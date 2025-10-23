// server/normalizeSurveyPayload.js

/**
 * Normalize incoming survey payloads.
 *
 * Input (legacy):
 * {
 *   survey: {
 *     section2: { love_o_meter: "cinephile", attraction_style: ["visual"] },
 *     section1: { name: "...", birth_time: "...", ... },
 *     ...
 *   },
 *   userEmail?: string,
 *   chartId?: string
 * }
 *
 * Output (normalized):
 * {
 *   userEmail: string|null,
 *   chartId: string|null,
 *   answers: [
 *     { questionKey: "casting.love_o_meter",  answerText: "cinephile" },
 *     { questionKey: "casting.attraction_style", optionValues: ["visual"] },
 *     ...
 *   ]
 * }
 */

function mapSectionIdToKey(sectionId) {
  // Your canonical 9-section keys (from DB)
  const map = {
    section1: "cosmic",
    section2: "casting",
    section3: "taste",
    section4: "core_memory",
    section5: "world",
    section6: "screen_ed",
    section7: "genres",
    section8: "global",
    section9: "fit",
  };
  return map[sectionId] || sectionId; // fallback if already a key
}
// Map frontend/local keys → DB global keys per section
const KEY_MAP = {
  casting: {
    life_role: "movie_role",            // casting.life_role -> casting.movie_role
    first_obsession_text: "first_obsession", // casting.first_obsession_text -> casting.first_obsession
  },
  // add more per section if needed
};

function normalizeSurveyPayload(body) {
  if (Array.isArray(body?.answers)) {
    return { userEmail: body.userEmail || null, chartId: body.chartId || null, answers: body.answers };
  }

  const survey = body?.survey || {};
  const answers = [];

  for (const [sectionId, fields] of Object.entries(survey)) {
    const sectionKey = mapSectionIdToKey(sectionId);
    if (!fields || typeof fields !== "object") continue;

    const mapForSection = KEY_MAP[sectionKey] || {};
    for (const [localKey, value] of Object.entries(fields)) {
      const resolvedLocal = mapForSection[localKey] || localKey;
      const questionKey = `${sectionKey}.${resolvedLocal}`;

      if (Array.isArray(value)) {
        answers.push({ questionKey, optionValues: value });
      } else if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        answers.push({ questionKey, answerText: String(value) });
      } else if (value != null) {
        answers.push({ questionKey, answerText: JSON.stringify(value) });
      }
    }
  }

  return {
    userEmail: body?.userEmail || null,
    chartId: body?.chartId || null,
    answers,
  };
}

module.exports = { normalizeSurveyPayload };
function normalizeSurveyPayload(body) {
  // already normalized?
  if (Array.isArray(body?.answers)) {
    return {
      userEmail: body.userEmail || null,
      chartId: body.chartId || null,
      answers: body.answers,
    };
  }

  const survey = body?.survey || {};
  const answers = [];

  for (const [sectionId, fields] of Object.entries(survey)) {
    const sectionKey = mapSectionIdToKey(sectionId);
    if (!fields || typeof fields !== "object") continue;

    for (const [localKey, value] of Object.entries(fields)) {
      const questionKey = `${sectionKey}.${localKey}`;

      if (Array.isArray(value)) {
        answers.push({ questionKey, optionValues: value });
      } else if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        answers.push({ questionKey, answerText: String(value) });
      } else if (value != null) {
        answers.push({ questionKey, answerText: JSON.stringify(value) });
      }
    }
  }

  return {
    userEmail: body?.userEmail || null,
    chartId: body?.chartId || null,
    answers,
  };
}

module.exports = { normalizeSurveyPayload };
