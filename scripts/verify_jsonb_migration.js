const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyMigrationStandalone() {
    console.log('🚀 Running Standalone JSONB Migration Verification...');

    try {
        // 1. Find a submission or create a dummy one
        let submission = await prisma.surveySubmission.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        if (!submission) {
            console.log('📝 No submissions found, creating a new one...');
            submission = await prisma.surveySubmission.create({
                data: { userEmail: 'jsonb_test@example.com' }
            });
        }

        console.log('📝 Testing storage in submission ID:', submission.id);

        const testFullResponses = {
            username: 'JSONB_Standalone_Test',
            gender: 'cinephile',
            movie_universe: { selected: ['fantasy'], otherText: 'Middle Earth' },
            discovery: 'Word of mouth'
        };

        // 2. Simulate the /api/survey/save-answer merge logic
        console.log('💾 Merging test data into fullData...');
        const currentData = (submission.fullData && typeof submission.fullData === 'object') ? submission.fullData : {};
        const updatedData = { ...currentData, ...testFullResponses };

        await prisma.surveySubmission.update({
            where: { id: submission.id },
            data: { fullData: updatedData }
        });

        // 3. Verify storage
        const verifiedSub = await prisma.surveySubmission.findUnique({
            where: { id: submission.id }
        });

        if (verifiedSub && verifiedSub.fullData && verifiedSub.fullData.username === 'JSONB_Standalone_Test') {
            console.log('✅ SUCCESS: JSONB data correctly stored and retrieved!');
            console.log('📦 Final fullData:', JSON.stringify(verifiedSub.fullData, null, 2));
        } else {
            console.error('❌ FAILURE: JSONB data not found or mismatch!');
        }

    } catch (error) {
        console.error('❌ Error during verification:', error.message);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

verifyMigrationStandalone();
