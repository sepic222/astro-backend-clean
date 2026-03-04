function isTestSubmission(submission, username = '', discoverySource = '') {
    console.log('Checking isTestSubmission with discoverySource:', discoverySource, 'type:', typeof discoverySource);
    try {
        if (discoverySource && discoverySource.toLowerCase() === 'founder') {
            return true;
        }
    } catch (e) {
        console.log('Caught expected crash:', e.message);
        throw e;
    }
    return false;
}

console.log('--- Case: Array ---');
try {
    isTestSubmission({}, 'John', ['founder']);
} catch (e) {
    console.log('Test caught re-thrown error:', e.message);
}
const text = "founder";
console.log('--- Case: String ---');
isTestSubmission({}, 'John', text);
