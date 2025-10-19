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



// --- best-effort DB save helper (non-fatal on error)
async function saveChartToDB(input, output) {
  try {
    // Shape data exactly like the Prisma schema
    const data = {
      // who
      name: input?.name ?? null,
      userEmail: input?.userEmail ?? input?.userEmail ?? null,
      // birth input (note: schema uses birthDate/birthTime)
      city: input?.city ?? null,
      country: input?.country ?? null,
      birthDate: input?.birthDate ?? input?.date ?? null,
      birthTime: input?.birthTime ?? input?.time ?? null,
      latitude: Number(input?.latitude),
      longitude: Number(input?.longitude),
      timeAccuracy: input?.timeAccuracy ?? null,

      // core numbers (from the computed payload)
      jd: Number(output?.jd),
      ascendant: Number(output?.ascendant),
      mc: Number(output?.mc),

      // quick signs (derive if present in output; otherwise null)
      risingSign: output?.ascendantSign ?? output?.houseSigns?.[0] ?? null,
mcSign:     output?.mcSign        ?? output?.houseSigns?.[9] ?? null,
  // extra angles (use payload.angles if present; otherwise derive/fallback)
  descendant: Number(
    output?.angles?.descendantDeg ??
    output?.descendantDeg ??
    ((Number(output?.ascendant) + 180) % 360)
  ),
  ic: Number(
    output?.angles?.icDeg ??
    output?.icDeg ??
    ((Number(output?.mc) + 180) % 360)
  ),
  descendantSign:
    output?.angles?.descendantSign ?? output?.descendantSign ?? null,
  icSign:
    output?.angles?.icSign ?? output?.icSign ?? null,

      // big 5
      sunSign:  output?.planets?.sun?.sign   ?? null,
      sunHouse: output?.planets?.sun?.house  ?? null,
      moonSign: output?.planets?.moon?.sign  ?? null,
      moonHouse:output?.planets?.moon?.house ?? null,
      marsSign: output?.planets?.mars?.sign  ?? null,
      marsHouse:output?.planets?.mars?.house ?? null,
      venusSign:output?.planets?.venus?.sign ?? null,
      venusHouse:output?.planets?.venus?.house ?? null,

      // full payload JSON goes into rawChart (schema field)
      rawChart: output ?? null,
    };

    // Important: do NOT include unknown fields like `method` or `payload`
    const rec = await prisma.chart.create({
      data,
      select: { id: true },
    });

    return rec.id;
  } catch (e) {
    console.error('🟥 DB save failed (non-fatal):', e);
    return null;
  }
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => res.send('OK'))
// Health & debug routes
app.get('/health', (_req, res) => {
  res.json({ ok: true, status: 'healthy' });
});

app.get('/_whoami', (_req, res) => {
  res.json({
    cwd: process.cwd(),
    __dirname,
    routesCount:
      (app._router && app._router.stack && app._router.stack.length) || 0
  });
});
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

// ---- Swiss Ephemeris setup ----
swisseph.swe_set_ephe_path(__dirname + '/ephe');

// Helpers
function getJulianDayFromDate(date) {
  return swisseph.swe_julday(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600,
    swisseph.SE_GREG_CAL
  );
}

const ZODIAC_SIGNS = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
];

function normalize360(val) {
  let x = Number(val);
  if (!Number.isFinite(x)) return NaN;
  x = x % 360;
  if (x < 0) x += 360;
  return x;
}

function signFromLongitude(lon) {
  lon = normalize360(lon);
  const idx = Math.floor(lon / 30) % 12;
  return ZODIAC_SIGNS[idx];
}
// ---- Traditional rulerships (no redeclare of ZODIAC_SIGNS) ----
const SIGN_RULER = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",        // traditional (modern: Pluto)
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",     // traditional (modern: Uranus)
  Pisces: "Jupiter"       // traditional (modern: Neptune)
};

// ---- Determine house (1..12) for a longitude using existing normalize360 ----
function houseOfLongitude(lon, houseCusps) {
  const L = normalize360(lon);   // uses your existing normalize360
  for (let i = 0; i < 12; i++) {
    const a = normalize360(houseCusps[i]);
    const b = normalize360(houseCusps[(i + 1) % 12]);
    if (a <= b) {
      if (L >= a && L < b) return i + 1;
    } else {
      // wrap-around 360 -> 0
      if (L >= a || L < b) return i + 1;
    }
  }
  return 12; // fallback
}

