// server.js
console.log("✅ Running server.js from:", __dirname);

const express = require('express');
const cors = require('cors');
const { DateTime } = require('luxon');
const swisseph = require('swisseph');
const { normalizeSurveyPayload } = require('./server/normalizeSurveyPayload');

require('dotenv').config();
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
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
const app = express();
app.use(cors());
app.use(express.json());

// dev-helpers (preview & retry tools)
app.get('/dev/email/preview/:outboxId', async (req, res) => {
  const r = await prisma.emailOutbox.findUnique({ where: { id: req.params.outboxId } });
  if (!r) return res.status(404).send('Not found');
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(r.htmlBody);
});

// root & health
app.get('/', (_req, res) => res.send('OK'));
app.get('/health', (_req, res) => res.json({ ok: true, status: 'healthy' }));
app.get('/_whoami', (_req, res) => {
  res.json({ cwd: process.cwd(), __dirname, routesCount: (app._router?.stack?.length) || 0 });
});

// tiny OpenAI smoke test
app.get('/api/ai/test', async (_req, res) => {
  try {
    const r = await openai.responses.create({ model: 'gpt-4o-mini', input: 'Write a one-line haiku about movies and stars.' });
    const text = r.output_text ?? r.content?.[0]?.text ?? '';
    res.json({ ok: true, text: String(text).trim() });
  } catch (e) {
    console.error('OpenAI error:', e);
    res.status(500).json({ ok: false, error: e?.message ?? 'Unknown error' });
  }
});

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

    const descendantDeg = (ascendant + 180) % 360;
    const icDeg         = (mc + 180) % 360;
    const signOf = (deg) => ZODIAC_SIGNS[Math.floor((((deg % 360) + 360) % 360) / 30)];

    const payload = {
      success: true,
      method: 'swisseph',
      jd,
      angles: {
        ascendantDeg: ascendant,
        ascendantSign: signOf(ascendant),
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
      planetsInHouses
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
      },
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

    const descendantDeg = (ascendant + 180) % 360;
    const icDeg         = (mc + 180) % 360;
    const signOf = (deg) => ZODIAC_SIGNS[Math.floor((((deg % 360) + 360) % 360) / 30)];

    const payload = {
      success: true,
      method: 'swisseph',
      jd,
      angles: {
        ascendantDeg: ascendant,
        ascendantSign: signOf(ascendant),
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
      planetsInHouses
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


app.get('/__routes', (_req, res) => {
  const out = [];
  const stack = (app && app._router && Array.isArray(app._router.stack)) ? app._router.stack : [];
  for (const layer of stack) {
    if (layer.route?.path) {
      const methods = Object.keys(layer.route.methods || {}).map(m => m.toUpperCase());
      out.push({ path: layer.route.path, methods });
    } else if (layer.name === 'router' && layer.handle && Array.isArray(layer.handle.stack)) {
      for (const sl of layer.handle.stack) {
        if (sl.route?.path) {
          const methods = Object.keys(sl.route.methods || {}).map(m => m.toUpperCase());
          out.push({ path: sl.route.path, methods });
        }
      }
    }
  }
  console.log('📜 Registered routes:', out);
  res.json(out);
});

// === Survey submit (normalized via shim) ======================
const PORT = 3001;

app.post("/api/survey/submit", async (req, res) => {
  try {
    console.log("submit route v2 hit", new Date().toISOString());
    console.log("submit v2 body:", req.body);

    const { userEmail, answers } = normalizeSurveyPayload(req.body);
    const chartId = req.body?.chartId || null;

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
      if (!a?.questionKey) continue;

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
  const { render } = require('./server/template');
  const { sendHtmlEmail } = require('./server/mailer');
  const fs = require('fs');
  const path = require('path');
  const templatePath = path.join(__dirname, 'templates/email/survey-result.html');

  // Load template once
  const htmlTpl = fs.readFileSync(templatePath, 'utf8');

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
      summary: readingSummary,
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

  // 6) Create outbox row (so failures can be retried)
  const outbox = await prisma.emailOutbox.create({
    data: {
      toEmail: userEmail || 'anonymous@example.com',
      subject: 'Your FateFlix Astro Reading',
      htmlBody,
      submissionId: submission.id,
      chartId,
    },
    select: { id: true },
  });

  // 7) Send email asynchronously (don’t block the HTTP response)
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

} catch (e) {
  console.error('Email pipeline error (non-fatal):', e);
}


    return res.json({ ok: true, submissionId: submission.id, responses: madeResponses, optionLinks: linkedOptions });
  } catch (e) {
    console.error("💥 submit error:", e);
    return res.status(500).json({ ok: false, error: e?.message ?? "Unknown error" });
  }
});

// ===== Chart SVG Endpoint (Birthday Surprise Edition!) =====
// TODO: Replace with real buildChartSVG functionality after Nov 14
app.get('/reading/:submissionId/chart.svg', async (req, res) => {
  try {
    const { submissionId } = req.params;

    // Check if today is November 14th (birthday surprise!)
    const now = new Date();
    const month = now.getMonth(); // 0-indexed, so 10 = November
    const day = now.getDate();
    const isBirthday = (month === 10 && day === 14);

    if (isBirthday) {
      // Birthday surprise SVG!
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <!-- Background -->
  <rect width="800" height="600" fill="#1a1a2e"/>

  <!-- Embedded GIF -->
  <image x="100" y="150" width="600" height="400"
         xlink:href="https://result.videoplus.ai/veo2-outputs/output/result/202511/14/34c8e6cd729a44cb8a95487237f6b798.gif"/>

  <!-- Cover leftover in top right corner -->
  <rect x="620" y="140" width="100" height="100" fill="#1a1a2e"/>

  <!-- Birthday Text Overlay -->
  <text x="400" y="120"
        font-family="Arial, sans-serif"
        font-size="48"
        font-weight="bold"
        fill="#FFD700"
        text-anchor="middle"
        stroke="#FF6B6B"
        stroke-width="2">
    Happy Birthdayyy!
  </text>

  <!-- Decorative elements -->
  <circle cx="100" cy="100" r="15" fill="#FF6B6B" opacity="0.8">
    <animate attributeName="cy" values="100;80;100" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="700" cy="100" r="15" fill="#4ECDC4" opacity="0.8">
    <animate attributeName="cy" values="100;80;100" dur="2s" begin="0.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="150" cy="80" r="12" fill="#FFD700" opacity="0.8">
    <animate attributeName="cy" values="80;60;80" dur="2s" begin="1s" repeatCount="indefinite"/>
  </circle>
  <circle cx="650" cy="80" r="12" fill="#FF6B6B" opacity="0.8">
    <animate attributeName="cy" values="80;60;80" dur="2s" begin="1.5s" repeatCount="indefinite"/>
  </circle>
</svg>`;
      res.type('image/svg+xml').send(svg);
    } else {
      // After birthday - endpoint ready for real chart implementation
      res.status(503).send('Chart SVG generation coming soon! (Temporary birthday version expired)');
    }
  } catch (e) {
    console.error('💥 /reading/:submissionId/chart.svg error:', e);
    res.status(500).send('Error generating chart');
  }
});

// start server (only when run directly)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Swiss Ephemeris backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
