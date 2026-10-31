const { SYSTEM_INSTRUCTION, buildPrompt } = require('./prompt');
const { validateAndNormalizeOutput } = require('./validator');

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';
const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_TIMEOUT_MS = 12000;

/**
 * Executes product listing extraction using OpenRouter's API.
 */
async function generateWithOpenRouter(text, options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      isConfigured: false,
      errorCategory: 'MISSING_API_KEY',
      message: 'OPENROUTER_API_KEY is not configured',
    };
  }

  const timeoutMs = options.timeoutMs || parseInt(process.env.OPENROUTER_TIMEOUT_MS, 10) || DEFAULT_TIMEOUT_MS;
  const abortController = new AbortController();
  const timer = setTimeout(() => abortController.abort(), timeoutMs);

  const t0 = Date.now();
  try {
    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://bharat-bhazaar-1.vercel.app',
        'X-Title': 'Bharat Bazaar Artisan Assistant',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION },
          { role: 'user', content: buildPrompt(text) },
        ],
        temperature: 0.2,
        max_tokens: 512,
      }),
      signal: abortController.signal,
    });
    clearTimeout(timer);

    const duration = Date.now() - t0;

    if (!response.ok) {
      const status = response.status;
      const isRateLimit = status === 429;
      const isUnavailable = status === 500 || status === 502 || status === 503 || status === 504 || status === 524;
      const isAuthError = status === 401 || status === 403;

      let errorMsg = `OpenRouter HTTP error ${status}`;
      try {
        const errBody = await response.json();
        errorMsg = errBody.error?.message || errorMsg;
      } catch (_) {}

      console.warn(`[AI OpenRouter] Failed with status ${status} in ${duration}ms: ${errorMsg}`);
      return {
        success: false,
        status,
        isRateLimit,
        isUnavailable,
        isAuthError,
        errorCategory: isRateLimit ? 'RATE_LIMITED' : isUnavailable ? 'SERVICE_UNAVAILABLE' : 'UPSTREAM_ERROR',
        message: errorMsg,
        duration,
      };
    }

    const json = await response.json();
    const rawContent = json.choices?.[0]?.message?.content || '';
    const validation = validateAndNormalizeOutput(rawContent);

    if (!validation.isValid) {
      console.warn(`[AI OpenRouter] Response failed schema validation in ${duration}ms: ${validation.error}`);
      return {
        success: false,
        errorCategory: 'INVALID_SCHEMA',
        message: validation.error,
        duration,
      };
    }

    console.log(`[AI OpenRouter] Successfully generated listing in ${duration}ms (model: ${OPENROUTER_MODEL})`);
    return {
      success: true,
      data: {
        ...validation.data,
        provider: 'openrouter',
        model: OPENROUTER_MODEL,
      },
      duration,
    };
  } catch (err) {
    clearTimeout(timer);
    const duration = Date.now() - t0;

    const isTimeout =
      abortController.signal.aborted ||
      err.name === 'AbortError' ||
      err.message?.includes('aborted');

    if (isTimeout) {
      console.warn(`[AI OpenRouter] Request timed out after ${timeoutMs}ms`);
      return {
        success: false,
        isTimeout: true,
        errorCategory: 'TIMEOUT',
        message: 'OpenRouter request timed out',
        duration,
      };
    }

    console.warn(`[AI OpenRouter] Network or execution error in ${duration}ms:`, err.message);
    return {
      success: false,
      errorCategory: 'NETWORK_ERROR',
      message: err.message || 'OpenRouter request failed',
      duration,
    };
  }
}

module.exports = {
  OPENROUTER_MODEL,
  DEFAULT_TIMEOUT_MS,
  generateWithOpenRouter,
};
