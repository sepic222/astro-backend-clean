# FateFlix Stable Baseline – 2025-08-11

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
