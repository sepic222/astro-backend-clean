# FateFlix — Project Guardrails (Full-Stack Context)

**Last updated:** 2025-10-28  
**Owner:** Sara-Ellen Picard  
**Purpose:** Single source of truth for agents/collaborators. Read **before** making changes.

---

## Stack & repos

- **Frontend (Vite + React)**: `/Users/saraellenpicard/astro-frontend-clean` (port usually `5173`)
- **Backend (Node/Express + Prisma)**: `/Users/saraellenpicard/Documents/fateflix-code/astro-backend-clean-main` (port `3001`)
- **DB:** Prisma (SQLite in dev). Use `npx prisma studio` to inspect.

---

## High-level product

FateFlix Survey = **two coupled parts**:

1) **Cosmic (Section 1)**: birth data + geocoding → compute chart via Swiss Ephemeris → save `Chart`.
2) **Survey (Sections 2–9)**: preference questions → save a `SurveySubmission` + `SurveyResponses`.  
`SurveySubmission` links to the `Chart` via `chartId`. We analyze correlations between **chart** and **movie taste** later.

---

## Current frontend truth

- **Survey flow component**: `src/survey/SurveyFlow.tsx`
- **Section 1 (Cosmic) UI**: `src/survey/sections/Section1.tsx` renders `EmbeddedCosmicFields` from `src/components/BirthForm.jsx`
- **Birth form (standalone, legacy dev view):** `src/components/BirthForm.jsx`  
  ⚠️ Do not rely on this page as the product flow. Section 1 uses an embedded, submit-less variant.

### Data helpers (frontend)

- **Get chart:** `src/survey/api/getChart.ts` → `getChartFromSurvey(survey)`
- **Submit survey:** `src/survey/api/submitSurvey.ts` → `submitSurvey(survey, { chartId, userEmail })`

### Flow rules

- **On Continue from Section 1** → `computeChartIfNeeded()` runs, calls `/api/birth-chart-swisseph`, stores `savedChartId` in `survey.meta.chartId`.
- **Final Submit** → posts normalized payload to `/api/survey/submit` with `chartId` + `userEmail`.

### Validation (frontend)

- **Required fields** (current min set):
  - `cosmic`: `birth_location`, `birth_date`, `birth_time`, `time_accuracy`
  - `fit`: `pick_what_to_watch`, `email`
- `birth_location` is **auto-composed** in `Section1` when city/country change.
- Coordinates (`latitude`, `longitude`) are read-only, filled by debounced geocoding.

---

## Current backend truth

- **Server entry:** `server.js`
- **Key endpoints:**
  - `POST /api/birth-chart-swisseph` → computes angles/planets + **saves Chart**, returns payload with `savedChartId`
  - `POST /api/survey/submit` → saves Submission + Responses (links to `chartId`)
  - `GET /api/geocode` → OpenCage pass-through (FE also geocodes client-side)
  - `POST /api/chart-houses` → compact houses/rulers endpoint (future insights)
  - `GET /__routes` → debug route list
- **Normalizer:** `server/normalizeSurveyPayload.js`
  - Contains `KEY_MAP` to map legacy FE keys → DB keys, e.g.  
    `casting.life_role → casting.movie_role`  
    `casting.first_obsession_text → casting.first_obsession`
  - ⚠️ Ensure only **one** exported `normalizeSurveyPayload` exists (remove duplicates).

### Prisma alignment (important)

- **Chart create**: do **NOT** send unknown columns. Specifically:
  - ❌ `timeAccuracy` → **not** a column (store in `rawChart.meta.timeAccuracy`)
  - ❌ `jd` → **not** a column (already in `rawChart.jd`)
- **Store birth timing** with:
  - `birthDateTimeUtc`, `tzOffsetMinutes`
- Time accuracy:
  - Source of truth as survey response key `cosmic.time_accuracy`
  - Convenience copy at `Chart.rawChart.meta.timeAccuracy`

---

## Naming & keys

