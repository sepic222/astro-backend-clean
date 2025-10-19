// server/normalizeSurveyPayload.js

/**
 * Accepts current legacy payload:
 * { survey: { section1: {...}, section2: {...}, ... }, email?: string }
 * and returns:
 * { userEmail: string|null, answers: Array<{ key: string, value: any }> }
 *
 * It flattens each section object into "section.field" keys.
 */
function normalizeSurveyPayload(body) {
    const legacy = body?.survey && typeof body.survey === 'object';
    const userEmail = body?.email ?? body?.userEmail ?? null;
  
    // If it's already normalized, just return it
    if (!legacy && Array.isArray(body?.answers)) {
      return { userEmail, answers: body.answers };
    }
  
    const answers = [];
    if (legacy) {
      const sections = body.survey || {};
      for (const [sectionKey, sectionVal] of Object.entries(sections)) {
        if (sectionVal && typeof sectionVal === 'object') {
          for (const [fieldKey, fieldVal] of Object.entries(sectionVal)) {
            answers.push({
              key: `${sectionKey}.${fieldKey}`,
              value: fieldVal,
            });
          }
        } else {
          // e.g., a primitive section value
          answers.push({ key: sectionKey, value: sectionVal });
        }
      }
    }
  
    return { userEmail, answers };
  }
  
  module.exports = { normalizeSurveyPayload };
  