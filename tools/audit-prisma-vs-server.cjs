// tools/audit-prisma-vs-server.cjs
// Compares Prisma Chart fields vs the fields used in server.js prisma.chart.create({ data: { … } })

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SCHEMA = path.join(ROOT, 'prisma', 'schema.prisma');
const SERVER = path.join(ROOT, 'server.js');

function read(file) {
  try { return fs.readFileSync(file, 'utf8'); }
  catch (e) {
    console.error(`❌ Cannot read ${file}:`, e.message);
    process.exit(1);
  }
}

function parseChartFieldsFromSchema(schemaText) {
  // Grab the "model Chart { ... }" block
  const modelStart = schemaText.indexOf('model Chart');
  if (modelStart === -1) return new Set();

  let i = schemaText.indexOf('{', modelStart);
  if (i === -1) return new Set();

  let depth = 0;
  let buf = '';
  for (; i < schemaText.length; i++) {
    const ch = schemaText[i];
    if (ch === '{') depth++;
    if (ch === '}') { depth--; if (depth === 0) { buf += ch; break; } }
    buf += ch;
  }

  // Extract field names on lines like: "fieldName Type @attr?"
  const fields = new Set();
  buf.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('@@')) return;
    // field name at start of line until whitespace or ':' (for Mongo), ignore relation lists etc.
    const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s+[^@]+/);
    if (!m) return;
    const name = m[1];
    // skip keywords Prisma uses that appear like fields
    if (['model', 'enum'].includes(name)) return;
    fields.add(name);
  });
  return fields;
}

function parseDataKeysFromServer(serverText) {
  // Find first "prisma.chart.create({"
  const createIdx = serverText.indexOf('prisma.chart.create({');
  if (createIdx === -1) return new Set();

  // From there, find "data:"
  const dataIdx = serverText.indexOf('data:', createIdx);
  if (dataIdx === -1) return new Set();

  // Extract object literal that starts at "data:"
  // naive brace matcher starting from the first "{" after "data:"
  const braceStart = serverText.indexOf('{', dataIdx);
  if (braceStart === -1) return new Set();

  let depth = 0;
  let i = braceStart;
  let buf = '';
  for (; i < serverText.length; i++) {
    const ch = serverText[i];
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    buf += ch;
    if (depth === 0) break;
  }

  // Now buf holds "{ ... }" for the data object.
  // Pull property names: lines like "fieldName:" (ignore computed keys, comments)
  const keys = new Set();
  buf
    .replace(/\/\/.*$/gm, '')     // strip // comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // strip /* */ comments
    .split(/\r?\n/)
    .forEach(line => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:/);
      if (m) keys.add(m[1]);
    });

  return keys;
}

(function main() {
  const schemaText = read(SCHEMA);
  const serverText = read(SERVER);

  const schemaFields = parseChartFieldsFromSchema(schemaText);
  const serverDataKeys = parseDataKeysFromServer(serverText);

  // Remove known non-column keys if they ever sneak in
  const blacklist = new Set(['select', 'include']);
  for (const b of blacklist) serverDataKeys.delete(b);

  const onlyInServer = [...serverDataKeys].filter(k => !schemaFields.has(k)).sort();
  const onlyInSchema = [...schemaFields].filter(k => !serverDataKeys.has(k)).sort();
  const inBoth = [...serverDataKeys].filter(k => schemaFields.has(k)).sort();

  console.log('\n📦 Prisma model: Chart (from prisma/schema.prisma)');
  console.log('Total fields:', schemaFields.size);

  console.log('\n🧾 Fields used in server.js → prisma.chart.create({ data: … })');
  console.log('Total fields:', serverDataKeys.size);

  console.log('\n✅ In both (server uses these & schema has them):');
  console.log(inBoth.join(', ') || '(none)');

  console.log('\n⚠️ Present in server.js but NOT in schema (remove or rename in code):');
  console.log(onlyInServer.join(', ') || '(none)');

  console.log('\nℹ️ Present in schema but NOT used in server.js (optional to add if needed):');
  console.log(onlyInSchema.join(', ') || '(none)');

  // Exit code hint for CI
  if (onlyInServer.length > 0) {
    console.log('\n❌ Mismatch detected: server is writing unknown fields.');
    process.exit(2);
  } else {
    console.log('\n✅ No unknown fields in server.js data block.');
  }
})();

