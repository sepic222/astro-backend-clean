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

// Lazy cache
let ASCENDANT_TXT = null;
let SUN_SIGN_TXT = null;
let SUN_HOUSE_TXT = null;

function ensureLoaded() {
  if (!ASCENDANT_TXT) ASCENDANT_TXT = loadJsonSafe('content/readings/ascendant.json');
  if (!SUN_SIGN_TXT)  SUN_SIGN_TXT  = loadJsonSafe('content/readings/sun_sign.json');
  if (!SUN_HOUSE_TXT) SUN_HOUSE_TXT = loadJsonSafe('content/readings/sun_house.json');
}

function pick(map, key) {
  if (!map) return null;
  return map[key] || null;
}

/**
 * buildReading({ chartPayload, answersByKey })
 * Returns a plain object { text } assembled from small blocks.
 */
function buildReading({ chartPayload, answersByKey = {} }) {
  ensureLoaded();
  const parts = [];

  const angles = chartPayload?.angles || {};
  const planets = chartPayload?.planets || {};

  const asc = angles.ascendantSign || null;
  const sunSign = planets.sun?.sign || null;
  const sunHouse = planets.sun?.house || null;

  // Ascendant block
  let ascText = pick(ASCENDANT_TXT, asc);
  if (!ascText && asc) ascText = `Ascendant in ${asc}.`;

  // Sun sign block
  let sunSignText = pick(SUN_SIGN_TXT, sunSign);
  if (!sunSignText && sunSign) sunSignText = `Sun in ${sunSign}.`;

  // Sun house block
  let sunHouseText = pick(SUN_HOUSE_TXT, String(sunHouse));
  if (!sunHouseText && sunHouse) sunHouseText = `Sun in House ${sunHouse}.`;

  [ascText, sunSignText, sunHouseText].forEach(t => { if (t) parts.push(t); });

  // Example: use an answer if present (e.g., genres.loved)
  const loved = answersByKey['genres.loved'];
  if (Array.isArray(loved) && loved.length) {
    parts.push(`You gravitate to: ${loved.slice(0, 3).join(', ')}.`);
  }

  return { text: parts.join(' ') };
}

module.exports = { buildReading };