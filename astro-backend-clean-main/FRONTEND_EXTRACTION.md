# Frontend Extraction Guide

This guide explains how to extract the frontend code into a separate repository for deployment on Vercel.

## Files to Extract

### Required Files/Directories:
1. `src/` - All React components, context, config, and pages
2. `public/assets/survey-logo.svg` - Frontend logo asset (ONLY this file from public/assets)
3. `astro.config.mjs` - Astro configuration (already updated, proxy removed)
4. `tailwind.config.mjs` - Tailwind CSS configuration
5. `package.json` - Use the template below (frontend dependencies only)

### Optional Files:
- `.gitignore` - Copy and adapt for frontend-only needs
- `tsconfig.json` - If you want TypeScript support (create if needed)

## Frontend Package.json Template

See `FRONTEND_PACKAGE.json` in the root directory for the complete template.

Key dependencies:
- `@astrojs/react`
- `@astrojs/tailwind`
- `astro`
- `react`
- `react-dom`
- `react-google-autocomplete`
- `tailwindcss`
- `autoprefixer`

## Environment Variables

Create a `.env.example` file in the frontend repo with:

```
PUBLIC_API_BASE=https://your-railway-backend-url.up.railway.app
PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_api_key_here
```

**Important:** 
- `PUBLIC_API_BASE` should point to your Railway backend URL (e.g., `https://myreading.fateflix.app`)
- All Astro environment variables must be prefixed with `PUBLIC_` to be accessible in the browser

## Extraction Steps

1. Create a new repository (e.g., `fateflix-frontend`)
2. Copy the files listed above to the new repo
3. Use the frontend package.json template
4. Create `.env.example` with the environment variables
5. Run `npm install` in the new repo
6. Test locally with `npm run dev`
7. Deploy to Vercel

## Vercel Deployment

1. Connect your frontend repository to Vercel
2. Configure environment variables in Vercel dashboard:
   - `PUBLIC_API_BASE`: Your Railway backend URL
   - `PUBLIC_GOOGLE_MAPS_KEY`: Your Google Maps API key
3. Vercel will auto-detect Astro and use the correct build settings:
   - Framework Preset: Astro
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm ci`

## Important Notes

- The frontend code has already been updated to use `PUBLIC_API_BASE` environment variable
- All API calls will work correctly once `PUBLIC_API_BASE` is set
- The proxy configuration has been removed from `astro.config.mjs` (not needed on Vercel)
- Only `survey-logo.svg` should be copied from `public/assets/` - all other assets (Blue Planet, etc.) remain on the backend

