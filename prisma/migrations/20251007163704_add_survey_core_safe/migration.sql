-- CreateTable
CREATE TABLE "survey_sections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "survey_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "showIfJson" JSONB,
    CONSTRAINT "survey_questions_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "survey_sections" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "survey_options" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    CONSTRAINT "survey_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "survey_questions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "survey_responses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT,
    "answerNum" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "survey_responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "survey_questions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "survey_response_options" (
    "responseId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    PRIMARY KEY ("responseId", "optionId"),
    CONSTRAINT "survey_response_options_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "survey_responses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "survey_response_options_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "survey_options" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "survey_sections_key_key" ON "survey_sections"("key");

-- CreateIndex
CREATE UNIQUE INDEX "survey_questions_key_key" ON "survey_questions"("key");
