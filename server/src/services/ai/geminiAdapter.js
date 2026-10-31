const { GoogleGenAI } = require('@google/genai');
const { buildPrompt } = require('./prompt');
const { validateAndNormalizeOutput } = require('./validator');

const GEMINI_MODEL =
  process.env.GEMINI_MODEL ||
  process.env.AI_MODEL ||
  'gemini-3.8-flash';

const DEFAULT_TIMEOUT_MS = 15000;

let client = null;

function getClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!client) {
    client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        timeout: 25000,
        retryOptions: {
          attempts: 1, // Application-level fallback orchestration manages retries/fallbacks
        },
      },
    });
  }
  return client;
}

/**
 * Executes prompt with Gemini and validates output schema.
 */
async function generateWithGemini(text, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      isConfigured: false,
      errorCategory: 'MISSING_API_KEY',
      message: 'GEMINI_API_KEY is not configured',
    };
  }

  const ai = getClient();
  const prompt = buildPrompt(text);
  const timeoutMs = options.timeoutMs || parseInt(process.env.GEMINI_TIMEOUT_MS, 10) || DEFAULT_TIMEOUT_MS;
  const abortController = new AbortController();
  const timer = setTimeout(() => abortController.abort(), timeoutMs);

  const t0 = Date.now();
  try {
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
    clearTimeout(timer);

    const duration = Date.now() - t0;
    const rawText = response.text || '';
    const validation = validateAndNormalizeOutput(rawText);

    if (!validation.isValid) {
      console.warn(`[AI Gemini] Response failed schema validation in ${duration}ms: ${validation.error}`);
      return {
        success: false,
        errorCategory: 'INVALID_SCHEMA',
        message: validation.error,
        duration,
      };
    }

    console.log(`[AI Gemini] Successfully generated listing in ${duration}ms (model: ${GEMINI_MODEL})`);
    return {
      success: true,
      data: {
        ...validation.data,
        provider: 'gemini',
        model: GEMINI_MODEL,
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
      console.warn(`[AI Gemini] Request timed out after ${timeoutMs}ms`);
      return {
        success: false,
        isTimeout: true,
        errorCategory: 'TIMEOUT',
        message: 'Gemini request timed out',
        duration,
      };
    }

    const status =
      err.status ||
      err.httpStatusCode ||
      (err.response && err.response.status);

    // Inspect error body for daily quota exhaustion vs temporary 429
    let isDailyQuota = false;
    let retryDelaySeconds = null;

    try {
      const rawMsg = err.message || '';
      const jsonIdx = rawMsg.indexOf('{');
      if (jsonIdx !== -1) {
        const errJson = JSON.parse(rawMsg.substring(jsonIdx));
        const retryInfo = errJson.error?.details?.find((d) =>
          d['@type']?.includes('RetryInfo')
        );
        if (retryInfo?.retryDelay) {
          retryDelaySeconds = parseInt(retryInfo.retryDelay, 10);
        }
        if (
          errJson.error?.status === 'RESOURCE_EXHAUSTED' ||
          rawMsg.includes('limit exceeded on Free Tier') ||
          rawMsg.includes('per day limit exceeded') ||
          (retryDelaySeconds && retryDelaySeconds > 60)
        ) {
          isDailyQuota = true;
        }
      }
    } catch (_) {
      if (
        err.message?.includes('RESOURCE_EXHAUSTED') ||
        err.message?.includes('per day limit exceeded')
      ) {
        isDailyQuota = true;
      }
    }

    const isAuthError = status === 401 || status === 403;
    const isRateLimit = status === 429 || isDailyQuota;
    const isUnavailable = status === 503 || status === 502 || status === 504;

    console.warn(`[AI Gemini] Generation failed in ${duration}ms:`, {
      status,
      isDailyQuota,
      isRateLimit,
      isUnavailable,
      category: err.statusText || err.code || 'UPSTREAM_ERROR',
    });

    return {
      success: false,
      isDailyQuota,
      isRateLimit,
      isUnavailable,
      isAuthError,
      errorCategory: isDailyQuota ? 'DAILY_QUOTA_EXHAUSTED' : isRateLimit ? 'RATE_LIMITED' : 'UPSTREAM_ERROR',
      message: err.message || 'Gemini error',
      duration,
    };
  }
}

module.exports = {
  GEMINI_MODEL,
  DEFAULT_TIMEOUT_MS,
  generateWithGemini,
};
