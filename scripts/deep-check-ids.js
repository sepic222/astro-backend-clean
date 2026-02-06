const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const ids = ['0beea16b-c742-48fc-9d10-173c00a386bf', '773d692b-6886-44f4-a0ce-2ae56be16105'];

    for (const id of ids) {
        console.log(`\n--- Searching for ID: ${id} ---`);

        const sub = await prisma.surveySubmission.findUnique({ where: { id } }).catch(() => null);
        console.log(`SurveySubmission: ${sub ? 'FOUND' : 'NOT FOUND'}`);

        const reading = await prisma.reading.findUnique({ where: { id } }).catch(() => null);
        console.log(`Reading: ${reading ? 'FOUND' : 'NOT FOUND'}`);

        const chart = await prisma.chart.findUnique({ where: { id } }).catch(() => null);
        console.log(`Chart: ${chart ? 'FOUND' : 'NOT FOUND'}`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
