// server.js
console.log("✅ Running server.js from:", __dirname);
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { DateTime } = require('luxon');
const swisseph = require('swisseph');
const { normalizeSurveyPayload } = require('./server/normalizeSurveyPayload');
const fs = require('fs');
const path = require('path');

// ---- content cache (reads your JSON once on boot) ----
// ---- content cache (reads your JSON once on boot) ----
function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const CONTENT_DIR = path.join(__dirname, 'content', 'readings');

// Core sections
const SECTION_INTROS  = loadJson(path.join(CONTENT_DIR, 'section_intros.json'));
const ASCENDANT_TEXT  = loadJson(path.join(CONTENT_DIR, 'ascendant.json'));
const SUN_SIGN_TEXT   = loadJson(path.join(CONTENT_DIR, 'sun_sign.json'));
const SUN_HOUSE_TEXT  = loadJson(path.join(CONTENT_DIR, 'sun_house.json'));
const MOON_SIGN_TEXT  = loadJson(path.join(CONTENT_DIR, 'moon_sign.json'));
const MOON_HOUSE_TEXT = loadJson(path.join(CONTENT_DIR, 'moon_house.json'));
const CHART_RULER_TEXT = loadJson(path.join(CONTENT_DIR, 'chart_ruler.json'));

const MERCURY_SIGN_TEXT = loadJson(path.join(CONTENT_DIR, 'mercury_sign.json'));
const MERCURY_HOUSE_TEXT = loadJson(path.join(CONTENT_DIR, 'mercury_house.json'));
const VENUS_SIGN_TEXT = loadJson(path.join(CONTENT_DIR, 'venus_sign.json'));
const VENUS_HOUSE_TEXT = loadJson(path.join(CONTENT_DIR, 'venus_house.json'));
const MARS_SIGN_TEXT = loadJson(path.join(CONTENT_DIR, 'mars_sign.json'));
const MARS_HOUSE_TEXT = loadJson(path.join(CONTENT_DIR, 'mars_house.json'));
const JUPITER_SIGN_TEXT = loadJson(path.join(CONTENT_DIR, 'jupiter_sign.json'));
const JUPITER_HOUSE_TEXT = loadJson(path.join(CONTENT_DIR, 'jupiter_house.json'));
const SATURN_SIGN_TEXT = loadJson(path.join(CONTENT_DIR, 'saturn_sign.json'));
const SATURN_HOUSE_TEXT = loadJson(path.join(CONTENT_DIR, 'saturn_house.json'));
const URANUS_SIGN_TEXT = loadJson(path.join(CONTENT_DIR, 'uranus_sign.json'));
const URANUS_HOUSE_TEXT = loadJson(path.join(CONTENT_DIR, 'uranus_house.json'));
const NEPTUNE_SIGN_TEXT = loadJson(path.join(CONTENT_DIR, 'neptune_sign.json'));
const NEPTUNE_HOUSE_TEXT = loadJson(path.join(CONTENT_DIR, 'neptune_house.json'));
const PLUTO_SIGN_TEXT = loadJson(path.join(CONTENT_DIR, 'pluto_sign.json'));
const PLUTO_HOUSE_TEXT = loadJson(path.join(CONTENT_DIR, 'pluto_house.json'));

// --- Express app (init early so routes can attach) ---
const app = express();
app.use(cors());
app.use(express.json());

// TEMP sanity route (proves route attachment works)
app.get('/ping', (_req, res) => res.json({ ok: true, t: Date.now() }));
// Single source of truth for PORT
const PORT = process.env.PORT || 3001;
// minimal, robust route lister
function listAllRoutes(app) {
  const out = [];
  const stack = app && app._router && Array.isArray(app._router.stack) ? app._router.stack : [];
  for (const layer of stack) {
    if (layer.route && layer.route.path) {
      out.push({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods || {}).map(m => m.toUpperCase())
      });
    } else if (layer.name === 'router' && layer.handle && Array.isArray(layer.handle.stack)) {
      for (const sl of layer.handle.stack) {
        if (sl.route && sl.route.path) {
          out.push({
            path: sl.route.path,
            methods: Object.keys(sl.route.methods || {}).map(m => m.toUpperCase())
          });
        }
      }
    }
  }
  return out;
}

// --- OpenAI (optional) ---
let openai = null;
if (process.env.OPENAI_API_KEY) {
  const OpenAI = require('openai');
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else {
  console.warn('⚠️ OpenAI API key missing — AI routes disabled.');
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// ---- helpers -------------------------------------------------
function normalize360(val) {
  let x = Number(val);
  if (!Number.isFinite(x)) return NaN;
  x = x % 360;
  if (x < 0) x += 360;
  return x;
}

const ZODIAC_SIGNS = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
];

function signFromLongitude(lon) {
  lon = normalize360(lon);
  const idx = Math.floor(lon / 30) % 12;
  return ZODIAC_SIGNS[idx];
}

const SIGN_RULER = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter"
};

function houseOfLongitude(lon, houseCusps) {
  const L = normalize360(lon);
  for (let i = 0; i < 12; i++) {
    const a = normalize360(houseCusps[i]);
    const b = normalize360(houseCusps[(i + 1) % 12]);
    if (a <= b) { if (L >= a && L < b) return i + 1; }
    else { if (L >= a || L < b) return i + 1; }
  }
  return 12;
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null; // convert NaN/undefined/null -> null
}

// Normalize chartRulerPlanet for enum variants
function normalizePlanetName(p) {
  if (!p) return null;
  // If your enum is TitleCase (Sun/Moon/...) this is already fine.
  // If your enum is UPPERCASE, uncomment the next line:
  // return p.toUpperCase();
  return p;
}

// --- best-effort DB save helper (non-fatal on error) ----------
async function saveChartToDB(input, output) {
  try {
    const num = (v) => (Number.isFinite(v) ? v : null);

    const data = {
      userEmail: input?.userEmail ?? null,
      city: input?.city ?? null,
      country: input?.country ?? null,
      birthDateTimeUtc: input?.birthDateTimeUtc ? new Date(input.birthDateTimeUtc) : null,
      tzOffsetMinutes: input?.tzOffsetMinutes ?? null,
      latitude: num(input?.latitude),
      longitude: num(input?.longitude),

      ascendant: num(output?.angles?.ascendantDeg ?? output?.ascendant),
      mc: num(output?.angles?.mcDeg ?? output?.mc),
      descendant: num(output?.angles?.descendantDeg ?? ((output?.ascendant ?? 0) + 180) % 360),
      ic: num(output?.angles?.icDeg ?? ((output?.mc ?? 0) + 180) % 360),

      risingSign: output?.angles?.ascendantSign ?? null,
      mcSign: output?.angles?.mcSign ?? null,
      descendantSign: output?.angles?.descendantSign ?? null,
      icSign: output?.angles?.icSign ?? null,

      sunSign: output?.planets?.sun?.sign ?? null,
      sunHouse: output?.planets?.sun?.house ?? null,
      moonSign: output?.planets?.moon?.sign ?? null,
      moonHouse: output?.planets?.moon?.house ?? null,
      mercurySign: output?.planets?.mercury?.sign ?? null,
      mercuryHouse: output?.planets?.mercury?.house ?? null,
      venusSign: output?.planets?.venus?.sign ?? null,
      venusHouse: output?.planets?.venus?.house ?? null,
      marsSign: output?.planets?.mars?.sign ?? null,
      marsHouse: output?.planets?.mars?.house ?? null,
      jupiterSign: output?.planets?.jupiter?.sign ?? null,
      jupiterHouse: output?.planets?.jupiter?.house ?? null,
      saturnSign: output?.planets?.saturn?.sign ?? null,
      saturnHouse: output?.planets?.saturn?.house ?? null,
      uranusSign: output?.planets?.uranus?.sign ?? null,
      uranusHouse: output?.planets?.uranus?.house ?? null,
      neptuneSign: output?.planets?.neptune?.sign ?? null,
      neptuneHouse: output?.planets?.neptune?.house ?? null,
      plutoSign: output?.planets?.pluto?.sign ?? null,
      plutoHouse: output?.planets?.pluto?.house ?? null,
      chartRulerPlanet: normalizePlanetName(output?.chartRulerPlanet) ?? null,      
      chartRulerHouse: output?.chartRulerHouse ?? null,
      northNodeHouse: output?.nodesAndChiron?.northNode?.house ?? null,
      chironHouse: output?.nodesAndChiron?.chiron?.house ?? null,
      rawChart: output ?? null,
    };

    const rec = await prisma.chart.create({ data, select: { id: true } });
    return rec.id;
  } catch (e) {
    console.error("🟥 DB save failed (non-fatal):", e);
    return null;
  }
}

