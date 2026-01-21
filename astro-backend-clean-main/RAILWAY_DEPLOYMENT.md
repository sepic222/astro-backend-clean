# Railway Deployment Guide

## Overview
This guide walks you through deploying the FateFlix backend to Railway for production testing with real data.

## Prerequisites
- Railway account (sign up at https://railway.app)
- GitHub repository connected to Railway
- OpenAI API key
- OpenCage API key (for geocoding)

## Deployment Steps

### 1. Create New Railway Project
1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository: `astro-backend-clean-main` (or your repo name)
5. Railway will detect the Dockerfile automatically

### 2. Add PostgreSQL Database
1. In your Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create a PostgreSQL service
4. The `DATABASE_URL` environment variable will be automatically set

### 3. Set Environment Variables
In your Railway service settings, add these environment variables:

**Required:**
- `OPENAI_API_KEY` - Your OpenAI API key (starts with `sk-...`)
- `OPENCAGE_API_KEY` - Your OpenCage API key (for geocoding)
- `NODE_ENV=production`

**Auto-provided by Railway:**
- `DATABASE_URL` - Automatically set when you add PostgreSQL
- `PORT` - Automatically set by Railway (usually 3001 or dynamic)

### 4. Deploy
1. Railway will automatically deploy when you push to your connected branch
2. Or click "Deploy" in the Railway dashboard
3. Watch the build logs - you should see:
   - Dependencies installing
   - Prisma client generating
   - Migrations running
   - Database seeding (survey questions)
   - Server starting

### 5. Verify Deployment

**Check Health Endpoint:**
```
https://your-app-name.up.railway.app/health
```

Should return:
```json
{
  "ok": true,
  "status": "healthy"
}
```

**Check Routes:**
```
https://your-app-name.up.railway.app/__routes
```

### 6. Verify Database Seeding

After deployment, check that survey questions were seeded:

1. Use Railway's PostgreSQL dashboard, OR
2. Connect via Railway CLI:
   ```bash
   railway connect
   npx prisma studio
   ```

Look for:
- `survey_sections` table should have ~9 sections
- `survey_questions` table should have ~43 questions
- `survey_options` table should have options for radio/checkbox questions

### 7. Update Frontend to Use Railway Backend

In your frontend code (if separate), update the API base URL:

```javascript
const apiBase = import.meta.env.DEV 
  ? 'http://localhost:3001' 
  : 'https://your-app-name.up.railway.app';
```

Or set environment variable:
```
VITE_API_BASE=https://your-app-name.up.railway.app
```

## What Happens on Deploy

1. **Build Stage:**
   - Installs Node.js dependencies
   - Installs native dependencies for Swiss Ephemeris
   - Generates Prisma client

2. **Startup Stage:**
   - Runs database migrations (`npx prisma migrate deploy`)
   - Seeds survey questions from `prisma/questions.csv` (`npm run seed`)
   - Starts Express server on port 3001

3. **Database Seeding:**
   - The seed script is **idempotent** (uses `upsert`)
   - Safe to run multiple times
   - Populates: SurveySection, SurveyQuestion, SurveyOption tables

## Testing Real-Time Saving

Once deployed, test the full flow:

1. **Open your frontend** (pointed to Railway backend)
2. **Fill Section 1** (birth data) → Chart computed, submission created
3. **Fill Sections 2-9** → Answers save in real-time (500ms debounce)
4. **Submit** → Reading generated, all answers saved

**Monitor in Railway:**
- View logs in Railway dashboard
- Look for: `✅ Saved X survey answers` messages
- Check database for `SurveyResponse` records

## Troubleshooting

### Seed Script Fails
- Check that `prisma/questions.csv` exists in the repo
- Verify CSV format (semicolon-separated)
- Check Railway logs for specific error

### Database Connection Issues
- Verify `DATABASE_URL` is set (should be auto-set by Railway)
- Check PostgreSQL service is running
- Verify migrations ran successfully

### Swiss Ephemeris Build Fails
- Check build logs for native compilation errors
- Ensure `build-essential` and `python3` are installed (they are in Dockerfile)

### Real-Time Saving Not Working
- Check backend logs for `/api/survey/save-answer` requests
- Verify `submissionId` is being created after Section 1
- Check database for `SurveyResponse` records

## Environment Variables Reference

| Variable | Required | Source | Description |
|----------|----------|--------|-------------|
| `DATABASE_URL` | Yes | Railway (auto) | PostgreSQL connection string |
| `OPENAI_API_KEY` | Yes | You | OpenAI API key for AI features |
| `OPENCAGE_API_KEY` | Yes | You | OpenCage API key for geocoding |
| `NODE_ENV` | Yes | You | Set to `production` |
| `PORT` | Auto | Railway | Server port (usually 3001) |

## Next Steps After Deployment

1. ✅ Test full survey flow
2. ✅ Verify answers are saving in real-time
3. ✅ Check database for saved responses
4. ✅ Test reading generation
5. ✅ Monitor Railway logs for errors

## Support

If you encounter issues:
1. Check Railway build/deploy logs
2. Check Railway runtime logs
3. Verify all environment variables are set
4. Verify database is connected and seeded

