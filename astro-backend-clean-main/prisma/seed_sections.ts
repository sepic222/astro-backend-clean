// prisma/seed_sections.ts
// Seeds SurveySection, SurveyQuestion, SurveyOption from questions.csv
// CSV headers expected (semicolon-separated):
// section_number;section_id;section_title;question_order;id;prompt;type;required;multiple;has_other;options_keywords

import "dotenv/config";
import { PrismaClient, SurveyQuestionType } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Row = {
  section_number?: string;
  section_id?: string;
  section_title?: string;
  question_order?: string;
  id?: string;                 // question key
  prompt?: string;             // question text
  type?: string;               // source type
  required?: string;
  multiple?: string;           // "true"/"false"
  has_other?: string;
  options_keywords?: string;   // delimited list of option tokens
};

// --- helpers ---
function toSnakeCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "");
}

function toTitleCase(s: string): string {
  return s
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// normalize your CSV types to Prisma enum
function normalizeType(srcType: string | undefined, multiple: string | undefined): SurveyQuestionType {
  const isMulti = (multiple || "").toString().toLowerCase() === "true";
  const t = (srcType || "").toLowerCase().trim();

  // if marked multiple → force checkbox
  if (isMulti) return "checkbox";

  // map common aliases
  if (t === "text" || t === "input" || t === "free_text") return "text";
  if (t === "radio" || t === "single" || t === "select_one") return "radio";
  if (t === "checkbox" || t === "multi" || t === "select_many") return "checkbox";
  if (t === "slider" || t === "scale" || t === "range") return "slider";

  // default conservative
  return "text";
}

// parse semicolon-separated CSV with quotes support
function parseSemicolonCSV(text: string): Row[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
  if (lines.length === 0) return [];
  const header = splitLine(lines[0], ";").map((h) => h.trim());
  const rows: Row[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitLine(lines[i], ";");
    const obj: any = {};
    header.forEach((h, idx) => (obj[h] = (cols[idx] ?? "").trim()));
    rows.push(obj as Row);
  }
  return rows;
}

function splitLine(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'; i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delim && !inQuotes) {
      out.push(cur); cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

async function main() {
  const csvPath = path.join(__dirname, "questions.csv");
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV not found at ${csvPath}`);
  }
  const csv = fs.readFileSync(csvPath, "utf8");
  const rows = parseSemicolonCSV(csv);
  if (rows.length === 0) {
    console.log("No rows found in questions.csv");
    return;
  }

  console.log(`📄 Loaded ${rows.length} rows from questions.csv`);

  // 1) Upsert sections
  const sectionMeta = new Map<string, { title: string; sortOrder: number }>();
  for (const r of rows) {
    const key = (r.section_id || "").trim();
    if (!key) continue;
    if (!sectionMeta.has(key)) {
      const title = (r.section_title || key).trim();
      const sortOrder = Number(r.section_number) || 0;
      sectionMeta.set(key, { title, sortOrder });
    }
  }

  console.log(`🧩 Upserting ${sectionMeta.size} sections...`);
  const sectionIdByKey = new Map<string, string>();
  for (const [key, meta] of sectionMeta.entries()) {
    const sec = await prisma.surveySection.upsert({
      where: { key },
      update: { title: meta.title, sortOrder: meta.sortOrder },
      create: { key, title: meta.title, sortOrder: meta.sortOrder },
    });
    sectionIdByKey.set(key, sec.id);
  }

  // 2) Upsert questions + options
  let qCount = 0;
  let optCount = 0;

  for (const r of rows) {
    const sectionKey = (r.section_id || "").trim();
    const sectionId = sectionIdByKey.get(sectionKey);
    if (!sectionId) continue;

    const qKey = (r.id || "").trim();
    const qText = (r.prompt || "").trim();
    const qType = normalizeType(r.type, r.multiple);
    const qSort = Number(r.question_order) || 0;

    const q = await prisma.surveyQuestion.upsert({
      where: { key: qKey },
      update: {
        text: qText,
        type: qType,
        sortOrder: qSort,
        sectionId,
      },
      create: {
        key: qKey,
        text: qText,
        type: qType,
        sortOrder: qSort,
        sectionId,
      },
    });
    qCount++;

    // options: only for radio/checkbox
    if (qType === "radio" || qType === "checkbox") {
      // Split option tokens
      const raw = (r.options_keywords || "").trim();
      const tokens = raw
        ? raw.split(/[|,]/).map((s) => s.trim()).filter(Boolean)
        : [];

      // Fetch existing options to avoid FK constraint errors on delete
      const existingOptions = await prisma.surveyOption.findMany({
        where: { questionId: q.id },
      });

      for (let i = 0; i < tokens.length; i++) {
        const val = toSnakeCase(tokens[i]);
        const label = toTitleCase(tokens[i]); // Or keep original casing? Using existing helper for now.

        const match = existingOptions.find((o) => o.value === val);
        if (match) {
          // Update existing
          await prisma.surveyOption.update({
            where: { id: match.id },
            data: { label, sortOrder: i + 1 },
          });
        } else {
          // Create new
          await prisma.surveyOption.create({
            data: {
              questionId: q.id,
              value: val,
              label,
              sortOrder: i + 1,
            },
          });
        }
      }
      // Note: We do NOT delete obsolete options here to preserve old data integrity.
    }
  }

  console.log(`✅ Seed complete. Sections: ${sectionMeta.size}, Questions: ${qCount}, Options: ${optCount}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
