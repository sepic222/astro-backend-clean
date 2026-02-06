const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSubmissions() {
  const submissions = await prisma.surveySubmission.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { responses: true } }
    }
  });

  submissions.forEach(s => {
    console.log(`ID: ${s.id}, Email: ${s.userEmail}`);
    console.log(`Response count (DB): ${s._count.responses}`);
    if (s.fullData) {
      console.log(`fullData keys: ${Object.keys(s.fullData).join(', ')}`);
      console.log(`fullData key count: ${Object.keys(s.fullData).length}`);
    } else {
      console.log('No fullData');
    }
    console.log('---');
  });

  await prisma.$disconnect();
}

checkSubmissions();
