const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        const s = await prisma.surveySubmission.findFirst({ select: { id: true } });
        if (!s) {
            console.log('❓ No submission to test on, creating a temp one');
            const temp = await prisma.surveySubmission.create({ data: { userEmail: 'test@example.com' } });
            try {
                await prisma.surveySubmission.update({
                    where: { id: temp.id },
                    data: { fullData: { test: true } }
                });
                console.log('✅ fullData field EXISTS and is writable');
            } finally {
                await prisma.surveySubmission.delete({ where: { id: temp.id } });
            }
        } else {
            await prisma.surveySubmission.update({
                where: { id: s.id },
                data: { fullData: { test: true } }
            });
            console.log('✅ fullData field EXISTS and is writable');
        }
    } catch (e) {
        console.error('❌ fullData field DOES NOT EXIST or error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
    process.exit(0);
}
main();
