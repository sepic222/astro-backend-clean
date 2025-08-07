console.log("✅ Running server.js from:", __dirname);

const express = require('express');
const cors = require('cors');
const { DateTime } = require('luxon');
const swisseph = require('swisseph');

const app = express();
app.use(cors());
app.use(express.json());

// Define the Typeform Webhook route
app.post('/api/typeform-webhook', (req, res) => {
  try {
    const formData = req.body; // Typeform sends data in the request body
    console.log('Received Typeform data:', formData);

    // Send a success response back to Typeform
    res.status(200).send('Webhook received successfully!');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Error processing webhook.');
  }
});
// Set the path to your Swiss Ephemeris files
swisseph.swe_set_ephe_path(__dirname + '/ephe');

// Helper to get Julian Day from date
function getJulianDayFromDate(date) {
  return swisseph.swe_julday(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600,
    swisseph.SE_GREG_CAL
  );
}

// Main endpoint using Swiss Ephemeris for birth chart calculation
app.post('/api/birth-chart-swisseph', async (req, res) => {
  try {
    const { date, time, latitude, longitude } = req.body;
    console.log("🛬 Raw incoming coords:", { latitude, longitude });
    const birthDateTime = DateTime.fromISO(`${date}T${time}`, { zone: 'Europe/Berlin' });
    const birthDateUTC = birthDateTime.toUTC().toJSDate();
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Calculate Julian Day
    const jd = getJulianDayFromDate(birthDateUTC);

    // Calculate planet positions
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
        swisseph.swe_calc_ut(jd, code, swisseph.SEFLG_SWIEPH, (res) => {
          if (res.error) reject(res.error); else resolve(res);
        });
      });
      planets[name] = {
        longitude: result.longitude
      };
    }

    // Calculate Ascendant and houses
    console.log("🧭 JD:", jd);
    console.log("📍 Coordinates:", { lat, lng });
    const ascmc = await new Promise((resolve, reject) => {
      swisseph.swe_houses(jd, lat, lng, 'P', (res) => {
        console.log("🧪 swe_houses raw result:", res);
        if (res.error) {
          console.error("❌ swe_houses error:", res.error);
          reject(res.error);
        } else {
          resolve(res);
        }
      });
    });

    console.log("📦 ascmc structure:", Object.keys(ascmc));
    console.dir(ascmc, { depth: null });

    const ascendant = ascmc.ascendant;
    const mc = ascmc.mc;

    const houses = {};
    ascmc.house.forEach((deg, i) => {
      houses[`house${i + 1}`] = deg;
    });

    console.log("🪐 Calculated Houses:", houses);

    const zodiacSigns = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];

    const houseRulers = {};
    for (let i = 1; i <= 12; i++) {
      const deg = houses[`house${i}`];
      const index = Math.floor(deg / 30) % 12;
      houseRulers[`house${i}`] = zodiacSigns[index];
    }

   // === Calculate which house each planet is in ===
const planetsInHouses = {};
const houseCusps = ascmc.house; // array of 12 cusp degrees

for (const [planetName, data] of Object.entries(planets)) {
  const planetLon = data.longitude;
  let houseNum = 12;

  for (let i = 0; i < 12; i++) {
    const cuspStart = houseCusps[i];
    const cuspEnd = houseCusps[(i + 1) % 12]; // wrap around

    if (cuspStart < cuspEnd) {
      if (planetLon >= cuspStart && planetLon < cuspEnd) {
        houseNum = i + 1;
        break;
      }
    } else {
      // Handles the wrap-around at 360°
      if (planetLon >= cuspStart || planetLon < cuspEnd) {
        houseNum = i + 1;
        break;
      }
    }
  }

  planetsInHouses[planetName] = houseNum;
}

    res.json({
      success: true,
      method: 'swisseph',
      jd,
      planets,
      ascendant,
      mc,
      houses,
      houseRulers,
      planetsInHouses
    });
  } catch (error) {
    console.error('Swiss Ephemeris Calculation Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: '🎯 Swiss Ephemeris Astrology Backend is working!' });
});

/// Load environment variables
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

app.get('/api/geocode', async (req, res) => {
  const { city, country } = req.query;
  console.log("📩 Received geocode request:", city, country);
  // ✅ Add this debug log to inspect incoming frontend request
  console.log("📥 Geocode API hit:", { city, country });

  if (!city || !country) {
    return res.status(400).json({ error: 'City and country are required.' });
  }

  try {
    const apiKey = process.env.OPENCAGE_API_KEY;
    const query = encodeURIComponent(`${city}, ${country}`);

    // ✅ Add this to log the exact URL your server is calling
    console.log("🌍 Calling OpenCage with:", `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${apiKey}`);

    const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${apiKey}`);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ error: 'Location not found.' });
    }

    const { lat, lng } = data.results[0].geometry;

    res.json({
      latitude: lat,
      longitude: lng
    });
  } catch (err) {
    console.error('❌ Geocoding backend error:', err);
    res.status(500).json({ error: 'Failed to geocode location.' });
  }
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Swiss Ephemeris backend running on http://localhost:${PORT}`);
});