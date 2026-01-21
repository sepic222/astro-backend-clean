const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- INSPECTING CHOICE ANSWERS ---");

    const samples = await prisma.surveyResponse.findMany({
        take: 10,
        where: {
            question: {
                type: { in: ['radio', 'checkbox'] }
            }
        },
        include: {
            question: true,
            responseOptions: {
                include: {
                    option: true
                }
            }
        }
    });

    samples.forEach(s => {
        console.log(`\nID: ${s.id}`);
        console.log(`Question: [${s.question.type}] ${s.question.key}`);
        console.log(`AnswerText (raw): "${s.answerText}"`);
        console.log(`Options Count: ${s.responseOptions.length}`);
        if (s.responseOptions.length > 0) {
            console.log(`Options: ${s.responseOptions.map(ro => `${ro.option.value} (${ro.option.label})`).join(', ')}`);
        }
    });
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
