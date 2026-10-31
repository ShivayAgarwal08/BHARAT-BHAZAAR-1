/**
 * Central prompt and system instructions for Artisan product listing generation.
 * Universal across Gemini, Groq, and OpenRouter models.
 */

const ALLOWED_CATEGORIES = ['Handicrafts', 'Textiles', 'Jewelry', 'Pottery', 'Art'];

const SYSTEM_INSTRUCTION = `You are a helpful assistant for rural Indian artisans on the Bharat Bazaar marketplace.
Your goal is to extract and generate structured product listings from natural language descriptions provided in Hindi, Hinglish, or English.
You must always output ONLY a single valid JSON object with no markdown fences, no conversational text, and no explanations.
Schema:
{
  "title": string,
  "description": string,
  "price": number,
  "quantity": number,
  "category": "Handicrafts" | "Textiles" | "Jewelry" | "Pottery" | "Art"
}`;

function buildPrompt(text) {
  return `You are a helpful assistant for rural Indian artisans.
Based on the following natural language description (which might be in Hindi, Hinglish, or English), generate a structured product listing.

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
}

module.exports = {
  ALLOWED_CATEGORIES,
  SYSTEM_INSTRUCTION,
  buildPrompt,
};
