
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Fetching last 5 survey submissions (WITH COSMIC DATA)...\n");

    const submissions = await prisma.surveySubmission.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            chart: true, // Include the linked Chart
            responses: {
                include: {
                    question: true,
                    responseOptions: {
                        include: {
                            option: true
                        }
                    }
                }
            }
        }
    });

    if (submissions.length === 0) {
        console.log("No submissions found.");
        return;
    }

    for (const sub of submissions) {
        console.log(`================================================================================`);
        console.log(`SUBMISSION ID: ${sub.id}`);
        console.log(`EMAIL:         ${sub.userEmail || 'Anonymous'}`);
        console.log(`DATE:          ${sub.createdAt}`);
        console.log(`--------------------------------------------------------------------------------`);

        // --- DISPLAY BIRTH DATA ---
        const c = sub.chart;
        if (c) {
            console.log(`[BIRTH DATA]`);
            console.log(`  Location:    ${c.city}, ${c.country}`);
            console.log(`  Birth Time:  ${c.birthDateTimeUtc ? new Date(c.birthDateTimeUtc).toISOString() : 'Unknown'}`);
            console.log(`  (Raw Chart ID: ${c.id})`);

            console.log(`\n[PLANETARY PLACEMENTS]`);
            console.log(`  RISING:      ${c.risingSign || '?'}`);
            console.log(`  SUN:         ${c.sunSign || '?'} (House ${c.sunHouse})`);
            console.log(`  MOON:        ${c.moonSign || '?'} (House ${c.moonHouse})`);
            console.log(`  MERCURY:     ${c.mercurySign || '?'} | VENUS: ${c.venusSign || '?'} | MARS: ${c.marsSign || '?'}`);
            console.log(`  JUPITER:     ${c.jupiterSign || '?'} | SATURN: ${c.saturnSign || '?'}`);
        } else {
            console.log(`[COSMIC DATA]  (No Linked Chart Found)`);
        }
        console.log(`--------------------------------------------------------------------------------`);
        console.log(`[SURVEY ANSWERS]`);

        // Sort responses by question sortOrder if possible
        const sortedResponses = sub.responses.sort((a, b) => {
            return (a.question.sortOrder || 0) - (b.question.sortOrder || 0);
        });

        for (const r of sortedResponses) {
            const qText = r.question.text;
            const qKey = r.question.key;

            let answerDisplay = '';

            if (r.responseOptions && r.responseOptions.length > 0) {
                const labels = r.responseOptions.map(ro => ro.option.label || ro.option.value);
                answerDisplay = labels.join(', ');
            } else {
                answerDisplay = r.answerText || '(No Answer)';
            }

            console.log(`  [${qKey}] ${qText}`);
            console.log(`   -> ${answerDisplay}`);
            console.log('');
        }
        console.log(`\n`);
    }
}

main()
    .catch((e) => {
        console.error("Error executing script:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
