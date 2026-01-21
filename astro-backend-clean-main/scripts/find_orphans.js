const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- ANALYZING HISTORY & ORPHANS ---");

    // 1. Get all responses
    const allResponses = await prisma.surveyResponse.findMany({
        include: {
            question: true, // This might be null if question was deleted
        }
    });

    console.log(`Total responses: ${allResponses.length}`);

    // 2. Identify orphans
    const orphans = allResponses.filter(r => !r.question);
    console.log(`Orphaned responses (no matching question): ${orphans.length}`);

    if (orphans.length > 0) {
        console.log("\nSample Orphan Data:");
        orphans.slice(0, 5).forEach(o => {
            console.log(`  ID: ${o.id} | QuestionID: ${o.questionId} | Answer: ${o.answerText}`);
        });
    }

    // 3. Look for "hidden" text responses that don't match common types
    // Actually, let's just see all unique question IDs in SurveyResponse
    const uniqueQuestionIds = [...new Set(allResponses.map(r => r.questionId))];
    const existingQuestions = await prisma.surveyQuestion.findMany({
        select: { id: true, key: true, text: true }
    });
    const existingIds = new Set(existingQuestions.map(q => q.id));

    console.log(`\nUnique Question IDs in Responses: ${uniqueQuestionIds.length}`);
    console.log(`Unique Question IDs in Question Table: ${existingIds.size}`);

    const missingIds = uniqueQuestionIds.filter(id => !existingIds.has(id));
    if (missingIds.length > 0) {
        console.log(`\nFound ${missingIds.length} question IDs in responses that are GONE from the question table:`);
        missingIds.forEach(id => console.log(`  - ${id}`));
    } else {
        console.log("\nNo orphaned question IDs found. All responses link to an existing question in the DB.");
    }

    // 4. Compare DB keys vs "Current" keys (from previous grep)
    // I already have the DB keys from analyzed_db_diff.js output.
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
