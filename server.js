console.log("✅ Running server.js from:", __dirname);

const express = require('express');
const cors = require('cors');
const { DateTime } = require('luxon');
const swisseph = require('swisseph');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

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
        // You can add more fields if needed (e.g., speed, latitude, etc.)
      };
    }

    // Calculate Ascendant and houses
    const ascmc = await new Promise((resolve, reject) => {
      swisseph.swe_houses(jd, lat, lng, 'P', (res) => {
        if (res.error) reject(res.error); else resolve(res);
      });
    });
    const ascendant = ascmc.ascendant;
    const mc = ascmc.mc;
    const houses = ascmc.cusps;

    res.json({
      success: true,
      method: 'swisseph',
      jd,
      planets,
      ascendant,
      mc,
      houses
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

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Swiss Ephemeris backend running on http://localhost:${PORT}`);
});
