# Project Handover: Database Retrieval & Verification

## Topic Context
The objective of the next session is to perform **Database data retrieval and verification**. 

### Current DB Setup:
- **ORM:** Prisma
- **Client:** `server.js` uses `const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient();`
- **Schema:** Located in `prisma/schema.prisma`
- **Primary Hub:** All survey responses are linked via `submissionId` to the `SurveySubmission` table.

## Key Tables to Audit:
1. **`SurveySubmission`**: The parent record for every user (contains `userEmail`, `chartId`).
2. **`SurveyResponse`**: Individual answers (question ID, answer text).
3. **`SurveyResponseOption`**: Links selected options (like genres or film styles) to the response.
4. **`Reading`**: The generated astrological data (planets, houses) tied to a submission.

## Handover Instructions for the Next Agent:
1. **Read the `BASELINE.md`** first.
2. **Setup**: Run `npx prisma generate` to ensure the local client is in sync.
3. **Verify**: Use Prisma Studio (`npx prisma studio`) or custom scripts to verify that data is correctly persisting across all 4 tables mentioned above.
4. **Consistency Check**: Ensure the `userEmail` captured in the final survey step is correctly migrating from the API payload into the `SurveySubmission` and `Reading` rows.

## Critical Recent Changes to Note:
- **Email personaliztion is live**: The backend now greps `cosmic.username` from the responses and passes it to the `sendReadingEmail` helper.
- **Mandatory Email**: The frontend now blocks submissions without a valid email.

---
*Ready for Database Verification and Data Retrieval audits.*
