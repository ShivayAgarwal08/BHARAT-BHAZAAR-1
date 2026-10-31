const {
  AllProvidersFailedError,
  generateProductWithFallback,
} = require('../services/ai/fallbackManager');

// In-flight deduplication — prevents the same artisan from firing two
// concurrent AI generation requests (e.g. double-click, network retry).
const inFlight = new Set();

/**
 * Generates a structured product listing from a natural language description.
 * Utilizes a multi-provider fallback hierarchy: Gemini -> Groq -> OpenRouter.
 */
const generateProduct = async (req, res) => {
  if (req.user?.role !== 'ARTISAN') {
    return res.status(403).json({ error: 'Only artisans can generate product listings' });
  }

  const { text } = req.body || {};

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
    const structuredProduct = await generateProductWithFallback(text, {
      adapters: req.aiAdapters,
    });
    return res.json(structuredProduct);
  } catch (err) {
    if (err instanceof AllProvidersFailedError) {
      return res.status(err.statusCode).json({
        error: err.message,
        code: err.code,
      });
    }

    console.error('[AI] Unexpected error in generateProduct:', err.message);
    return res.status(500).json({
      error: 'An unexpected error occurred. Please try again or enter the details manually.',
      code: 'UNEXPECTED_ERROR',
    });
  } finally {
    inFlight.delete(flightKey);
  }
};

module.exports = {
  generateProduct,
};
