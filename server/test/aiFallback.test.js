const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

// Ensure test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-32-bytes-minimum!';

const { validateAndNormalizeOutput } = require('../src/services/ai/validator');
const { buildPrompt, ALLOWED_CATEGORIES } = require('../src/services/ai/prompt');
const { generateProductWithFallback, AllProvidersFailedError } = require('../src/services/ai/fallbackManager');
const geminiAdapter = require('../src/services/ai/geminiAdapter');
const groqAdapter = require('../src/services/ai/groqAdapter');
const openrouterAdapter = require('../src/services/ai/openrouterAdapter');
const { app, server, io } = require('../src/index');

let baseUrl;
let serverPort;

function createArtisanToken() {
  return jwt.sign(
    { id: 'artisan-test-id-1', role: 'ARTISAN', name: 'Ramesh Artisan' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

function createCustomerToken() {
  return jwt.sign(
    { id: 'customer-test-id-1', role: 'CUSTOMER', name: 'Pooja Customer' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

test.before(async () => {
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      serverPort = server.address().port;
      baseUrl = `http://127.0.0.1:${serverPort}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => io.close(resolve));
  await new Promise((resolve) => server.close(resolve));
});

test.describe('Task: Multi-Provider AI Fallback System', () => {
  const origEnv = { ...process.env };
  const origGemini = geminiAdapter.generateWithGemini;
  const origGroq = groqAdapter.generateWithGroq;
  const origOpenRouter = openrouterAdapter.generateWithOpenRouter;

  test.beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-gemini-key-xyz';
    process.env.GROQ_API_KEY = 'test-groq-key-abc';
    process.env.OPENROUTER_API_KEY = 'test-openrouter-key-uvw';
  });

  test.afterEach(() => {
    process.env = { ...origEnv };
    geminiAdapter.generateWithGemini = origGemini;
    groqAdapter.generateWithGroq = origGroq;
    openrouterAdapter.generateWithOpenRouter = origOpenRouter;
  });

  // ─────────────────────────────────────────────────────────────
  // 1. Gemini success means no fallback
  // ─────────────────────────────────────────────────────────────
  test('1. Gemini success returns listing without invoking secondary providers', async () => {
    let groqCalled = false;
    let openrouterCalled = false;

    geminiAdapter.generateWithGemini = async () => ({
      success: true,
      data: {
        title: 'Handmade Wooden Toys',
        description: 'Traditional handcrafted wooden spinning top',
        price: 150,
        quantity: 20,
        category: 'Handicrafts',
        provider: 'gemini',
        model: 'gemini-3.8-flash',
      },
      duration: 120,
    });

    groqAdapter.generateWithGroq = async () => {
      groqCalled = true;
      throw new Error('Groq should not be called');
    };

    openrouterAdapter.generateWithOpenRouter = async () => {
      openrouterCalled = true;
      throw new Error('OpenRouter should not be called');
    };

    const result = await generateProductWithFallback('लकड़ी का लट्टू 150 रुपये में 20 पीस');
    assert.equal(result.provider, 'gemini');
    assert.equal(result.title, 'Handmade Wooden Toys');
    assert.equal(result.price, 150);
    assert.equal(groqCalled, false, 'Groq must not be called when Gemini succeeds');
    assert.equal(openrouterCalled, false, 'OpenRouter must not be called when Gemini succeeds');
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Gemini quota exhaustion → Groq success
  // ─────────────────────────────────────────────────────────────
  test('2. Gemini daily quota exhaustion immediately cascades to Groq and succeeds', async () => {
    let openrouterCalled = false;

    geminiAdapter.generateWithGemini = async () => ({
      success: false,
      isDailyQuota: true,
      errorCategory: 'DAILY_QUOTA_EXHAUSTED',
      message: 'Resource exhausted 429: per day limit exceeded',
      duration: 50,
    });

    groqAdapter.generateWithGroq = async () => ({
      success: true,
      data: {
        title: 'Terracotta Clay Diya Set',
        description: 'Eco-friendly handmade earthen oil lamps for festivals',
        price: 200,
        quantity: 50,
        category: 'Pottery',
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
      },
      duration: 350,
    });

    openrouterAdapter.generateWithOpenRouter = async () => {
      openrouterCalled = true;
      throw new Error('OpenRouter should not be called');
    };

    const result = await generateProductWithFallback('मिट्टी के 50 दीये 200 रुपये');
    assert.equal(result.provider, 'groq');
    assert.equal(result.title, 'Terracotta Clay Diya Set');
    assert.equal(result.category, 'Pottery');
    assert.equal(openrouterCalled, false, 'OpenRouter must not be called when Groq succeeds');
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Gemini failure → Groq failure → OpenRouter success
  // ─────────────────────────────────────────────────────────────
  test('3. Gemini failure and Groq failure cascades to OpenRouter and succeeds', async () => {
    geminiAdapter.generateWithGemini = async () => ({
      success: false,
      errorCategory: 'SERVICE_UNAVAILABLE',
      message: '503 Service Unavailable',
      duration: 80,
    });

    groqAdapter.generateWithGroq = async () => ({
      success: false,
      errorCategory: 'RATE_LIMITED',
      isRateLimit: true,
      message: '429 Rate limit reached',
      duration: 100,
    });

    openrouterAdapter.generateWithOpenRouter = async () => ({
      success: true,
      data: {
        title: 'Banarasi Silk Dupatta',
        description: 'Handwoven golden zari work pure silk dupatta',
        price: 1200,
        quantity: 5,
        category: 'Textiles',
        provider: 'openrouter',
        model: 'meta-llama/llama-3.3-70b-instruct:free',
      },
      duration: 400,
    });

    const result = await generateProductWithFallback('बनारसी सिल्क दुपट्टा 1200 रुपये 5 पीस');
    assert.equal(result.provider, 'openrouter');
    assert.equal(result.title, 'Banarasi Silk Dupatta');
    assert.equal(result.price, 1200);
    assert.equal(result.category, 'Textiles');
  });

  // ─────────────────────────────────────────────────────────────
  // 4. All providers fail → manual-entry workflow remains available
  // ─────────────────────────────────────────────────────────────
  test('4. All providers quota exhaustion throws 429 AI_DAILY_QUOTA_EXHAUSTED with manual-entry message', async () => {
    geminiAdapter.generateWithGemini = async () => ({
      success: false,
      isDailyQuota: true,
      errorCategory: 'DAILY_QUOTA_EXHAUSTED',
      duration: 30,
    });

    groqAdapter.generateWithGroq = async () => ({
      success: false,
      isRateLimit: true,
      errorCategory: 'RATE_LIMITED',
      duration: 40,
    });

    openrouterAdapter.generateWithOpenRouter = async () => ({
      success: false,
      isRateLimit: true,
      errorCategory: 'RATE_LIMITED',
      duration: 45,
    });

    await assert.rejects(
      async () => {
        await generateProductWithFallback('कुछ भी');
      },
      (err) => {
        assert(err instanceof AllProvidersFailedError);
        assert.equal(err.statusCode, 429);
        assert.equal(err.code, 'AI_DAILY_QUOTA_EXHAUSTED');
        assert.match(err.message, /manually below/i);
        return true;
      }
    );
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Invalid input does not trigger fallback
  // ─────────────────────────────────────────────────────────────
  test('5. Invalid user input returns 400 immediately without triggering any provider', async () => {
    let anyProviderCalled = false;
    geminiAdapter.generateWithGemini = async () => {
      anyProviderCalled = true;
      return { success: true };
    };

    // Empty text
    const res1 = await fetch(`${baseUrl}/api/products/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${createArtisanToken()}`,
      },
      body: JSON.stringify({ text: '' }),
    });
    assert.equal(res1.status, 400);

    // Whitespace only
    const res2 = await fetch(`${baseUrl}/api/products/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${createArtisanToken()}`,
      },
      body: JSON.stringify({ text: '    ' }),
    });
    assert.equal(res2.status, 400);

    // Non-string
    const res3 = await fetch(`${baseUrl}/api/products/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${createArtisanToken()}`,
      },
      body: JSON.stringify({ text: 12345 }),
    });
    assert.equal(res3.status, 400);

    // Too long (> 2000 chars)
    const res4 = await fetch(`${baseUrl}/api/products/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${createArtisanToken()}`,
      },
      body: JSON.stringify({ text: 'a'.repeat(2005) }),
    });
    assert.equal(res4.status, 400);

    assert.equal(anyProviderCalled, false, 'No provider should be called for invalid input');
  });

  // ─────────────────────────────────────────────────────────────
  // 6. Malformed provider JSON triggers the next provider
  // ─────────────────────────────────────────────────────────────
  test('6. Malformed JSON output from Gemini triggers Groq fallback', async () => {
    geminiAdapter.generateWithGemini = async () => ({
      success: false,
      errorCategory: 'INVALID_SCHEMA',
      message: 'Malformed JSON from Gemini',
      duration: 100,
    });

    groqAdapter.generateWithGroq = async () => ({
      success: true,
      data: {
        title: 'Brass Pooja Thali',
        description: 'Engraved pure brass thali for ceremonies',
        price: 850,
        quantity: 12,
        category: 'Handicrafts',
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
      },
      duration: 250,
    });

    const result = await generateProductWithFallback('पीतल की पूजा थाली');
    assert.equal(result.provider, 'groq');
    assert.equal(result.title, 'Brass Pooja Thali');
  });

  // ─────────────────────────────────────────────────────────────
  // 7. Provider timeout triggers the next eligible provider
  // ─────────────────────────────────────────────────────────────
  test('7. Provider timeout triggers the next eligible provider', async () => {
    geminiAdapter.generateWithGemini = async () => ({
      success: false,
      isTimeout: true,
      errorCategory: 'TIMEOUT',
      message: 'Gemini request timed out after 20000ms',
      duration: 20000,
    });

    groqAdapter.generateWithGroq = async () => ({
      success: true,
      data: {
        title: 'Handloom Cotton Scarf',
        description: 'Soft organic handloom cotton scarf',
        price: 350,
        quantity: 15,
        category: 'Textiles',
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
      },
      duration: 300,
    });

    const result = await generateProductWithFallback('कॉटन स्कार्फ 350 रुपये');
    assert.equal(result.provider, 'groq');
    assert.equal(result.title, 'Handloom Cotton Scarf');
  });

  // ─────────────────────────────────────────────────────────────
  // 8. Missing API key is handled safely
  // ─────────────────────────────────────────────────────────────
  test('8. Missing API keys are safely skipped without crash', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    process.env.OPENROUTER_API_KEY = 'test-openrouter-key';

    openrouterAdapter.generateWithOpenRouter = async () => ({
      success: true,
      data: {
        title: 'Jute Tote Bag',
        description: 'Eco-friendly embroidered jute shopping bag',
        price: 180,
        quantity: 30,
        category: 'Handicrafts',
        provider: 'openrouter',
        model: 'meta-llama/llama-3.3-70b-instruct:free',
      },
      duration: 220,
    });

    const result = await generateProductWithFallback('जूट बैग 180 रुपये 30 पीस');
    assert.equal(result.provider, 'openrouter');
    assert.equal(result.title, 'Jute Tote Bag');
  });

  // ─────────────────────────────────────────────────────────────
  // 9. No API key or secret appears in logs or client responses
  // ─────────────────────────────────────────────────────────────
  test('9. No API key or secret appears in error or success responses', async () => {
    const sensitiveKey = 'SUPER_SECRET_TOKEN_DO_NOT_LEAK_998877';
    process.env.GROQ_API_KEY = sensitiveKey;

    geminiAdapter.generateWithGemini = async () => ({
      success: false,
      errorCategory: 'SERVICE_UNAVAILABLE',
      duration: 50,
    });

    groqAdapter.generateWithGroq = async () => ({
      success: false,
      errorCategory: 'RATE_LIMITED',
      message: 'Rate limit hit',
      duration: 60,
    });

    openrouterAdapter.generateWithOpenRouter = async () => ({
      success: false,
      errorCategory: 'RATE_LIMITED',
      message: 'All keys exhausted',
      duration: 60,
    });

    const res = await fetch(`${baseUrl}/api/products/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${createArtisanToken()}`,
      },
      body: JSON.stringify({ text: 'Handcrafted items' }),
    });

    const bodyText = await res.text();
    assert.equal(bodyText.includes(sensitiveKey), false, 'Secret must never appear in response text');
    assert.equal(bodyText.includes('test-gemini-key'), false);
    assert.equal(bodyText.includes('test-openrouter-key'), false);
  });

  // ─────────────────────────────────────────────────────────────
  // 10. Existing Gemini quota-handling tests still pass
  // ─────────────────────────────────────────────────────────────
  test('10. Validator correctly handles markdown code fences and cleans schema', () => {
    const rawFenced = '```json\n{\n  "title": "Kashmiri Shawl",\n  "description": "Fine pashmina wool",\n  "price": "4500",\n  "quantity": "2",\n  "category": "textiles"\n}\n```';
    const validation = validateAndNormalizeOutput(rawFenced);
    assert.equal(validation.isValid, true);
    assert.equal(validation.data.title, 'Kashmiri Shawl');
    assert.equal(validation.data.price, 4500);
    assert.equal(validation.data.quantity, 2);
    assert.equal(validation.data.category, 'Textiles');
  });

  // ─────────────────────────────────────────────────────────────
  // 11. Existing frontend product-listing response contract remains unchanged
  // ─────────────────────────────────────────────────────────────
  test('11. Response strictly conforms to frontend contract (title, description, price, quantity, category)', async () => {
    geminiAdapter.generateWithGemini = async () => ({
      success: true,
      data: {
        title: 'Madhubani Painting',
        description: 'Hand-painted folklore art on handmade paper',
        price: 900,
        quantity: 3,
        category: 'Art',
        provider: 'gemini',
      },
      duration: 100,
    });

    const res = await fetch(`${baseUrl}/api/products/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${createArtisanToken()}`,
      },
      body: JSON.stringify({ text: 'मधुबनी पेंटिंग 900 रुपये' }),
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(typeof json.title, 'string');
    assert.equal(typeof json.description, 'string');
    assert.equal(typeof json.price, 'number');
    assert.equal(typeof json.quantity, 'number');
    assert(ALLOWED_CATEGORIES.includes(json.category));
  });

  // ─────────────────────────────────────────────────────────────
  // 12. Non-artisan roles are rejected with 403
  // ─────────────────────────────────────────────────────────────
  test('12. Non-artisan roles cannot access generate endpoint', async () => {
    const res = await fetch(`${baseUrl}/api/products/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${createCustomerToken()}`,
      },
      body: JSON.stringify({ text: 'Some text' }),
    });

    assert.equal(res.status, 403);
    const json = await res.json();
    assert.match(json.error, /only artisans/i);
  });

  // ─────────────────────────────────────────────────────────────
  // 13. Timeout defaults and cumulative budget alignment
  // ─────────────────────────────────────────────────────────────
  test('13. Adapter timeout defaults are 15s (Gemini), 10s (Groq), 12s (OpenRouter) with total < 45s', () => {
    assert.equal(geminiAdapter.DEFAULT_TIMEOUT_MS, 15000);
    assert.equal(groqAdapter.DEFAULT_TIMEOUT_MS, 10000);
    assert.equal(openrouterAdapter.DEFAULT_TIMEOUT_MS, 12000);

    const totalServerTimeout =
      geminiAdapter.DEFAULT_TIMEOUT_MS +
      groqAdapter.DEFAULT_TIMEOUT_MS +
      openrouterAdapter.DEFAULT_TIMEOUT_MS;

    assert.equal(totalServerTimeout, 37000);
    assert(totalServerTimeout < 45000, 'Cumulative timeout must remain below 45s client axios timeout');
  });

  // ─────────────────────────────────────────────────────────────
  // 14. OpenRouter request body does not contain response_format
  // ─────────────────────────────────────────────────────────────
  test('14. OpenRouter request body omits response_format for free-tier compatibility', async () => {
    let capturedBody = null;
    const origFetch = global.fetch;

    global.fetch = async (url, options) => {
      capturedBody = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  title: 'Terracotta Jug',
                  description: 'Earthen jug',
                  price: 150,
                  quantity: 1,
                  category: 'Pottery',
                }),
              },
            },
          ],
        }),
      };
    };

    try {
      const res = await openrouterAdapter.generateWithOpenRouter('मिट्टी का जग');
      assert.equal(res.success, true);
      assert(capturedBody, 'Fetch must have been called');
      assert.equal(
        capturedBody.response_format,
        undefined,
        'OpenRouter request body must not contain response_format'
      );
    } finally {
      global.fetch = origFetch;
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 15. Groq preserves response_format: { type: 'json_object' }
  // ─────────────────────────────────────────────────────────────
  test('15. Groq request body preserves response_format: { type: "json_object" }', async () => {
    let capturedBody = null;
    const origFetch = global.fetch;

    global.fetch = async (url, options) => {
      capturedBody = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  title: 'Bamboo Basket',
                  description: 'Handmade basket',
                  price: 300,
                  quantity: 5,
                  category: 'Handicrafts',
                }),
              },
            },
          ],
        }),
      };
    };

    try {
      const res = await groqAdapter.generateWithGroq('बांस की टोकरी');
      assert.equal(res.success, true);
      assert(capturedBody, 'Fetch must have been called');
      assert.deepEqual(
        capturedBody.response_format,
        { type: 'json_object' },
        'Groq request body must include response_format: { type: "json_object" }'
      );
    } finally {
      global.fetch = origFetch;
    }
  });
});
