-- CreateEnum
CREATE TYPE "public"."Planet" AS ENUM ('Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto');

-- CreateEnum
CREATE TYPE "public"."Sign" AS ENUM ('Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces');

-- CreateEnum
CREATE TYPE "public"."AspectType" AS ENUM ('Conjunction', 'Sextile', 'Square', 'Trine', 'Opposition');

-- CreateEnum
CREATE TYPE "public"."SurveyQuestionType" AS ENUM ('text', 'radio', 'checkbox', 'slider');

-- CreateTable
CREATE TABLE "public"."Chart" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userEmail" TEXT,
    "birthDateTimeUtc" TIMESTAMP(3),
    "tzOffsetMinutes" INTEGER,
    "city" TEXT,
    "country" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "ascendant" DOUBLE PRECISION,
    "mc" DOUBLE PRECISION,
    "descendant" DOUBLE PRECISION,
    "ic" DOUBLE PRECISION,
    "risingSign" "public"."Sign",
    "mcSign" "public"."Sign",
    "descendantSign" "public"."Sign",
    "icSign" "public"."Sign",
    "sunSign" "public"."Sign",
    "sunHouse" INTEGER,
    "moonSign" "public"."Sign",
    "moonHouse" INTEGER,
    "mercurySign" "public"."Sign",
    "mercuryHouse" INTEGER,
    "venusSign" "public"."Sign",
    "venusHouse" INTEGER,
    "marsSign" "public"."Sign",
    "marsHouse" INTEGER,
    "jupiterSign" "public"."Sign",
    "jupiterHouse" INTEGER,
    "saturnSign" "public"."Sign",
    "saturnHouse" INTEGER,
    "uranusSign" "public"."Sign",
    "uranusHouse" INTEGER,
    "neptuneSign" "public"."Sign",
    "neptuneHouse" INTEGER,
    "plutoSign" "public"."Sign",
    "plutoHouse" INTEGER,
    "chartRulerPlanet" "public"."Planet",
    "chartRulerHouse" INTEGER,
    "northNodeHouse" INTEGER,
    "chironHouse" INTEGER,
    "rawChart" JSONB NOT NULL,

    CONSTRAINT "Chart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChartAspect" (
    "id" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "a" "public"."Planet" NOT NULL,
    "b" "public"."Planet" NOT NULL,
    "aspect" "public"."AspectType" NOT NULL,
    "orb" DOUBLE PRECISION,
    "strength" INTEGER,

    CONSTRAINT "ChartAspect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AscSignInterpretation" (
    "id" TEXT NOT NULL,
    "sign" "public"."Sign" NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "source" TEXT,

    CONSTRAINT "AscSignInterpretation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChartRulerSignInterpretation" (
    "id" TEXT NOT NULL,
    "sign" "public"."Sign" NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT,

    CONSTRAINT "ChartRulerSignInterpretation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChartRulerHouseInterpretation" (
    "id" TEXT NOT NULL,
    "house" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT,

    CONSTRAINT "ChartRulerHouseInterpretation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanetSignInterpretation" (
    "id" TEXT NOT NULL,
    "planet" "public"."Planet" NOT NULL,
    "sign" "public"."Sign" NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT,

    CONSTRAINT "PlanetSignInterpretation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanetHouseInterpretation" (
    "id" TEXT NOT NULL,
    "planet" "public"."Planet" NOT NULL,
    "house" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT,

    CONSTRAINT "PlanetHouseInterpretation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NodeHouseInterpretation" (
    "id" TEXT NOT NULL,
    "node" TEXT NOT NULL,
    "house" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT,

    CONSTRAINT "NodeHouseInterpretation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChironHouseInterpretation" (
    "id" TEXT NOT NULL,
    "house" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT,

    CONSTRAINT "ChironHouseInterpretation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Survey" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chartId" TEXT,
    "type" TEXT,
    "version" TEXT,
    "schema" JSONB,
    "userEmail" TEXT,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Response" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "surveyId" TEXT NOT NULL,
    "chartId" TEXT,
    "answers" JSONB NOT NULL,
    "userEmail" TEXT,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."survey_sections" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "survey_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."survey_questions" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" "public"."SurveyQuestionType" NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "showIfJson" JSONB,

    CONSTRAINT "survey_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."survey_options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "survey_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."survey_responses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "submissionId" TEXT,
    "answerText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."survey_response_options" (
    "responseId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "survey_response_options_pkey" PRIMARY KEY ("responseId","optionId")
);

-- CreateTable
CREATE TABLE "public"."SurveySubmission" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT,
    "chartId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailOutbox" (
    "id" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "htmlBody" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "submissionId" TEXT,
    "chartId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "EmailOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reading" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "chartId" TEXT,
    "userEmail" TEXT,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Chart_userEmail_createdAt_idx" ON "public"."Chart"("userEmail", "createdAt");

-- CreateIndex
CREATE INDEX "Chart_risingSign_idx" ON "public"."Chart"("risingSign");

-- CreateIndex
CREATE INDEX "Chart_sunSign_moonSign_mercurySign_idx" ON "public"."Chart"("sunSign", "moonSign", "mercurySign");

-- CreateIndex
CREATE INDEX "Chart_venusSign_marsSign_idx" ON "public"."Chart"("venusSign", "marsSign");

-- CreateIndex
CREATE INDEX "Chart_jupiterSign_saturnSign_idx" ON "public"."Chart"("jupiterSign", "saturnSign");

-- CreateIndex
CREATE INDEX "Chart_uranusSign_neptuneSign_plutoSign_idx" ON "public"."Chart"("uranusSign", "neptuneSign", "plutoSign");

-- CreateIndex
CREATE INDEX "ChartAspect_chartId_aspect_idx" ON "public"."ChartAspect"("chartId", "aspect");

-- CreateIndex
CREATE UNIQUE INDEX "AscSignInterpretation_sign_key" ON "public"."AscSignInterpretation"("sign");

-- CreateIndex
CREATE UNIQUE INDEX "ChartRulerSignInterpretation_sign_key" ON "public"."ChartRulerSignInterpretation"("sign");

-- CreateIndex
CREATE UNIQUE INDEX "ChartRulerHouseInterpretation_house_key" ON "public"."ChartRulerHouseInterpretation"("house");

-- CreateIndex
CREATE UNIQUE INDEX "PlanetSignInterpretation_planet_sign_key" ON "public"."PlanetSignInterpretation"("planet", "sign");

-- CreateIndex
CREATE UNIQUE INDEX "PlanetHouseInterpretation_planet_house_key" ON "public"."PlanetHouseInterpretation"("planet", "house");

-- CreateIndex
CREATE UNIQUE INDEX "NodeHouseInterpretation_node_house_key" ON "public"."NodeHouseInterpretation"("node", "house");

-- CreateIndex
CREATE UNIQUE INDEX "ChironHouseInterpretation_house_key" ON "public"."ChironHouseInterpretation"("house");

-- CreateIndex
CREATE INDEX "Survey_userEmail_createdAt_idx" ON "public"."Survey"("userEmail", "createdAt");

-- CreateIndex
CREATE INDEX "Response_userEmail_createdAt_idx" ON "public"."Response"("userEmail", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "survey_sections_key_key" ON "public"."survey_sections"("key");

-- CreateIndex
CREATE UNIQUE INDEX "survey_questions_key_key" ON "public"."survey_questions"("key");

-- CreateIndex
CREATE INDEX "survey_responses_questionId_idx" ON "public"."survey_responses"("questionId");

-- CreateIndex
CREATE INDEX "survey_responses_submissionId_idx" ON "public"."survey_responses"("submissionId");

-- CreateIndex
CREATE INDEX "SurveySubmission_userEmail_createdAt_idx" ON "public"."SurveySubmission"("userEmail", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Reading_submissionId_key" ON "public"."Reading"("submissionId");

-- AddForeignKey
ALTER TABLE "public"."ChartAspect" ADD CONSTRAINT "ChartAspect_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "public"."Chart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Survey" ADD CONSTRAINT "Survey_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "public"."Chart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Response" ADD CONSTRAINT "Response_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "public"."Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Response" ADD CONSTRAINT "Response_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "public"."Chart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."survey_questions" ADD CONSTRAINT "survey_questions_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."survey_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."survey_options" ADD CONSTRAINT "survey_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."survey_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."survey_responses" ADD CONSTRAINT "survey_responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."survey_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."survey_responses" ADD CONSTRAINT "survey_responses_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."SurveySubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."survey_response_options" ADD CONSTRAINT "survey_response_options_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "public"."survey_responses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."survey_response_options" ADD CONSTRAINT "survey_response_options_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "public"."survey_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SurveySubmission" ADD CONSTRAINT "SurveySubmission_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "public"."Chart"("id") ON DELETE SET NULL ON UPDATE CASCADE;