// --------------------------------------------------------------

// dev-helpers (preview & retry tools)
app.get('/dev/email/preview/:outboxId', async (req, res) => {
  const r = await prisma.emailOutbox.findUnique({ where: { id: req.params.outboxId } });
  if (!r) return res.status(404).send('Not found');
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(r.htmlBody);
});

// root & health
app.get('/', (_req, res) => res.send('OK'));

app.get('/health', (req, res) => {
  const routes = listAllRoutes(app);
  res.json({
    ok: true,
    status: 'healthy',
    build: process.env.RAILWAY_GIT_COMMIT_SHA
        || process.env.VERCEL_GIT_COMMIT_SHA
        || 'unknown',
    cwd: process.cwd(),
    __dirname,
    routesCount: routes.length
  });
});
app.get('/_whoami', (_req, res) => {
  res.json({ cwd: process.cwd(), __dirname, routesCount: (app._router?.stack?.length) || 0 });
});

// tiny OpenAI smoke test
if (typeof openai !== 'undefined' && openai) {
  app.get('/api/ai/test', async (req, res) => {
    try {
      const r = await openai.responses.create({
        model: 'gpt-4o-mini',
        input: 'Write a one-line haiku about movies and stars.',
      });
      const text = r.output_text ?? r.content?.[0]?.text ?? '';
      res.json({ ok: true, text: String(text).trim() });
    } catch (e) {
      console.error('OpenAI error:', e);
      res.status(500).json({ ok: false, error: e?.message ?? 'Unknown error' });
    }
  });
}
// ---- Swiss Ephemeris setup ----
swisseph.swe_set_ephe_path(__dirname + '/ephe');

function getJulianDayFromDate(date) {
  return swisseph.swe_julday(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600,
    swisseph.SE_GREG_CAL
  );
}

// ------------- MAIN CHART ENDPOINT -------------
app.post('/api/birth-chart-swisseph', async (req, res) => {
  try {
    const { date, time, latitude, longitude } = req.body || {};
    if (!date || !time || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required fields (date, time, latitude, longitude).' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ success: false, error: 'Invalid coordinates.' });
    }

    // Convert input date/time (Berlin zone) → UTC
const birthDT = DateTime.fromISO(`${date}T${time}`, { zone: 'Europe/Berlin' });
if (!birthDT.isValid) {
  return res.status(400).json({ success: false, error: 'Invalid date or time.' });
}
const birthUTC = birthDT.toUTC().toJSDate();
const tzOffsetMinutes = birthDT.offset; // e.g. +120 or +60 depending on DST


    const jd = getJulianDayFromDate(birthUTC);

    const planetCodes = {
      sun: swisseph.SE_SUN, moon: swisseph.SE_MOON, mercury: swisseph.SE_MERCURY,
      venus: swisseph.SE_VENUS, mars: swisseph.SE_MARS, jupiter: swisseph.SE_JUPITER,
      saturn: swisseph.SE_SATURN, uranus: swisseph.SE_URANUS,
      neptune: swisseph.SE_NEPTUNE, pluto: swisseph.SE_PLUTO
    };

    const planets = {};
    for (const [name, code] of Object.entries(planetCodes)) {
      const result = await new Promise((resolve, reject) => {
        swisseph.swe_calc_ut(jd, code, swisseph.SEFLG_SWIEPH, (r) => r.error ? reject(new Error(r.error)) : resolve(r));
      });
      const lon = normalize360(result.longitude);
      planets[name] = { longitude: lon };
    }

    const housesRes = await new Promise((resolve, reject) => {
      swisseph.swe_houses(jd, lat, lng, 'P', (r) => r.error ? reject(new Error(r.error)) : resolve(r));
    });

    const ascendant = normalize360(housesRes.ascendant);
    const mc        = normalize360(housesRes.mc);
    const housesDeg = (housesRes.house || []).map(normalize360);
    const houseSigns = housesDeg.map(signFromLongitude);

    const houseRulers = {};
    for (let i = 0; i < 12; i++) houseRulers[`house${i + 1}`] = houseSigns[i] || null;

    function houseOf(longitude) {
      for (let i = 0; i < 12; i++) {
        const start = housesDeg[i];
        const end   = housesDeg[(i + 1) % 12];
        if (start <= end) { if (longitude >= start && longitude < end) return i + 1; }
        else { if (longitude >= start || longitude < end) return i + 1; }
      }
      return 12;
    }

    const planetsInHouses = {};
    for (const [planet, data] of Object.entries(planets)) {
      const house = houseOf(data.longitude);
      planetsInHouses[planet] = house;
      data.sign  = signFromLongitude(data.longitude);
      data.house = house;
    }
// --- Nodes & Chiron (compute AFTER housesDeg + houseOf exist) ---
// NOTE: Chiron needs asteroid ephemeris files (e.g. seas_18.se1). If the file is missing,
// we skip Chiron gracefully so the rest of the chart can compute.
const extraBodies = {
  northNode: swisseph.SE_TRUE_NODE,  // true node (works without asteroid files)
  chiron:    swisseph.SE_CHIRON      // requires seas_*.se1 (asteroid ephe)
};

const nodesAndChiron = {};
for (const [name, code] of Object.entries(extraBodies)) {
  try {
    const result = await new Promise((resolve, reject) => {
      swisseph.swe_calc_ut(jd, code, swisseph.SEFLG_SWIEPH, (r) => {
        if (r.error) reject(new Error(r.error)); else resolve(r);
      });
    });
    const lon = normalize360(result.longitude);
    const house = houseOf(lon);
    nodesAndChiron[name] = {
      longitude: lon,
      sign: signFromLongitude(lon),
      house
    };
  } catch (err) {
    // If Chiron fails due to missing `seas_*.se1`, log and continue.
    console.warn(`⚠️ Skipping ${name}:`, err.message);
  }
}

// merge whatever we got into planets-style structures
if (nodesAndChiron.northNode) {
  planets.northNode = nodesAndChiron.northNode;
  planetsInHouses.northNode = nodesAndChiron.northNode.house;
}
if (nodesAndChiron.chiron) {
  planets.chiron = nodesAndChiron.chiron;
  planetsInHouses.chiron = nodesAndChiron.chiron.house;
}
    const descendantDeg = (ascendant + 180) % 360;
    const icDeg         = (mc + 180) % 360;
    const signOf = (deg) => ZODIAC_SIGNS[Math.floor((((deg % 360) + 360) % 360) / 30)];
    const ascendantSign = signOf(ascendant);

    // --- Chart Ruler (traditional) and its house ---
    const chartRulerPlanet = SIGN_RULER[ascendantSign] || null;
    const chartRulerHouse = chartRulerPlanet
      ? (planetsInHouses[chartRulerPlanet.toLowerCase()] ?? null)
      : null;
      console.log('🔎 chartRuler computed:', { ascendantSign, chartRulerPlanet, chartRulerHouse });
    const payload = {
      success: true,
      method: 'swisseph',
      jd,
      angles: {
        ascendantDeg: ascendant,
        ascendantSign,
        mcDeg: mc,
        mcSign: signOf(mc),
        descendantDeg,
        descendantSign: signOf(descendantDeg),
        icDeg,
        icSign: signOf(icDeg),
      },
      houses: housesDeg,
      houseSigns,
      houseRulers,
      planets,
      planetsInHouses,
      nodesAndChiron,
      chartRulerPlanet,
      chartRulerHouse
    };

    // ensure a meta bag exists
    payload.meta = payload.meta || {};
    payload.meta.timeAccuracy = req.body?.timeAccuracy ?? null;
 const savedChartId = await saveChartToDB(
      {
        userEmail: req.body?.userEmail ?? null,
        city: req.body?.city ?? null,
        country: req.body?.country ?? null,
        timeAccuracy: req.body?.timeAccuracy ?? null,
        date, time, latitude, longitude,
        birthDateTimeUtc: birthUTC.toISOString(),tzOffsetMinutes,
        northNodeHouse: nodesAndChiron.northNode?.house ?? null,
        chironHouse: nodesAndChiron.chiron?.house ?? null,},
      payload
    );

    payload.savedChartId = savedChartId;
    // --- debug: show key chart bits in the server log (POST) ---
try {
  const planetSummary = Object.fromEntries(
    Object.entries(planets || {}).map(([name, p]) => [
      name,
      { sign: p.sign, house: p.house }
    ])
  );
  console.log('🪐 [POST] chart computed:', {
    jd,
    angles: payload.angles,
    planets: planetSummary,
  });
  console.log('💾 savedChartId:', savedChartId ?? null);
} catch (e) {
  console.warn('chart debug log failed (POST):', e?.message);
}
// return res.json (payload)is response that ends the route
    return res.json(payload);
  } catch (e) {
    console.error("💥 submit error:", e);
    res.status(500).json({ ok: false, error: e?.message ?? "Unknown error", stack: e?.stack });
  }

});

