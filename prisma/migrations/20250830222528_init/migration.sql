-- CreateTable
CREATE TABLE "Chart" (
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
    "jd" REAL NOT NULL,
    "ascendant" REAL NOT NULL,
    "mc" REAL NOT NULL,
    "risingSign" TEXT NOT NULL,
    "mcSign" TEXT NOT NULL,
    "sunSign" TEXT NOT NULL,
    "sunHouse" INTEGER NOT NULL,
    "moonSign" TEXT NOT NULL,
    "moonHouse" INTEGER NOT NULL,
    "marsSign" TEXT NOT NULL,
    "marsHouse" INTEGER NOT NULL,
    "venusSign" TEXT NOT NULL,
    "venusHouse" INTEGER NOT NULL,
    "rawChart" JSONB
);

-- CreateTable
CREATE TABLE "HouseCusp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chartId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "degree" REAL NOT NULL,
    "sign" TEXT NOT NULL,
    "ruler" TEXT,
    CONSTRAINT "HouseCusp_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "Chart" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanetPosition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chartId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "longitude" REAL NOT NULL,
    "sign" TEXT NOT NULL,
    "house" INTEGER NOT NULL,
    CONSTRAINT "PlanetPosition_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "Chart" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Chart_createdAt_idx" ON "Chart"("createdAt");

-- CreateIndex
CREATE INDEX "Chart_userEmail_idx" ON "Chart"("userEmail");

-- CreateIndex
CREATE INDEX "HouseCusp_chartId_idx" ON "HouseCusp"("chartId");

-- CreateIndex
CREATE UNIQUE INDEX "HouseCusp_chartId_number_key" ON "HouseCusp"("chartId", "number");

-- CreateIndex
CREATE INDEX "PlanetPosition_chartId_idx" ON "PlanetPosition"("chartId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanetPosition_chartId_name_key" ON "PlanetPosition"("chartId", "name");
