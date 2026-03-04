const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EMAIL_TO_FIND = 'arisha_m@hotmail.co.uk';

async function main() {
    console.log(`Searching for records associated with: ${EMAIL_TO_FIND}\n`);

    const submissions = await prisma.surveySubmission.findMany({
        where: {
            userEmail: EMAIL_TO_FIND,
        },
        include: {
            responses: true,
            chart: true,
        },
    });

    if (submissions.length === 0) {
        console.log('No records found for this email.');
        return;
    }

    console.log(`Found ${submissions.length} submission(s):`);

    for (const sub of submissions) {
        const reading = await prisma.reading.findUnique({
            where: { submissionId: sub.id }
        });

        console.log(`--- Submission ID: ${sub.id} ---`);
        console.log(`Created At: ${sub.createdAt}`);
        console.log(`Reading Found: ${reading ? 'Yes' : 'No'}`);
        console.log(`Responses Count: ${sub.responses.length}`);
        console.log(`Chart ID: ${sub.chartId || 'None'}`);
        console.log('\n');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