// Optional GET variant for convenience (reads from query params)
app.get('/api/birth-chart-swisseph', async (req, res) => {
  try {
    const { date, time, latitude, longitude } = req.query || {};
    if (!date || !time || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required fields (date, time, latitude, longitude).' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ success: false, error: 'Invalid coordinates.' });
    }

    const birthDT = DateTime.fromISO(`${date}T${time}`, { zone: 'Europe/Berlin' });
    if (!birthDT.isValid) return res.status(400).json({ success: false, error: 'Invalid date or time.' });
    const birthUTC = birthDT.toUTC().toJSDate();
    const tzOffsetMinutes = birthDT.offset;

    const jd = getJulianDayFromDate(birthUTC);

    const planetCodes = {
      sun: swisseph.SE_SUN, moon: swisseph.SE_MOON, mercury: swisseph.SE_MERCURY,
      venus: swisseph.SE_VENUS, mars: swisseph.SE_MARS, jupiter: swisseph.SE_JUPITER,
      saturn: swisseph.SE_SATURN, uranus: swisseph.SE_URANUS,
      neptune: swisseph.SE_NEPTUNE, pluto: swisseph.SE_PLUTO
    };

    const planets = {};
    for (const [name, code] of Object.entries(planetCodes)) {
      const result = await new Promise((resolve, reject) => {
        swisseph.swe_calc_ut(jd, code, swisseph.SEFLG_SWIEPH, (r) => r.error ? reject(new Error(r.error)) : resolve(r));
      });
      const lon = normalize360(result.longitude);
      planets[name] = { longitude: lon };
    }

    const housesRes = await new Promise((resolve, reject) => {
      swisseph.swe_houses(jd, lat, lng, 'P', (r) => r.error ? reject(new Error(r.error)) : resolve(r));
    });

    const ascendant = normalize360(housesRes.ascendant);
    const mc        = normalize360(housesRes.mc);
    const housesDeg = (housesRes.house || []).map(normalize360);
    const houseSigns = housesDeg.map(signFromLongitude);

    const houseRulers = {};
    for (let i = 0; i < 12; i++) houseRulers[`house${i + 1}`] = houseSigns[i] || null;

    function houseOf(longitude) {
      for (let i = 0; i < 12; i++) {
        const start = housesDeg[i];
        const end   = housesDeg[(i + 1) % 12];
        if (start <= end) { if (longitude >= start && longitude < end) return i + 1; }
        else { if (longitude >= start || longitude < end) return i + 1; }
      }
      return 12;
    }

    const planetsInHouses = {};
    for (const [planet, data] of Object.entries(planets)) {
      const house = houseOf(data.longitude);
      planetsInHouses[planet] = house;
      data.sign  = signFromLongitude(data.longitude);
      data.house = house;
    }

    // --- Nodes & Chiron (compute AFTER housesDeg + houseOf exist) ---
    const extraBodies = {
      northNode: swisseph.SE_TRUE_NODE,
      chiron:    swisseph.SE_CHIRON
    };

    const nodesAndChiron = {};
    for (const [name, code] of Object.entries(extraBodies)) {
      try {
        const result = await new Promise((resolve, reject) => {
          swisseph.swe_calc_ut(jd, code, swisseph.SEFLG_SWIEPH, (r) => {
            if (r.error) reject(new Error(r.error)); else resolve(r);
          });
        });
        const lon = normalize360(result.longitude);
        const house = houseOf(lon);
        nodesAndChiron[name] = {
          longitude: lon,
          sign: signFromLongitude(lon),
          house
        };
      } catch (err) {
        console.warn(`⚠️ Skipping ${name}:`, err.message);
      }
    }

    // merge whatever we got into planets-style structures
    if (nodesAndChiron.northNode) {
      planets.northNode = nodesAndChiron.northNode;
      planetsInHouses.northNode = nodesAndChiron.northNode.house;
    }
    if (nodesAndChiron.chiron) {
      planets.chiron = nodesAndChiron.chiron;
      planetsInHouses.chiron = nodesAndChiron.chiron.house;
    }

    const descendantDeg = (ascendant + 180) % 360;
    const icDeg         = (mc + 180) % 360;
    const signOf = (deg) => ZODIAC_SIGNS[Math.floor((((deg % 360) + 360) % 360) / 30)];
    const ascendantSign = signOf(ascendant);

    // --- Chart Ruler (traditional) and its house ---
    const chartRulerPlanet = SIGN_RULER[ascendantSign] || null;
    const chartRulerHouse = chartRulerPlanet
      ? (planetsInHouses[chartRulerPlanet.toLowerCase()] ?? null)
      : null;
      console.log('🔎 chartRuler computed:', { ascendantSign, chartRulerPlanet, chartRulerHouse });
    const payload = {
      success: true,
      method: 'swisseph',
      jd,
      angles: {
        ascendantDeg: ascendant,
        ascendantSign,
        mcDeg: mc,
        mcSign: signOf(mc),
        descendantDeg,
        descendantSign: signOf(descendantDeg),
        icDeg,
        icSign: signOf(icDeg),
      },
      houses: housesDeg,
      houseSigns,
      houseRulers,
      planets,
      planetsInHouses,
      nodesAndChiron,
      chartRulerPlanet,
      chartRulerHouse
    };

    // meta + best-effort save
    payload.meta = payload.meta || {};
    payload.meta.timeAccuracy = req.query?.timeAccuracy ?? null;

    const savedChartId = await saveChartToDB(
      {
        userEmail: req.query?.userEmail ?? null,
        city: req.query?.city ?? null,
        country: req.query?.country ?? null,
        timeAccuracy: req.query?.timeAccuracy ?? null,
        date, time, latitude, longitude,
        birthDateTimeUtc: birthUTC.toISOString(), tzOffsetMinutes,
        northNodeHouse: nodesAndChiron.northNode?.house ?? null,
        chironHouse: nodesAndChiron.chiron?.house ?? null,
      },
      payload
    );

    payload.savedChartId = savedChartId;
    // --- debug: show key chart bits in the server log (GET) ---
try {
  const planetSummary = Object.fromEntries(
    Object.entries(planets || {}).map(([name, p]) => [
      name,
      { sign: p.sign, house: p.house }
    ])
  );
  console.log('🪐 [GET] chart computed:', {
    jd,
    angles: payload.angles,
    planets: planetSummary,
  });
  console.log('💾 savedChartId:', savedChartId ?? null);
} catch (e) {
  console.warn('chart debug log failed (GET):', e?.message);
}
    return res.json(payload);
  } catch (e) {
    console.error("💥 submit error (GET):", e);
    res.status(500).json({ ok: false, error: e?.message ?? "Unknown error", stack: e?.stack });
  }
});

