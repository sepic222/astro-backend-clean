// server.js
console.log("✅ Running server.js from:", __dirname);

const express = require('express');
const cors = require('cors');
const { DateTime } = require('luxon');
const swisseph = require('swisseph');

require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));




const app = express();
app.use(cors());
app.use(express.json());

// Health/root
app.get('/', (_req, res) => res.send('OK'));

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

    return res.json({
      success: true,
      method: 'swisseph',
      jd,
      ascendant,
      mc,
      houses: housesDeg,     // degrees
      houseSigns,            // sign name for each cusp
      houseRulers,           // kept for compatibility
      planets,               // each has longitude, sign, house
      planetsInHouses        // compatibility
    });
  } catch (error) {
    console.error('Swiss Ephemeris Calculation Error:', error);
    return res.status(500).json({ success: false, error: error.message || String(error) });
  }
});
// ===== House rulers & planets-in-houses (compact endpoint) =====
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
// -------- Test endpoint ----------
app.get('/api/test', (_req, res) => {
  res.json({ message: '🎯 Swiss Ephemeris Astrology Backend is working!' });
});

// -------- Geocoding --------------
app.get('/api/geocode', async (req, res) => {
  try {
    const { city, country } = req.query || {};
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
    return res.json({ latitude: lat, longitude: lng });
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
// -------- Start server -----------
const PORT = 3001;

// Only start the HTTP listener if this file is run directly (node server.js)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Swiss Ephemeris backend running on http://localhost:${PORT}`);
  });
}

// Always export the Express app so require('./server.js') returns it
module.exports = app;