// ------------- MAIN CHART ENDPOINT -------------
app.post('/api/birth-chart-swisseph', async (req, res) => {
  try {
    const { date, time, latitude, longitude } = req.body || {};

    // Basic validation
    if (!date || !time || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required fields (date, time, latitude, longitude).' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ success: false, error: 'Invalid coordinates.' });
    }

    // Timestamp
    const birthDT = DateTime.fromISO(`${date}T${time}`, { zone: 'Europe/Berlin' });
    if (!birthDT.isValid) {
      return res.status(400).json({ success: false, error: 'Invalid date or time.' });
    }
    const birthUTC = birthDT.toUTC().toJSDate();

    // JD
    const jd = getJulianDayFromDate(birthUTC);

    // Planets
    const planetCodes = {
      sun: swisseph.SE_SUN,
      moon: swisseph.SE_MOON,
      mercury: swisseph.SE_MERCURY,
      venus: swisseph.SE_VENUS,
      mars: swisseph.SE_MARS,
      jupiter: swisseph.SE_JUPITER,
      saturn: swisseph.SE_SATURN,
      uranus: swisseph.SE_URANUS,
      neptune: swisseph.SE_NEPTUNE,
      pluto: swisseph.SE_PLUTO
    };

    const planets = {};
    for (const [name, code] of Object.entries(planetCodes)) {
      const result = await new Promise((resolve, reject) => {
        swisseph.swe_calc_ut(jd, code, swisseph.SEFLG_SWIEPH, (r) => {
          if (r.error) reject(new Error(r.error)); else resolve(r);
        });
      });
      const lon = normalize360(result.longitude);
      planets[name] = { longitude: lon }; // we’ll add sign + house later
    }

    // Houses (Placidus)
    const housesRes = await new Promise((resolve, reject) => {
      swisseph.swe_houses(jd, lat, lng, 'P', (r) => {
        if (r.error) reject(new Error(r.error)); else resolve(r);
      });
    });

    const ascendant = normalize360(housesRes.ascendant);
    const mc        = normalize360(housesRes.mc);

    const housesDeg = (housesRes.house || []).map(normalize360); // 12 cusps
    // House signs by cusp degree
    const houseSigns = housesDeg.map(signFromLongitude);

    // House rulers: which sign is on each cusp → sign name
    const houseRulers = {};
    for (let i = 0; i < 12; i++) {
      houseRulers[`house${i + 1}`] = houseSigns[i] || null;
    }

    // Determine planet houses
    function houseOf(longitude) {
      // Walk cusps, wrap-around
      for (let i = 0; i < 12; i++) {
        const start = housesDeg[i];
        const end   = housesDeg[(i + 1) % 12];
        if (start <= end) {
          if (longitude >= start && longitude < end) return i + 1;
        } else {
          // wrap across 360->0
          if (longitude >= start || longitude < end) return i + 1;
        }
      }
      return 12; // fallback
    }

    const planetsInHouses = {};
    for (const [planet, data] of Object.entries(planets)) {
      const house = houseOf(data.longitude);
      planetsInHouses[planet] = house;
      // enrich planet with sign + house
      data.sign  = signFromLongitude(data.longitude);
      data.house = house;
    }

// ---- Angles & signs (ASC / MC / DSC / IC) ----

// Opposite angles
const descendantDeg = (ascendant + 180) % 360;
const icDeg         = (mc + 180) % 360;

// Map degrees → sign
const zodiacSigns = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
];
const signOf = (deg) => zodiacSigns[Math.floor((((deg % 360) + 360) % 360) / 30)];

// Signs for all four angles
const ascendantSign  = signOf(ascendant);
const mcSign         = signOf(mc);
const descendantSign = signOf(descendantDeg);
const icSign         = signOf(icDeg);
    // build the response payload first
    const payload = {
      success: true,
      method: 'swisseph',
      jd,
      angles: {
        ascendantDeg: ascendant,
        ascendantSign,
        mcDeg: mc,
        mcSign,
        descendantDeg,
        descendantSign,
        icDeg,
        icSign,
      },
      houses: housesDeg,     // degrees
      houseSigns,            // sign name for each cusp
      houseRulers,           // kept for compatibility (signs on cusps)
      planets,               // each has longitude, sign, house
      planetsInHouses        // compatibility
    };

    // try to persist (non-fatal if it fails)
    const savedChartId = await saveChartToDB(
      {
        name: req.body?.name ?? null,
        userEmail: req.body?.userEmail ?? null,  // <<< NEW
        city: req.body?.city ?? null,
        country: req.body?.country ?? null,
        timeAccuracy: req.body?.timeAccuracy ?? null,
        date,
        time,
        latitude,
        longitude
      },
      payload
    );// output

    // include the id (may be null if save failed)
    payload.savedChartId = savedChartId;

    // return final payload
    return res.json(payload);
  } catch (e) {
    console.error("💥 submit error:", e);
    res.status(500).json({
      ok: false,
      error: e?.message ?? "Unknown error",
      stack: e?.stack,
    });
  }
});
// ===== House rulers & planets-in-houses (compact endpoint) =====
app.post('/api/chart-houses', async (req, res) => {
  try {
    console.log('✅ /api/chart-houses route hit');

    const { date, time, latitude, longitude } = req.body || {};

    // Basic validation
    if (!date || !time || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required fields (date, time, latitude, longitude).' });
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ success: false, error: 'Invalid coordinates.' });
    }

    // Build JD (UTC) from local date/time (Europe/Berlin)
    const birthDT = DateTime.fromISO(`${date}T${time}`, { zone: 'Europe/Berlin' });
    if (!birthDT.isValid) {
      return res.status(400).json({ success: false, error: 'Invalid date or time.' });
    }
    const birthUTC = birthDT.toUTC().toJSDate();
    const jd = getJulianDayFromDate(birthUTC);

    // ---- Planet longitudes ----
    const planetCodes = {
      sun: swisseph.SE_SUN,
      moon: swisseph.SE_MOON,
      mercury: swisseph.SE_MERCURY,
      venus: swisseph.SE_VENUS,
      mars: swisseph.SE_MARS,
      jupiter: swisseph.SE_JUPITER,
      saturn: swisseph.SE_SATURN,
      uranus: swisseph.SE_URANUS,
      neptune: swisseph.SE_NEPTUNE,
      pluto: swisseph.SE_PLUTO
    };

    const planets = {};
    for (const [name, code] of Object.entries(planetCodes)) {
      const result = await new Promise((resolve, reject) => {
        swisseph.swe_calc_ut(jd, code, swisseph.SEFLG_SWIEPH, (r) => {
          if (r.error) reject(new Error(r.error)); else resolve(r);
        });
      });
      planets[name] = { longitude: normalize360(result.longitude) };
    }

    // ---- Houses (Placidus) ----
    const housesRes = await new Promise((resolve, reject) => {
      swisseph.swe_houses(jd, lat, lng, 'P', (r) => {
        if (r.error) reject(new Error(r.error)); else resolve(r);
      });
    });

    const ascendant = normalize360(housesRes.ascendant);
    const mc        = normalize360(housesRes.mc);
    const houseCusps = (housesRes.house || []).map(normalize360); // 12 cusp degrees
    // ---- Angles (ASC/MC/DSC/IC) + signs ----
    const descendantDeg = (ascendant + 180) % 360;
    const icDeg         = (mc + 180) % 360;
    const zodiacSigns = [
      "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
      "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
    ];
    const signOf = (deg) => zodiacSigns[Math.floor((((deg % 360) + 360) % 360) / 30)];
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

    // ---- Signs on cusps & traditional rulers ----
    const houseSigns  = houseCusps.map(signFromLongitude);            // e.g. "Aries"
    const houseRulers = houseSigns.map(sign => SIGN_RULER[sign] || null); // e.g. "Mars"

    // ---- planet -> house number (1..12) ----
    const planetsInHouses = {};
    Object.entries(planets).forEach(([name, { longitude }]) => {
      planetsInHouses[name] = houseOfLongitude(longitude, houseCusps);
    });

    // ---- house -> [planets...] ----
    const planetsByHouse = Array.from({ length: 12 }, () => []);
    Object.entries(planetsInHouses).forEach(([planet, h]) => {
      planetsByHouse[h - 1].push(planet);
    });

    // Enrich planets with sign + house
    for (const [name, p] of Object.entries(planets)) {
      p.sign  = signFromLongitude(p.longitude);
      p.house = planetsInHouses[name];
    }

    return res.json({
      success: true,
      jd,
      ascendant,
      mc,
      angles,
      houses: houseCusps,
      houseSigns,
      houseRulers,
      planetsInHouses,
      planetsByHouse,
      planets
    });
  } catch (error) {
    console.error('Error in /api/chart-houses:', error);
    return res.status(500).json({ success: false, error: error.message || String(error) });
  }
});
// === Save survey response ===
app.post('/api/survey-response', async (req, res) => {
  try {
    const { surveyId, chartId, userEmail, answers } = req.body;

    if (!surveyId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, error: 'Missing surveyId or answers[]' });
    }

    // Create response
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

// -------- Test endpoint ----------
app.get('/api/test', (_req, res) => {
  res.json({ message: '🎯 Swiss Ephemeris Astrology Backend is working!' });
});

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
    return res.json({ latitude: lat, longitude: lng, userEmail});
  } catch (err) {
    console.error('❌ Geocoding backend error:', err);
    return res.status(500).json({ error: 'Failed to geocode location.' });
  }
});
// --- TEMP: ping + route dump ---
app.post('/api/chart-houses/ping', (req, res) => {
  console.log('✅ /api/chart-houses/ping hit');
  res.json({ ok: true });
});
app.get('/__routes', (_req, res) => {
  const out = [];
  const stack = (app && app._router && Array.isArray(app._router.stack))
    ? app._router.stack
    : [];

  for (const layer of stack) {
    if (layer.route && layer.route.path) {
      const methods = Object.keys(layer.route.methods || {}).map(m => m.toUpperCase());
      out.push({ path: layer.route.path, methods });
    } else if (layer.name === 'router' && layer.handle && Array.isArray(layer.handle.stack)) {
      for (const sl of layer.handle.stack) {
        if (sl.route && sl.route.path) {
          const methods = Object.keys(sl.route.methods || {}).map(m => m.toUpperCase());
          out.push({ path: sl.route.path, methods });
        }
      }
    }
  }

  console.log('📜 Registered routes:', out);
  res.json(out);
});