// === DTO: compact chart summary =================================
app.get('/api/chart/summary', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ ok: false, error: 'Missing id' });

    const chart = await prisma.chart.findUnique({
      where: { id },
      select: {
        id: true,
        chartRulerPlanet: true,
        chartRulerHouse: true,
        northNodeHouse: true,
        chironHouse: true,
        rawChart: true,
      },
    });
    if (!chart) return res.status(404).json({ ok: false, error: 'Chart not found' });

    const rc = chart.rawChart || {};
    const angles = rc.angles || {};
    const planets = rc.planets || {};
    const summary = {
      id: chart.id,
      ascSign: angles.ascendantSign || null,
      mcSign: angles.mcSign || null,
      chartRuler: {
        planet: chart.chartRulerPlanet || null,
        house: chart.chartRulerHouse || null,
      },
      northNodeHouse: chart.northNodeHouse || rc?.nodesAndChiron?.northNode?.house || null,
      chironHouse: chart.chironHouse || rc?.nodesAndChiron?.chiron?.house || null,
      planets: {
        sun:   { sign: planets.sun?.sign   || null, house: planets.sun?.house   || null },
        moon:  { sign: planets.moon?.sign  || null, house: planets.moon?.house  || null },
        mercury:{sign: planets.mercury?.sign|| null, house: planets.mercury?.house|| null },
        venus: { sign: planets.venus?.sign || null, house: planets.venus?.house || null },
        mars:  { sign: planets.mars?.sign  || null, house: planets.mars?.house  || null },
        jupiter:{sign: planets.jupiter?.sign|| null, house: planets.jupiter?.house|| null },
        saturn:{ sign: planets.saturn?.sign|| null, house: planets.saturn?.house|| null },
        uranus:{ sign: planets.uranus?.sign|| null, house: planets.uranus?.house|| null },
        neptune:{sign: planets.neptune?.sign|| null, house: planets.neptune?.house|| null },
        pluto: { sign: planets.pluto?.sign || null, house: planets.pluto?.house || null },
        northNode: { sign: planets.northNode?.sign || null, house: planets.northNode?.house || null },
        chiron:    { sign: planets.chiron?.sign    || null, house: planets.chiron?.house    || null },
      },
      houseSigns: rc.houseSigns || null,
      houseRulers: rc.houseRulers || null,
    };

    res.json({ ok: true, summary });
  } catch (e) {
    console.error('💥 /api/chart/summary error:', e);
    res.status(500).json({ ok: false, error: e?.message || 'Unknown error' });
  }
});

// === Dev helper: one-shot compute -> save -> return SVG/HTML URLs ===========
app.post('/api/dev/chart-to-svg', async (req, res) => {
  try {
    const { date, time, latitude, longitude, userEmail } = req.body || {};
    if (!date || !time || latitude == null || longitude == null) {
      return res.status(400).json({ ok: false, error: 'Missing date, time, latitude, or longitude' });
    }

    // Build absolute base URL that works in Railway (no localhost)
    const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'https');
    const host  = req.headers['x-forwarded-host']  || req.get('host');
    const base  = `${proto}://${host}`;

    // 1) Compute + save chart via our own API (returns savedChartId)
    const rChart = await fetch(`${base}/api/birth-chart-swisseph`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, time, latitude, longitude, userEmail })
    });
    if (!rChart.ok) {
      const err = await rChart.text().catch(()=>'');
      return res.status(502).json({ ok: false, step: 'chart', error: err || rChart.statusText });
    }
    const chartPayload = await rChart.json();
    const chartId = chartPayload.savedChartId || null;
    if (!chartId) return res.status(500).json({ ok: false, error: 'Chart computed but not saved' });

    // 2) Create submission + reading directly (bypass survey/submit to avoid empty answers requirement)
    const submission = await prisma.surveySubmission.create({
      data: { userEmail: userEmail || null, chart: { connect: { id: chartId } } },
      select: { id: true }
    });

    const reading = await prisma.reading.create({
      data: {
        submissionId: submission.id,
        chartId,
        userEmail: userEmail || null,
        summary: 'Auto-generated placeholder reading for dev preview.'
      },
      select: { id: true }
    });

    // 3) Hand back URLs your FE can use immediately
    const svgUrl  = `${base}/reading/${submission.id}/chart.svg`;
    const htmlUrl = `${base}/reading/${submission.id}/html`;

    return res.json({ ok: true, chartId, submissionId: submission.id, svgUrl, htmlUrl });
  } catch (e) {
    console.error('💥 /api/dev/chart-to-svg error:', e);
    return res.status(500).json({ ok: false, error: e?.message || 'Unknown error' });
  }
});

// === Reading DTO by submission id =================================
//1st version of GET handler for /api/reading/:submissionId
app.get('/api/reading/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;
    if (!submissionId) {
      return res.status(400).json({ ok: false, error: 'Missing submissionId' });
    }

    const reading = await prisma.reading.findFirst({
      where: { submissionId },
      select: { id: true, summary: true, chartId: true, createdAt: true, userEmail: true },
    });
    if (!reading) {
      return res.status(404).json({ ok: false, error: 'Reading not found' });
    }

    let chartSummary = null;
    let builtText = null;

    if (reading.chartId) {
      const chart = await prisma.chart.findUnique({
        where: { id: reading.chartId },
        select: {
          id: true,
          chartRulerPlanet: true,
          chartRulerHouse: true,
          rawChart: true,
        },
      });

      if (chart) {
        const rc      = chart.rawChart || {};
        const angles  = rc.angles  || {};
        const planets = rc.planets || {};

        chartSummary = {
          id: chart.id,
          ascSign: angles.ascendantSign || null,
          mcSign:  angles.mcSign || null,
          chartRuler: { planet: chart.chartRulerPlanet || null, house: chart.chartRulerHouse || null },
          northNodeHouse: rc?.nodesAndChiron?.northNode?.house || null,
          chironHouse:    rc?.nodesAndChiron?.chiron?.house    || null,
          planets: {
            sun:      { sign: planets.sun?.sign,      house: planets.sun?.house },
            moon:     { sign: planets.moon?.sign,     house: planets.moon?.house },
            mercury:  { sign: planets.mercury?.sign,  house: planets.mercury?.house },
            venus:    { sign: planets.venus?.sign,    house: planets.venus?.house },
            mars:     { sign: planets.mars?.sign,     house: planets.mars?.house },
            jupiter:  { sign: planets.jupiter?.sign,  house: planets.jupiter?.house },
            saturn:   { sign: planets.saturn?.sign,   house: planets.saturn?.house },
            uranus:   { sign: planets.uranus?.sign,   house: planets.uranus?.house },
            neptune:  { sign: planets.neptune?.sign,  house: planets.neptune?.house },
            pluto:    { sign: planets.pluto?.sign,    house: planets.pluto?.house },
            northNode:{ sign: rc?.nodesAndChiron?.northNode?.sign, house: rc?.nodesAndChiron?.northNode?.house },
            chiron:   { sign: rc?.nodesAndChiron?.chiron?.sign,    house: rc?.nodesAndChiron?.chiron?.house },
          },
          houseSigns: rc.houseSigns || null,
          houseRulers: rc.houseRulers || null,
        };

        const builderDto = {
          ascendantSign:  angles.ascendantSign || null,
          sunSign:        planets?.sun?.sign || null,
          sunHouse:       planets?.sun?.house || null,
          moonSign:       planets?.moon?.sign || null,
          moonHouse:      planets?.moon?.house || null,
          chartRulerPlanet: chart.chartRulerPlanet || null,
          chartRulerHouse:  chart.chartRulerHouse  || null
        };
        builtText = buildReadingFromContent(builderDto);
      }
    }

    return res.json({
      ok: true,
      submissionId,
      createdAt: reading.createdAt,
      userEmail: reading.userEmail,
      reading: {
        id: reading.id,
        storedSummary: reading.summary,
        builtText: builtText || null,
      },
      chart: chartSummary,
    });
  } catch (e) {
    console.error('💥 /api/reading/:submissionId error:', e);
    res.status(500).json({ ok: false, error: e?.message || 'Unknown error' });
  }
});

