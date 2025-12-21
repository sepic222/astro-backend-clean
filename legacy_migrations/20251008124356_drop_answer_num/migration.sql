/*
  Warnings:

  - You are about to drop the column `answerNum` on the `survey_responses` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "SurveySubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userEmail" TEXT,
    "chartId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SurveySubmission_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "Chart" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_survey_responses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "submissionId" TEXT,
    "answerText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "survey_responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "survey_questions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "survey_responses_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "SurveySubmission" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_survey_responses" ("answerText", "createdAt", "id", "questionId", "userId") SELECT "answerText", "createdAt", "id", "questionId", "userId" FROM "survey_responses";
DROP TABLE "survey_responses";
ALTER TABLE "new_survey_responses" RENAME TO "survey_responses";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "SurveySubmission_userEmail_createdAt_idx" ON "SurveySubmission"("userEmail", "createdAt");
