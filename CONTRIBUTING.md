# Contributing to FateFlix Backend

## Branches
- `main`: stable
- `feature/*`, `fix/*`, `chore/*`, `docs/*`: work branches

## Commit style
## 🧭 Repository Overview
- **Main branch (`main`)** — production-ready and stable.  
- **Feature branches (`feature/...`)** — for all new development (never commit directly to `main`).  
Use concise, imperative messages:
- `feat: add survey submit endpoint`
- `fix: guard ascendant NaN`
- `chore: .env example + docs`

## Setup (local)
1. `npm install`
2. Copy `.env.example` → `.env` and set values
3. `npx prisma migrate dev`
4. `node server.js` → http://localhost:3001

Update: 🔧 Local Setup
1. **Fork** this repository on GitHub.
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/astro-backend-clean.git
   cd astro-backend-clean
   npm install

## Endpoints to sanity-check
- `POST /api/birth-chart-swisseph` (chart compute)
- `GET /api/birth-chart-swisseph?...` (browser test)
- `POST /api/chart-houses` (compact)
- `GET /api/geocode?city=...&country=...` (needs OPENCAGE key)
- `POST /api/survey/submit` (normalized survey answers)

## PR checklist
- [ ] No secrets committed (`.env`, `prisma/dev.db`)
- [ ] New env vars reflected in `.env.example`
- [ ] Endpoint(s) tested locally; include sample payloads if relevant
- [ ] Prisma migration included if schema changed
