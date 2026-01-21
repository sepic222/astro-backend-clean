const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const submissionId = 'test-' + Date.now();
    const userEmail = 'test@example.com';
    const fullResponses = {
        username: "FinalVerificationUser",
        gender: "male",
        watch_habit: ["solo"]
    };

    const keyMapping = {
        'username': 'cosmic.name',
        'gender': 'casting.gender',
        'watch_habit': 'taste.how_you_watch'
    };

    console.log("--- SIMULATING ANSWER SAVE ---");
    const answers = [];
    for (const [frontendKey, value] of Object.entries(fullResponses)) {
        if (['date', 'time', 'latitude', 'longitude', 'city', 'country', 'time_accuracy'].includes(frontendKey)) {
            continue;
        }

        const questionKey = keyMapping[frontendKey];
        if (questionKey) {
            if (Array.isArray(value)) {
                answers.push({ questionKey, optionValues: value });
            } else if (value != null && value !== '') {
                answers.push({ questionKey, answerText: String(value) });
            }
        }
    }

    console.log("Answers array built:", JSON.stringify(answers, null, 2));

    // Create a dummy submission first
    await prisma.surveySubmission.create({ data: { id: submissionId, userEmail } });
    console.log("Created submission:", submissionId);

    for (const a of answers) {
        console.log("Saving key:", a.questionKey);
        const q = await prisma.surveyQuestion.findUnique({
            where: { key: a.questionKey },
            include: { options: true },
        });

        if (!q) {
            console.log("❌ Question NOT found:", a.questionKey);
            continue;
        }

        const response = await prisma.surveyResponse.create({
            data: {
                questionId: q.id,
                submissionId: submissionId,
                answerText: a.answerText ?? null,
                userId: userEmail,
            },
        });
        console.log("✅ Saved response for:", a.questionKey);
    }

    // Verify
    const final = await prisma.surveySubmission.findUnique({
        where: { id: submissionId },
        include: { responses: { include: { question: true } } }
    });
    console.log("\nFinal verification in DB:");
    final.responses.forEach(r => console.log(`- ${r.question.key}: ${r.answerText}`));

    // Cleanup
    await prisma.surveyResponse.deleteMany({ where: { submissionId } });
    await prisma.surveySubmission.delete({ where: { id: submissionId } });
}

main().finally(() => prisma.$disconnect());
