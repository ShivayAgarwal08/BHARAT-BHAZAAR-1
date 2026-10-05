const { GoogleGenAI } = require('@google/genai');

let ai;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

const generateProduct = async (req, res) => {
  if (req.user.role !== 'ARTISAN') {
    return res.status(403).json({ error: 'Only artisans can generate product listings' });
  }

  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Please provide valid text describing your product.' });
  }

  if (text.length > 2000) {
    return res.status(400).json({ error: 'Text description is too long.' });
  }

  try {
    let structuredProduct = null;

    if (ai) {
      const prompt = `You are a helpful assistant for rural Indian artisans. 
Based on the following natural language description (which might be in Hindi or English), generate a structured product listing. 

Text: "${text}"

Rules:
1. Extract or infer an appropriate 'title' for the product.
2. Write a clean, professional 'description' based on the details.
3. Extract the 'price' as a positive number. If not mentioned, return 0.
4. Extract the 'quantity' as a non-negative integer. If not mentioned, return 1.
5. Pick an appropriate 'category' from this list: Handicrafts, Textiles, Jewelry, Pottery, Art. If none fit perfectly, pick 'Handicrafts'.
6. You MUST return ONLY valid JSON matching this schema:
{
  "title": "...",
  "description": "...",
  "price": 100,
  "quantity": 5,
  "category": "Handicrafts"
}
Do NOT wrap the output in markdown code blocks like \`\`\`json. Return the raw JSON string.`;

      const MAX_RETRIES = 3;
      let attempt = 0;
      let lastError = null;

      while (attempt < MAX_RETRIES) {
        try {
          const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL || process.env.AI_MODEL || 'gemini-3.8-flash',
            contents: prompt,
          });

          let responseText = response.text;
          
          // Robust JSON extraction
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            responseText = jsonMatch[0];
          }

          structuredProduct = JSON.parse(responseText);
          break; // Success
        } catch (error) {
          lastError = error;
          const status = error.status || (error.response && error.response.status);
          if (status === 429 || status === 503) {
            attempt++;
            if (attempt < MAX_RETRIES) {
              const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
              await new Promise((resolve) => setTimeout(resolve, delay));
              continue;
            } else {
              return res.status(503).json({ error: 'AI service is temporarily busy. Please try again in a moment.' });
            }
          }
          throw error; // Other errors
        }
      }
    } else {
      // Mock fallback if API key is not provided (for seamless testing without crashing)
      structuredProduct = {
        title: "Generated Product Title",
        description: `This is an auto-generated description for: ${text.substring(0, 50)}...`,
        price: 500,
        quantity: 10,
        category: "Handicrafts"
      };
    }

    // Validate the AI output structure before returning
    if (!structuredProduct.title || typeof structuredProduct.title !== 'string') throw new Error('Invalid title');
    if (!structuredProduct.description || typeof structuredProduct.description !== 'string') throw new Error('Invalid description');
    if (typeof structuredProduct.price !== 'number' || structuredProduct.price < 0) throw new Error('Invalid price');
    if (typeof structuredProduct.quantity !== 'number' || structuredProduct.quantity < 0) throw new Error('Invalid quantity');
    if (!structuredProduct.category || typeof structuredProduct.category !== 'string') throw new Error('Invalid category');

    res.json(structuredProduct);
  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ 
      error: 'Failed to process voice text into a product listing. Please enter the details manually.' 
    });
  }
};

module.exports = { generateProduct };
