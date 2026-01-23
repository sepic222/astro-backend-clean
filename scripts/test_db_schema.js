const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const submissions = await prisma.surveySubmission.findMany({ take: 1 });
    console.log('✅ Connection successful');
    console.log('Sample submission fields:', Object.keys(submissions[0] || {}));
  } catch (e) {
    console.error('❌ Connection failed:', e.message);
  } finally {
    await prisma.$disconnect();
  }
  process.exit(0);
}
main();
