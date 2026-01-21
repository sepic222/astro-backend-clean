
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLatestResponses() {
    console.log("🔍 Checking latest 20 responses...");
    const responses = await prisma.surveyResponse.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
            question: { select: { key: true } },
            submission: { select: { id: true, createdAt: true } }
        }
    });

    responses.forEach(r => {
        console.log(`[${r.createdAt.toISOString()}] Sub: ${r.submissionId || 'N/A'} | Key: ${r.question?.key} | Value: ${r.answerText}`);
    });

    const submissions = await prisma.surveySubmission.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, responses: { select: { question: { select: { key: true } } } } }
    });

    console.log("\n📦 Latest 5 Submissions and their keys:");
    submissions.forEach(s => {
        const keys = s.responses.map(r => r.question?.key).join(', ');
        console.log(`Sub: ${s.id} | Keys: ${keys}`);
    });

    await prisma.$disconnect();
}

checkLatestResponses().catch(console.error);
