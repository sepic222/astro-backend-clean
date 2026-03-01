const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const submissions = await prisma.surveySubmission.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        take: 10,
        select: {
            id: true,
            userEmail: true,
            createdAt: true,
        },
    });

    console.log('Recent Submissions:');
    console.table(submissions);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
