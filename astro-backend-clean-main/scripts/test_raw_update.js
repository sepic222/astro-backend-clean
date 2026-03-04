const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        const s = await prisma.surveySubmission.findFirst({ select: { id: true } });
        if (s) {
            const data = JSON.stringify({ test: 'raw_update_v2' });
            await prisma.$executeRawUnsafe(
                `UPDATE "SurveySubmission" SET "fullData" = $1::jsonb WHERE "id" = $2`,
                data,
                s.id
            );
            console.log('✅ Raw update successful!');
        } else {
            console.log('❓ No submission to test on');
        }
    } catch (e) {
        console.error('❌ Raw update failed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
    process.exit(0);
}
main();
