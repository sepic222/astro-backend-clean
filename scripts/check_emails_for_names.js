const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- CHECKING EMAIL OUTBOX FOR NAMES ---");

    const emails = await prisma.emailOutbox.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        where: { status: 'SENT' }
    });

    emails.forEach(e => {
        console.log(`\nEmail to: ${e.toEmail}`);
        // Look for common greeting patterns in the HTML
        const match = e.htmlBody.match(/Hi\s+([^,!<]+)/) || e.htmlBody.match(/Dear\s+([^,!<]+)/);
        if (match) {
            console.log(`Potential Name match: "${match[1].trim()}"`);
        } else {
            console.log("No name pattern found in HTML.");
        }
    });
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
