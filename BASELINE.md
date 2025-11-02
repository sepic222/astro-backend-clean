# FateFlix Backend — Technical Baseline

This document provides a high-level overview of the FateFlix backend architecture, core technologies, and key design principles.  
It represents the **current stable version (v1.1-stable-backend, November 2025)** of the project.

---

## 🧱 System Architecture

![FateFlix Backend Architecture](./architecture-diagram.png)

---

## ⚙️ Core Components

| Component | Description |
|------------|-------------|
| **server.js** | Entry point for all routes. Configures Express, loads env variables, and defines `/api` endpoints. |
| **prisma/schema.prisma** | Database schema for all models (Charts, Surveys, Responses, Submissions, Outbox, Readings). |
| **server/normalizeSurveyPayload.js** | Standardizes survey submissions before saving. |
| **server/mailer.js** | Handles transactional email sending (via Resend API). |
| **server/readings.js** | Generates the user’s personalized reading summary. |
| **tools/** | Audit and validation scripts for ensuring data consistency. |
| **scripts/** | Test and automation utilities (resend_failed.mjs, etc.). |
| **context/** | Documentation for Codex/Agents and project alignment. |

---

## 🌍 Key Endpoints

| Route | Method | Purpose |
|-------|---------|---------|
| `/health` | GET | Basic server health check |
| `/api/geocode` | GET | Geocode city + country via OpenCage |
| `/api/birth-chart-swisseph` | POST | Compute and persist a full astrological chart |
| `/api/survey/submit` | POST | Save user survey responses and trigger email generation |
| `/__routes` | GET | Debug: list all registered endpoints |
| `/dev/email/preview/:outboxId` | GET | Preview a stored email HTML in the browser |

---

## 🧠 Data Model Overview

### Main Prisma Models
- `Chart` — Birth data, calculated positions, and angles  
- `SurveyQuestion` / `SurveyResponse` — Structured survey framework  
- `SurveySubmission` — Links user responses to their chart  
- `ResponseOption` — Multiple choice and checkbox options  
- `Reading` — Stores generated reading summaries per submission  
- `EmailOutbox` — Stores all outgoing email data and statuses  

### Relations
- One `Chart` → Many `SurveySubmissions`  
- One `Submission` → Many `SurveyResponses`  
- One `Submission` → One `Reading`  
- One `EmailOutbox` → Optional `Chart` and `Submission` links  

---

## 🧩 Deployment Notes

| Environment | Description |
|--------------|-------------|
| **Local** | Run with `node server.js` (port 3001). Connect frontend via `VITE_API_BASE=http://localhost:3001`. |
| **Render** | Backend host for production (connected to main branch). |
| **Vercel** | Frontend hosting, connected to this backend API. |

---

## 🧰 Developer Utilities

| Command | Description |
|----------|-------------|
| `npx prisma studio` | Opens the local database viewer |
| `node tools/audit-prisma-vs-server.cjs` | Validates schema vs routes |
| `node tools/audit-survey-coverage.cjs` | Checks if all survey sections are implemented |
| `npm run dev` | Starts backend in dev mode |
| `node scripts/resend_failed.mjs` | Retries failed emails in the outbox |

---

## 🛠️ Versioning

| Version | Tag | Date | Status |
|----------|-----|------|--------|
| v1.1-stable-backend | `v1.1-stable-backend` | Nov 2025 | ✅ Stable |
| v1.0.0 | `v1.0.0` | Sep 2025 | Deprecated |

---

## 🧭 Maintainers
- **Sara-Ellen Picard** — Founder & Product Lead  
- **Frontend:** (TBD)  
- **Backend Support:** GPT-5 / Codex (assistant integration)

---

**Last Updated:** November 2025  
© FateFlix 2025 – All rights reserved.
