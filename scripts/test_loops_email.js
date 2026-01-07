require('dotenv').config();

const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
const LOOPS_TRANSACTIONAL_ID = process.env.LOOPS_TRANSACTIONAL_ID;
const TEST_EMAIL = "dev@example.com"; // We will try to find a real email from the logs or use a placeholder

async function testLoops() {
    console.log("🔍 Testing Loops.so Integration...");
    console.log("🔑 API Key Present:", !!LOOPS_API_KEY);
    console.log("🆔 Transaction ID:", LOOPS_TRANSACTIONAL_ID);

    if (!LOOPS_API_KEY) {
        console.error("❌ Missing LOOPS_API_KEY in .env");
        return;
    }

    const rawBaseUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:4321';
    const baseUrl = rawBaseUrl.replace(/\/$/, '');
    const readingUrl = `${baseUrl}/reading/TEST-SUBMISSION-ID`;

    console.log("🔗 Generated Link:", readingUrl);

    try {
        const payload = {
            transactionalId: LOOPS_TRANSACTIONAL_ID,
            email: process.env.EMAIL_FROM && process.env.EMAIL_FROM.includes('@') ? "sara@fateflix.app" : "dev@fateflix.app", // Try to send to a safe address or prompt user
            dataVariables: {
                'ff-link': readingUrl,
                'name': "Film Buff"
            }
        };

        // We need a real email to test. I'll check if there's one in the args.
        const targetEmail = process.argv[2];
        if (!targetEmail) {
            console.log("⚠️  Usage: node scripts/test_loops_email.js <your-email>");
            console.log("⚠️  No email provided, skipping actual send.");
            return;
        }
        payload.email = targetEmail;

        console.log(`📧 Sending test email to: ${payload.email}`);

        const response = await fetch('https://app.loops.so/api/v1/transactional', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${LOOPS_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => null);
        const text = !data ? await response.text().catch(() => "") : "";

        if (!response.ok) {
            console.error("❌ Loops API Error:", response.status, response.statusText);
            console.error("Details:", data || text);
        } else {
            console.log("✅ Email sent successfully via Loops!");
            console.log("Response:", data);
        }

    } catch (error) {
        console.error("💥 Unknown Error:", error.message);
    }
}

testLoops();
