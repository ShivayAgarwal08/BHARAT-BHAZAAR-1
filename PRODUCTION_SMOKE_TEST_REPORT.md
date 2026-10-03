# Bharat Bazaar — Production Smoke Test Report

## Deployment
- **Frontend URL:** https://bharat-bhazaar-1.vercel.app
- **Backend URL:** https://bharat-bazaar-api.onrender.com

## Summary
All tested core workflows and endpoints are fully functional in the production environment. There are no critical failures, and the backend securely handles requests with appropriate role-based restrictions.

| Area | Result | Notes |
|------|--------|-------|
| Authentication | PASS | Logins succeed for both roles, token generation works, unauthenticated access gracefully returns 401. |
| Artisan Product Flow | PASS | AI Product Generation works successfully (`gemini-3.8-flash` deployed correctly). |
| Marketplace | PASS | Products and requests endpoints load properly. Interns can successfully view open requests. |
| Project Workflow | PASS | Projects load correctly, chat history functions, and messaging works. Project data correctly protected. |
| CORS & Deployment | PASS | Vercel frontend communicates seamlessly with the Render backend without origin errors. No localhost URLs present. |
| Security | PASS | Role restrictions properly implemented. (e.g., Interns receive 403 on AI generation, unassociated users receive 403 on projects). |
| UI | PASS WITH NOTES | Core pages load successfully with responsive layouts; however, browser-based tests indicate a high AI model usage warning that is transient. |

## Detailed Test Results

### 1. Authentication
- **Login as ARTISAN:** PASS (Returns 200 with JWT)
- **Login as INTERN:** PASS (Returns 200 with JWT)
- **Verify `/me` works:** PASS (Returns 200 with correct profile info)
- **Verify unauthenticated protected requests:** PASS (Returns 401 Unauthorized)

### 2. Artisan Product Flow
- **AI Product Creation:** PASS
  - Triggered with: `"Handcrafted wooden toy made by a local artisan"`
  - Successfully generated and parsed title, description, price, quantity, and category.
  - Returned HTTP 200 containing valid JSON. No ghost products were published to the database.

### 3. Marketplace
- **Verify products load:** PASS (`GET /api/products` returns products array)
- **Verify Growth Manager requests load:** PASS (`GET /api/requests` returns 200 OK)
- **Verify an INTERN can view open requests:** PASS (Intern authenticated requests fetch data successfully)

### 4. Project Workflow
- **Verify existing project/workspace loads:** PASS (Successfully loaded existing test project ID)
- **Verify project membership protection:** PASS (Attempt to view project with a freshly registered, unrelated user account securely returned 403 Forbidden)
- **Verify chat history loads:** PASS (`GET /api/projects/:id/messages` returns messages array)
- **Verify sending a message works:** PASS (`POST /api/projects/:id/messages` successfully returns 201 Created and saves the automated message)

### 5. CORS and Deployment
- **Verify Vercel frontend communicates with Render backend:** PASS (Preflight `OPTIONS` returned 204 with correct `Access-Control-Allow-Origin: https://bharat-bhazaar-1.vercel.app`)
- **Verify no localhost API URL is being used:** PASS (Verified via network requests and source configuration)

### 6. Security Smoke Test
- **Verify protected endpoints reject unauthenticated access:** PASS
- **Verify role restrictions still work:** PASS (Confirmed by attempting to call the Artisan-only AI Generation endpoint with an Intern token, which successfully resulted in a 403 Forbidden).

### 7. UI
- **Check main production pages:** PASS WITH NOTES
  - The deployed application runs gracefully on the Vercel edge network. No broken layouts or console errors block functionality.

## Cleanup Actions Completed
- Deleted temporary internal debugging Node scripts (`test_ai.js`, `test_ai_production.js`, `find_accounts.js`, `smoke_test.js`, `test_project.js`, `test_gemini.js`, `get_token.js`) from the local working directory.
- No destructive database modifications were made.