- **Question keys** are namespaced, e.g. `cosmic.time_accuracy`, `casting.movie_role`.  
- Agents must **not invent** keys; match DB or extend via migration/spec PR.

---

## Must-keep behaviors

- Section 1 geocoding is **debounced** and requires *both* city & country before calling.
- On leaving Section 1, the chart is computed **exactly once** (unless city/country/date/time change).
- `submitSurvey` always sends `{ survey, chartId, userEmail }`.
- No blocking on chart failure (toast + continue is acceptable), but **ideal** is chart computed.

---

## Things agents must not do

- Do **not** delete or rename:
  - `src/survey/SurveyFlow.tsx`
  - `src/survey/sections/Section1.tsx`
  - `src/components/BirthForm.jsx` (contains `EmbeddedCosmicFields`)
  - `server/normalizeSurveyPayload.js`
  - `server.js` route names
- Do **not** add Prisma columns without a migration.
- Do **not** remove key maps (KEY_MAP) unless the FE is updated to match DB keys.

---

## Dev scripts & ports

- Backend: `node server.js` → `http://localhost:3001`
- Frontend: `npm run dev` → `http://localhost:5173` (survey at `/survey?new=1`)
- Prisma UI: `npx prisma studio`

---

## Roadmap / Live Dev Checklist (October 2025)

### Current Focus
- [x] Connect backend to OpenAI (✅ working)
- [x] Wire Section 1 to EmbeddedCosmicFields
- [ ] Finalize Prisma schema with Survey + Astro merged
- [ ] Run safe additive migration
- [ ] Seed survey from `prisma/questions.csv`
- [ ] Test survey data queries via Prisma Studio

### Next Phase: Mini-Readings Layer
- [ ] Define `UserReading` + optional `ReadingTemplate` models
- [ ] Map which astro + survey fields feed into reading logic
- [ ] Draft OpenAI prompt templates for mini-readings
- [ ] Generate first demo reading for a test user

## Optional Enhancements
- [ ] Add email or in-app delivery tracking (`DeliveryLog`)
- [ ] Store generated readings in DB for analytics
MD

cat > context/agent-figma-brief.md <<'MD'
# Agent Brief — Implement Figma Designs into FateFlix Survey

**Goal:** Implement FateFlix Survey UI from Figma **into the existing flow** without breaking data wiring.

---

## Deliverables

- Replace placeholder UIs in all survey sections with Figma-accurate components.
- Keep current flow, API contracts, and validation logic intact.
- Achieve style parity (spacing, typography, colors, progress UI).

---

## Constraints (critical)

- **Do not** change endpoints or FE/BE function signatures:
  - FE: `getChartFromSurvey`, `submitSurvey`
  - BE: `/api/birth-chart-swisseph`, `/api/survey/submit`, `/api/geocode`
- **Do not** change question keys; use existing DB keys (see `Prisma → SurveyQuestion.key`).
- **Do not** remove `KEY_MAP` in `server/normalizeSurveyPayload.js` unless you update all FE references.
- **Do not** remove or rename:
  - `src/survey/SurveyFlow.tsx`
  - `src/survey/sections/Section1.tsx`
  - `src/components/BirthForm.jsx` (contains `EmbeddedCosmicFields`)
- **Do not** reintroduce `timeAccuracy` or `jd` as Prisma columns without a migration.

---

## Files you will edit (frontend)

- `src/survey/sections/Section1.tsx` … `Section9.tsx` → replace placeholders with Figma UI
- `src/survey/components/*` → create new components per Figma (inputs, radios, checkboxes, sliders)
- Global styles or CSS modules **near** the components you touch

---

## Keep these wiring points

- **On Continue from Section 1**: do not remove the call to compute the chart (in `SurveyFlow.tsx`).
- `continueDisabled` must reflect required fields (see `utils/validators.ts`).
- Final Submit must call:
  ```ts
  submitSurvey(survey, { chartId: survey?.meta?.chartId ?? null, userEmail })
