/**
 * Analyze Differences between database and surveyData.js
 * Also inspects the Response model's JSON answers for legacy keys.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

// Mock a way to get the current survey keys (simplification since I can't easily import from frontend here without setup)
// I will instead just list what's in the DB and identify what looks "old" or "orphaned".

async function main() {
    console.log("--- ANALYZING DATABASE QUESTIONS ---");
    const dbQuestions = await prisma.surveyQuestion.findMany({
        include: { section: true }
    });

    console.log(`Total questions in DB: ${dbQuestions.length}`);
    dbQuestions.forEach(q => {
        console.log(`[DB] Section: ${q.section.key} | Key: ${q.key} | Text: ${q.text.substring(0, 30)}...`);
    });

    console.log("\n--- ANALYZING RAW RESPONSES (JSON) ---");
    const rawResponses = await prisma.response.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' }
    });

    const allKeysFoundInJson = new Set();
    rawResponses.forEach(r => {
        if (typeof r.answers === 'object' && r.answers !== null) {
            Object.keys(r.answers).forEach(k => allKeysFoundInJson.add(k));
        }
    });

    console.log(`Unique keys found in recent Response.answers JSON:`);
    Array.from(allKeysFoundInJson).sort().forEach(k => console.log(`  - ${k}`));

    console.log("\n--- SEARCHING FOR DISCREPANCIES ---");
    const dbKeys = new Set(dbQuestions.map(q => q.key));

    console.log("Keys in JSON that are NOT in SurveyQuestion table:");
    allKeysFoundInJson.forEach(k => {
        if (!dbKeys.has(k)) {
            console.log(`  - ${k} (Legacy or different format)`);
        }
    });
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
