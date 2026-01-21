/**
 * Export all survey submissions to TSV for Google Sheets
 * 
 * Outputs:
 * - Rows: one per submission
 * - Columns: Submission ID, Email, Created At, then each question by numbered ID
 * 
 * Run: node scripts/export_all_submissions_tsv.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching all survey submissions...\n");

    // First, get all unique questions ordered by their sortOrder to create consistent columns
    const allQuestions = await prisma.surveyQuestion.findMany({
        orderBy: [
            { section: { sortOrder: 'asc' } },
            { sortOrder: 'asc' }
        ],
        include: {
            section: true
        }
    });

    // Create numbered question IDs (Q1, Q2, etc.) with their database key
    const questionMap = {};
    const orderedQuestionKeys = [];

    allQuestions.forEach((q, index) => {
        const numberedId = `Q${index + 1}_${q.key}`;
        questionMap[q.id] = {
            numberedId,
            key: q.key,
            sectionKey: q.section.key,
            index: index + 1
        };
        orderedQuestionKeys.push({ id: q.id, numberedId, key: q.key });
    });

    // Fetch all submissions with their responses
    const submissions = await prisma.surveySubmission.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            chart: true,
            responses: {
                include: {
                    question: true,
                    responseOptions: {
                        include: {
                            option: true
                        }
                    }
                }
            }
        }
    });

    if (submissions.length === 0) {
        console.log("No submissions found.");
        return;
    }

    console.log(`Found ${submissions.length} submissions and ${allQuestions.length} questions.\n`);

    // Build header row
    const headerRow = [
        'Submission_ID',
        'Email',
        'Created_At',
        'Birth_City',
        'Birth_Country',
        'Rising_Sign',
        'Sun_Sign',
        'Moon_Sign',
        ...orderedQuestionKeys.map(q => q.numberedId)
    ];

    // Build data rows
    const dataRows = [];

    for (const sub of submissions) {
        // Build a map of question ID -> answer for this submission
        const answerMap = {};

        for (const r of sub.responses) {
            let answerDisplay = '';

            // 1. Relational Response Options (Prefer labels)
            if (r.responseOptions && r.responseOptions.length > 0) {
                const values = r.responseOptions.map(ro => ro.option.label || ro.option.value);
                answerDisplay = values.join('; ');
            }

            // 2. Fallback to answerText if empty or if it contains JSON/Objects
            if (!answerDisplay || answerDisplay === 'null') {
                const raw = (r.answerText || '').trim();

                if (raw && raw !== 'null' && raw !== '[object Object]') {
                    try {
                        // Check if it's JSON (often seen as ["val1", "val2"] or {"selected": [...]})
                        if (raw.startsWith('[') || raw.startsWith('{')) {
                            const parsed = JSON.parse(raw);
                            if (Array.isArray(parsed)) {
                                answerDisplay = parsed.join('; ');
                            } else if (typeof parsed === 'object' && parsed.selected) {
                                // Handle {"selected": [...]} format
                                answerDisplay = Array.isArray(parsed.selected) ? parsed.selected.join('; ') : String(parsed.selected);
                            } else {
                                answerDisplay = raw;
                            }
                        } else {
                            // Simple text
                            answerDisplay = raw;
                        }
                    } catch (e) {
                        // Not valid JSON, just use raw text
                        answerDisplay = raw;
                    }
                }
            }

            // Cleanup for TSV
            if (answerDisplay === 'null' || answerDisplay === '[object Object]') {
                answerDisplay = '';
            }

            answerMap[r.questionId] = answerDisplay;
        }

        // Build row
        const row = [
            sub.id,
            sub.userEmail || '',
            sub.createdAt ? sub.createdAt.toISOString() : '',
            sub.chart?.city || '',
            sub.chart?.country || '',
            sub.chart?.risingSign || '',
            sub.chart?.sunSign || '',
            sub.chart?.moonSign || '',
            ...orderedQuestionKeys.map(q => {
                const answer = answerMap[q.id] || '';
                // Escape tabs and newlines for TSV format
                return String(answer).replace(/\t/g, ' ').replace(/\n/g, ' | ');
            })
        ];

        dataRows.push(row);
    }

    // Convert to TSV format
    const tsvContent = [
        headerRow.join('\t'),
        ...dataRows.map(row => row.join('\t'))
    ].join('\n');

    // Write to file
    const outputPath = path.join(__dirname, '..', 'survey_submissions_export.tsv');
    fs.writeFileSync(outputPath, tsvContent, 'utf-8');

    console.log(`✅ Export complete!`);
    console.log(`📄 File: ${outputPath}`);
    console.log(`📊 Total submissions: ${submissions.length}`);
    console.log(`❓ Total question columns: ${orderedQuestionKeys.length}`);
    console.log(`\n📋 Question ID Reference:`);

    // Print question reference
    orderedQuestionKeys.forEach(q => {
        console.log(`   ${q.numberedId}`);
    });
}

main()
    .catch((e) => {
        console.error("Error executing script:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
