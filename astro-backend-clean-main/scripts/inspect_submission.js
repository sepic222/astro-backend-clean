
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect(id) {
    console.log(`Inspecting Submission ID: ${id}`);
    const sub = await prisma.surveySubmission.findUnique({
        where: { id },
        include: {
            chart: true,
            responses: {
                include: { question: true }
            }
        }
    });

    if (!sub) {
        console.log("Submission not found.");
        return;
    }

    console.log("--- SUBMISSION RECORD ---");
    console.log(JSON.stringify(sub, null, 2));

    if (sub.chart) {
        console.log("\n--- CHART RECORD ---");
        console.log(JSON.stringify(sub.chart, null, 2));
    } else {
        console.log("\n--- NO CHART LINKED ---");
    }
}

inspect('cmjg340ov01hpmj1lxw9lpsq4')
    .finally(async () => await prisma.$disconnect());
