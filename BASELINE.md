# 🛑 READ THIS FIRST: PROJECT BASELINE & RULES

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

### 📜 `src/config/surveyData.js`
*   **Role:** Defines every question, option, and logic flow for the survey.
*   **Rule:** If you edit this file in the backend, you **MUST** copy the changes to the frontend (and vice versa).
*   **Path Backend:** `astro-backend-clean-main/src/config/surveyData.js`
*   **Path Frontend:** `fateflix-frontend/src/config/surveyData.js`

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

## 6. 🛠️ DEBUGGING & DEV
*   **`GET /dev/no-time`**: UI test for the "Unknown Birth Time" view.
*   **`GET /dev/chart-wheel`**: UI test for the new chart wheel visualizations.
*   **`GET /health`**: Simple ping to check if Railway is alive.

---

*Verified & Updated: Jan 6, 2026*
