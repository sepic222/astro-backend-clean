// scripts/view_submissions.mjs
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function view() {
  console.log('📋 Recent Survey Submissions:\n');

  const submissions = await prisma.surveySubmission.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: {
      responses: {
        include: {
          question: true,
          responseOptions: {
            include: { option: true }
          }
        }
      }
    }
  });

  submissions.forEach((sub, idx) => {
    console.log(`\n${idx + 1}. Submission ID: ${sub.id}`);
    console.log(`   Email: ${sub.userEmail || 'anonymous'}`);
    console.log(`   Created: ${sub.createdAt.toISOString()}`);
    console.log(`   Responses: ${sub.responses.length}`);
    
    sub.responses.forEach((resp, i) => {
      console.log(`\n   ${i + 1}) ${resp.question.key}: ${resp.question.text}`);
      if (resp.answerText) {
        console.log(`      Answer: "${resp.answerText}"`);
      }
      if (resp.responseOptions.length > 0) {
        const opts = resp.responseOptions.map(ro => ro.option.label).join(', ');
        console.log(`      Selected: ${opts}`);
      }
    });
  });

  await prisma.$disconnect();
}

view();
