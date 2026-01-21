const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        // Find the latest submission
        const lastSubmission = await prisma.surveySubmission.findFirst({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                responses: {
                    include: {
                        question: true,
                    },
                },
            },
        });

        if (!lastSubmission) {
            console.log('No submissions found.');
            return;
        }

        console.log(`\nSubmission ID: ${lastSubmission.id}`);
        console.log(`Created: ${lastSubmission.createdAt}\n`);

        // Find the "crave_most" question response
        const craveResponse = lastSubmission.responses.find(
            r => r.question.key === 'world.crave_in_movie'
        );

        if (craveResponse) {
            console.log('Question: What do you crave most in a movie?');
            console.log('Raw answerText:', craveResponse.answerText);
            console.log('Type:', typeof craveResponse.answerText);
            console.log('Length:', craveResponse.answerText?.length);

            // Try to see the actual characters
            if (craveResponse.answerText) {
                console.log('\nCharacter codes:');
                for (let i = 0; i < Math.min(50, craveResponse.answerText.length); i++) {
                    console.log(`  [${i}]: '${craveResponse.answerText[i]}' (${craveResponse.answerText.charCodeAt(i)})`);
                }
            }
        } else {
            console.log('Could not find crave_most response');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
