-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Chart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "userEmail" TEXT,
    "city" TEXT,
    "country" TEXT,
    "birthDate" TEXT NOT NULL,
    "birthTime" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "timeAccuracy" TEXT,
    "jd" REAL NOT NULL,
    "ascendant" REAL NOT NULL,
    "mc" REAL NOT NULL,
    "risingSign" TEXT,
    "mcSign" TEXT,
    "sunSign" TEXT,
    "sunHouse" INTEGER,
    "moonSign" TEXT,
    "moonHouse" INTEGER,
    "marsSign" TEXT,
    "marsHouse" INTEGER,
    "venusSign" TEXT,
    "venusHouse" INTEGER,
    "rawChart" JSONB
);
INSERT INTO "new_Chart" ("ascendant", "birthDate", "birthTime", "city", "country", "createdAt", "id", "jd", "latitude", "longitude", "marsHouse", "marsSign", "mc", "mcSign", "moonHouse", "moonSign", "name", "rawChart", "risingSign", "sunHouse", "sunSign", "timeAccuracy", "userEmail", "venusHouse", "venusSign") SELECT "ascendant", "birthDate", "birthTime", "city", "country", "createdAt", "id", "jd", "latitude", "longitude", "marsHouse", "marsSign", "mc", "mcSign", "moonHouse", "moonSign", "name", "rawChart", "risingSign", "sunHouse", "sunSign", "timeAccuracy", "userEmail", "venusHouse", "venusSign" FROM "Chart";
DROP TABLE "Chart";
ALTER TABLE "new_Chart" RENAME TO "Chart";
CREATE INDEX "Chart_createdAt_idx" ON "Chart"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
