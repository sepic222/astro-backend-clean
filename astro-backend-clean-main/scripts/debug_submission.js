
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    console.log('--- Debugging Submission Logic ---');

    // 1. Inspect a problematic question
    const targetKey = 'taste.how_you_watch';
    console.log(`\nFetching question: ${targetKey}`);

    const question = await prisma.surveyQuestion.findUnique({
        where: { key: targetKey },
        include: { options: true },
    });

    if (!question) {
        console.error(`ERROR: Question ${targetKey} not found!`);
        return;
    }

    console.log('Valid Options in DB:');
    question.options.forEach(o => {
        console.log(` - ID: ${o.id}, Value: "${o.value}", Label: "${o.label}"`);
    });

    // 2. Simulate the submission logic from server.js (UPDATED with Fallback)
    console.log('\nSimulating submission with answer: "Alone"');
    const testValues = ['Alone']; // The value typically sent by frontend

    for (const val of testValues) {
        if (val == null || val === '') continue;

        // 1. Try Strict Match (Value)
        let opt = question.options.find(o => o.value === val);

        // 2. Fallback: Match by Label (if strict match failed)
        if (!opt) {
            opt = question.options.find(o => o.label === val); // Exact label match
            if (opt) {
                console.log(`✅ MATCH: Resolved "${val}" to Option Value "${opt.value}" via Label.`);
            }
        }

        // 3. Fallback: Case-insensitive Label
        if (!opt && typeof val === 'string') {
            opt = question.options.find(o => o.label.toLowerCase() === val.toLowerCase());
            if (opt) {
                console.log(`✅ MATCH: Resolved "${val}" to Option Value "${opt.value}" via fuzzy Label.`);
            }
        }

        if (opt) {
            console.log(`-> Will link to Option ID: ${opt.id}`);
        } else {
            console.error(`❌ FAILURE: Still could not match "${val}" to any option.`);
        }
    }

    // 3. Try to actually create a dummy submission to trigger Prisma logs
    console.log('\nAttempting real DB write (Test Submission)...');
    try {
        const submission = await prisma.surveySubmission.create({
            data: {
                userEmail: 'debug_test@example.com',
            }
        });
        console.log('Submission created:', submission.id);

        // Attempt to save response
        // We intentionally use the logic that might fail if chose is empty
        if (chosen.length > 0) {
            const response = await prisma.surveyResponse.create({
                data: {
                    questionId: question.id,
                    submissionId: submission.id,
                    userId: 'debug_test@example.com'
                }
            });
            console.log('Response created:', response.id);
        } else {
            console.warn('Skipping response creation because no valid options matched.');
        }

    } catch (e) {
        console.error('Prisma Error:', e);
    } finally {
        // Cleanup? Maybe keep it for inspection.
    }

    await prisma.$disconnect();
}

main();
