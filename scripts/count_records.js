const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const responseCount = await prisma.response.count();
    const submissionCount = await prisma.surveySubmission.count();
    const surveyResponseCount = await prisma.surveyResponse.count();
    const surveyQuestionCount = await prisma.surveyQuestion.count();

    console.log(`Response table count: ${responseCount}`);
    console.log(`SurveySubmission table count: ${submissionCount}`);
    console.log(`SurveyResponse table count: ${surveyResponseCount}`);
    console.log(`SurveyQuestion table count: ${surveyQuestionCount}`);

    if (responseCount > 0) {
        const sample = await prisma.response.findFirst();
        console.log("\nSample Response.answers:", JSON.stringify(sample.answers, null, 2));
    }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
