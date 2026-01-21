# Changelog
All notable changes to this project will be documented in this file.

The format follows Keep a Changelog (https://keepachangelog.com/en/1.0.0/),
and this project adheres to Semantic Versioning (https://semver.org/spec/v2.0.0.html).

---

## [v1.1-stable-backend] – 2025-11-01
### Added
- Full README with stack overview, setup, and API route documentation
- .gitignore cleanup to exclude local DBs and node_modules
- GitHub release and version tagging for stable backend

### Changed
- Flattened repo structure (removed nested "astro-backend-clean-main" folder)
- Updated route registrations and restored Swiss Ephemeris and geocoding endpoints
- Standardized server.js routes and environment variable usage
- Improved database schema alignment with survey and chart data models

### Fixed
- Broken API routes after folder merge
- Prisma connection issues (missing path resolution)
- OpenAI and OpenCage imports missing after reorganization

---

## [v1.0.0] – 2025-09-15
### Initial Backend Setup
- Set up Express backend with Prisma (SQLite)
- Added Swiss Ephemeris (swisseph) birth chart endpoint
- Integrated OpenCage API for city geocoding
- Implemented base /api/survey/submit route
- Added normalizeSurveyPayload helper and Prisma seeding tools
