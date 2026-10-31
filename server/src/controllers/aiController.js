const { GoogleGenAI } = require('@google/genai');

// ---------------------------------------------------------------------------
// Gemini client — initialised once at module load, not per request.
// ---------------------------------------------------------------------------
let ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      timeout: 25000,
      retryOptions: {
        attempts: 1, // Disable internal SDK retry loop; enforce explicit application-level bounded backoff
      },
    },
  });
}

// Resolve the model name at startup so misconfiguration is caught early.
// Current stable generation model in Google AI Studio is gemini-3.8-flash.
const GEMINI_MODEL =
  process.env.GEMINI_MODEL ||
  process.env.AI_MODEL ||
  'gemini-3.8-flash';

console.log(`[AI] Gemini model configured: ${GEMINI_MODEL}`);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Sleep for `ms` milliseconds.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Bounded exponential backoff with jitter.
 * Base: 2^attempt seconds, jitter: 0–500 ms, cap: 16 s.
 */
const backoffMs = (attempt) =>
  Math.min(Math.pow(2, attempt) * 1000 + Math.random() * 500, 16000);

/**
 * Wraps a promise with a timeout.  Rejects with an error whose `.isTimeout`
 * flag is true so callers can distinguish it from API errors.
 */
const withTimeout = (promise, ms, label) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`${label} timed out after ${ms}ms`);
      err.isTimeout = true;
      reject(err);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

// ---------------------------------------------------------------------------
// In-flight deduplication — prevents the same artisan from firing two
// concurrent AI generation requests (e.g. double-click, network retry).
// ---------------------------------------------------------------------------
const inFlight = new Set();

