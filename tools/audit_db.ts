
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database...');
  try {
    const submissionCount = await prisma.surveySubmission.count();
    console.log(`Total SurveySubmissions: ${submissionCount}`);
    
    // Get last 5 submissions
    const recentSubmissions = await prisma.surveySubmission.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        responses: {
          include: {
            responseOptions: true
          }
        }
      }
    });

    console.log('\n--- Recent Submissions Analysis ---');
    for (const sub of recentSubmissions) {
      console.log(`\nID: ${sub.id}`);
      console.log(`Email: ${sub.userEmail}`);
      console.log(`Created: ${sub.createdAt.toISOString()}`);
      console.log(`Response Count: ${sub.responses.length}`);
      
      const responseWithOptions = sub.responses.find(r => r.responseOptions.length > 0);
      if (responseWithOptions) {
        console.log(`  Sample Response with Options (Q: ${responseWithOptions.questionId}): has ${responseWithOptions.responseOptions.length} options`);
      }

      // Check for associated Reading (using findFirst since submissionId is not @unique in schema but likely unique in practice?)
      // Schema said submissionId is @unique in Reading model.
      const reading = await prisma.reading.findUnique({
        where: { submissionId: sub.id }
      });
      console.log(`Reading Generated: ${!!reading} ${reading ? `(ID: ${reading.id})` : '[MISSING]'}`);
    }

    const readingCount = await prisma.reading.count();
    console.log(`\nTotal Readings: ${readingCount}`);
    
    const responseCount = await prisma.surveyResponse.count();
    console.log(`Total Responses: ${responseCount}`);

    const optionCount = await prisma.surveyResponseOption.count();
    console.log(`Total Response Options: ${optionCount}`);

  } catch (error) {
    console.error('Error auditing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
