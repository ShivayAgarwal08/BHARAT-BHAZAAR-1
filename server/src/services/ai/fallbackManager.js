const geminiAdapter = require('./geminiAdapter');
const groqAdapter = require('./groqAdapter');
const openrouterAdapter = require('./openrouterAdapter');

/**
 * Custom error class representing exhaustion of all configured providers.
 */
class AllProvidersFailedError extends Error {
  constructor(message, { details, statusCode = 503, code = 'AI_ALL_PROVIDERS_UNAVAILABLE' } = {}) {
    super(message);
    this.name = 'AllProvidersFailedError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Orchestrates multi-provider AI product listing generation with cascading fallbacks:
 * 1. Gemini (Primary)
 * 2. Groq (Secondary fallback)
 * 3. OpenRouter (Tertiary fallback)
 */
async function generateProductWithFallback(text, options = {}) {
  const adapters = options.adapters || {};
  const geminiFn = adapters.gemini || geminiAdapter.generateWithGemini;
  const groqFn = adapters.groq || groqAdapter.generateWithGroq;
  const openrouterFn = adapters.openrouter || openrouterAdapter.generateWithOpenRouter;

  const providersAttempted = [];

  // Check if at least one API key is configured
  const hasAnyKey = Boolean(
    process.env.GEMINI_API_KEY ||
    process.env.GROQ_API_KEY ||
    process.env.OPENROUTER_API_KEY
  );

  if (!hasAnyKey) {
    console.warn('[AI Fallback] No AI provider API keys configured — returning development mock product.');
    return {
      title: 'Sample Handicraft Product',
      description: `Auto-generated listing for: ${text.trim().substring(0, 80)}`,
      price: 500,
      quantity: 10,
      category: 'Handicrafts',
      provider: 'mock',
    };
  }

  // -------------------------------------------------------------------------
  // 1. Primary: Gemini
  // -------------------------------------------------------------------------
  if (process.env.GEMINI_API_KEY) {
    console.log('[AI Fallback] Attempting primary provider: Gemini...');
    const geminiRes = await geminiFn(text, options);
    if (geminiRes.success) {
      console.log(`[AI Fallback] Gemini succeeded in ${geminiRes.duration || 0}ms`);
      return geminiRes.data;
    }

    providersAttempted.push({
      provider: 'gemini',
      category: geminiRes.errorCategory,
      isDailyQuota: Boolean(geminiRes.isDailyQuota),
      isRateLimit: Boolean(geminiRes.isRateLimit),
      isTimeout: Boolean(geminiRes.isTimeout),
      duration: geminiRes.duration || 0,
    });
    console.warn(`[AI Fallback] Gemini failed (${geminiRes.errorCategory}). Cascading to Groq fallback...`);
  } else {
    console.log('[AI Fallback] GEMINI_API_KEY not configured. Skipping Gemini...');
  }

  // -------------------------------------------------------------------------
  // 2. Secondary: Groq
  // -------------------------------------------------------------------------
  if (process.env.GROQ_API_KEY) {
    console.log('[AI Fallback] Attempting secondary provider: Groq...');
    const groqRes = await groqFn(text, options);
    if (groqRes.success) {
      console.log(`[AI Fallback] Groq fallback succeeded in ${groqRes.duration || 0}ms`);
      return groqRes.data;
    }

    providersAttempted.push({
      provider: 'groq',
      category: groqRes.errorCategory,
      isDailyQuota: Boolean(groqRes.isDailyQuota),
      isRateLimit: Boolean(groqRes.isRateLimit),
      isTimeout: Boolean(groqRes.isTimeout),
      duration: groqRes.duration || 0,
    });
    console.warn(`[AI Fallback] Groq fallback failed (${groqRes.errorCategory}). Cascading to OpenRouter fallback...`);
  } else {
    console.log('[AI Fallback] GROQ_API_KEY not configured. Skipping Groq...');
  }

  // -------------------------------------------------------------------------
  // 3. Tertiary: OpenRouter
  // -------------------------------------------------------------------------
  if (process.env.OPENROUTER_API_KEY) {
    console.log('[AI Fallback] Attempting tertiary provider: OpenRouter...');
    const openRouterRes = await openrouterFn(text, options);
    if (openRouterRes.success) {
      console.log(`[AI Fallback] OpenRouter fallback succeeded in ${openRouterRes.duration || 0}ms`);
      return openRouterRes.data;
    }

    providersAttempted.push({
      provider: 'openrouter',
      category: openRouterRes.errorCategory,
      isDailyQuota: Boolean(openRouterRes.isDailyQuota),
      isRateLimit: Boolean(openRouterRes.isRateLimit),
      isTimeout: Boolean(openRouterRes.isTimeout),
      duration: openRouterRes.duration || 0,
    });
    console.warn(`[AI Fallback] OpenRouter fallback failed (${openRouterRes.errorCategory}).`);
  } else {
    console.log('[AI Fallback] OPENROUTER_API_KEY not configured. Skipping OpenRouter...');
  }

  // -------------------------------------------------------------------------
  // All configured providers failed
  // -------------------------------------------------------------------------
  console.error('[AI Fallback] All AI providers exhausted:', providersAttempted);

  const allQuotaOrRateLimited =
    providersAttempted.length > 0 &&
    providersAttempted.every(
      (p) =>
        p.isDailyQuota ||
        p.isRateLimit ||
        p.category === 'DAILY_QUOTA_EXHAUSTED' ||
        p.category === 'RATE_LIMITED'
    );

  const allTimedOut =
    providersAttempted.length > 0 &&
    providersAttempted.every((p) => p.isTimeout || p.category === 'TIMEOUT');

  if (allQuotaOrRateLimited) {
    throw new AllProvidersFailedError(
      'AI product listing generation has reached daily usage quotas across all available providers. You can enter your product details manually below or try again later.',
      {
        statusCode: 429,
        code: 'AI_DAILY_QUOTA_EXHAUSTED',
        details: providersAttempted.map((p) => p.provider),
      }
    );
  }

  if (allTimedOut) {
    throw new AllProvidersFailedError(
      'AI services took too long to respond. Please enter your product details manually below or try again later.',
      {
        statusCode: 504,
        code: 'AI_TIMEOUT',
        details: providersAttempted.map((p) => p.provider),
      }
    );
  }

  throw new AllProvidersFailedError(
    'AI listing generation is currently unavailable across all providers. You can enter your product details manually below or try again later.',
    {
      statusCode: 503,
      code: 'AI_ALL_PROVIDERS_UNAVAILABLE',
      details: providersAttempted.map((p) => p.provider),
    }
  );
}

module.exports = {
  AllProvidersFailedError,
  generateProductWithFallback,
};
