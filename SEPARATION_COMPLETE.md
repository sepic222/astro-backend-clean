# Frontend/Backend Separation - Implementation Complete

## Summary

The codebase has been successfully prepared for separate frontend and backend deployments. All code changes have been implemented.

## Backend Changes (Current Repository)

### ✅ Completed

1. **Dockerfile Simplified**
   - Removed Astro build step
   - Changed back to `npm ci --omit=dev` (no dev dependencies needed)
   - Backend now only builds what it needs

2. **server.js Updated**
   - Removed all frontend serving code (dist/ folder serving, catch-all routes)
   - Removed root route that served frontend
   - Kept asset serving (`/assets/` routes) for reading HTML assets (Blue Planet, etc.)
   - Updated CORS to accept requests from frontend (configurable via `FRONTEND_URL` env var)

3. **package.json Cleaned**
   - Removed all frontend dependencies (Astro, React, Tailwind, etc.)
   - Removed frontend-related scripts (`dev`, `build`, `start` with concurrently)
   - Kept only backend dependencies

4. **No-Time Logic Verified**
   - Blue Planet screen logic remains intact in `server.js` (lines 2939-3004)
   - Blue Planet asset verified at `public/assets/blue planet.png`
   - Asset serving remains functional at `/assets/blue%20planet.png`

## Frontend Changes (Ready for Extraction)

### ✅ Completed

1. **API Calls Updated**
   - All API calls now use `PUBLIC_API_BASE` environment variable
   - Falls back to `http://localhost:3001` in development if `PUBLIC_API_BASE` not set
   - Updated files:
     - `src/components/FateFlixSurvey.jsx` (4 locations)
     - `src/context/SurveyContext.jsx` (1 location)

2. **Astro Config Updated**
   - Removed `server.proxy` configuration (not needed on Vercel)
   - Clean, minimal config ready for Vercel deployment

3. **Extraction Documentation Created**
   - `FRONTEND_EXTRACTION.md` - Complete extraction guide
   - `FRONTEND_PACKAGE.json` - Frontend package.json template
   - `FRONTEND_ENV.example` - Environment variable template
   - `FRONTEND_GITIGNORE` - Frontend .gitignore template

## Next Steps (Manual Actions Required)

### Backend Deployment (Railway)

1. **Push Changes to Git**
   ```bash
   git add .
   git commit -m "Separate frontend/backend: remove frontend serving, clean dependencies"
   git push origin fix/linux-swisseph-build
   ```

2. **Railway Will Auto-Deploy**
   - Railway will detect the new commit
   - Build will use the simplified Dockerfile (no Astro build)
   - Backend will serve only API routes and assets

3. **Update Environment Variables in Railway**
   - Add `FRONTEND_URL` (optional, for CORS - defaults to `*` if not set)
   - Verify existing variables are still set:
     - `DATABASE_URL`
     - `PORT`
     - `OPENCAGE_API_KEY` (if used)
     - `RESEND_API_KEY` (if used)

### Frontend Deployment (Vercel)

1. **Create New Repository**
   - Create a new Git repository (e.g., `fateflix-frontend`)
   - Follow the guide in `FRONTEND_EXTRACTION.md`

2. **Copy Frontend Files**
   - Copy `src/` directory
   - Copy `public/assets/survey-logo.svg` (ONLY this file from public/assets)
   - Copy `astro.config.mjs`
   - Copy `tailwind.config.mjs`
   - Use `FRONTEND_PACKAGE.json` as template for `package.json`
   - Use `FRONTEND_ENV.example` as template for `.env.example`
   - Use `FRONTEND_GITIGNORE` as template for `.gitignore`

3. **Deploy to Vercel**
   - Connect repository to Vercel
   - Add environment variables:
     - `PUBLIC_API_BASE`: Your Railway backend URL (e.g., `https://myreading.fateflix.app`)
     - `PUBLIC_GOOGLE_MAPS_KEY`: Your Google Maps API key
   - Vercel will auto-detect Astro and deploy

## Architecture After Separation

```
┌─────────────────────────────────────┐
│   Frontend (Vercel)                 │
│   - Astro + React                   │
│   - Survey UI                       │
│   - public/assets/survey-logo.svg   │
│                                     │
│   API Calls →                       │
└───────────────┬─────────────────────┘
                │
                │ HTTPS
                │
┌───────────────▼─────────────────────┐
│   Backend (Railway)                 │
│   - Express API                     │
│   - Chart computation               │
│   - Reading HTML generation         │
│   - public/assets/                  │
│     ├── blue planet.png            │
│     ├── greenglow.png              │
│     └── ... (reading assets)       │
└─────────────────────────────────────┘
```

## Testing Checklist

After both deployments are complete:

- [ ] Frontend loads on Vercel URL
- [ ] Survey form displays correctly
- [ ] City search works (Google Maps API)
- [ ] Section 1 submission creates chart and submissionId
- [ ] Real-time answer saving works (calls Railway API)
- [ ] Final submission generates reading
- [ ] Reading displays correctly:
  - [ ] Badge shows
  - [ ] Chart SVG shows (if time known)
  - [ ] Reading Part 1 shows
  - [ ] Reading Part 2 shows:
    - [ ] Blue Planet screen for no-time users
    - [ ] Full chart ruler content for exact time users
- [ ] All assets load correctly:
  - [ ] Frontend: survey-logo.svg
  - [ ] Backend: Blue Planet and other reading assets

## Important Notes

1. **Assets Split**: 
   - Frontend only needs `survey-logo.svg`
   - All reading assets (Blue Planet, stars, etc.) remain on backend and are served via `/assets/` routes

2. **CORS**: 
   - Backend CORS is configured to accept requests from frontend
   - Set `FRONTEND_URL` in Railway for production, or it defaults to `*` (allows all)

3. **Environment Variables**:
   - Frontend: All variables must be prefixed with `PUBLIC_` to be accessible in browser
   - Backend: Standard environment variables (no `PUBLIC_` prefix)

4. **No-Time Logic**:
   - Completely backend-side (reading HTML generation)
   - Will continue to work as long as Blue Planet asset is accessible at `/assets/blue%20planet.png`