// === Server-rendered Reading Page (HTML) ============================
const ZODIAC_ICONS = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓"
};
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function fmtDeg(n) { const v = Number(n); return Number.isFinite(v) ? v.toFixed(2) + '°' : '—'; }
function renderSign(sign) {
  if (!sign) return '—';
  const icon = ZODIAC_ICONS[sign] || '•';
  return `${icon} ${sign}`;
}
function renderChartHTML(dto) {
  const houses = dto?.houseSigns || [];
  const planets = dto?.planets || {};
  const planetsByHouse = (() => {
    const bucket = Array.from({ length: 12 }, () => []);
    Object.entries(planets).forEach(([name, v]) => {
      const h = Number(v?.house);
      if (Number.isInteger(h) && h >= 1 && h <= 12) bucket[h - 1].push(name);
    });
    return bucket;
  })();
  const houseRows = (dto?.houseSigns || []).map((sign, i) => {
    return `
      <div class="tile">
        <div class="t"><b>House ${i + 1}</b></div>
        <div>Cusp: ${fmtDeg(dto?.rawHouses?.[i])}</div>
        <div>Sign: ${renderSign(sign)}</div>
      <div>Ruler: ${
  esc(
    (Array.isArray(dto?.houseRulers)
      ? dto.houseRulers[i]
      : (dto?.houseRulers ? dto.houseRulers['house' + (i + 1)] : null)
    ) || '—'
  )
}</div>
      </div>
    `;
  }).join('');
  const planetsByHouseGrid = planetsByHouse.map((list, i) => {
    const li = list.length
      ? `<ul>${list.map(p => {
          const info = planets[p] || {};
          return `<li>${esc(p)} — ${renderSign(info.sign)}${info.longitude != null ? ` (${fmtDeg(info.longitude)})` : ''}</li>`;
        }).join('')}</ul>`
      : '—';
    return `
      <div class="tile">
        <div class="t"><b>House ${i + 1}</b></div>
        <div>${li}</div>
      </div>
    `;
  }).join('');
  const allPlanets = Object.entries(planets).map(([name, info]) => `
    <div class="tile">
      <div class="t"><b>${esc(name)}</b></div>
      <div>Sign: ${renderSign(info.sign)}</div>
      <div>House: ${esc(info.house)}</div>
      <div>Longitude: ${fmtDeg(info.longitude)}</div>
    </div>
  `).join('');

  return `
    <section>
      <h2>Your Birth Chart</h2>
      <div class="card">
        <div><b>Ascendant (Rising):</b> ${renderSign(dto.ascSign)} (${fmtDeg(dto.ascDeg)})</div>
        <div><b>MC (Midheaven):</b> ${renderSign(dto.mcSign)} (${fmtDeg(dto.mcDeg)})</div>
        ${dto.chartRuler?.planet ? `<div><b>Chart Ruler:</b> ${esc(dto.chartRuler.planet)} in House ${esc(dto.chartRuler.house || '—')}</div>` : ''}
      </div>

      <div class="card">
        <b>Houses (cusp → sign → ruler):</b>
        <div class="grid">${houseRows}</div>
      </div>

      <div class="card">
        <b>Planets by House:</b>
        <div class="grid">${planetsByHouseGrid}</div>
      </div>

      <div class="card">
        <b>All Planets (sign, house, degree):</b>
        <div class="grid">${allPlanets}</div>
      </div>
    </section>
  `;
}

// === Simple SVG wheel renderer =====================================
// Geometry helpers
function degToRad(d) { return (Math.PI / 180) * d; }
function polar(cx, cy, r, deg) {
  const a = degToRad(deg);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

// Map ecliptic longitude to SVG angle (0° Aries at 3 o'clock, increases CCW)
function svgAngleFromEcliptic(longitude) {
  // SVG 0° is along +X (to the right). We want 0° Aries at +X, counter-clockwise.
  // So just use +longitude.
  return longitude;
}

const PLANET_GLYPH = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
  northNode: "☊", chiron: "⚷"
};

// Build a prettier chart wheel SVG from rawChart JSON
function buildChartSVG(rawChart, opts = {}) {
  const size = Number(opts.size) || 720;  // a bit bigger default
  const pad = 18;
  const cx = size / 2, cy = size / 2;

  // Radii layout (outer → inner)
  const R_outer            = (size / 2) - pad; // canvas margin
  const R_border           = R_outer - 2;      // thin border
  const R_signBandOuter    = R_border - 2;     // sign colored ring (outer edge)
  const R_signBandInner    = R_signBandOuter - 28;
  const R_majorTickOuter   = R_signBandInner - 2;
  const R_majorTickInner   = R_majorTickOuter - 12;
  const R_minorTickInner   = R_majorTickOuter - 6;
  const R_houseOuter       = R_majorTickInner - 6;
  const R_houseInner       = R_houseOuter - 58;
  const R_planet           = R_houseInner - 26;
  const R_center           = R_planet - 18;

  const houses   = rawChart?.houses || [];       // 12 cusp longitudes
  const houseSigns = rawChart?.houseSigns || []; // 12 sign names for cusps
  const planets  = rawChart?.planets || {};      // { sun:{longitude, sign, house}, ... }

  // Local helpers (these rely on helpers already defined above in the file)
  const clamp360 = (d) => ((d % 360) + 360) % 360;
  const rad      = (d) => (Math.PI / 180) * d;
  const pol      = (r, deg) => {
    const a = rad(deg);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };
  const svgAngle = (lon) => svgAngleFromEcliptic(lon); // keep same orientation as before

  // Colors (dark theme)
  const BG        = "#0b0d10";
  const PANEL     = "#11151b";
  const BORDER    = "#222a35";
  const GRID      = "#313a46";
  const GRID_SOFT = "#2a3340";
  const TEXT      = "#d8dee9";
  const TEXT_SOFT = "#aab3c0";
  const ACCENT    = "#83c9f4";

  // Per-sign subtle colors (12)
  const SIGN_COLORS = [
    "#f7a7a6", // Aries
    "#f6c48f", // Taurus
    "#f7e58e", // Gemini
    "#c3e6a0", // Cancer
    "#9fd6a5", // Leo
    "#9fe1d6", // Virgo
    "#9bc8f2", // Libra
    "#b2a6f7", // Scorpio
    "#dba6f7", // Sagittarius
    "#f7a6ca", // Capricorn
    "#a6f7dd", // Aquarius
    "#a6f1f7", // Pisces
  ].map(c => c + "33"); // add alpha

  // Optional glyphs for signs (fallbacks to names if not available)
  const SIGN_GLYPH = {
    Aries:"♈", Taurus:"♉", Gemini:"♊", Cancer:"♋",
    Leo:"♌", Virgo:"♍", Libra:"♎", Scorpio:"♏",
    Sagittarius:"♐", Capricorn:"♑", Aquarius:"♒", Pisces:"♓"
  };

  let svg = [];
  svg.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    `<defs>`,
    `  <radialGradient id="gBg" cx="50%" cy="50%" r="50%">`,
    `    <stop offset="0%"  stop-color="${BG}"/>`,
    `    <stop offset="100%" stop-color="${PANEL}"/>`,
    `  </radialGradient>`,
    `</defs>`,
    `<rect x="0" y="0" width="${size}" height="${size}" fill="url(#gBg)"/>`
  );

  // Outer ring & border
  svg.push(
    `<circle cx="${cx}" cy="${cy}" r="${R_outer}" fill="none" stroke="${BORDER}" stroke-width="2"/>`,
    `<circle cx="${cx}" cy="${cy}" r="${R_border}" fill="${PANEL}" stroke="${GRID}" stroke-width="1"/>`
  );

  // 12 colored sign wedges
  for (let i = 0; i < 12; i++) {
    const a0 = svgAngle(i * 30);
    const a1 = svgAngle(i * 30 + 30);
    const color = SIGN_COLORS[i] || "#ffffff22";

    // ring wedge (approx via polygon)
    const steps = 4; // smoothness of wedge edge
    const pts = [];
    for (let s = 0; s <= steps; s++) {
      const a = a0 + ((a1 - a0) * s) / steps;
      const p = pol(R_signBandOuter, a);
      pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
    }
    for (let s = steps; s >= 0; s--) {
      const a = a0 + ((a1 - a0) * s) / steps;
      const p = pol(R_signBandInner, a);
      pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
    }
    svg.push(`<polygon points="${pts.join(' ')}" fill="${color}" stroke="none"/>`);
  }

  // Major ticks (every 30°) + sign labels
  for (let i = 0; i < 12; i++) {
    const deg = svgAngle(i * 30);
    const pOuter = pol(R_majorTickOuter, deg);
    const pInner = pol(R_majorTickInner, deg);
    svg.push(`<line x1="${pOuter.x.toFixed(1)}" y1="${pOuter.y.toFixed(1)}" x2="${pInner.x.toFixed(1)}" y2="${pInner.y.toFixed(1)}" stroke="${GRID}" stroke-width="2"/>`);

    // Label at middle of each sign wedge
    const mid = svgAngle(i * 30 + 15);
    const pLbl = pol((R_signBandOuter + R_signBandInner) / 2, mid);
    const name = ZODIAC_SIGNS[i] || "";
    const glyph = SIGN_GLYPH[name] || "";
    svg.push(
      `<text x="${pLbl.x.toFixed(1)}" y="${pLbl.y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle"`,
      `  style="font: 700 12px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; fill:${TEXT}">`,
      `${glyph ? glyph + " " : ""}${name}</text>`
    );
  }

  // Minor ticks (every 5°)
  for (let d = 0; d < 360; d += 5) {
    if (d % 30 === 0) continue; // skip majors
    const deg = svgAngle(d);
    const pOuter = pol(R_majorTickOuter, deg);
    const pInner = pol(R_minorTickInner, deg);
    svg.push(`<line x1="${pOuter.x.toFixed(1)}" y1="${pOuter.y.toFixed(1)}" x2="${pInner.x.toFixed(1)}" y2="${pInner.y.toFixed(1)}" stroke="${GRID_SOFT}" stroke-width="1"/>`);
  }

  // House cusps (12)
  if (Array.isArray(houses) && houses.length === 12) {
    for (let i = 0; i < 12; i++) {
      const deg = svgAngle(houses[i]);
      const pOut = pol(R_houseOuter, deg);
      const pIn  = pol(R_houseInner, deg);
      svg.push(`<line x1="${pOut.x.toFixed(1)}" y1="${pOut.y.toFixed(1)}" x2="${pIn.x.toFixed(1)}" y2="${pIn.y.toFixed(1)}" stroke="${ACCENT}" stroke-width="1.5" opacity="0.7"/>`);

      // cusp number slightly inside
      const pNum = pol(R_houseInner - 10, deg);
      svg.push(
        `<text x="${pNum.x.toFixed(1)}" y="${pNum.y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle"`,
        `  style="font: 600 11px system-ui, -apple-system; fill:${TEXT_SOFT}">${(i + 1)}</text>`
      );
    }
  }

  // Planet glyphs on the planet ring
  for (const [name, p] of Object.entries(planets)) {
    const lon = Number(p?.longitude);
    if (!Number.isFinite(lon)) continue;
    const deg = svgAngle(lon);
    const pt  = pol(R_planet, deg);
    const glyph = PLANET_GLYPH[name] || name.slice(0,1).toUpperCase();

    svg.push(
      `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="12" fill="${PANEL}" stroke="${GRID}" stroke-width="1.2"/>`,
      `<text x="${pt.x.toFixed(1)}" y="${pt.y.toFixed(1)}" class="planet" text-anchor="middle" dominant-baseline="middle"`,
      `  style="font: 16px system-ui, -apple-system; fill:${TEXT}">${glyph}</text>`
    );
  }

  // Decorative inner circle
  svg.push(
    `<circle cx="${cx}" cy="${cy}" r="${R_center}" fill="none" stroke="${GRID_SOFT}" stroke-width="1"/>`,
    `<circle cx="${cx}" cy="${cy}" r="3" fill="${TEXT_SOFT}"/>`
  );

  svg.push(`</svg>`);
  return svg.join('\n');

