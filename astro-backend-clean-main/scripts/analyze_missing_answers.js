
const fs = require('fs');
const path = require('path');

// 1. Read the exported submission CSV
const submissionPath = path.join(process.cwd(), 'last_submission_check.csv');
const submissionContent = fs.readFileSync(submissionPath, 'utf8');

// Parse simple CSV (handling quoted newlines roughly or assuming simple structure from previous export)
// The previous export used standard CSV rules. Let's do a reliable enough parse.
// We know column 0 is Key, 2 is Answer.
function parseCsv(content) {
    const lines = content.split('\n');
    const headers = lines[0].split(',');
    const result = {};

    // Skip header, process lines
    // Note: Splitting by comma is dangerous if values contain commas, but our export script handles that by determining fields. 
    // A robust CSV parser is better, but let's try a regex match for simplicity as we generated the file.
    // The export format was: "key","text","answer" (or unquoted if safe).

    // Actually, let's just use the previous script's logic in reverse or a simple regex.
    // Or better, just map the file content since we know the keys.

    // Let's iterate and find lines.
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple parse: split by comma, respecting quotes
        const matches = line.match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g);
        if (matches && matches.length >= 3) {
            // Clean up matches
            const key = matches[0].replace(/^,/, '').replace(/^"|"$/g, '').replace(/""/g, '"');
            // The answer is the last column usually, but let's be careful.
            // We exported: key, text, answer. 3 columns.
            // matches array might have empty strings for empty fields.

            const lastMatch = matches[matches.length - 1]; // Answer
            const answer = lastMatch.replace(/^,/, '').replace(/^"|"$/g, '').replace(/""/g, '"');

            result[key] = answer;
        }
    }
    return result;
}

const submissionAnswers = parseCsv(submissionContent);

// 2. Read questions.csv
const questionsPath = path.join(process.cwd(), 'prisma/questions.csv');
const questionsContent = fs.readFileSync(questionsPath, 'utf8');
const questionLines = questionsContent.split('\n');

const stats = {
    total: 0,
    missing: 0,
    byType: {}
};

// headers: section_number;section_id;section_title;question_order;id;prompt;type;required;multiple;has_other;options_keywords
// Separator is semicolon
for (let i = 1; i < questionLines.length; i++) {
    const line = questionLines[i].trim();
    if (!line) continue;

    const cols = line.split(';');
    const key = cols[4]; // id column
    const type = cols[6]; // type column

    if (!key || !type) continue;

    stats.total++;

    // Check if answer exists in submission
    const answer = submissionAnswers[key];
    if (!answer || answer.trim() === '') {
        stats.missing++;

        // Normalize type (some might be capitalized like 'Radio')
        const normType = type.toLowerCase();
        stats.byType[normType] = (stats.byType[normType] || 0) + 1;

        // Log missing for debugging
        // console.log(`Missing: ${key} (${type})`);
    }
}

console.log('--- Analysis Result ---');
console.log(`Total Questions: ${stats.total}`);
console.log(`Total Missing Answers: ${stats.missing}`);
console.log('\nMissing by type:');
const sortedTypes = Object.entries(stats.byType).sort((a, b) => b[1] - a[1]);
for (const [type, count] of sortedTypes) {
    console.log(`${type}: ${count}`);
}

// 3. Output logic for the agent to read
const mostFrequent = sortedTypes.length > 0 ? sortedTypes[0][0] : 'None';
console.log(`\nMost frequently missing type: ${mostFrequent} (${sortedTypes.length > 0 ? sortedTypes[0][1] : 0})`);
