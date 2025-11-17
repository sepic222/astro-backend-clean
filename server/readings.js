// server/readings.js
const fs = require('fs');
const path = require('path');

function loadJsonSafe(relPath) {
  try {
    const p = path.join(process.cwd(), relPath);
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  } catch (e) {
    console.warn('readings: failed to load', relPath, e.message);
  }
  return null;
}

// Lazy caches
let SECTION_INTROS = null;
let ASCENDANT_TXT = null;
let SUN_SIGN_TXT = null;
let SUN_HOUSE_TXT = null;

function ensureLoaded() {
  if (!SECTION_INTROS) SECTION_INTROS = loadJsonSafe('content/readings/section_intros.json');
  if (!ASCENDANT_TXT)  ASCENDANT_TXT  = loadJsonSafe('content/readings/ascendant.json');
  if (!SUN_SIGN_TXT)   SUN_SIGN_TXT   = loadJsonSafe('content/readings/sun_sign.json');
  if (!SUN_HOUSE_TXT)  SUN_HOUSE_TXT  = loadJsonSafe('content/readings/sun_house.json');
}

function pick(map, key) {
  if (!map) return null;
  return map[key] || null;
}

function pushSection(parts, introKey, bodyText) {
  const intro = SECTION_INTROS && SECTION_INTROS[introKey];
  if (intro) parts.push(intro);
  if (bodyText) parts.push(bodyText);
}

/**
 * buildReading({ chartPayload, answersByKey })
 * Returns a plain object { text } assembled from fixed intros + small blocks.
 */
function buildReading({ chartPayload, answersByKey = {} }) {
  ensureLoaded();
  const parts = [];

  const angles  = chartPayload?.angles || {};
  const planets = chartPayload?.planets || {};

  const asc      = angles.ascendantSign || null;
  const sunSign  = planets.sun?.sign || null;
  const sunHouse = planets.sun?.house || null;

  // Personalized blocks (fallbacks if content JSON is missing)
  let ascText = pick(ASCENDANT_TXT, asc);
  if (!ascText && asc) ascText = `Ascendant in ${asc}.`;

  let sunSignText = pick(SUN_SIGN_TXT, sunSign);
  if (!sunSignText && sunSign) sunSignText = `Sun in ${sunSign}.`;

  let sunHouseText = pick(SUN_HOUSE_TXT, String(sunHouse));
  if (!sunHouseText && sunHouse) sunHouseText = `Sun in House ${sunHouse}.`;

  // 1) Ascendant section
  if (asc || ascText) {
    pushSection(parts, 'ascendant', ascText);
  }

  // 2) Sun sign section
  if (sunSign || sunSignText) {
    pushSection(parts, 'sun_sign', sunSignText);
  }

  // 3) Sun house section
  if (sunHouse || sunHouseText) {
    pushSection(parts, 'sun_house', sunHouseText);
  }

  // Optional flavor: use a survey answer if available (kept from earlier)
  const loved = answersByKey['genres.loved'];
  if (Array.isArray(loved) && loved.length) {
    parts.push(`You gravitate to: ${loved.slice(0, 3).join(', ')}.`);
  }

  // 4) Closing summary intro (fixed copy at the end)
  if (SECTION_INTROS && SECTION_INTROS.summary) {
    parts.push(SECTION_INTROS.summary);
  }

  return { text: parts.join('\n\n') };
}

module.exports = { buildReading };