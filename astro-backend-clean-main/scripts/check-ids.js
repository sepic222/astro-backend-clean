const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const ids = ['0beea16b-c742-48fc-9d10-173c00a386bf', '773d692b-6886-44f4-a0ce-2ae56be16105'];
    for (const id of ids) {
        const sub = await prisma.surveySubmission.findUnique({ where: { id } });
        console.log(`ID ${id}: ${sub ? 'FOUND' : 'NOT FOUND'}`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
