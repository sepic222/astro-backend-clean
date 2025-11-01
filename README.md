FateFlix Astrology Backend

This backend powers the FateFlix Astro-Cinematic survey and birth-chart computation.
It provides endpoints for astrology calculations, survey submissions, and AI-based personalization.

⸻

🚀 Stack Overview
	•	Runtime: Node.js (Express)
	•	Database: SQLite (via Prisma ORM)
	•	Astrology Engine: Swiss Ephemeris (swisseph)
	•	Geocoding: OpenCage Data API
	•	AI Integration: OpenAI API (openai package)
	•	Frontend Connection: React (Vite) frontend served separately at http://localhost:5173

⸻

📦 Installation

git clone https://github.com/sepic222/astro-backend-clean.git
cd astro-backend-clean
npm install


⸻

⚙️ Environment Setup

Create a .env file in the root using the included .env.example template:

OPENAI_API_KEY=sk-...
OPENCAGE_API_KEY=...
DATABASE_URL="file:./prisma/dev.db"


⸻

🧭 API Routes

Method	Route	Description
GET	/health	Health check
GET	/api/geocode	Forward geocoding for city + country
POST	/api/birth-chart-swisseph	Compute and save full birth chart
POST	/api/survey/submit	Submit full survey responses
GET	/__routes	List all registered routes (debug)


⸻

🧑‍💻 Developer Tools

Script	Purpose
npx prisma studio	Opens the database viewer
node tools/audit-prisma-vs-server.cjs	Checks schema–code consistency
node tools/audit-survey-coverage.cjs	Validates survey coverage
npm run dev	Starts backend (port 3001)
npm run test	Runs test scripts (if defined)


⸻

🧩 Structure

astro-backend-clean/
├── prisma/                 # Database schema, migrations, seeds
├── server/                 # Route helpers & normalization scripts
├── tools/                  # Audits, survey coverage tools
├── scripts/                # Manual test / automation scripts
├── context/                # FateFlix project context docs
└── server.js               # Main Express app


⸻

🧠 Notes for Contributors
	1.	Always run node tools/audit-prisma-vs-server.cjs before pushing.
	2.	Use feature branches (e.g. feature/section1-embed).
	3.	PRs must pass npm run lint and npm test (where applicable).

⸻

© FateFlix 2025 – All rights reserved.
