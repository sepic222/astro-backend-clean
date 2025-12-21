
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Find the very last survey submission
    const lastSubmission = await prisma.surveySubmission.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        responses: {
          include: {
            question: true,
            responseOptions: {
              include: {
                option: true,
              },
            },
          },
        },
      },
    });

    if (!lastSubmission) {
      console.log('No survey submissions found.');
      return;
    }

    console.log(`Found submission ID: ${lastSubmission.id} from ${lastSubmission.createdAt}`);

    // 2. Format data for CSV
    // We want columns like: Question Key, Question Text, Answer
    const csvRows = [];

    // Add header
    csvRows.push(['Question Key', 'Question Text', 'Answer'].map(formatCsvField).join(','));

    // Sort responses by question sortOrder if possible, otherwise just iterate
    // The schema shows SurveyQuestion has sortOrder
    const sortedResponses = lastSubmission.responses.sort((a, b) => {
      return (a.question.sortOrder || 0) - (b.question.sortOrder || 0);
    });

    for (const response of sortedResponses) {
      const questionKey = response.question.key;
      const questionText = response.question.text;

      let answer = '';

      if (response.answerText) {
        // Try to parse answerText as JSON to handle "Other" option objects
        try {
          const parsed = JSON.parse(response.answerText);

          // Handle radio "Other" option: { selected: "other", otherText: "..." }
          if (parsed.selected === 'other' && parsed.otherText) {
            answer = `Other: ${parsed.otherText}`;
          }
          // Handle checkbox "Other" option: { selected: ["opt1", "other"], otherText: "..." }
          else if (Array.isArray(parsed.selected) && parsed.selected.includes('other') && parsed.otherText) {
            const otherOptions = parsed.selected.filter(v => v !== 'other').join('; ');
            answer = otherOptions ? `${otherOptions}; Other: ${parsed.otherText}` : `Other: ${parsed.otherText}`;
          }
          // Handle multi-entry arrays (like character_match)
          else if (Array.isArray(parsed)) {
            answer = parsed.join('; ');
          }
          // Handle any other object - just stringify it
          else if (typeof parsed === 'object') {
            answer = JSON.stringify(parsed);
          }
          // Regular string value
          else {
            answer = String(parsed);
          }
        } catch (e) {
          // Not JSON, just use as-is
          answer = response.answerText;
        }
      } else if (response.responseOptions && response.responseOptions.length > 0) {
        // Collect all selected options
        answer = response.responseOptions
          .map(ro => ro.option.label || ro.option.value)
          .join('; '); // Semicolon separate multiple selections
      }

      csvRows.push([questionKey, questionText, answer].map(formatCsvField).join(','));
    }

    // 3. Write to CSV file
    const outputPath = path.join(process.cwd(), 'last_submission_check.csv');
    fs.writeFileSync(outputPath, csvRows.join('\n'));

    console.log(`Successfully exported to ${outputPath}`);

  } catch (error) {
    console.error('Error exporting submission:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper to escape fields for CSV (handle quotes, commas, newlines)
function formatCsvField(field) {
  if (field === null || field === undefined) {
    return '""';
  }
  const stringField = String(field);
  // If field contains quote, comma or newline, wrap in quotes and escape internal quotes
  if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
}

main();
