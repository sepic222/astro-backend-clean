const fs = require('fs');
const path = require('path');

// Extract parseAnswer and isTestSubmission from server.js
const serverJs = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');

function extractFunc(name) {
    const match = serverJs.match(new RegExp(`function ${name}\\s*\\([^{]*\\)\\s*\\{([\\s\\S]*?\\n\\})`, ''));
    if (!match) return null;
    return new Function('submission', 'username', 'discoverySource', 'responseCount', 'totalQuestions',
        `const TEST_EMAIL_PATTERNS = ['@test.com', '@example.com', '@fateflix.app', 'test@', 'demo@', 'admin@'];
     const FOUNDER_EMAILS = ['saraellenpicard@icloud.com'];
     const TEST_NAME_PATTERNS = ['test', 'demo', 'admin', 'asdf', 'xxx', 'aaa', 'bbb'];
     function parseAnswer(answerText, responseOptions = []) {
       if (responseOptions && responseOptions.length > 0) {
         return responseOptions.map(ro => ro.option?.label || ro.option?.value).join('; ');
       }
       let answer = answerText;
       if (answer === null || answer === undefined) return '';
       if (typeof answer === 'object') {
         if (Array.isArray(answer)) return answer.map(String).join('; ');
         return JSON.stringify(answer);
       }
       return String(answer);
     }
     ${match[1]}`);
}

const isTestSubmission = extractFunc('isTestSubmission');

// Also need to manually test the logic in the route if possible, or just mock it
console.log('--- Testing isTestSubmission for Crash ---');
try {
    const result = isTestSubmission({}, 'John', ['founder'], 10, 50);
    console.log('✅ Fix verified: No crash with array in isTestSubmission');
} catch (e) {
    console.log('💥 Fix FAILED:', e.message);
}
