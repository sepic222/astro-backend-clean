# Fateflix Context

This file is the single source of truth for Cursor and ChatGPT.

- Database schema lives in `prisma/schema.prisma`
- Survey data: `prisma/questions.csv` + `prisma/seed.js`
- Backend entry: `server.js`
- Always make additive Prisma migrations first (optional → backfill → required)
- OpenAI key stays in backend only

---

## 🗺️ Project Structure Overview

### Paths
- **Backend root:** `/Users/saraellenpicard/Documents/fateflix-code/astro-backend-clean-main`
  - Database schema: `prisma/schema.prisma`
  - Seed data: `prisma/questions.csv` + `prisma/seed.js`
  - Environment file: `.env` (contains `OPENAI_API_KEY`)
  - Server entry: `server.js` (Express + Prisma + SQLite)
  - Deployed version: Render

- **Frontend root:** `/Users/saraellenpicard/astro-frontend-clean`
  - React + Vite survey flow
  - Dynamically loads questions from backend API
  - Target endpoint for survey responses: `POST /api/survey/submit`
  - Local dev server: http://localhost:5173
  - Backend runs on port 3001 → update proxy in `vite.config.ts` accordingly

---

## 🌌 Fateflix Database & Survey Overview

### Goal
Unify astrology data (birth charts) and personality/film survey data into a single Prisma schema for Fateflix personalization logic.

### Architecture
| Domain | Key Models | Description |
|--------|-------------|-------------|
| **Astrology** | `User`, `Chart`, `House`, `Planet`, `Aspect` | Stores user’s birth data and computed chart details |
| **Survey** | `SurveySection`, `SurveyQuestion`, `SurveyOption`, `SurveyResponse`, `ResponseOption` | Defines survey structure (43 questions, sections I–IX) and user answers |
| **Integration** | `User` ↔ `Chart`, `User` ↔ `SurveyResponse` | Allows combining astrological and behavioral data for recommendations |

---

### Rules for Editing & Migration
- All schema changes must be **additive first** (`?` → backfill → required).
- Avoid destructive migrations (drops, renames) on live tables.
- If Prisma fails with “cannot add required column” → mark it optional first, backfill, then update.
- Never edit `dev.db` manually.
- Seed only from `prisma/questions.csv`; do not hardcode survey text in JS/TS.

---

### Seeding & Data Files
| File | Purpose |
|------|----------|
| `prisma/questions.csv` | Canonical list of 43 survey questions + options (exported from Figma spec) |
| `prisma/seed.js` | Parses CSV and populates `SurveySection`, `SurveyQuestion`, `SurveyOption` tables |
| `scripts/backfill-chart.js` | Optional: populate missing `birthDateTimeUtc` or `tzOffsetMinutes` |
| `scripts/openai-smoke.mjs` | Verifies OpenAI connection (use for quick API sanity checks) |

---

### Backend–Frontend Connection
- Backend API runs on `http://localhost:3001`
- Frontend (Vite dev) runs on `http://localhost:5173`
- Add this to `vite.config.ts` for local testing:
  ```ts
  export default {
    server: {
      proxy: {
        "/api": "http://localhost:3001",
      },
    },
  };
---

## ✅ Live Dev Checklist (October 2025)

### Current Focus
- [x] Connect backend to OpenAI (✅ working)
- [ ] Finalize Prisma schema with Survey + Astro merged
- [ ] Run safe additive migration
- [ ] Seed survey from `prisma/questions.csv`
- [ ] Test survey data queries via Prisma Studio

### Next Phase: Mini-Readings Layer
- [ ] Define `UserReading` + optional `ReadingTemplate` models
- [ ] Map which astro + survey fields feed into reading logic
- [ ] Draft OpenAI prompt templates for mini-readings
- [ ] Generate first demo reading for a test user

### Optional Enhancements
- [ ] Add email or in-app delivery tracking (`DeliveryLog`)
- [ ] Store generated readings in DB for analytics
