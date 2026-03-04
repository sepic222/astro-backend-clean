const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkColumns() {
    try {
        const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'SurveySubmission' 
      AND table_schema = 'public';
    `;
        console.log('Columns in SurveySubmission:');
        console.table(result);

        const readingColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Reading' 
      AND table_schema = 'public';
    `;
        console.log('Columns in Reading:');
        console.table(readingColumns);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkColumns();
