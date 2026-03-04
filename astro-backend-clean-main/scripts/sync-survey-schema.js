const fs = require('fs');
const path = require('path');

// Paths
// Assuming we run this from astro-backend-clean-main root
const FRONTEND_PATH = path.join(__dirname, '../../fateflix-frontend/src/config/surveyData.js');
const BACKEND_OUTPUT_PATH = path.join(__dirname, '../src/config/surveySchema.js');

console.log('🔄 Syncing Survey Schema...');
console.log(`📖 Reading from: ${FRONTEND_PATH}`);

try {
    // Check if frontend file exists
    if (!fs.existsSync(FRONTEND_PATH)) {
        console.error('❌ Frontend surveyData.js not found!');
        process.exit(1);
    }

    const fileContent = fs.readFileSync(FRONTEND_PATH, 'utf8');

    // We need to parse the array from the file string without executing it (it contains ESM exports)
    // Simple strategy: Extract the array using regex or eval in a safe context?
    // Since it's a fixed format export, we can try a regex extraction or a temporary modification to require it.
    // BUT: The frontend file uses `export const surveySections = [...]`
    // We can strip the export prefix and use eval/JSON.parse if it's clean, but it has JS objects.

    // Method: Simple Regex to find the array content and reconstruction, 
    // OR safer: Function evaluation.

    // Let's try a regex-based extraction of the structural data to be safe and avoid runtime complexity 
    // with missing frontend dependencies (like React components if they were there).

    // Actually, simplest robust way:
    // 1. Read file
    // 2. Remove "export const surveySections =" and "export default"
    // 3. Eval the object (assuming it doesn't have imported dependencies)

    let cleanJs = fileContent
        .replace(/export\s+const\s+surveySections\s+=\s+/, 'module.exports = ')
        .replace(/;(\s*)$/, '');

    // Define a temporary module to load it
    const tempFile = path.join(__dirname, 'temp_survey_loader.js');
    fs.writeFileSync(tempFile, cleanJs);

    const surveySections = require('./temp_survey_loader');

    // Clean up temp file
    fs.unlinkSync(tempFile);

    // Now we have the full object. Let's strip UI fields.
    const cleanSchema = surveySections.map(section => ({
        id: section.id,
        title: section.title,
        questions: section.questions.map(q => {
            // Essential fields for Backend Reports
            const cleanQ = {
                id: q.id,
                type: q.type,
                text: q.text
            };

            // Include options for Radio/Checkbox (needed for label mapping)
            if (q.options) {
                cleanQ.options = q.options.map(o => ({
                    value: o.value,
                    label: o.label
                }));
            }

            return cleanQ;
        })
    }));

    const outputContent = `// AUTO-GENERATED FILE. DO NOT EDIT.
// Synced from fateflix-frontend/src/config/surveyData.js
// Run "npm run sync-schema" to update.

module.exports.surveySchema = ${JSON.stringify(cleanSchema, null, 2)};
`;

    fs.writeFileSync(BACKEND_OUTPUT_PATH, outputContent);
    console.log(`✅ Successfully synced schema to: ${BACKEND_OUTPUT_PATH}`);
    // console.log(`📊 Extracted ${cleanSchema.length} sections.`);

} catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
}
