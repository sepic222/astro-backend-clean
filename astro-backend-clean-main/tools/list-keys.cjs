const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const sections = await prisma.surveySection.findMany({
      select: { key: true },
      orderBy: { key: 'asc' },
    });
    console.log('\nSurveySection.key');
    console.table(sections);

    const questions = await prisma.surveyQuestion.findMany({
      select: { key: true },
      orderBy: { key: 'asc' },
    });
    console.log('\nSurveyQuestion.key');
    console.table(questions);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
