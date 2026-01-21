const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- TESTING USERNAME MAPPING ---");

    const { normalizeSurveyPayload } = require('../server/normalizeSurveyPayload');

    const mockReqBody = {
        survey: {
            "section1": {
                username: "TestUser123"
            }
        }
    };

    const normalized = normalizeSurveyPayload(mockReqBody);
    console.log("Normalized mapping check (astro-data.username):");
    const found = normalized.answers.find(a => a.questionKey === 'cosmic.name');
    if (found && found.answerText === 'TestUser123') {
        console.log("✅ SUCCESS: astro-data.username -> cosmic.name");
    } else {
        console.log("❌ FAILED: Mapping not as expected", JSON.stringify(normalized.answers));
    }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