// ---------------------------------------------------------------------------
// generateProduct
// ---------------------------------------------------------------------------
const generateProduct = async (req, res) => {
  if (req.user.role !== 'ARTISAN') {
    return res.status(403).json({ error: 'Only artisans can generate product listings' });
  }

  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Please provide valid text describing your product.' });
  }

  if (text.length > 2000) {
    return res.status(400).json({ error: 'Text description is too long. Please keep it under 2000 characters.' });
  }

  // Deduplication guard: reject a second in-flight request from the same user.
  const flightKey = `generate:${req.user.id}`;
  if (inFlight.has(flightKey)) {
    return res.status(429).json({
      error: 'A listing is already being generated for your account. Please wait for it to complete.',
      code: 'GENERATION_IN_PROGRESS',
    });
  }

  inFlight.add(flightKey);

  try {
    let structuredProduct = null;

    if (ai) {
      const prompt = `You are a helpful assistant for rural Indian artisans.
Based on the following natural language description (which might be in Hindi or English), generate a structured product listing.

Text: "${text.trim()}"

Rules:
1. Extract or infer an appropriate 'title' for the product.
2. Write a clean, professional 'description' based on the details.
3. Extract the 'price' as a positive number. If not mentioned, return 0.
4. Extract the 'quantity' as a non-negative integer. If not mentioned, return 1.
5. Pick an appropriate 'category' from this list: Handicrafts, Textiles, Jewelry, Pottery, Art. If none fit perfectly, pick 'Handicrafts'.
6. You MUST return ONLY valid JSON matching this schema — no markdown fences, no extra text:
{
  "title": "...",
  "description": "...",
  "price": 100,
  "quantity": 5,
  "category": "Handicrafts"
}`;

      // Maximum two attempts: with thinking level set to LOW, requests balance speed and quality
      // Only retry on transient errors (429, 503).
      const MAX_RETRIES = 2;
      const RETRYABLE_STATUSES = new Set([429, 503]);
      // Per-attempt timeout: 25 s is sufficient for flash models with low thinking level
      const ATTEMPT_TIMEOUT_MS = 25_000;
      let lastError = null;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const abortController = new AbortController();
        const timeoutTimer = setTimeout(() => {
          abortController.abort();
        }, ATTEMPT_TIMEOUT_MS);

        try {
          const t0 = Date.now();
          const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
              abortSignal: abortController.signal,
              thinkingConfig: {
                thinkingLevel: 'LOW',
              },
            },
          });
          clearTimeout(timeoutTimer);
          console.log(`[AI] Gemini responded in ${Date.now() - t0}ms (attempt ${attempt + 1})`);

          let responseText = response.text || '';

          // Strip optional markdown code fences the model sometimes adds
          responseText = responseText
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```\s*$/, '')
            .trim();

          // Robust JSON extraction — grab first {...} block
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) responseText = jsonMatch[0];

          structuredProduct = JSON.parse(responseText);
          break; // success — exit retry loop
        } catch (err) {
          clearTimeout(timeoutTimer);
          lastError = err;

          // Check if error was caused by our AbortController timeout
          const isTimeout =
            abortController.signal.aborted ||
            err.name === 'AbortError' ||
            err.message?.includes('aborted');

          if (isTimeout) {
            console.warn(`[AI] Attempt ${attempt + 1} timed out and underlying HTTP request was aborted.`);
            lastError.isTimeout = true;
            break; // Stop retries on timeout
          }

          const status =
            err.status ||
            err.httpStatusCode ||
            (err.response && err.response.status);

          // Honour Retry-After header when the server provides it
          const retryAfterMs = err.response?.headers?.['retry-after']
            ? parseInt(err.response.headers['retry-after'], 10) * 1000
            : null;

          if (RETRYABLE_STATUSES.has(status) && attempt < MAX_RETRIES - 1) {
            const delay = retryAfterMs ?? backoffMs(attempt + 1);
            console.warn(
              `[AI] Attempt ${attempt + 1} failed with status ${status}. Retrying in ${Math.round(delay)}ms…`
            );
            await sleep(delay);
            continue;
          }

          // Non-retryable error (400, 401, 404, JSON parse error, etc.)
          console.error(`[AI] Non-retryable error on attempt ${attempt + 1}:`, {
            status,
            message: err.message,
          });
          break;
        }
      }

      if (!structuredProduct) {
        const isTimeout = lastError?.isTimeout;
        const status =
          lastError?.status ||
          lastError?.httpStatusCode ||
          (lastError?.response && lastError.response.status);

        if (isTimeout) {
          return res.status(504).json({
            error:
              'The AI service took too long to respond. Please try again or enter the details manually.',
            code: 'AI_TIMEOUT',
          });
        }
        if (status === 429) {
          return res.status(503).json({
            error: 'AI service is temporarily busy. Please wait a moment and try again.',
            code: 'AI_RATE_LIMITED',
          });
        }
        // Catch-all for model errors, auth errors, parse failures
        console.error('[AI] Generation failed. Last error:', lastError?.message);
        return res.status(500).json({
          error:
            'Failed to process your description into a product listing. Please enter the details manually.',
          code: 'AI_ERROR',
        });
      }
    } else {
      // No API key configured — return a clearly-labelled mock so the form is
      // still usable in development/test without crashing.
      console.warn('[AI] GEMINI_API_KEY not set — returning mock product data.');
      structuredProduct = {
        title: 'Sample Handicraft Product',
        description: `Auto-generated listing for: ${text.trim().substring(0, 80)}`,
        price: 500,
        quantity: 10,
        category: 'Handicrafts',
      };
    }

    // Validate AI output before returning to the client
    if (!structuredProduct.title || typeof structuredProduct.title !== 'string') {
      throw new Error('AI returned invalid title');
    }
    if (!structuredProduct.description || typeof structuredProduct.description !== 'string') {
      throw new Error('AI returned invalid description');
    }
    if (typeof structuredProduct.price !== 'number' || structuredProduct.price < 0) {
      structuredProduct.price = 0; // safe default rather than crashing
    }
    if (typeof structuredProduct.quantity !== 'number' || structuredProduct.quantity < 0) {
      structuredProduct.quantity = 1;
    }
    if (!structuredProduct.category || typeof structuredProduct.category !== 'string') {
      structuredProduct.category = 'Handicrafts';
    }

    return res.json(structuredProduct);
  } catch (error) {
    console.error('[AI] Unexpected error in generateProduct:', error.message);
    return res.status(500).json({
      error:
        'An unexpected error occurred. Please try again or enter the details manually.',
      code: 'UNEXPECTED_ERROR',
    });
  } finally {
    inFlight.delete(flightKey);
  }
};

module.exports = { generateProduct };
