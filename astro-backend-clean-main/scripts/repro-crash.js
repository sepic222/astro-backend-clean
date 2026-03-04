const TEST_EMAIL_PATTERNS = ['@test.com', '@example.com', '@fateflix.app', 'test@', 'demo@', 'admin@'];
const FOUNDER_EMAILS = ['saraellenpicard@icloud.com'];
const TEST_NAME_PATTERNS = ['test', 'demo', 'admin', 'asdf', 'xxx', 'aaa', 'bbb'];

function isTestSubmission(submission, username = '', discoverySource = '', responseCount = 0, totalQuestions = 50) {
    const email = (submission?.userEmail || '').toLowerCase();
    const nameLower = (username || '').toLowerCase().trim();

    for (const pattern of TEST_EMAIL_PATTERNS) {
        if (email.includes(pattern.toLowerCase())) return { isTest: true, reason: `Pattern: ${pattern}` };
    }

    const completionRate = totalQuestions > 0 ? (responseCount / totalQuestions) : 0;
    for (const founderEmail of FOUNDER_EMAILS) {
        if (email === founderEmail.toLowerCase()) {
            if (completionRate < 0.9) return { isTest: true, reason: `Founder email low completion` };
        }
    }

    for (const pattern of TEST_NAME_PATTERNS) {
        if (nameLower === pattern || nameLower.startsWith(pattern + ' ') || nameLower.includes(pattern)) {
            return { isTest: true, reason: `Name pattern: ${pattern}` };
        }
    }

    // CRASH POINT
    if (discoverySource && discoverySource.toLowerCase() === 'founder') {
        if (completionRate < 0.5) return { isTest: true, reason: 'Found via founder with low completion' };
    }

    if (nameLower.length > 0 && nameLower.length <= 2) return { isTest: true, reason: 'Name too short' };

    return { isTest: false, reason: 'Real' };
}

console.log('--- Testing with String ---');
try {
    isTestSubmission({ userEmail: 'user@example.com' }, 'John', 'founder', 10, 50);
    console.log('✅ String test passed');
} catch (e) {
    console.log('💥 String test FAILED:', e.message);
}

console.log('--- Testing with Array (REPRO) ---');
try {
    isTestSubmission({ userEmail: 'user@example.com' }, 'John', ['founder'], 10, 50);
    console.log('✅ Array test passed');
} catch (e) {
    console.log('💥 Array test FAILED (Expected):', e.message);
}
