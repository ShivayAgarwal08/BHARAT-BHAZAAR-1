const { ALLOWED_CATEGORIES } = require('./prompt');

/**
 * Strips markdown code fences and extracts the outermost JSON block.
 */
function extractJsonText(rawText) {
  if (typeof rawText !== 'string') return '';
  let cleaned = rawText
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```\s*$/m, '')
    .trim();

  // Find the first outermost { ... }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

/**
 * Validates and normalizes raw model text into the strict product schema.
 * Returns { isValid: true, data: { ... } } or { isValid: false, error: string }
 */
function validateAndNormalizeOutput(rawText) {
  const jsonText = extractJsonText(rawText);
  if (!jsonText) {
    return { isValid: false, error: 'Empty or missing JSON in model output' };
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    return { isValid: false, error: `Malformed JSON: ${err.message}` };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { isValid: false, error: 'Output is not a valid JSON object' };
  }

  const title = typeof parsed.title === 'string' ? parsed.title.trim() : '';
  if (!title) {
    return { isValid: false, error: 'Product title is missing or empty' };
  }

  const description = typeof parsed.description === 'string' ? parsed.description.trim() : '';
  if (!description) {
    return { isValid: false, error: 'Product description is missing or empty' };
  }

  // Price normalization: must be a positive number, default to 0
  let price = typeof parsed.price === 'number' ? parsed.price : parseFloat(parsed.price);
  if (isNaN(price) || price < 0) {
    price = 0;
  }

  // Quantity normalization: must be a non-negative integer, default to 1
  let quantity = typeof parsed.quantity === 'number' ? parsed.quantity : parseInt(parsed.quantity, 10);
  if (isNaN(quantity) || quantity < 0) {
    quantity = 1;
  } else {
    quantity = Math.floor(quantity);
  }

  // Category normalization: check against allowlist case-insensitively
  let category = 'Handicrafts';
  if (typeof parsed.category === 'string') {
    const rawCat = parsed.category.trim();
    const matched = ALLOWED_CATEGORIES.find(
      (c) => c.toLowerCase() === rawCat.toLowerCase()
    );
    if (matched) {
      category = matched;
    }
  }

  return {
    isValid: true,
    data: {
      title,
      description,
      price,
      quantity,
      category,
    },
  };
}

module.exports = {
  extractJsonText,
  validateAndNormalizeOutput,
};
