/*
  Warnings:

  - You are about to drop the `HouseCusp` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlanetPosition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `dateValue` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `freeText` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `numberValue` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `selectedOptionId` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Option` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Option` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Survey` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Survey` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `Survey` table. All the data in the column will be lost.
  - Made the column `value` on table `Option` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `key` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `Survey` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "HouseCusp_chartId_index_idx";

-- DropIndex
DROP INDEX "PlanetPosition_chartId_name_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "HouseCusp";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PlanetPosition";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SurveySubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT,
    "chartId" TEXT,
    "answers" JSONB NOT NULL,
    "version" TEXT DEFAULT 'v1'
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Answer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "responseId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT,
    CONSTRAINT "Answer_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "Response" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Answer" ("id", "questionId", "responseId") SELECT "id", "questionId", "responseId" FROM "Answer";
DROP TABLE "Answer";
ALTER TABLE "new_Answer" RENAME TO "Answer";
CREATE TABLE "new_Chart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT,
    "name" TEXT,
    "birthDate" TEXT,
    "birthTime" TEXT,
    "risingSign" TEXT,
    "userEmail" TEXT,
    "city" TEXT,
    "country" TEXT,
    "timeAccuracy" TEXT,
    "date" TEXT,
    "time" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "method" TEXT,
    "jd" REAL,
    "ascendant" REAL,
    "mc" REAL,
    "sunSign" TEXT,
    "sunHouse" INTEGER,
    "moonSign" TEXT,
    "moonHouse" INTEGER,
    "marsSign" TEXT,
    "marsHouse" INTEGER,
    "venusSign" TEXT,
    "venusHouse" INTEGER,
    "mcSign" TEXT,
    "rawChart" JSONB,
    "planets" JSONB,
    "houseRulers" JSONB,
    "planetsInHouses" JSONB
);
INSERT INTO "new_Chart" ("ascendant", "birthDate", "birthTime", "city", "country", "createdAt", "id", "jd", "latitude", "longitude", "marsHouse", "marsSign", "mc", "mcSign", "moonHouse", "moonSign", "name", "rawChart", "risingSign", "sunHouse", "sunSign", "timeAccuracy", "userEmail", "venusHouse", "venusSign") SELECT "ascendant", "birthDate", "birthTime", "city", "country", "createdAt", "id", "jd", "latitude", "longitude", "marsHouse", "marsSign", "mc", "mcSign", "moonHouse", "moonSign", "name", "rawChart", "risingSign", "sunHouse", "sunSign", "timeAccuracy", "userEmail", "venusHouse", "venusSign" FROM "Chart";
DROP TABLE "Chart";
ALTER TABLE "new_Chart" RENAME TO "Chart";
CREATE TABLE "new_Option" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Option" ("id", "label", "order", "questionId", "value") SELECT "id", "label", "order", "questionId", "value" FROM "Option";
DROP TABLE "Option";
ALTER TABLE "new_Option" RENAME TO "Option";
CREATE TABLE "new_Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "surveyId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Question_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Question" ("id", "order", "surveyId", "text", "type") SELECT "id", "order", "surveyId", "text", "type" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
CREATE TABLE "new_Response" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "surveyId" TEXT NOT NULL,
    "chartId" TEXT,
    "email" TEXT,
    CONSTRAINT "Response_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Response_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "Chart" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Response" ("chartId", "createdAt", "email", "id", "surveyId") SELECT "chartId", "createdAt", "email", "id", "surveyId" FROM "Response";
DROP TABLE "Response";
ALTER TABLE "new_Response" RENAME TO "Response";
CREATE TABLE "new_Survey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Survey" ("createdAt", "id", "title") SELECT "createdAt", "id", "title" FROM "Survey";
DROP TABLE "Survey";
ALTER TABLE "new_Survey" RENAME TO "Survey";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
