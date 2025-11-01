const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = '/Users/saraellenpicard/astro-frontend-clean';

const EXPECTED_PATH = path.join(__dirname, 'expectedSections.json');
if (!fs.existsSync(EXPECTED_PATH)) {
  console.error('Missing tools/expectedSections.json');
  process.exit(2);
}
const expected = JSON.parse(fs.readFileSync(EXPECTED_PATH, 'utf8'));

const sectionsDir = path.join(FRONTEND_DIR, 'src', 'survey', 'sections');
fs.mkdirSync(sectionsDir, { recursive: true });

function toComponentName(sectionId) {
  if (/^section\d+$/i.test(sectionId)) {
    return sectionId.replace(/^section/i, 'Section');
  }
  return 'Section' + sectionId
    .split(/[-_.]/)
    .map(s => (s ? s[0].toUpperCase() + s.slice(1) : ''))
    .join('');
}

function sectionExists(id) {
  if (!fs.existsSync(sectionsDir)) return false;
  const files = fs.readdirSync(sectionsDir).filter(f => f.endsWith('.tsx'));
  return files.some(f => fs.readFileSync(path.join(sectionsDir, f), 'utf8').includes(id));
}

const indexFile = path.join(sectionsDir, 'index.ts');
let indexContent = fs.existsSync(indexFile) ? fs.readFileSync(indexFile, 'utf8') : '';

let created = 0;

for (const id of expected) {
  const comp = toComponentName(id);
  const filePath = path.join(sectionsDir, `${comp}.tsx`);

  if (fs.existsSync(filePath) || sectionExists(id)) continue;

  const stub = `import React from 'react';

type Props = {
  value?: any;
  onChange?: (patch: any) => void;
  onContinue?: () => void;
};

export function ${comp}({ value, onChange, onContinue }: Props) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">${id} (placeholder)</h2>
      <p className="mb-4">Replace this placeholder with the real UI for <code>${id}</code>.</p>
      <button className="px-4 py-2 rounded bg-gray-200" onClick={onContinue}>Continue</button>
    </div>
  );
}
`;

  fs.writeFileSync(filePath, stub, 'utf8');
  created++;

  const exportLine = `export { ${comp} } from './${comp}';\n`;
  if (!indexContent.includes(exportLine)) indexContent += exportLine;
}

if (created) fs.writeFileSync(indexFile, indexContent, 'utf8');

console.log(`Frontend dir: ${FRONTEND_DIR}`);
console.log(`Created ${created} placeholder component(s) in ${path.relative(process.cwd(), sectionsDir)}`);
