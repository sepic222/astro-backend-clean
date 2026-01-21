# FateFlix Backend — Endpoints

Generated from the repository sepic222/astro-backend-clean on 2025-11-03 UTC. This file organizes discovered API endpoints by priority/usage for sharing with the team. Results were gathered from server.js, README, API.http and project docs; verify by checking server.js for the authoritative implementation.

----

High priority — core product (frontend depends on these)

- POST /api/birth-chart-swisseph
  - Purpose: Compute a full birth chart using Swiss Ephemeris and save a Chart record.
  - Required: date, time, latitude, longitude. Optional: city, country, userEmail, timeAccuracy.
  - Called by: frontend Section 1 (computeChartIfNeeded). Produces savedChartId used for survey linking.
  - Notes: Returns computed chart payload and savedChartId; critical for downstream personalization.

- POST /api/survey/submit
  - Purpose: Final survey submission endpoint. Normalizes payload, links to chartId, triggers reading/email generation.
  - Required: userEmail, answers array (chartId optional).
  - Called by: frontend final-submit flow.
  - Notes: Primary data capture for the survey; persists Submission + Responses.

- GET /api/geocode
  - Purpose: Forward geocoding via OpenCage; returns latitude and longitude.
  - Required query params: city, country. Optional userEmail.
  - Called by: frontend to auto-fill coordinates based on city/country.
  - Notes: Requires OPENCAGE_API_KEY on the server.

- GET /health
  - Purpose: Health check for deployments and local sanity checks.
  - Response: { ok: true, status: 'healthy' }

----

Medium priority — supporting / diagnostic

- POST /api/chart-houses
  - Purpose: Compact houses/rulers computation (houses, houseSigns, planets by house, etc.).
  - Required: date, time, latitude, longitude.
  - Notes: Used for lighter-weight insights and diagnostics.

- POST /api/chart-houses/ping
  - Purpose: Lightweight ping for the chart-houses module.
  - Notes: Returns { ok: true }.

- POST /api/survey-response
  - Purpose: Save a normalized survey response into Prisma (creates response + answers rows).
  - Required: surveyId and answers[].
  - Notes: Lower-level storage endpoint used by imports/tools or alternate flows.

- GET /api/ai/test
  - Purpose: Small OpenAI smoke test endpoint; verifies OpenAI connectivity.
  - Notes: Useful when debugging AI-driven features.

----

Low priority — dev / debug utilities

- GET /
  - Purpose: Root — returns 'OK'.

- GET /_whoami
  - Purpose: Debug information (cwd, __dirname, route count).

- GET /__routes
  - Purpose: Lists registered Express routes for debugging and discovery.

- GET /dev/email/preview/:outboxId
  - Purpose: Dev-only: display stored email HTML previews for local testing.

----

Documented / verify

- GET /api/test
  - Notes: Referenced in BASELINE.md as a deployed test endpoint (https://astro-backend-clean-main.onrender.com/api/test). I did not find an explicit /api/test handler in the sampled server.js snippets; verify the exact handler in server.js or on the deployed instance.

----

Notes & next steps

- This file is a shareable summary for the team. The authoritative implementations and parameter validation live in server.js — review that file for exact request/response shapes and error codes.
- If you want, I can also: produce a Postman collection (JSON), CSV/JSON export of these endpoints, or open a PR adding this file to the repository README. Please tell me which you prefer.

----

Repository search link (code search for "/api/"):
https://github.com/sepic222/astro-backend-clean/search?q=%2Fapi%2F&type=code