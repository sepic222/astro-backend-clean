# 📌 FateFlix Baseline – Stable Version

This file logs the known **stable** commits for both the backend and frontend, so we can always roll back if needed.

---

## Backend  
**Repo:** https://github.com/sepic222/astro-backend-clean  
**Stable Commit:** `bc22d5b`  
**Description:** Stable backend with working birth chart, geocode, and test endpoints.  
**Date:** 2025-08-11  

---

## Frontend  
**Repo:** https://github.com/sepic222/astro-frontend-clean  
**Stable Commit:** `79f21f8`  
**Description:** Stable frontend with API helper, geocode stability, and working local+deployed config.  
**Date:** 2025-08-11  

---

## Notes  
- Backend runs locally on **port 3001**.  
- Frontend runs locally on **port 5173** (Vite may choose 5174 if 5173 is taken).  
- `.env.local` in frontend must contain:  
  ```env
  VITE_API_BASE="http://localhost:3001"# FateFlix Stable Baseline – 2025-08-11

## 📌 Frontend
**Repo:** astro-frontend-clean  
**Commit:** `79f21f8`  
**Message:** Frontend: validation + API helper + geocode stability  
**Hosting:** Vercel – linked to `main` branch  
**Local folder:** `/Users/saraellenpicard/astro-frontend-clean`  

## 📌 Backend
**Repo:** astro-backend-clean-main  
**Commit:** `bc22d5b`  
**Message:** Backend: validation + API helper + geocode stability  
**Hosting:** Render – linked to `main` branch  
**Local folder:** `/Users/saraellenpicard/Documents/FATEFLIX - CODE/astro-backend-clean-main`  

---

## 🌍 Environment Variables
**Frontend:** `.env.local`

**Backend:** `.env`

---

## 🔍 Health Checks
- Backend test endpoint:  
  https://astro-backend-clean-main.onrender.com/api/test  
- Frontend local dev:  
  http://localhost:5173

---

## 📝 Notes
- `.env.local` is excluded from GitHub for security, so remember to update it manually after cloning.  
- Vercel frontend will call the deployed backend once `VITE_API_BASE` is updated in its environment variables.  
