# 🛑 READ THIS FIRST: PROJECT BASELINE & RULES

## 0. 📜 AGENT ACKNOWLEDGEMENT (MANDATORY)
**Before performing ANY task, you must:**
1. Read this entire document.
2. Verify you have access to both repositories (Section 1).
3. **Acknowledge to the user** that you have read this baseline and state the current "Last Verified" date shown at the bottom.

---

**To any Agent taking over this project:**
This document is the **Source of Truth**. Ignore it at your own peril (and the user's frustration).

---

## 1. 🏗️ THE WORKSPACE RULE (CRITICAL)

**You MUST have BOTH of these folders active in your workspace at all times:**

1.  **Backend:** `astro-backend-clean-main` (The Logic & API)
2.  **Frontend:** `fateflix-frontend` (The UI & Vercel Deployment)

**The Problem:** These are two *separate* git repositories that share critical configuration. Changes often need to be mirrored. If you do not see the frontend folder, **ASK THE USER TO ADD IT** immediately.

---

## 2. 🔄 SYNCHRONIZATION RULES

There are files that exist in **BOTH** repositories. You must keep them identical.

### 📜 `src/config/surveySchema.js` (Auto-Synced)
*   **Role:** Defines the questions and logic for the survey.
*   **Source of Truth:** `fateflix-frontend/src/config/surveyData.js`
*   **Backend Mirror:** `astro-backend-clean-main/src/config/surveySchema.js`
*   **Rule:** This file is **AUTO-GENERATED**. Do not edit it directly in the backend. To update it, edit `surveyData.js` in the frontend and run `npm run sync-schema` in the backend.
*   **Command:** `npm run sync-schema` (Triggers the `scripts/sync-survey-schema.js` logic).

### 🎨 Static Assets
*   **Role:** Images, planet PNGs, fonts in `public/assets`.
*   **Rule:** If a new asset is added to the backend (e.g. for generating emails or HTML readings), it usually needs to be in the Frontend `public/assets` too so mobile users can load it.

---

## 3. 🗺️ ARCHITECTURE & DEPLOYMENT

| Repository | Role | Deployed To | Key Tech |
| :--- | :--- | :--- | :--- |
| **astro-backend-clean-main** | API, Database, Reading Gen, Email | **Railway** | Node.js, Express, Prisma, Loops.so |
| **fateflix-frontend** | User Interface, Survey Flow | **Vercel** | Astro, React, Tailwind |

---

## 4. 🔌 ACTIVE API ENDPOINTS (The "List")

Do not assume an endpoint exists unless it is on this list. We have removed many legacy services (OpenCage, Resend, etc).

### 📝 Survey & Submission
*   **`POST /api/survey/submit`**
    *   **Purpose:** The main handler for finishing a survey. saves data, calculates charges, creates a `Reading` record, and triggers the email.
    *   **Status:** ✅ ACTIVE

### 🔮 Reading & Results (Dashboard)
*   **Frontend (React):** The "Reading" is a **1-page React build**. It dynamically renders the layout (e.g. "No Time" vs "Co-Ruler" view) based on the data received.
*   **Backend (Data API):**
    *   **`GET /api/reading/:submissionId`**
        *   **Purpose:** Returns the **JSON data** (Planets, Houses, Rulers) used by the React Frontend to build the dashboard.
        *   **Status:** ✅ ACTIVE (Primary Source)
*   **Backend (HTML Views/Previews):**
    *   *Note: These generate static HTML (Server-Side), often used for email previews or debug, but are NOT the main React interactive dashboard.*
    *   **`GET /reading/:submissionId/html`** (Planets View)
    *   **`GET /reading/:submissionId/html/2`** (Houses/Ruler View)

### 🧮 Astrological Calculation
*   **`POST /api/birth-chart-swisseph`**
    *   **Purpose:** Calculates planet positions using Swiss Ephemeris.
    *   **Status:** ✅ ACTIVE
*   **`POST /api/chart-houses`**
    *   **Purpose:** Calculates House cusps and rulers.
    *   **Status:** ✅ ACTIVE

### 📧 Email Service
*   **Service Provider:** **Loops.so** (Migrated from Resend)
*   **Required Env Vars:** `LOOPS_API_KEY`, `LOOPS_TRANSACTIONAL_ID`
*   **Trigger:** Automated inside `sendReadingEmail()` after survey submission.

---

## 5. 🗑️ DEPRECATED / GHOST CODE

**DO NOT USE OR RESURRECT:**
*   ❌ **Resend**: Completely removed. Do not import `resend`.
*   ❌ **OpenCage**: Removed.
*   ❌ **Old `/api/user` routes**: Mostly replaced by the direct survey flows.

---

## 6. �️ DATABASE & DATA MODELS
*   **Provider:** PostgreSQL (Railway)
*   **ORM:** Prisma
*   **Schema:** `astro-backend-clean-main/prisma/schema.prisma`

### 🔑 Key Tables (Core Flow)
1.  **`SurveySubmission`**: The central hub for a user's session.
    *   **Crucial Field:** `fullData` (JSONB) - Stores the complete raw event/answer object. **Primary Source of Truth** for user answers to ensure 100% persistence.
    *   Links to `userEmail`, `chartId`, `responses`.
2.  **`Chart`**: Stores the calculated astrological data (planets, houses, aspects, raw JSON).
3.  **`Reading`**: Stores the generated result summary text and is linked to `submissionId`.
    *   **Field Note**: Use `summary` for the interpretation text (avoid the deprecated `content` field).
4.  **`EmailOutbox`**: Tracks transactional emails sent via Loops.so (status, error logs).

> [!IMPORTANT]
> **Data Deletion Policy**: When deleting a `SurveySubmission`, ensure you also delete its associated `Reading` and `SurveyResponse` records. If the associated `Chart` is not used by any other submission, it should be deleted as well to keep the database clean.

### 📝 Survey Structure & Responses
*   **Structure:** `SurveySection` → `SurveyQuestion` → `SurveyOption` (Defines the survey schema in DB).
*   **Responses:**
    *   `SurveyResponse`: Individual answer link.
    *   `SurveyResponseOption`: Junction for multi-select checkboxes.
    *   *Note: While these tables exist for granular querying, always check `SurveySubmission.fullData` for the raw complete state.*

### 🔮 Interpretation Reference Data
*   Tables storing static text content for the report generation:
    *   `AscSignInterpretation`, `PlanetSignInterpretation`, `PlanetHouseInterpretation`, `ChartRulerSignInterpretation`, etc.

### 🛠️ Common Commands
*   `npx prisma generate`: Syncs the Prisma Client with the schema (run after schema changes).
*   `npx prisma studio`: Opens a GUI to view and edit database records.

---

## 7. �🛠️ DEBUGGING & DEV
*   **`GET /dev/no-time`**: UI test for the "Unknown Birth Time" view.
*   **`GET /dev/chart-wheel`**: UI test for the new chart wheel visualizations.
*   **`GET /health`**: Simple ping to check if Railway is alive.


---

## 8. 🏢 ADMIN DASHBOARD & TOOLS

Access these routes via the /admin prefix.

### 📊 Views
*   **GET /admin/dashboard**: High-level overview of recent submissions with "Real" vs "Test" filtering.
*   **GET /admin/data**: Spreadsheet-style 2D table of all answers, dynamically reconstructed from both SurveyResponse tables and the fullData JSONB field.
*   **GET /admin/latest-report**: Quick view of the most recent submission's detailed breakdown.

### 📥 Data Export
*   **GET /admin/export**: Generates a CSV of all submissions.
*   **Optimization Rule**: This route fetches Reading data in **bulk** using a Map to avoid N+1 query timeouts.
*   **Formatting**: Includes a UTF-8 BOM for Excel compatibility and custom date-based filenames (fateflix_export_YYYY-MM-DD.csv).

---

*Verified & Updated: Feb 5, 2026 (Added Admin Dashboard & Data Export documentation)*
