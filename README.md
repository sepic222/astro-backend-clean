# FateFlix — Astrology Backend (Swiss Ephemeris + Prisma)

A Node.js/Express backend that:
- computes natal chart data via Swiss Ephemeris,
- persists chart results and survey submissions with Prisma (SQLite in dev),
- exposes clean JSON endpoints for the survey frontend.

## Tech
- Node 18+, Express
- Prisma ORM (SQLite for local dev)
- `swisseph` (Swiss Ephemeris)
- Luxon (timezones)
- Optional: OpenAI (toy test route)

## Quick Start

### 1) Install
```bash
npm install
