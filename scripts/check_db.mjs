// scripts/check_db.mjs
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  console.log('🔍 Checking database...\n');

  const sections = await prisma.surveySection.count();
  const questions = await prisma.surveyQuestion.count();
  const options = await prisma.surveyOption.count();
  const submissions = await prisma.surveySubmission.count();
  const responses = await prisma.surveyResponse.count();

  console.log(`📊 Database counts:`);
  console.log(`   Survey Sections: ${sections}`);
  console.log(`   Survey Questions: ${questions}`);
  console.log(`   Survey Options: ${options}`);
  console.log(`   Submissions: ${submissions}`);
  console.log(`   Responses: ${responses}`);

  if (questions > 0) {
    console.log('\n📝 Sample questions:');
    const sampleQuestions = await prisma.surveyQuestion.findMany({
      take: 3,
      include: { options: true },
    });
    sampleQuestions.forEach(q => {
      console.log(`   - ${q.key}: ${q.text} (${q.options.length} options)`);
    });
  }

  await prisma.$disconnect();
}

check();
