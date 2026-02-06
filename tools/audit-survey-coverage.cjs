const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = '/Users/saraellenpicard/astro-frontend-clean';

const EXPECTED_PATH = path.join(__dirname, 'expectedSections.json');
if (!fs.existsSync(EXPECTED_PATH)) {
  console.error('Missing tools/expectedSections.json');
  process.exit(2);
}
const EXPECTED = JSON.parse(fs.readFileSync(EXPECTED_PATH, 'utf8'));

const CANDIDATE_DIRS = ['src/survey', 'src/components', 'src/pages', 'src'];
const SEARCH_DIRS = CANDIDATE_DIRS
  .map(rel => path.join(FRONTEND_DIR, rel))
  .filter(abs => fs.existsSync(abs));

if (!SEARCH_DIRS.length) {
  console.error('No searchable directories found.');
  console.error('Checked:', CANDIDATE_DIRS.join(', '));
  console.error('Frontend dir:', FRONTEND_DIR);
  process.exit(2);
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(t|j)sx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

function findImplementedSections(files, keys) {
  const found = new Set();
  for (const file of files) {
    let text = '';
    try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
    for (const key of keys) {
      if (text.includes(key)) found.add(key);
    }
  }
  return [...found].sort();
}

const files = SEARCH_DIRS.map(d => walk(d)).flat();
const implemented = findImplementedSections(files, EXPECTED);
const missing = EXPECTED.filter(k => !implemented.includes(k));

console.log('— Survey Section Coverage —');
console.log(`Frontend dir: ${FRONTEND_DIR}`);
console.log(`Expected:     ${EXPECTED.length}`);
console.log(`Implemented:  ${implemented.length}`);
console.log(`Missing:      ${missing.length}\n`);

console.log('Implemented:\n' + (implemented.join(', ') || '(none)') + '\n');
console.log('Missing:\n' + (missing.join(', ') || '(none)') + '\n');

process.exit(missing.length ? 1 : 0);
