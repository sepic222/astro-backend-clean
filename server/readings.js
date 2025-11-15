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
let ASCENDANT_TXT  = null;
let SUN_SIGN_TXT   = null;
let SUN_HOUSE_TXT  = null;
let MOON_SIGN_TXT  = null;
let MOON_HOUSE_TXT = null;
// Optional: per (planet, house) copy if you add it later
let CHART_RULER_TXT = null; // e.g. content/readings/chart_ruler.json (keys like "Mars-7")

function ensureLoaded() {
  if (!SECTION_INTROS) SECTION_INTROS = loadJsonSafe('content/readings/section_intros.json');
  if (!ASCENDANT_TXT)  ASCENDANT_TXT  = loadJsonSafe('content/readings/ascendant.json');
  if (!SUN_SIGN_TXT)   SUN_SIGN_TXT   = loadJsonSafe('content/readings/sun_sign.json');
  if (!SUN_HOUSE_TXT)  SUN_HOUSE_TXT  = loadJsonSafe('content/readings/sun_house.json');
  if (!MOON_SIGN_TXT)  MOON_SIGN_TXT  = loadJsonSafe('content/readings/moon_sign.json'); // optional
  if (!CHART_RULER_TXT) CHART_RULER_TXT = loadJsonSafe('content/readings/chart_ruler.json'); // optional
  if (!MOON_HOUSE_TXT) MOON_HOUSE_TXT = loadJsonSafe('content/readings/moon_house.json');
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
 * Expects chartPayload in the shape returned by /api/chart/summary (angles, planets, etc.).
 */
function buildReading({ chartPayload, answersByKey = {} }) {
  ensureLoaded();
  const parts = [];

  const angles   = chartPayload?.angles || {};
  const planets  = chartPayload?.planets || {};
  const meta     = chartPayload || {};

  const asc         = angles.ascendantSign || null;
  const sunSign     = planets.sun?.sign || null;
  const sunHouse    = planets.sun?.house || null;
  const moonSign    = planets.moon?.sign || null;
  const moonHouse = planets.moon?.house || null;

  
let moonHouseText = pick(MOON_HOUSE_TXT, String(moonHouse));
if (!moonHouseText && moonHouse) moonHouseText = `Moon in House ${moonHouse}.`;
if (moonHouse || moonHouseText) pushSection(parts, 'moon_house', moonHouseText);
  // If provided by backend summary (recommended)
  const chartRulerPlanet = meta.chartRulerPlanet || null; // e.g. "Mars"
  const chartRulerHouse  = meta.chartRulerHouse  || null; // e.g. 7

  // 1) Ascendant
  let ascText = pick(ASCENDANT_TXT, asc);
  if (!ascText && asc) ascText = `Ascendant in ${asc}.`;
  if (asc || ascText) pushSection(parts, 'ascendant', ascText);

  // 2) Sun sign
  let sunSignText = pick(SUN_SIGN_TXT, sunSign);
  if (!sunSignText && sunSign) sunSignText = `Sun in ${sunSign}.`;
  if (sunSign || sunSignText) pushSection(parts, 'sun_sign', sunSignText);

  // 3) Sun house
  let sunHouseText = pick(SUN_HOUSE_TXT, String(sunHouse));
  if (!sunHouseText && sunHouse) sunHouseText = `Sun in House ${sunHouse}.`;
  if (sunHouse || sunHouseText) pushSection(parts, 'sun_house', sunHouseText);

  // 4) Moon sign
  let moonSignText = pick(MOON_SIGN_TXT, moonSign);
  if (!moonSignText && moonSign) moonSignText = `Moon in ${moonSign}.`;
  if (moonSign || moonSignText) pushSection(parts, 'moon_sign', moonSignText);

  // 5) Chart ruler in house
  let chartRulerText = null;
  if (chartRulerPlanet && chartRulerHouse) {
    // Prefer a curated block if you add content/readings/chart_ruler.json with keys like "Mars-7"
    const key = `${chartRulerPlanet}-${chartRulerHouse}`;
    chartRulerText = pick(CHART_RULER_TXT, key);
    if (!chartRulerText) {
      chartRulerText = `Your chart ruler is ${chartRulerPlanet} in House ${chartRulerHouse}.`;
    }
    pushSection(parts, 'chart_ruler', chartRulerText);
  }

  // Optional flavor from survey
  const loved = answersByKey['genres.loved'];
  if (Array.isArray(loved) && loved.length) {
    parts.push(`You gravitate to: ${loved.slice(0, 3).join(', ')}.`);
  }

  // Closing summary (fixed copy)
  if (SECTION_INTROS && SECTION_INTROS.summary) {
    parts.push(SECTION_INTROS.summary);
  }

  return { text: parts.join('\n\n') };
}

module.exports = { buildReading, buildReadingFromContent: buildReading };