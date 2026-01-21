const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const { default: fetch } = await import('node-fetch');
    const url = 'http://localhost:3001/api/birth-chart-swisseph'; // Adjust port if needed

    // Payload mimicking the frontend, WITH City/Country
    const payload = {
        date: '1982-08-18',
        time: '18:54',
        latitude: 50.7374,
        longitude: 7.0982,
        city: 'Bonn',
        country: 'Germany',
        username: 'ReproUser',
        timeAccuracy: 'exact',
        userEmail: 'repro@test.com'
    };

    console.log("Sending payload:", payload);

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const json = await res.json();
        console.log("Response:", JSON.stringify(json, null, 2));

        if (json.chartId) {
            console.log(`\nVerifying Chart ID: ${json.chartId} in DB...`);
            const chart = await prisma.chart.findUnique({
                where: { id: json.chartId }
            });
            console.log("Saved Chart Record:", chart);

            if (chart.city === 'Bonn' && chart.country === 'Germany') {
                console.log("SUCCESS: City and Country were saved correctly.");
            } else {
                console.log("FAILURE: City/Country MISSING in DB record.");
            }
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
