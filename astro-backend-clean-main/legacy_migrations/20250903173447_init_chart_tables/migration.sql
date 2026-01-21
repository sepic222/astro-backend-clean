/*
  Warnings:

  - You are about to drop the column `number` on the `HouseCusp` table. All the data in the column will be lost.
  - You are about to drop the column `ruler` on the `HouseCusp` table. All the data in the column will be lost.
  - Added the required column `index` to the `HouseCusp` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Chart_userEmail_idx";

-- DropIndex
DROP INDEX "PlanetPosition_chartId_name_key";

-- DropIndex
DROP INDEX "PlanetPosition_chartId_idx";

-- AlterTable
ALTER TABLE "Chart" ADD COLUMN "timeAccuracy" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HouseCusp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chartId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "degree" REAL NOT NULL,
    "sign" TEXT NOT NULL,
    CONSTRAINT "HouseCusp_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "Chart" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HouseCusp" ("chartId", "degree", "id", "sign") SELECT "chartId", "degree", "id", "sign" FROM "HouseCusp";
DROP TABLE "HouseCusp";
ALTER TABLE "new_HouseCusp" RENAME TO "HouseCusp";
CREATE INDEX "HouseCusp_chartId_index_idx" ON "HouseCusp"("chartId", "index");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PlanetPosition_chartId_name_idx" ON "PlanetPosition"("chartId", "name");
