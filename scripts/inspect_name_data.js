const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- INSPECTING CHART DATA FOR NAME ---");

    const charts = await prisma.chart.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
    });

    charts.forEach(c => {
        console.log(`\nChart ID: ${c.id}`);
        console.log(`Email: ${c.userEmail}`);
        console.log(`rawChart keys: ${Object.keys(c.rawChart || {})}`);
        if (c.rawChart && (c.rawChart.name || c.rawChart.username || c.rawChart.firstName)) {
            console.log(`Found name info: name=${c.rawChart.name}, username=${c.rawChart.username}`);
        }
        // Also check responses linked to this chart if any
    });

    console.log("\n--- CHECKING RECENT SUBMISSIONS ---");
    const sub = await prisma.surveySubmission.findFirst({
        include: { chart: true }
    });
    console.log("Submission Chart ID:", sub?.chartId);
    if (sub?.chart?.rawChart) {
        console.log("Full rawChart:", JSON.stringify(sub.chart.rawChart, null, 2));
    }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