// -------- Start server -----------
const PORT = 3001;
// POST /api/survey/submit
// Body: { userEmail: string, chartId?: string, answers: [{ questionKey: string, optionValues?: string[], answerText?: string }] }
app.post("/api/survey/submit", async (req, res) => {
  try {
console.log("submit route v2 hit", new Date().toISOString());
console.log("submit v2 body:", req.body);

    // 🆕 Convert legacy { survey: {...} } payloads into normalized form
    // 🆕 Convert legacy { survey: {...} } payloads into normalized form
const { userEmail, answers } = normalizeSurveyPayload(req.body);
const chartId = req.body?.chartId || null;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ ok: false, error: "answers[] is required" });
    }

    // 1) Create a submission (✅ use relation connect for chart)
    const submission = await prisma.surveySubmission.create({
      data: {
        userEmail: userEmail || null,
        ...(chartId ? { chart: { connect: { id: chartId } } } : {}),
      },
      select: { id: true },
    });

    let madeResponses = 0;
    let linkedOptions = 0;

    // 2) For each answer, create SurveyResponse + (option links for radio/checkbox)
    for (const a of answers) {
      if (!a?.questionKey) continue;

      // find the question by its stable key (e.g. "II.4")
      const q = await prisma.surveyQuestion.findUnique({
        where: { key: a.questionKey },
        include: { options: true },
      });
      if (!q) {
        console.warn("No question found for key:", a.questionKey);
        continue;
      }

      // create the response row (free text if provided)
      const response = await prisma.surveyResponse.create({
        data: {
          questionId: q.id,
          submissionId: submission.id,
          answerText: a.answerText ?? null,
          userId: userEmail || "anonymous",      // 👈 required by your schema
        },
        select: { id: true },
      });
      madeResponses++;

      // for radio/checkbox: link chosen options via join table
      if (Array.isArray(a.optionValues) && a.optionValues.length > 0) {
        const allowed = new Set(q.options.map(o => o.value)); // machine values from DB
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

    return res.json({
      ok: true,
      submissionId: submission.id,
      responses: madeResponses,
      optionLinks: linkedOptions,
    });
  } catch (e) {
    console.error("💥 submit error:", e);
    return res.status(500).json({ ok: false, error: e?.message ?? "Unknown error" });
  }
});



// Only start the HTTP listener if this file is run directly (node server.js)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Swiss Ephemeris backend running on http://localhost:${PORT}`);
  });
}

// Always export the Express app so require('./server.js') returns it
module.exports = app;
