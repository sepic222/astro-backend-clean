/*
  Warnings:

  - You are about to drop the `Answer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Option` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SurveySubmission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `birthDate` on the `Chart` table. All the data in the column will be lost.
  - You are about to drop the column `birthTime` on the `Chart` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Chart` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Chart` table. All the data in the column will be lost.
  - You are about to drop the column `houseRulers` on the `Chart` table. All the data in the column will be lost.
  - You are about to drop the column `jd` on the `Chart` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `Chart` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Chart` table. All the data in the column will be lost.
  - You are about to drop the column `planets` on the `Chart` table. All the data in the column will be lost.
  - You are about to drop the column `planetsInHouses` on the `Chart` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Chart` table. All the data in the column will be lost.
  - You are about to drop the column `timeAccuracy` on the `Chart` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Response` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Survey` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Survey` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Survey` table. All the data in the column will be lost.
  - Made the column `rawChart` on table `Chart` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `answers` to the `Response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Survey` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Answer";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Option";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Question";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SurveySubmission";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ChartAspect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chartId" TEXT NOT NULL,
    "a" TEXT NOT NULL,
    "b" TEXT NOT NULL,
    "aspect" TEXT NOT NULL,
    "orb" REAL,
    "strength" INTEGER,
    CONSTRAINT "ChartAspect_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "Chart" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AscSignInterpretation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sign" TEXT NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "source" TEXT
);

-- CreateTable
CREATE TABLE "ChartRulerSignInterpretation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sign" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT
);

-- CreateTable
CREATE TABLE "ChartRulerHouseInterpretation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "house" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT
);

-- CreateTable
CREATE TABLE "PlanetSignInterpretation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planet" TEXT NOT NULL,
    "sign" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT
);

-- CreateTable
CREATE TABLE "PlanetHouseInterpretation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planet" TEXT NOT NULL,
    "house" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT
);

-- CreateTable
CREATE TABLE "NodeHouseInterpretation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "node" TEXT NOT NULL,
    "house" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT
);

-- CreateTable
CREATE TABLE "ChironHouseInterpretation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "house" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Chart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userEmail" TEXT,
    "birthDateTimeUtc" DATETIME,
    "tzOffsetMinutes" INTEGER,
    "city" TEXT,
    "country" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "ascendant" REAL,
    "mc" REAL,
    "descendant" REAL,
    "ic" REAL,
    "risingSign" TEXT,
    "mcSign" TEXT,
    "descendantSign" TEXT,
    "icSign" TEXT,
    "sunSign" TEXT,
    "sunHouse" INTEGER,
    "moonSign" TEXT,
    "moonHouse" INTEGER,
    "mercurySign" TEXT,
    "mercuryHouse" INTEGER,
    "venusSign" TEXT,
    "venusHouse" INTEGER,
    "marsSign" TEXT,
    "marsHouse" INTEGER,
    "jupiterSign" TEXT,
    "jupiterHouse" INTEGER,
    "saturnSign" TEXT,
    "saturnHouse" INTEGER,
    "uranusSign" TEXT,
    "uranusHouse" INTEGER,
    "neptuneSign" TEXT,
    "neptuneHouse" INTEGER,
    "plutoSign" TEXT,
    "plutoHouse" INTEGER,
    "chartRulerPlanet" TEXT,
    "chartRulerHouse" INTEGER,
    "northNodeHouse" INTEGER,
    "chironHouse" INTEGER,
    "rawChart" JSONB NOT NULL
);
INSERT INTO "new_Chart" ("ascendant", "city", "country", "createdAt", "descendant", "descendantSign", "ic", "icSign", "id", "latitude", "longitude", "marsHouse", "marsSign", "mc", "mcSign", "moonHouse", "moonSign", "rawChart", "risingSign", "sunHouse", "sunSign", "userEmail", "venusHouse", "venusSign") SELECT "ascendant", "city", "country", "createdAt", "descendant", "descendantSign", "ic", "icSign", "id", "latitude", "longitude", "marsHouse", "marsSign", "mc", "mcSign", "moonHouse", "moonSign", "rawChart", "risingSign", "sunHouse", "sunSign", "userEmail", "venusHouse", "venusSign" FROM "Chart";
DROP TABLE "Chart";
ALTER TABLE "new_Chart" RENAME TO "Chart";
CREATE INDEX "Chart_userEmail_createdAt_idx" ON "Chart"("userEmail", "createdAt");
CREATE INDEX "Chart_risingSign_idx" ON "Chart"("risingSign");
CREATE INDEX "Chart_sunSign_moonSign_mercurySign_idx" ON "Chart"("sunSign", "moonSign", "mercurySign");
CREATE INDEX "Chart_venusSign_marsSign_idx" ON "Chart"("venusSign", "marsSign");
CREATE INDEX "Chart_jupiterSign_saturnSign_idx" ON "Chart"("jupiterSign", "saturnSign");
CREATE INDEX "Chart_uranusSign_neptuneSign_plutoSign_idx" ON "Chart"("uranusSign", "neptuneSign", "plutoSign");
CREATE TABLE "new_Response" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "surveyId" TEXT NOT NULL,
    "chartId" TEXT,
    "answers" JSONB NOT NULL,
    "userEmail" TEXT,
    CONSTRAINT "Response_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Response_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "Chart" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Response" ("chartId", "createdAt", "id", "surveyId") SELECT "chartId", "createdAt", "id", "surveyId" FROM "Response";
DROP TABLE "Response";
ALTER TABLE "new_Response" RENAME TO "Response";
CREATE INDEX "Response_userEmail_createdAt_idx" ON "Response"("userEmail", "createdAt");
CREATE TABLE "new_Survey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "chartId" TEXT,
    "type" TEXT,
    "version" TEXT,
    "schema" JSONB,
    "userEmail" TEXT,
    CONSTRAINT "Survey_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "Chart" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Survey" ("createdAt", "id") SELECT "createdAt", "id" FROM "Survey";
DROP TABLE "Survey";
ALTER TABLE "new_Survey" RENAME TO "Survey";
CREATE INDEX "Survey_userEmail_createdAt_idx" ON "Survey"("userEmail", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ChartAspect_chartId_aspect_idx" ON "ChartAspect"("chartId", "aspect");

-- CreateIndex
CREATE UNIQUE INDEX "AscSignInterpretation_sign_key" ON "AscSignInterpretation"("sign");

-- CreateIndex
CREATE UNIQUE INDEX "ChartRulerSignInterpretation_sign_key" ON "ChartRulerSignInterpretation"("sign");

-- CreateIndex
CREATE UNIQUE INDEX "ChartRulerHouseInterpretation_house_key" ON "ChartRulerHouseInterpretation"("house");

-- CreateIndex
CREATE UNIQUE INDEX "PlanetSignInterpretation_planet_sign_key" ON "PlanetSignInterpretation"("planet", "sign");

-- CreateIndex
CREATE UNIQUE INDEX "PlanetHouseInterpretation_planet_house_key" ON "PlanetHouseInterpretation"("planet", "house");

-- CreateIndex
CREATE UNIQUE INDEX "NodeHouseInterpretation_node_house_key" ON "NodeHouseInterpretation"("node", "house");

-- CreateIndex
CREATE UNIQUE INDEX "ChironHouseInterpretation_house_key" ON "ChironHouseInterpretation"("house");
