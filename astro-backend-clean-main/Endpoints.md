# FateFlix Backend — Endpoints

*Last Updated: Feb 5, 2026*

This file organizes active API endpoints. Authoritative implementations live in `server.js`.

----

## 🟢 High Priority — Core Product

### 📝 Survey & Submission
- **`POST /api/survey/submit`**
  - **Purpose**: Main survey completion handler. Persists `SurveySubmission` and merged JSONB `fullData`.
  - **Trigger**: Final "See Results" click.
  - **Notes**: Reuses existing `submissionId` if provided to avoid duplicates.

- **`GET /api/reading/:submissionId`**
  - **Purpose**: Returns the calculated interpretation JSON used by the interactive dashboard.

### 🧮 Astrological Calculations (Swiss Ephemeris)
- **`POST /api/birth-chart-swisseph`**
  - **Purpose**: Computes full chart data (planets, aspects).
  - **Inputs**: `date`, `time`, `latitude`, `longitude`.
  - **Source**: [server.js:L2083](file:///Users/saraellenpicard/Documents/fateflix-code/astro-backend-clean-main/server.js#L2083)

- **`POST /api/chart-houses`**
  - **Purpose**: Calculates house cusps and rulers.
  - **Source**: [server.js:L4534](file:///Users/saraellenpicard/Documents/fateflix-code/astro-backend-clean-main/server.js#L4534)

----

## 🏢 Admin & Data Management

### 📊 Dashboard Views
- **`GET /admin/dashboard`**: High-level overview of submissions with test/real filtering.
- **`GET /admin/data`**: Full spreadsheet view of all answers (dynamic reconstructed logic).
- **`GET /admin/latest-report`**: Visual breakdown of the most recent submission.

### 📤 Data Export
- **`GET /admin/export`**: Downloads a CSV of all submissions.
- **Optimization**: Uses bulk reading fetching and Map-based lookups for speed.
- **Compatibility**: UTF-8 BOM enabled for Excel; date-stamped filename.

----

## 🛠️ Debug & Dev Utilities

- **`GET /health`**: Simple health check (returns `{ ok: true }`).
- **`GET /ping`**: Latency/uptime check.
- **`GET /dev/no-time`**: UI test for "Unknown Birth Time" flow.
- **`GET /dev/chart-wheel`**: UI test for chart visualizations.

---

## 🗑️ Deprecated (Do Not Use)
- ❌ **`GET /api/geocode`**: OpenCage service removed.
- ❌ **Resend Endpoints**: All email has migrated to Loops.so.