// 2nd version of GET handler for /reading/:submissionId/html

  app.get('/reading/:submissionId/html', async (req, res) => {
    try {
      const { submissionId } = req.params;
      if (!submissionId) return res.status(400).send('Missing submissionId');
  
      const reading = await prisma.reading.findFirst({
        where: { submissionId },
        select: { id: true, summary: true, chartId: true, createdAt: true, userEmail: true }
      });
      if (!reading) return res.status(404).send('Reading not found');
  
      // Load chart + build DTO for the content builder
      let chartDTO = null;
      let readingText = null;
  
      if (reading.chartId) {
        const chart = await prisma.chart.findUnique({
          where: { id: reading.chartId },
          select: {
            id: true,
            chartRulerPlanet: true,
            chartRulerHouse: true,
            rawChart: true
          }
        });
  
        if (chart) {
          const rc = chart.rawChart || {};
          const angles  = rc.angles  || {};
          const planets = rc.planets || {};
  
          // DTO used by renderChartHTML (for the wheel/tech section)
          chartDTO = {
            id: chart.id,
            ascSign: angles.ascendantSign || null,
            mcSign:  angles.mcSign || null,
            ascDeg:  angles.ascendantDeg,
            mcDeg:   angles.mcDeg,
            chartRuler: { planet: chart.chartRulerPlanet || null, house: chart.chartRulerHouse || null },
            houseSigns: rc.houseSigns || [],
            houseRulers: rc.houseRulers || [],
            rawHouses: rc.houses || [],
            planets
          };
  
          // DTO for the prose reading builder (uses your JSON content)
          const builderDto = {
            ascendantSign:  angles.ascendantSign || null,
            sunSign:        planets?.sun?.sign || null,
            sunHouse:       planets?.sun?.house || null,
            moonSign:       planets?.moon?.sign || null,
            moonHouse:      planets?.moon?.house || null,
            chartRulerPlanet: chart.chartRulerPlanet || null,
            chartRulerHouse:  chart.chartRulerHouse  || null
          };
  
          // ← This pulls from content/readings/*.json
          readingText = buildReadingFromContent(builderDto);
        }
      }
  
      // Fallback: if we couldn't build, show the stored summary (or a tiny note)
      if (!readingText) readingText = reading.summary || 'Reading will appear here when chart data is available.';
  
      const chartHTML = chartDTO ? renderChartHTML(chartDTO) : '<p>No chart linked.</p>';
  
      const html = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>FateFlix Reading – ${esc(submissionId)}</title>
        <style>
          body{font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;background:#0e0e0e;color:#eee;margin:0;padding:24px}
          a{color:#9cd}
          h1,h2{margin:0 0 8px}
          .wrap{max-width:1100px;margin:0 auto}
          .meta{opacity:0.8;margin-bottom:12px}
          .card{margin-top:16px;padding:12px;border:1px solid #333;border-radius:8px;background:#141414}
          .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:12px}
          .tile{padding:8px 10px;background:#1c1c1c;border-radius:6px}
          .reading{white-space:pre-wrap;line-height:1.5}
          .t{margin-bottom:4px}
          footer{margin-top:28px;opacity:0.7}
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1>FateFlix Reading</h1>
          <div class="meta">Submission: ${esc(submissionId)} • ${esc(new Date(reading.createdAt).toLocaleString())}</div>
  
          <section class="card">
            <h2>Summary</h2>
            <div class="reading">${esc(readingText)}</div>
          </section>
  
          <div class="card">
            <b>Wheel (SVG preview):</b>
            <div style="margin-top:8px">
              <img src="/reading/${esc(submissionId)}/chart.svg" alt="Chart wheel" style="max-width:100%;height:auto;border:1px solid #333;border-radius:8px;background:#111" />
            </div>
          </div>
  
          ${chartHTML}
  
          <footer>
            <p>© FateFlix • Server-rendered preview. You can also call <code>/api/reading/${esc(submissionId)}</code> for JSON.</p>
          </footer>
        </div>
      </body>
      </html>`;
  
      res.type('html').send(html);
    } catch (e) {
      console.error('💥 /reading/:submissionId/html error:', e);
      res.status(500).send('Internal error');
    }
  });
// ===== House rulers & planets-in-houses (compact endpoint) =====
app.post('/api/chart-houses', async (req, res) => {
  try {
    const { date, time, latitude, longitude } = req.body || {};
    if (!date || !time || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required fields (date, time, latitude, longitude).' });
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ success: false, error: 'Invalid coordinates.' });
    }

    const birthDT = DateTime.fromISO(`${date}T${time}`, { zone: 'Europe/Berlin' });
    if (!birthDT.isValid) return res.status(400).json({ success: false, error: 'Invalid date or time.' });
    const birthUTC = birthDT.toUTC().toJSDate();
    const jd = getJulianDayFromDate(birthUTC);

    const planetCodes = {
      sun: swisseph.SE_SUN, moon: swisseph.SE_MOON, mercury: swisseph.SE_MERCURY,
      venus: swisseph.SE_VENUS, mars: swisseph.SE_MARS, jupiter: swisseph.SE_JUPITER,
      saturn: swisseph.SE_SATURN, uranus: swisseph.SE_URANUS,
      neptune: swisseph.SE_NEPTUNE, pluto: swisseph.SE_PLUTO
    };

    const planets = {};
    for (const [name, code] of Object.entries(planetCodes)) {
      const result = await new Promise((resolve, reject) => {
        swisseph.swe_calc_ut(jd, code, swisseph.SEFLG_SWIEPH, (r) => r.error ? reject(new Error(r.error)) : resolve(r));
      });
      planets[name] = { longitude: normalize360(result.longitude) };
    }

    const housesRes = await new Promise((resolve, reject) => {
      swisseph.swe_houses(jd, lat, lng, 'P', (r) => r.error ? reject(new Error(r.error)) : resolve(r));
    });

    const ascendant = normalize360(housesRes.ascendant);
    const mc        = normalize360(housesRes.mc);
    const houseCusps = (housesRes.house || []).map(normalize360);

    const descendantDeg = (ascendant + 180) % 360;
    const icDeg         = (mc + 180) % 360;
    const signOf = (deg) => ZODIAC_SIGNS[Math.floor((((deg % 360) + 360) % 360) / 30)];
    const angles = {
      ascendantDeg: ascendant,
      ascendantSign: signOf(ascendant),
      mcDeg: mc,
      mcSign: signOf(mc),
      descendantDeg,
      descendantSign: signOf(descendantDeg),
      icDeg,
      icSign: signOf(icDeg),
    };

    const houseSigns  = houseCusps.map(signFromLongitude);
    const houseRulers = houseSigns.map(sign => SIGN_RULER[sign] || null);

    const planetsInHouses = {};
    Object.entries(planets).forEach(([name, { longitude }]) => {
      planetsInHouses[name] = houseOfLongitude(longitude, houseCusps);
    });

    const planetsByHouse = Array.from({ length: 12 }, () => []);
    Object.entries(planetsInHouses).forEach(([planet, h]) => {
      planetsByHouse[h - 1].push(planet);
    });

    for (const [name, p] of Object.entries(planets)) {
      p.sign  = signFromLongitude(p.longitude);
      p.house = planetsInHouses[name];
    }

    return res.json({
      success: true,
      jd, ascendant, mc, angles,
      houses: houseCusps, houseSigns, houseRulers,
      planetsInHouses, planetsByHouse, planets
    });
  } catch (error) {
    console.error('Error in /api/chart-houses:', error);
    return res.status(500).json({ success: false, error: error.message || String(error) });
  }
});

// === Save survey response (normalized) ========================
app.post('/api/survey-response', async (req, res) => {
  try {
    const { surveyId, chartId, userEmail, answers } = req.body;

    if (!surveyId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, error: 'Missing surveyId or answers[]' });
    }

    const response = await prisma.response.create({
      data: {
        surveyId,
        chartId: chartId ?? null,
        userEmail: userEmail ?? null,
        answers: {
          create: answers.map((a) => ({
            questionId: a.questionId,
            freeText: a.freeText ?? null,
            numberValue: a.numberValue ?? null,
            dateValue: a.dateValue ?? null,
            selectedOptionId: a.selectedOptionId ?? null,
          })),
        },
      },
      include: { answers: true },
    });

    res.json({ success: true, response });
  } catch (error) {
    console.error('❌ Error saving survey response:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- TEMP: ping + route dump ---------------------------------
app.post('/api/chart-houses/ping', (_req, res) => res.json({ ok: true }));

// -------- Geocoding --------------
app.get('/api/geocode', async (req, res) => {
  try {
    const { city, country, userEmail } = req.query || {};
    if (!city || !country) {
      return res.status(400).json({ error: 'City and country are required.' });
    }

    const apiKey = process.env.OPENCAGE_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Server geocoding key missing.' });

    const query = encodeURIComponent(`${city}, ${country}`);
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || !data.results.length) {
      return res.status(404).json({ error: 'Location not found.' });
    }

    const { lat, lng } = data.results[0].geometry;
    return res.json({ latitude: lat, longitude: lng, userEmail });
  } catch (err) {
    console.error('❌ Geocoding backend error:', err);
    return res.status(500).json({ error: 'Failed to geocode location.' });
  }
});

// === Survey submit (normalized via shim) ======================
app.post("/api/survey/submit", async (req, res) => {
  try {
    console.log("submit route v2 hit", new Date().toISOString());
const safeBody = JSON.parse(JSON.stringify(req.body));
if (safeBody?.survey?.section1?.chartData) safeBody.survey.section1.chartData = "(omitted)";
console.log("submit v2 body (safe):", safeBody);

const { userEmail: shimEmail, answers } = normalizeSurveyPayload(req.body);
// Prefer shim value, else legacy section1.email
const userEmail = shimEmail || req.body?.survey?.section1?.email || null;

// Prefer explicit chartId, else meta.chartId, else section1.chartId
const chartId =
  req.body?.chartId ||
  req.body?.survey?.meta?.chartId ||
  req.body?.survey?.section1?.chartId ||
  null;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ ok: false, error: "answers[] is required" });
    }

    const submission = await prisma.surveySubmission.create({
      data: {
        userEmail: userEmail || null,
        ...(chartId ? { chart: { connect: { id: chartId } } } : {}),
      },
      select: { id: true },
    });

    let madeResponses = 0;
    let linkedOptions = 0;

    for (const a of answers) {
      const key = a?.questionKey;
      if (!key) continue;
  // Skip non-question payload keys (birth-data & meta)
  if (key.startsWith('cosmic.') || key.startsWith('meta.')) continue;
      const q = await prisma.surveyQuestion.findUnique({
        where: { key: a.questionKey },
        include: { options: true },
      });
      if (!q) { console.warn("No question found for key:", a.questionKey); continue; }

      const response = await prisma.surveyResponse.create({
        data: {
          questionId: q.id,
          submissionId: submission.id,
          answerText: a.answerText ?? null,
          userId: userEmail || "anonymous",
        },
        select: { id: true },
      });
      madeResponses++;

      if (Array.isArray(a.optionValues) && a.optionValues.length > 0) {
        const allowed = new Set(q.options.map(o => o.value));
        const chosen = a.optionValues.filter(v => allowed.has(v));
        for (const val of chosen) {
          const opt = q.options.find(o => o.value === val);
          if (!opt) continue;
          await prisma.surveyResponseOption.create({
            data: { responseId: response.id, optionId: opt.id },
          });
          linkedOptions++;
        }
      }
    }
// ---- Build & queue email (fire-and-forget) ----
try {
  const { buildReading } = require('./server/readings');
  let render;
  try {
    ({ render } = require('./server/template'));
  } catch (e) {
    console.warn('⚠️ Missing ./server/template, using fallback render()');
    render = (tpl, data) => {
      // very small templater: replaces {{key}} with string values
      if (!tpl || typeof tpl !== 'string') return '';
      return tpl.replace(/{{\s*([\w.]+)\s*}}/g, (_, k) => {
        const val = k.split('.').reduce((o, p) => (o ? o[p] : ''), data);
        return (val == null) ? '' : String(val);
      });
    };
  }
  const looksLikeEmail = (v) => typeof v === "string" && /.+@.+\..+/.test(v);
  const { sendHtmlEmail } = require('./server/mailer');
  const fs = require('fs');
  const path = require('path');
  const templatePath = path.join(__dirname, 'templates/email/survey-result.html');

  // Load template once (optional)
  let htmlTpl = '';
  try {
    htmlTpl = fs.readFileSync(templatePath, 'utf8');
  } catch {
    // very simple default template if the file is missing
    htmlTpl = `
      <h1>Your FateFlix Astro Reading</h1>
      <p><strong>Ascendant:</strong> {{asc}}</p>
      <p><strong>MC:</strong> {{mc}}</p>
      <p><strong>Sun:</strong> {{sunSign}} (House {{sunHouse}})</p>
      <p><strong>Moon:</strong> {{moonSign}} (House {{moonHouse}})</p>
      <hr />
      <pre style="white-space:pre-wrap">{{readingSummary.text}}</pre>
    `;
  }

  // 1) Load the chart (if linked)
  let chart = null;
  if (chartId) {
    chart = await prisma.chart.findUnique({ where: { id: chartId } });
  }

  // 2) Gather answers into a keyed map (e.g. { "genres.loved": ["drama", ...], "world.crave_in_movie": "..." })
  const answerMap = {};
  for (const a of answers) {
    if (!a?.questionKey) continue;
    // normalize radio/checkbox vs free text
    if (Array.isArray(a.optionValues)) answerMap[a.questionKey] = a.optionValues;
    if (a.answerText) answerMap[a.questionKey] = a.answerText;
  }

  // 3) Build reading text
  const chartPayload = chart?.rawChart || null;
  const readingSummary = buildReading({ chartPayload, answersByKey: answerMap });

  // 4) Persist reading
  const readingRec = await prisma.reading.create({
    data: {
      submissionId: submission.id,
      chartId,
      userEmail,
      summary: (typeof readingSummary === 'string'
        ? readingSummary
        : (readingSummary?.text ?? JSON.stringify(readingSummary))),
    },
    select: { id: true },
  });

  // 5) Render email HTML
  const htmlBody = render(htmlTpl, {
    asc: chartPayload?.angles?.ascendantSign || '',
    mc:  chartPayload?.angles?.mcSign || '',
    sunSign: chartPayload?.planets?.sun?.sign || '',
    sunHouse: chartPayload?.planets?.sun?.house || '',
    moonSign: chartPayload?.planets?.moon?.sign || '',
    moonHouse: chartPayload?.planets?.moon?.house || '',
    readingSummary,
  });
  // 6) Queue + send email only if the address looks valid
  if (looksLikeEmail(userEmail)) {
    const outbox = await prisma.emailOutbox.create({
      data: {
        toEmail: userEmail,
        subject: 'Your FateFlix Astro Reading',
        htmlBody,
        submissionId: submission.id,
        chartId,
      },
      select: { id: true },
    });

    // 7) Send email asynchronously (don't block the HTTP response)
    (async () => {
      try {
        await sendHtmlEmail({
          to: userEmail,
          subject: 'Your FateFlix Astro Reading',
          html: htmlBody,
        });
        await prisma.emailOutbox.update({
          where: { id: outbox.id },
          data: { status: 'SENT', sentAt: new Date(), error: null },
        });
      } catch (err) {
        await prisma.emailOutbox.update({
          where: { id: outbox.id },
          data: { status: 'FAILED', error: String(err?.message || err) },
        });
        console.error('❌ Email send failed:', err);
      }
    })();
  } else {
    console.warn('⚠️ Skipping email send: invalid or missing userEmail');
  }

} catch (e) {
  console.error('Email pipeline error (non-fatal):', e);
}


    return res.json({ ok: true, submissionId: submission.id, responses: madeResponses, optionLinks: linkedOptions });
  } catch (e) {
    console.error("💥 submit error:", e);
    return res.status(500).json({ ok: false, error: e?.message ?? "Unknown error" });
  }
});
// === Debug helper: list recent chart + submission IDs ==============
app.get('/api/debug/latest', async (_req, res) => {
  try {
    const [chart, submission, reading] = await Promise.all([
      prisma.chart.findFirst({ orderBy: { createdAt: 'desc' }, select: { id: true, createdAt: true } }),
      prisma.surveySubmission.findFirst({ orderBy: { createdAt: 'desc' }, select: { id: true, createdAt: true } }),
      prisma.reading.findFirst({ orderBy: { createdAt: 'desc' }, select: { id: true, submissionId: true, chartId: true, createdAt: true } }),
    ]);
    res.json({ ok: true, latest: { chart, submission, reading } });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// List all registered routes (place near the bottom)
app.get('/__routes', (_req, res) => {
  const list = [];
  const stack = app?._router?.stack ?? [];
  for (const layer of stack) {
    if (layer.route?.path) {
      const methods = Object.keys(layer.route.methods || {}).map(m => m.toUpperCase());
      list.push({ path: layer.route.path, methods });
    } else if (layer.name === 'router' && layer.handle?.stack) {
      for (const sl of layer.handle.stack) {
        if (sl.route?.path) {
          const methods = Object.keys(sl.route.methods || {}).map(m => m.toUpperCase());
          list.push({ path: sl.route.path, methods });
        }
      }
    }
  }
  res.json({ count: list.length, routes: list });
});


// start server (only when run directly)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Swiss Ephemeris backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;

function pick(map, key, fallback = ''){ 
  if (!map || typeof map !== 'object') return fallback;
  return map[key] ?? fallback;
}

function buildReadingFromContent(chartDto) {
  const ascSign   = chartDto.ascendantSign || chartDto.risingSign || '';
  const sunSign   = chartDto.sunSign || '';
  const sunHouse  = String(chartDto.sunHouse || '');
  const moonSign  = chartDto.moonSign || chartDto.planets?.moon?.sign || '';
  const moonHouse = String(chartDto.moonHouse || chartDto.planets?.moon?.house || '');
  const chartRulerPlanet = chartDto.chartRulerPlanet || chartDto.planets?.chartRulerPlanet || '';
  const chartRulerHouse  = chartDto.chartRulerHouse  || chartDto.planets?.chartRulerHouse  || '';

  const parts = [];

  // ---- SUMMARY INTRO ----
  if (SECTION_INTROS.summary) parts.push(SECTION_INTROS.summary.trim());

  // ---- ASCENDANT ----
  if (SECTION_INTROS.ascendant) parts.push(SECTION_INTROS.ascendant.trim());
  parts.push(pick(ASCENDANT_TEXT, ascSign, ''));

  // ---- SUN ----
  if (SECTION_INTROS.sun_sign) parts.push(SECTION_INTROS.sun_sign.trim());
  parts.push(pick(SUN_SIGN_TEXT, sunSign, ''));

  if (SECTION_INTROS.sun_house) parts.push(SECTION_INTROS.sun_house.trim());
  parts.push(pick(SUN_HOUSE_TEXT, sunHouse, ''));

  // ---- MOON ----
  if (SECTION_INTROS.moon_sign) parts.push(SECTION_INTROS.moon_sign.trim());
  parts.push(pick(MOON_SIGN_TEXT, moonSign, ''));

  if (SECTION_INTROS.moon_house) parts.push(SECTION_INTROS.moon_house.trim());
  parts.push(pick(MOON_HOUSE_TEXT, moonHouse, ''));

  // ---- MERCURY → PLUTO ----
  const PLANETS = [
    ['mercury', MERCURY_SIGN_TEXT, MERCURY_HOUSE_TEXT],
    ['venus',   VENUS_SIGN_TEXT,   VENUS_HOUSE_TEXT],
    ['mars',    MARS_SIGN_TEXT,    MARS_HOUSE_TEXT],
    ['jupiter', JUPITER_SIGN_TEXT, JUPITER_HOUSE_TEXT],
    ['saturn',  SATURN_SIGN_TEXT,  SATURN_HOUSE_TEXT],
    ['uranus',  URANUS_SIGN_TEXT,  URANUS_HOUSE_TEXT],
    ['neptune', NEPTUNE_SIGN_TEXT, NEPTUNE_HOUSE_TEXT],
    ['pluto',   PLUTO_SIGN_TEXT,   PLUTO_HOUSE_TEXT],
  ];

  for (const [name, SIGN_TEXT, HOUSE_TEXT] of PLANETS) {
    const signVal  = chartDto[`${name}Sign`]  || chartDto.planets?.[name]?.sign  || '';
    const houseVal = String(chartDto[`${name}House`] || chartDto.planets?.[name]?.house || '');
    if (SECTION_INTROS[`${name}_sign`])  parts.push(SECTION_INTROS[`${name}_sign`].trim());
    parts.push(pick(SIGN_TEXT, signVal, ''));
    if (SECTION_INTROS[`${name}_house`]) parts.push(SECTION_INTROS[`${name}_house`].trim());
    parts.push(pick(HOUSE_TEXT, houseVal, ''));
  }

  // ---- CHART RULER ----
  if (SECTION_INTROS.chart_ruler) parts.push(SECTION_INTROS.chart_ruler.trim());
  if (chartRulerPlanet && chartRulerHouse) {
    const key = `${chartRulerPlanet}:${chartRulerHouse}`;
    const rulerCopy = pick(CHART_RULER_TEXT, key, '');
    parts.push(rulerCopy || `Your chart ruler is **${chartRulerPlanet}** in **House ${chartRulerHouse}**.`);
  }

  return parts.filter(Boolean).join('\n\n');
}

