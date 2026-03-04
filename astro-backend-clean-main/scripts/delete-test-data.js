const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
    const isDryRun = process.argv.includes('--execute') ? false : true;
    const userIdsPath = path.join(__dirname, 'user-test-ids.txt');

    if (!fs.existsSync(userIdsPath)) {
        console.error("Error: scripts/user-test-ids.txt not found.");
        process.exit(1);
    }

    const userIds = fs.readFileSync(userIdsPath, 'utf8')
        .split('\n')
        .map(id => id.trim())
        .filter(id => id.length > 0);

    console.log(`Loaded ${userIds.length} verified test IDs.`);
    if (isDryRun) {
        console.log("DRY RUN MODE: No data will be deleted. Use --execute to perform deletion.\n");
    } else {
        console.log("EXECUTE MODE: Deleting data...\n");
    }

    const stats = {
        submissions: 0,
        readings: 0,
        responses: 0,
        responseOptions: 0,
        outbox: 0,
        charts: 0,
        errors: 0
    };

    for (const id of userIds) {
        try {
            const submission = await prisma.surveySubmission.findUnique({
                where: { id },
                include: {
                    responses: {
                        include: { responseOptions: true }
                    }
                }
            });

            if (!submission) {
                // console.log(`Submission ${id} not found, skipping.`);
                continue;
            }

            const chartId = submission.chartId;

            // 1. Readings
            const readingCount = await prisma.reading.count({ where: { submissionId: id } });
            if (!isDryRun && readingCount > 0) {
                await prisma.reading.deleteMany({ where: { submissionId: id } });
            }
            stats.readings += readingCount;

            // 2. Email Outbox
            const outboxCount = await prisma.emailOutbox.count({ where: { submissionId: id } });
            if (!isDryRun && outboxCount > 0) {
                await prisma.emailOutbox.deleteMany({ where: { submissionId: id } });
            }
            stats.outbox += outboxCount;

            // 3. Responses and Options
            for (const resp of submission.responses) {
                stats.responseOptions += resp.responseOptions.length;
                if (!isDryRun) {
                    // ResponseOptions are deleted automatically if they were defined with onDelete: Cascade in Prisma?
                    // Let's check schema: @@id([responseId, optionId]) and @@map("survey_response_options")
                    // No explicit cascade in schema but we can delete them.
                    await prisma.surveyResponseOption.deleteMany({ where: { responseId: resp.id } });
                }
                stats.responses += 1;
            }

            if (!isDryRun) {
                await prisma.surveyResponse.deleteMany({ where: { submissionId: id } });
            }

            // 4. Submission
            if (!isDryRun) {
                await prisma.surveySubmission.delete({ where: { id } });
            }
            stats.submissions += 1;

            // 5. Chart (if not shared)
            if (chartId) {
                const otherSubmissions = await prisma.surveySubmission.count({
                    where: { chartId, id: { not: id } }
                });

                if (otherSubmissions === 0) {
                    if (!isDryRun) {
                        // Check for other tables linked to Chart
                        await prisma.chartAspect.deleteMany({ where: { chartId } });
                        await prisma.chart.delete({ where: { id: chartId } });
                    }
                    stats.charts += 1;
                }
            }

            if (stats.submissions % 50 === 0) {
                console.log(`Progress: ${stats.submissions} submissions processed...`);
            }

        } catch (err) {
            console.error(`Error processing ID ${id}:`, err.message);
            stats.errors += 1;
        }
    }

    console.log(`\nFinal Summary (${isDryRun ? 'DRY RUN' : 'EXECUTED'}):`);
    console.log(`- Submissions: ${stats.submissions}`);
    console.log(`- Readings: ${stats.readings}`);
    console.log(`- Survey Responses: ${stats.responses}`);
    console.log(`- Response Options: ${stats.responseOptions}`);
    console.log(`- Email Outbox entries: ${stats.outbox}`);
    console.log(`- Unique Charts: ${stats.charts}`);
    console.log(`- Errors: ${stats.errors}`);

    if (isDryRun) {
        console.log("\nTo perform the actual deletion, run: node scripts/delete-test-data.js --execute");
    }

    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
