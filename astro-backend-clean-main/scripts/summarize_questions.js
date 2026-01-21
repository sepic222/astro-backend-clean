const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- QUESTION RESPONSE SUMMARY ---");

    const questions = await prisma.surveyQuestion.findMany({
        include: {
            _count: {
                select: { responses: true }
            },
            section: true
        }
    });

    questions.forEach(q => {
        console.log(`[${q._count.responses.toString().padStart(4)}] Key: ${q.key.padEnd(30)} | Text: ${q.text.substring(0, 40)}...`);
    });

    console.log("\n--- SEARCHING FOR DATA NOT IN CURRENT FRONTEND ---");
    // I don't have the list of "current" keys in this script easily, 
    // but I can see if any have 0 responses (brand new) or very old responses.
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
