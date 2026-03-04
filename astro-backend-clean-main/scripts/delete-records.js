const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SUBMISSION_IDS = ['cmlmvtgl805opqh1lvr5m53vl', 'cmlmvtgtg05osqh1lqje1yd0y'];

async function main() {
    console.log(`Starting deletion for submissions: ${SUBMISSION_IDS.join(', ')}\n`);

    for (const id of SUBMISSION_IDS) {
        console.log(`Processing Submission ID: ${id}`);

        // 1. Get submission details to find chartId
        const sub = await prisma.surveySubmission.findUnique({
            where: { id },
            include: { responses: true }
        });

        if (!sub) {
            console.log(`Submission ${id} not found, skipping.`);
            continue;
        }

        const chartId = sub.chartId;

        // 2. Delete SurveyResponseOptions
        const responseIds = sub.responses.map(r => r.id);
        if (responseIds.length > 0) {
            const deletedOptions = await prisma.surveyResponseOption.deleteMany({
                where: { responseId: { in: responseIds } }
            });
            console.log(`Deleted ${deletedOptions.count} SurveyResponseOption(s)`);
        }

        // 3. Delete SurveyResponses
        const deletedResponses = await prisma.surveyResponse.deleteMany({
            where: { submissionId: id }
        });
        console.log(`Deleted ${deletedResponses.count} SurveyResponse(s)`);

        // 4. Delete Reading
        const deletedReadings = await prisma.reading.deleteMany({
            where: { submissionId: id }
        });
        console.log(`Deleted ${deletedReadings.count} Reading(s)`);

        // 5. Delete SurveySubmission
        await prisma.surveySubmission.delete({
            where: { id }
        });
        console.log(`Deleted SurveySubmission: ${id}`);

        // 6. Handle Chart Cleanup
        if (chartId) {
            const usageCount = await prisma.surveySubmission.count({
                where: { chartId }
            });

            if (usageCount === 0) {
                // No other submissions use this chart
                // Check if other models use it (Survey, Response)
                const surveyCount = await prisma.survey.count({ where: { chartId } });
                const resCount = await prisma.response.count({ where: { chartId } });

                if (surveyCount === 0 && resCount === 0) {
                    await prisma.chart.delete({ where: { id: chartId } });
                    console.log(`Deleted unshared Chart: ${chartId}`);
                } else {
                    console.log(`Chart ${chartId} is still referenced by Surveys/Responses, keeping it.`);
                }
            } else {
                console.log(`Chart ${chartId} is still referenced by ${usageCount} other submission(s), keeping it.`);
            }
        }
        console.log('--- Done ---\n');
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
