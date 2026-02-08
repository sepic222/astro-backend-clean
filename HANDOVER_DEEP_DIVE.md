# 🎯 Handover: Deep Dive Dashboard & High-Fidelity Chart Integration

## 📋 Context & Objective
The user wants to add a "Deep Dive" view to the Admin Dashboard. This view will focus on a high-fidelity visual representation of the birth chart (the "Chart Wheel") and potentially transit data in the future.

### Current Status
- **Admin Dashboard**: Located at `/admin/dashboard` and `/admin/data`. It currently shows a list and a 2D table of responses. 
- **CSV Export**: Optimized at `/admin/export` to handle large datasets via bulk-fetching.
- **Chart Wheel**: An active but "hidden" logic exists at `GET /reading/:submissionId/chart.svg`. 
    - *Note*: This endpoint currently returns **HTML** containing an SVG to allow for Apple-style metadata overlays and premium styling.
    - *Logic*: The SVG is generated via `buildChartWheelHtml(chartDTO)` in `server.js`.

## 🛠️ Technical Implementation Details for the Next Agent

### 1. Data Flow (Birth Chart)
- All calculated astrological data resides in the `Chart` table, linked to `SurveySubmission` via `chartId`.
- The `Chart.rawChart` field (JSONB) is the primary source of truth for planetary longitudes, house cusps, and aspects.
- **Key Helper**: `buildChartWheelHtml(chartDTO)` transforms raw longitudes into a visual SVG.

### 2. Integration Plan
1.  **Add "Deep Dive" Button**: Update `views/admin_data.ejs` and `admin_dashboard.ejs` to include a "Deep Dive" link for each submission.
    - URL structure: `/admin/deep-dive/:submissionId`
2.  **Create Admin Route**: In `server.js`, implement `app.get('/admin/deep-dive/:submissionId')`.
    - It must fetch the `SurveySubmission` + `Chart` + `Reading`.
    - Use the existing `isTestSubmission` helper to clearly flag if the data is a test.
3.  **Render High-Fidelity View**:
    - Use a new EJS template `views/admin_deep_dive.ejs`.
    - Embed the SVG wheel logic. You can call `buildChartWheelHtml` and pass the `chartDTO`.
4.  **Transits (Phase 1.5)**:
    - To show transits, you will need to call the Swiss Ephemeris (`swisseph`) using the *current* date/time.
    - Compare current planetary longitudes against the birth longitudes found in the `Chart` record.
    - Update `buildChartWheelHtml` to support an optional secondary array of "outer ring" planets.

## 📁 Critical Files to Review
- `astro-backend-clean-main/server.js`: Look for the `/admin` routes and the `buildChartWheelHtml` function (~line 1395).
- `astro-backend-clean-main/prisma/schema.prisma`: Understand the `Chart` and `SurveySubmission` relationship.
- `astro-backend-clean-main/BASELINE.md`: Read the "Data Deletion Policy" and "Admin Dashboard" sections for operational rules.

## 🛑 Rules for the Next Agent
- **Do not break the CSV Export**: The recent performance optimizations (bulk fetching) are critical.
- **Maintain Aesthetic**: The user expects "Rich Aesthetics" (Glassmorphism, Apple-style clean layouts).
- **Primary Source**: Always prefer `SurveySubmission.fullData` for raw answer interpretations.
