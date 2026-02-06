// server/normalizeSurveyPayload.js

/**
 * Normalize incoming survey payloads.
 *
 * Input (legacy):
 * {
 *   survey: {
 *     section2: { cine_level: "cinephile", attraction_style: ["visual"] },
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
 *     { questionKey: "casting.cine_level",  answerText: "cinephile" },
 *     { questionKey: "casting.attraction_style", optionValues: ["visual"] },
 *     ...
 *   ]
 * }
 */

function mapSectionIdToKey(sectionId) {
  // Your canonical 9-section keys (from DB)
  const map = {
    // Both hyphenated and non-hyphenated formats
    "astro-data": "cosmic",
    "section-i": "cosmic",
    section1: "cosmic",

    "section-ii": "casting",
    section2: "casting",

    "section-iii": "taste",
    section3: "taste",

    "section-iv": "core_memory",
    section4: "core_memory",

    "section-v": "world",
    section5: "world",

    "section-vi": "screen_ed",
    section6: "screen_ed",

    "section-vii": "genres",
    "section-swipe": "genres",
    section7: "genres",

    "section-viii": "global",
    section8: "global",

    "section-ix": "fit",
    section9: "fit",
  };
  return map[sectionId] || sectionId; // fallback if already a key
}

function normalizeSurveyPayload(body) {
  if (Array.isArray(body?.answers)) {
    return { userEmail: body.userEmail || null, chartId: body.chartId || null, answers: body.answers };
  }

  const survey = body?.survey || {};
  const answers = [];

  for (const [sectionId, fields] of Object.entries(survey)) {
    const sectionKey = mapSectionIdToKey(sectionId);
    if (!fields || typeof fields !== "object") continue;

    for (const [localKey, value] of Object.entries(fields)) {
      // Direct mapping: sectionKey.localKey
      // No more KEY_MAP or renaming. We trust the frontend keys now match DB keys (via CSV update).
      const questionKey = `${sectionKey}.${localKey}`;

      if (Array.isArray(value)) {
        // Store array as JSON string in answerText
        answers.push({ questionKey, answerText: JSON.stringify(value) });
      } else if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        answers.push({ questionKey, answerText: String(value) });
      } else if (typeof value === "object" && value !== null) {
        // Handle {selected, otherText} structure for "Other" options
        if (value.selected !== undefined) {
          // Radio with "Other": {selected: 'other', otherText: '...'}
          if (typeof value.selected === "string") {
            if (value.selected === "other" && value.otherText) {
              // Store both selection and custom text as JSON
              answers.push({
                questionKey,
                answerText: JSON.stringify({ selected: value.selected, otherText: value.otherText })
              });
            } else {
              // Regular radio selection - store as simple string
              answers.push({ questionKey, answerText: value.selected });
            }
          }
          // Checkbox with "Other": {selected: [...], otherText: '...'}
          else if (Array.isArray(value.selected)) {
            // Store the full object if otherText present, otherwise just the array
            const data = value.otherText
              ? { selected: value.selected, otherText: value.otherText }
              : value.selected;
            answers.push({ questionKey, answerText: JSON.stringify(data) });
          }
        } else {
          // Fallback: stringify unknown objects
          answers.push({ questionKey, answerText: JSON.stringify(value) });
        }
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
