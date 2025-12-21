
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const { default: fetch } = await import('node-fetch');
    const url = 'http://localhost:3001/api/birth-chart-swisseph';

    // Test Case: New York City (Should be America/New_York)
    // Lat: 40.7128, Lng: -74.0060
    const payload = {
        date: '1990-06-15',
        time: '12:00',
        latitude: 40.7128,
        longitude: -74.0060,
        city: 'New York',
        country: 'USA',
        username: 'TimezoneTest',
        timeAccuracy: 'exact',
        userEmail: 'tz_test@example.com'
    };

    console.log("Sending payload for New York:", payload);

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const json = await res.json();
        console.log("Response:", JSON.stringify(json, null, 2));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
