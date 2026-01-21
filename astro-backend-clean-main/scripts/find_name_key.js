const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- SEARCHING FOR NAMES IN RESPONSES ---");

    // Check for any response where the text might look like a name or ID might be "username"
    const anyNameResponse = await prisma.surveyResponse.findMany({
        where: {
            OR: [
                { question: { key: { contains: 'name' } } },
                { question: { key: { contains: 'username' } } }
            ]
        },
        include: { question: true },
        take: 50
    });

    console.log(`Found ${anyNameResponse.length} name-related responses.`);
    anyNameResponse.forEach(r => {
        console.log(`  Key: ${r.question.key} | Answer: ${r.answerText}`);
    });

    console.log("\n--- SEARCHING ALL UNIQUE KEYS ---");
    const allKeys = await prisma.surveyResponse.findMany({
        select: { question: { select: { key: true } } },
        distinct: ['questionId']
    });
    console.log("All unique keys in SurveyResponse:");
    allKeys.forEach(k => console.log(`  - ${k.question.key}`));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
