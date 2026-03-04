const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TEST_EMAIL_PATTERNS = [
    '@test.com', '@example.com', '@fateflix.app',
    'test@', 'demo@', 'admin@'
];

const FOUNDER_EMAILS = [
    'saraellenpicard@icloud.com'
];

const TEST_NAME_PATTERNS = [
    'test', 'demo', 'admin', 'asdf', 'xxx', 'aaa', 'bbb'
];

function isTestSubmission(submission, username = '', discoverySource = '', responseCount = 0, totalQuestions = 50) {
    const email = (submission?.userEmail || '').toLowerCase();
    const nameLower = (username || '').toLowerCase().trim();

    for (const pattern of TEST_EMAIL_PATTERNS) {
        if (email.includes(pattern.toLowerCase())) {
            return { isTest: true, reason: `Email matches test pattern: ${pattern}` };
        }
    }

    const completionRate = totalQuestions > 0 ? (responseCount / totalQuestions) : 0;
    for (const founderEmail of FOUNDER_EMAILS) {
        if (email === founderEmail.toLowerCase()) {
            if (completionRate < 0.9) {
                return { isTest: true, reason: `Founder email with ${Math.round(completionRate * 100)}% completion` };
            }
        }
    }

    for (const pattern of TEST_NAME_PATTERNS) {
        if (nameLower === pattern || nameLower.startsWith(pattern + ' ') || nameLower.includes(pattern)) {
            return { isTest: true, reason: `Name matches test pattern: ${pattern}` };
        }
    }

    if (discoverySource && discoverySource.toLowerCase() === 'founder') {
        if (completionRate < 0.5) {
            return { isTest: true, reason: 'Found via founder with low completion' };
        }
    }

    if (nameLower.length > 0 && nameLower.length <= 2) {
        return { isTest: true, reason: 'Name too short (likely test)' };
    }

    return { isTest: false, reason: 'Appears to be real user' };
}

async function main() {
    console.log("Analyzing database for test data...");
    const submissions = await prisma.surveySubmission.findMany({
        include: {
            _count: { select: { responses: true } },
            responses: {
                where: { question: { key: { in: ['username', 'cosmic.username', 'discovery', 'fit.found_survey', 'fit.discovery'] } } },
                include: { question: { select: { key: true } } }
            }
        }
    });

    let testCount = 0;
    let realCount = 0;
    const reasons = {};

    for (const s of submissions) {
        const fullData = (s.fullData && typeof s.fullData === 'object') ? s.fullData : {};
        let username = fullData.username || '';
        let discoverySource = fullData.discovery || '';

        for (const resp of s.responses || []) {
            if (!username && (resp.question?.key === 'username' || resp.question?.key === 'cosmic.username')) username = resp.answerText || '';
            if (!discoverySource && (resp.question?.key === 'fit.found_survey' || resp.question?.key === 'fit.discovery' || resp.question?.key === 'discovery')) {
                discoverySource = resp.answerText || '';
            }
        }

        const responseCount = (s._count?.responses || 0) + Object.keys(fullData).length;
        const result = isTestSubmission(s, username, discoverySource, responseCount, 50);

        if (result.isTest) {
            testCount++;
            reasons[result.reason] = (reasons[result.reason] || 0) + 1;
        } else {
            realCount++;
        }
    }

    console.log(`\nResults:`);
    console.log(`Total Submissions: ${submissions.length}`);
    console.log(`Test Submissions: ${testCount}`);
    console.log(`Real Submissions: ${realCount}`);
    console.log(`\nTest Reasons Breakdown:`);
    console.dir(reasons);

    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
