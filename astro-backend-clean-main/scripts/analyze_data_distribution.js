const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const questions = await prisma.surveyQuestion.findMany({
        include: {
            responses: {
                take: 100,
                include: {
                    responseOptions: {
                        include: { option: true }
                    }
                }
            }
        }
    });

    console.log("Key | Type | Count | Has Text | Has Options | Sample Answer");
    console.log("------------------------------------------------------------");

    for (const q of questions) {
        let hasText = 0;
        let hasOptions = 0;
        let sample = "";

        q.responses.forEach(r => {
            if (r.answerText && r.answerText !== 'null') hasText++;
            if (r.responseOptions.length > 0) hasOptions++;

            if (!sample) {
                if (r.responseOptions.length > 0) {
                    sample = r.responseOptions.map(ro => ro.option.value).join('; ');
                } else if (r.answerText && r.answerText !== 'null') {
                    sample = r.answerText;
                }
            }
        });

        console.log(`${q.key.padEnd(25)} | ${q.type.padEnd(8)} | ${q.responses.length.toString().padStart(5)} | ${hasText.toString().padStart(8)} | ${hasOptions.toString().padStart(11)} | ${sample.substring(0, 30)}`);
    }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
