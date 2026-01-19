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
function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
const CONTENT_DIR = path.join(__dirname, 'content', 'readings');
const SECTION_INTROS = loadJson(path.join(CONTENT_DIR, 'section_intros.json'));
const ASCENDANT_TEXT = loadJson(path.join(CONTENT_DIR, 'ascendant.json'));
const SUN_SIGN_TEXT = loadJson(path.join(CONTENT_DIR, 'sun_sign.json'));
const SUN_HOUSE_TEXT = loadJson(path.join(CONTENT_DIR, 'sun_house.json'));
const MOON_SIGN_TEXT = loadJson(path.join(CONTENT_DIR, 'moon_sign.json'));
const MOON_HOUSE_TEXT = loadJson(path.join(CONTENT_DIR, 'moon_house.json'));
const CHART_RULER_TEXT = loadJson(path.join(CONTENT_DIR, 'chart_ruler.json'));
const CHART_RULER_HOUSE_TEXT = loadJson(path.join(CONTENT_DIR, 'chart_ruler_house.json'));
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
const HOUSE_1_TEXT = loadJson(path.join(CONTENT_DIR, 'house_01.json'));
const HOUSE_2_TEXT = loadJson(path.join(CONTENT_DIR, 'house_02.json'));
const HOUSE_3_TEXT = loadJson(path.join(CONTENT_DIR, 'house_03.json'));
const HOUSE_4_TEXT = loadJson(path.join(CONTENT_DIR, 'house_04.json'));
const HOUSE_5_TEXT = loadJson(path.join(CONTENT_DIR, 'house_05.json'));
const HOUSE_6_TEXT = loadJson(path.join(CONTENT_DIR, 'house_06.json'));
const HOUSE_7_TEXT = loadJson(path.join(CONTENT_DIR, 'house_07.json'));
const HOUSE_8_TEXT = loadJson(path.join(CONTENT_DIR, 'house_08.json'));
const HOUSE_9_TEXT = loadJson(path.join(CONTENT_DIR, 'house_09.json'));
const HOUSE_10_TEXT = loadJson(path.join(CONTENT_DIR, 'house_10.json'));
const HOUSE_11_TEXT = loadJson(path.join(CONTENT_DIR, 'house_11.json'));
const HOUSE_12_TEXT = loadJson(path.join(CONTENT_DIR, 'house_12.json'));

// --- Express app (init early so routes can attach) ---
const app = express();
// CORS configuration - allow requests from Vercel frontend
const corsOptions = {
  origin: function (origin, callback) {
    const sanitize = (url) => url ? url.replace(/\/$/, '') : null;
    const allowed = [
      sanitize(process.env.FRONTEND_URL),
      sanitize(process.env.BASE_URL),
      'https://dashboard.fateflix.app',
      'https://surveyfrontend.vercel.app'
    ].filter(Boolean);

    // Allow if origin is in list, or if it's a Vercel preview, or if no origin (local/mobile)
    if (!origin || allowed.includes(origin) || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      console.warn('CORS Blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from public dir
app.use('/assets', express.static(path.join(__dirname, 'public/assets'))); // Explicitly serve assets

// --- EJS view engine setup ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// --------------------------------------------------------------
// ADMIN DASHBOARD HELPERS
// --------------------------------------------------------------
const basicAuth = (req, res, next) => {
  const user = process.env.ADMIN_USER || 'admin';
  const pass = process.env.ADMIN_PASS || 'cosmos';

  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

  if (login && password && login === user && password === pass) {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="Fateflix Admin"');
  res.status(401).send('Authentication required.');
};

function toCsv(headers, rows) {
  const headerRow = headers.join(',') + '\n';
  const dataRows = rows.map(row =>
    row.map(cell => {
      if (cell === null || cell === undefined) return '';
      const str = String(cell).replace(/"/g, '""');
      return `"${str}"`;
    }).join(',')
  ).join('\n');
  return headerRow + dataRows;
}

// --------------------------------------------------------------
// TEST SUBMISSION DETECTION
// Determines if a submission is a test vs real user submission
// --------------------------------------------------------------
const TEST_EMAIL_PATTERNS = [
  '@test.com', '@example.com', '@fateflix.app',
  'test@', 'demo@', 'admin@'
];

const FOUNDER_EMAILS = [
  'saraellenpicard@icloud.com'
];

const TEST_NAME_PATTERNS = [
  'test', 'demo', 'admin', 'asdf', 'xxx', 'aaa', 'bbb'
];

/**
 * Determines if a submission is a test submission based on multiple heuristics
 * @param {Object} submission - The submission object with email, responses, etc.
 * @param {string} username - The username/name from the survey
 * @param {string} discoverySource - How they found the survey (founder = test indicator)
 * @param {number} responseCount - Number of survey responses
 * @param {number} totalQuestions - Total number of questions in survey (default ~50)
 * @returns {Object} { isTest: boolean, reason: string }
 */
function isTestSubmission(submission, username = '', discoverySource = '', responseCount = 0, totalQuestions = 50) {
  const email = (submission?.userEmail || '').toLowerCase();
  const nameLower = (username || '').toLowerCase().trim();

  // Check for test email patterns
  for (const pattern of TEST_EMAIL_PATTERNS) {
    if (email.includes(pattern.toLowerCase())) {
      return { isTest: true, reason: `Email matches test pattern: ${pattern}` };
    }
  }

  // Check for founder emails - but allow if 90%+ of survey answered
  const completionRate = totalQuestions > 0 ? (responseCount / totalQuestions) : 0;
  for (const founderEmail of FOUNDER_EMAILS) {
    if (email === founderEmail.toLowerCase()) {
      if (completionRate < 0.9) {
        return { isTest: true, reason: `Founder email with ${Math.round(completionRate * 100)}% completion` };
      }
      // Founder with 90%+ completion = real submission
    }
  }

  // Check for test name patterns
  for (const pattern of TEST_NAME_PATTERNS) {
    if (nameLower === pattern || nameLower.startsWith(pattern + ' ') || nameLower.includes(pattern)) {
      return { isTest: true, reason: `Name matches test pattern: ${pattern}` };
    }
  }

  // Check discovery source
  if (discoverySource && discoverySource.toLowerCase() === 'founder') {
    // Founder discovery could still be real if survey mostly completed
    if (completionRate < 0.5) {
      return { isTest: true, reason: 'Found via founder with low completion' };
    }
  }

  // Very short names often indicate test
  if (nameLower.length > 0 && nameLower.length <= 2) {
    return { isTest: true, reason: 'Name too short (likely test)' };
  }

  return { isTest: false, reason: 'Appears to be real user' };
}


app.use('/admin', basicAuth);

app.get('/admin/dashboard', async (req, res) => {
  try {
    const filterType = req.query.type || 'all'; // 'all', 'test', 'real'

    const totalSubmissions = await prisma.surveySubmission.count();
    const totalReadings = await prisma.reading.count();
    const totalResponses = await prisma.surveyResponse.count();

    // First, get ALL submissions for accurate test/real counts (lightweight query)
    const allSubmissionsForCount = await prisma.surveySubmission.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userEmail: true,
        _count: { select: { responses: true } },
        responses: {
          where: {
            question: { key: { in: ['username', 'fit.found_survey'] } }
          },
          select: { answerText: true, question: { select: { key: true } } }
        }
      }
    });

    // Calculate test/real counts from ALL submissions
    let totalTestCount = 0;
    let totalRealCount = 0;
    for (const s of allSubmissionsForCount) {
      let username = '';
      let discoverySource = '';
      for (const resp of s.responses || []) {
        if (resp.question?.key === 'username') username = resp.answerText || '';
        if (resp.question?.key === 'fit.found_survey') discoverySource = resp.answerText || '';
      }
      const testResult = isTestSubmission(s, username, discoverySource, s._count?.responses || 0, 50);
      if (testResult.isTest) totalTestCount++;
      else totalRealCount++;
    }

    // Fetch recent submissions with full data for display (limit for performance)
    const submissions = await prisma.surveySubmission.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { responses: true } },
        chart: { select: { id: true, risingSign: true, sunSign: true, moonSign: true } },
        responses: {
          where: { question: { key: { in: ['username', 'discovery', 'fit.found_survey'] } } },
          include: { question: { select: { key: true } } }
        }
      }
    });

    // Fetch readings for displayed submissions
    const submissionIds = submissions.map(s => s.id);
    const readings = await prisma.reading.findMany({
      where: { submissionId: { in: submissionIds } },
      select: { submissionId: true, id: true }
    });
    const readingMap = new Map(readings.map(r => [r.submissionId, r.id]));

    // Process submissions with test detection
    let processedSubmissions = submissions.map(s => {
      let username = '';
      let discoverySource = '';
      for (const resp of s.responses || []) {
        if (resp.question?.key === 'username') username = resp.answerText || '';
        if (resp.question?.key === 'fit.found_survey' || resp.question?.key === 'discovery') {
          discoverySource = resp.answerText || '';
        }
      }
      const testResult = isTestSubmission(s, username, discoverySource, s._count?.responses || 0, 50);
      return {
        ...s,
        readingId: readingMap.get(s.id) || null,
        username,
        discoverySource,
        isTest: testResult.isTest,
        testReason: testResult.reason,
        risingSign: s.chart?.risingSign || null,
        sunSign: s.chart?.sunSign || null,
        moonSign: s.chart?.moonSign || null
      };
    });

    // Apply filter to displayed submissions
    if (filterType === 'test') {
      processedSubmissions = processedSubmissions.filter(s => s.isTest);
    } else if (filterType === 'real') {
      processedSubmissions = processedSubmissions.filter(s => !s.isTest);
    }

    res.render('admin_dashboard', {
      stats: {
        totalSubmissions,
        totalReadings,
        totalResponses,
        testSubmissions: totalTestCount,
        realSubmissions: totalRealCount
      },
      submissions: processedSubmissions,
      currentFilter: filterType
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).send('Server Error');
  }
});

// --- ADMIN API ROUTES (for AJAX refresh) ---
app.get('/admin/api/stats', async (req, res) => {
  try {
    const totalSubmissions = await prisma.surveySubmission.count();
    const totalReadings = await prisma.reading.count();
    const totalResponses = await prisma.surveyResponse.count();

    res.json({
      totalSubmissions,
      totalReadings,
      totalResponses,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Stats API Error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// --- ADMIN DATA VIEW (Spreadsheet-style 2D table) ---
app.get('/admin/data', async (req, res) => {
  try {
    const filterType = req.query.type || 'all';

    // Get all unique question keys for columns
    const questions = await prisma.surveyQuestion.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, key: true, text: true }
    });

    // Fetch all submissions with all responses
    const submissions = await prisma.surveySubmission.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        chart: {
          select: { risingSign: true, sunSign: true, moonSign: true }
        },
        responses: {
          include: {
            question: { select: { key: true } },
            responseOptions: {
              include: { option: { select: { label: true, value: true } } }
            }
          }
        }
      }
    });

    // Process each submission into a row
    const rows = submissions.map(sub => {
      // Create answer map for this submission
      const answerMap = {};
      let username = '';
      let discoverySource = '';

      for (const resp of sub.responses) {
        const key = resp.question?.key;
        if (!key) continue;

        let answer = resp.answerText || '';

        // Handle responseOptions (checkbox answers stored via junction table)
        if (resp.responseOptions && resp.responseOptions.length > 0) {
          answer = resp.responseOptions.map(ro => ro.option.label || ro.option.value).join('; ');
        }
        // Handle JSON objects/arrays stored in answerText (checkbox multi-select)
        else if (answer && typeof answer === 'string') {
          try {
            const parsed = JSON.parse(answer);
            if (Array.isArray(parsed)) {
              answer = parsed.join('; ');
            } else if (typeof parsed === 'object' && parsed !== null) {
              // Handle {selected: [...], otherText: '...'} format
              if (parsed.selected && Array.isArray(parsed.selected)) {
                answer = parsed.selected.join('; ');
                if (parsed.otherText) answer += '; ' + parsed.otherText;
              } else {
                answer = JSON.stringify(parsed);
              }
            }
          } catch (e) {
            // Not JSON, keep original string
          }
        } else if (typeof answer === 'object' && answer !== null) {
          // Handle case where answer is already an object (not stringified)
          if (Array.isArray(answer)) {
            answer = answer.join('; ');
          } else if (answer.selected && Array.isArray(answer.selected)) {
            answer = answer.selected.join('; ');
            if (answer.otherText) answer += '; ' + answer.otherText;
          } else {
            answer = JSON.stringify(answer);
          }
        }

        answerMap[key] = answer;

        if (key === 'username') username = answer;
        if (key === 'fit.found_survey' || key === 'discovery') discoverySource = answer;
      }

      const testResult = isTestSubmission(sub, username, discoverySource, sub.responses.length, 50);

      return {
        id: sub.id,
        createdAt: sub.createdAt,
        userEmail: sub.userEmail || '',
        isTest: testResult.isTest,
        testReason: testResult.reason,
        risingSign: sub.chart?.risingSign || '',
        sunSign: sub.chart?.sunSign || '',
        moonSign: sub.chart?.moonSign || '',
        responseCount: sub.responses.length,
        answers: answerMap
      };
    });

    // Apply filter
    let filteredRows = rows;
    if (filterType === 'test') {
      filteredRows = rows.filter(r => r.isTest);
    } else if (filterType === 'real') {
      filteredRows = rows.filter(r => !r.isTest);
    }

    // Define question order matching the frontend survey (surveyData.js)
    const SURVEY_QUESTION_ORDER = [
      'username', 'date', 'time', 'time_accuracy', 'city', 'latitude', 'longitude',
      'gender', 'attraction_style', 'cine_level', 'life_role', 'escapism_style',
      'top_3_movies', 'first_crush',
      'watch_habit', 'fav_era', 'culture_background', 'environment_growing_up',
      'first_feeling', 'life_changing', 'comfort_watch', 'power_watch', 'date_impress',
      'movie_universe', 'villain_relate', 'forever_crush', 'crave_most',
      'tv_taste', 'top_3_series_detailed', 'cinematography', 'directors', 'access_growing_up',
      'genres_love', 'turn_offs', 'hated_film', 'hype_style',
      'character_match',
      'foreign_films',
      'selection_method', 'discovery_apps', 'discovery', 'email', 'beta_test', 'open_feedback'
    ];

    // Order questions according to survey order
    const questionMap = new Map(questions.map(q => [q.key, q]));
    const orderedQuestions = [];
    for (const key of SURVEY_QUESTION_ORDER) {
      if (questionMap.has(key)) {
        orderedQuestions.push(questionMap.get(key));
      }
    }
    // Add any remaining questions not in our predefined list
    for (const q of questions) {
      if (!SURVEY_QUESTION_ORDER.includes(q.key)) {
        orderedQuestions.push(q);
      }
    }

    res.render('admin_data', {
      rows: filteredRows,
      questions: orderedQuestions,
      allQuestions: orderedQuestions,
      currentFilter: filterType,
      testCount: rows.filter(r => r.isTest).length,
      realCount: rows.filter(r => !r.isTest).length,
      totalCount: rows.length
    });
  } catch (error) {
    console.error('Data View Error:', error);
    res.status(500).send('Server Error: ' + error.message);
  }
});


app.get('/admin/export', async (req, res) => {
  try {
    // Define question order matching the frontend survey (surveyData.js)
    const SURVEY_QUESTION_ORDER = [
      'username', 'date', 'time', 'time_accuracy', 'city', 'latitude', 'longitude',
      'gender', 'attraction_style', 'cine_level', 'life_role', 'escapism_style',
      'top_3_movies', 'first_crush',
      'watch_habit', 'fav_era', 'culture_background', 'environment_growing_up',
      'first_feeling', 'life_changing', 'comfort_watch', 'power_watch', 'date_impress',
      'movie_universe', 'villain_relate', 'forever_crush', 'crave_most',
      'tv_taste', 'top_3_series_detailed', 'cinematography', 'directors', 'access_growing_up',
      'genres_love', 'turn_offs', 'hated_film', 'hype_style',
      'character_match',
      'foreign_films',
      'selection_method', 'discovery_apps', 'discovery', 'email', 'beta_test', 'open_feedback'
    ];

    // Get all unique question keys from database
    const dbQuestions = await prisma.surveyQuestion.findMany({
      select: { id: true, key: true, text: true }
    });
    const dbQuestionMap = new Map(dbQuestions.map(q => [q.key, q]));

    // Build ordered question list: survey order first, then any extras from DB
    const orderedQuestions = [];
    for (const key of SURVEY_QUESTION_ORDER) {
      if (dbQuestionMap.has(key)) {
        orderedQuestions.push(dbQuestionMap.get(key));
        dbQuestionMap.delete(key);
      }
    }
    // Add any remaining questions not in our predefined list
    for (const q of dbQuestionMap.values()) {
      orderedQuestions.push(q);
    }

    const submissions = await prisma.surveySubmission.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        responses: {
          include: {
            question: { select: { key: true } },
            responseOptions: {
              include: { option: { select: { label: true, value: true } } }
            }
          }
        },
        chart: true
      }
    });

    // Build headers: fixed columns + one per question
    const fixedHeaders = ['Submission ID', 'Date', 'User Email', 'Type', 'Responses Count', 'Reading ID', 'Ascendant', 'Sun', 'Moon'];
    const questionHeaders = orderedQuestions.map(q => q.key);
    const headers = [...fixedHeaders, ...questionHeaders];

    const rows = [];

    // Helper to parse JSON answer values
    const parseAnswer = (answerText, responseOptions) => {
      if (responseOptions && responseOptions.length > 0) {
        return responseOptions.map(ro => ro.option.label || ro.option.value).join('; ');
      }

      let answer = answerText || '';
      if (answer && typeof answer === 'string') {
        try {
          const parsed = JSON.parse(answer);
          if (Array.isArray(parsed)) {
            return parsed.join('; ');
          } else if (typeof parsed === 'object' && parsed !== null) {
            if (parsed.selected && Array.isArray(parsed.selected)) {
              let result = parsed.selected.join('; ');
              if (parsed.otherText) result += '; ' + parsed.otherText;
              return result;
            }
          }
        } catch (e) {
          // Not JSON, keep original string
        }
      }
      return answer;
    };

    for (const sub of submissions) {
      // Look up reading
      const reading = await prisma.reading.findUnique({ where: { submissionId: sub.id } });

      // Build answer map for this submission
      const answerMap = {};
      let username = '';
      let discoverySource = '';

      for (const resp of sub.responses) {
        const key = resp.question?.key;
        if (!key) continue;
        answerMap[key] = parseAnswer(resp.answerText, resp.responseOptions);

        if (key === 'username') username = answerMap[key];
        if (key === 'fit.found_survey' || key === 'discovery') discoverySource = answerMap[key];
      }

      // Determine if test submission
      const testResult = isTestSubmission(sub, username, discoverySource, sub.responses.length, 50);

      // Fixed columns
      const row = [
        sub.id,
        sub.createdAt.toISOString(),
        sub.userEmail || '',
        testResult.isTest ? 'Test' : 'Real',
        sub.responses.length,
        reading ? reading.id : '',
        sub.chart ? (sub.chart.risingSign || sub.chart.ascendant || '') : '',
        sub.chart ? (sub.chart.sunSign || '') : '',
        sub.chart ? (sub.chart.moonSign || '') : ''
      ];

      // Add one column per question
      for (const q of orderedQuestions) {
        row.push(answerMap[q.key] || '');
      }

      rows.push(row);
    }

    const csvContent = toCsv(headers, rows);
    res.header('Content-Type', 'text/csv');
    res.attachment(`fateflix_export_${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csvContent);

  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).send('Export Failed');
  }
});
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

// --- email helper ---------------------------------------------
const fetch = require('node-fetch');
const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
const LOOPS_TRANSACTIONAL_ID = process.env.LOOPS_TRANSACTIONAL_ID;

if (!LOOPS_API_KEY) {
  console.warn('⚠️ LOOPS_API_KEY missing — Email features disabled.');
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const MOCK_DB = {
  'dev-badge-test': {
    submissionId: 'dev-badge-test',
    reading: {
      id: 'mock-reading-1',
      submissionId: 'dev-badge-test',
      createdAt: new Date('2025-11-30'),
      birthDate: new Date('1990-06-15'),
      birthTime: '14:30',
      birthCity: 'Los Angeles',
      birthCountry: 'USA',
      username: 'cosmic-tester',
      userEmail: 'test@fateflix.app',
      chartId: 'mock-chart-1'
    },
    chart: {
      id: 'mock-chart-1',
      chartRulerPlanet: 'Mercury',
      chartRulerHouse: 3,
      rawChart: {
        angles: {
          ascendantSign: 'Gemini',
          ascendantDeg: 95.5,
          mcSign: 'Aquarius',
          mcDeg: 305.2
        },
        planets: {
          sun: { longitude: 84.3, sign: 'Gemini', house: 12 },
          moon: { longitude: 225.7, sign: 'Scorpio', house: 5 },
          mercury: { longitude: 95.2, sign: 'Cancer', house: 1 },
          venus: { longitude: 62.8, sign: 'Taurus', house: 11 },
          mars: { longitude: 157.4, sign: 'Virgo', house: 3 },
          jupiter: { longitude: 198.9, sign: 'Libra', house: 4 },
          saturn: { longitude: 280.1, sign: 'Capricorn', house: 7 },
          uranus: { longitude: 12.5, sign: 'Aries', house: 10 },
          neptune: { longitude: 305.8, sign: 'Aquarius', house: 8 },
          pluto: { longitude: 230.2, sign: 'Scorpio', house: 5 }
        }
      }
    }
  },
  'no-time-test': {
    submissionId: 'no-time-test',
    reading: {
      id: 'mock-reading-notime',
      submissionId: 'no-time-test',
      createdAt: new Date('2025-11-30'),
      birthDate: new Date('1995-03-20'),
      birthTime: null, // No time provided
      birthCity: 'New York',
      birthCountry: 'USA',
      username: 'mystery-user',
      userEmail: 'notime@fateflix.app',
      chartId: 'mock-chart-notime'
    },
    chart: {
      id: 'mock-chart-notime',
      chartRulerPlanet: null,
      chartRulerHouse: null,
      rawChart: {
        angles: {
          ascendantSign: null, // No ascendant without birth time
          ascendantDeg: null,
          mcSign: null,
          mcDeg: null
        },
        planets: {
          sun: { longitude: 359.5, sign: 'Pisces', house: null },
          moon: { longitude: 145.2, sign: 'Leo', house: null },
          mercury: { longitude: 15.8, sign: 'Aries', house: null },
          venus: { longitude: 330.4, sign: 'Aquarius', house: null },
          mars: { longitude: 195.6, sign: 'Libra', house: null },
          jupiter: { longitude: 245.1, sign: 'Sagittarius', house: null },
          saturn: { longitude: 310.7, sign: 'Pisces', house: null },
          uranus: { longitude: 280.3, sign: 'Capricorn', house: null },
          neptune: { longitude: 295.9, sign: 'Capricorn', house: null },
          pluto: { longitude: 225.4, sign: 'Scorpio', house: null }
        }
      }
    }
  },
  'bonn-test-1982': {
    submissionId: 'bonn-test-1982',
    reading: {
      id: 'mock-reading-bonn',
      submissionId: 'bonn-test-1982',
      createdAt: new Date('2025-11-30'),
      birthDate: new Date('1982-08-18'),
      birthTime: '18:54',
      birthCity: 'Bonn',
      birthCountry: 'Germany',
      username: 'test-user-bonn',
      userEmail: 'bonn-test@fateflix.app',
      chartId: 'mock-chart-bonn'
    },
    chart: {
      id: 'mock-chart-bonn',
      chartRulerPlanet: 'Saturn',
      chartRulerHouse: 8,
      rawChart: {
        angles: {
          ascendantSign: 'Capricorn',
          ascendantDeg: 285.4888995786447,
          mcSign: 'Scorpio',
          mcDeg: 229.77153166523078,
          descendantSign: 'Cancer',
          descendantDeg: 105.48889957864469,
          icSign: 'Taurus',
          icDeg: 49.77153166523078
        },
        houses: [285.4888995786447, 338.93384852657005, 22.673947650902537, 49.77153166523078, 69.22821693280252, 86.35102604567419, 105.48889957864469, 158.93384852657005, 202.67394765090253, 229.77153166523078, 249.22821693280255, 266.3510260456742],
        houseSigns: ['Capricorn', 'Pisces', 'Aries', 'Taurus', 'Gemini', 'Gemini', 'Cancer', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Sagittarius'],
        houseRulers: {
          house1: 'Capricorn',
          house2: 'Pisces',
          house3: 'Aries',
          house4: 'Taurus',
          house5: 'Gemini',
          house6: 'Gemini',
          house7: 'Cancer',
          house8: 'Virgo',
          house9: 'Libra',
          house10: 'Scorpio',
          house11: 'Sagittarius',
          house12: 'Sagittarius'
        },
        planets: {
          sun: { longitude: 145.41043944635712, sign: 'Leo', house: 7 },
          moon: { longitude: 139.8000428306842, sign: 'Leo', house: 7 },
          mercury: { longitude: 166.72771491453616, sign: 'Virgo', house: 8 },
          venus: { longitude: 125.17743111170672, sign: 'Leo', house: 7 },
          mars: { longitude: 218.99814015479816, sign: 'Scorpio', house: 9 },
          jupiter: { longitude: 214.17640464582973, sign: 'Scorpio', house: 9 },
          saturn: { longitude: 198.40904525059474, sign: 'Libra', house: 8 },
          uranus: { longitude: 240.6132970847294, sign: 'Sagittarius', house: 10 },
          neptune: { longitude: 264.3617600209152, sign: 'Sagittarius', house: 11 },
          pluto: { longitude: 204.6797242230068, sign: 'Libra', house: 9 }
        }
      }
    }
  }
}; // In-memory cache for testing without DB
const { readingHtmlHandler, readingSvgHandler, chartSvgAlias } = require('./server/readingRoutes');
// ---- helpers -------------------------------------------------
function normalize360(val) {
  let x = Number(val);
  if (!Number.isFinite(x)) return NaN;
  x = x % 360;
  if (x < 0) x += 360;
  return x;
}

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
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

// Helper to safely pick from a map
function pick(map, key, fallback = '') {
  if (!map || typeof map !== 'object') return fallback;
  return map[key] ?? fallback;
}

// Builds the reading text using your JSON blocks
function buildReadingFromContent(chartDto) {
  // chartDto should contain: ascendantSign, sunSign, sunHouse, chartRulerPlanet, chartRulerHouse, etc.
  const ascSign = chartDto.ascendantSign || chartDto.risingSign || '';
  const sunSign = chartDto.sunSign || '';
  const sunHouse = String(chartDto.sunHouse || '');
  const moonSign = chartDto.moonSign || (chartDto.planets?.moon?.sign || '');
  const moonHouse = String(chartDto.moonHouse || (chartDto.planets?.moon?.house || ''));

  const parts = [];

  // Summary (optional intro)
  if (SECTION_INTROS.summary) parts.push(SECTION_INTROS.summary.trim());

  // Ascendant section
  if (SECTION_INTROS.ascendant) parts.push(SECTION_INTROS.ascendant.trim());
  parts.push(pick(ASCENDANT_TEXT, ascSign, ''));

  // Chart ruler
  if (SECTION_INTROS.chart_ruler) parts.push(SECTION_INTROS.chart_ruler.trim());
  const chartRulerPlanet = chartDto.chartRulerPlanet || '';
  const chartRulerHouse = String(chartDto.chartRulerHouse || '');
  if (chartRulerPlanet) {
    // chart_ruler.json now uses zodiac sign names as keys (e.g., "Aries", "Taurus")
    // We need to get the sign that the chart ruler planet is IN
    const chartRulerPlanetLower = chartRulerPlanet.toLowerCase();
    const chartRulerSign = chartDto[`${chartRulerPlanetLower}Sign`] || chartDto.planets?.[chartRulerPlanetLower]?.sign || '';

    if (chartRulerSign) {
      const rulerText = pick(CHART_RULER_TEXT, chartRulerSign, '');
      if (rulerText) parts.push(rulerText);
    }
  }
  if (chartRulerHouse) {
    parts.push(pick(CHART_RULER_HOUSE_TEXT, chartRulerHouse, ''));
  }

  // Sun sign
  if (SECTION_INTROS.sun_sign) parts.push(SECTION_INTROS.sun_sign.trim());
  parts.push(pick(SUN_SIGN_TEXT, sunSign, ''));

  // Sun house
  if (SECTION_INTROS.sun_house) parts.push(SECTION_INTROS.sun_house.trim());
  parts.push(pick(SUN_HOUSE_TEXT, sunHouse, ''));

  // Moon sign
  if (SECTION_INTROS.moon_sign) parts.push(SECTION_INTROS.moon_sign.trim());
  parts.push(pick(MOON_SIGN_TEXT, moonSign, ''));

  // Moon house
  if (SECTION_INTROS.moon_house) parts.push(SECTION_INTROS.moon_house.trim());
  parts.push(pick(MOON_HOUSE_TEXT, moonHouse, ''));

  // Mercury → Pluto
  const PLANETS = [
    ['mercury', MERCURY_SIGN_TEXT, MERCURY_HOUSE_TEXT],
    ['venus', VENUS_SIGN_TEXT, VENUS_HOUSE_TEXT],
    ['mars', MARS_SIGN_TEXT, MARS_HOUSE_TEXT],
    ['jupiter', JUPITER_SIGN_TEXT, JUPITER_HOUSE_TEXT],
    ['saturn', SATURN_SIGN_TEXT, SATURN_HOUSE_TEXT],
    ['uranus', URANUS_SIGN_TEXT, URANUS_HOUSE_TEXT],
    ['neptune', NEPTUNE_SIGN_TEXT, NEPTUNE_HOUSE_TEXT],
    ['pluto', PLUTO_SIGN_TEXT, PLUTO_HOUSE_TEXT],
  ];

  for (const [name, SIGN_TEXT, HOUSE_TEXT] of PLANETS) {
    const signVal = chartDto[`${name}Sign`] || chartDto.planets?.[name]?.sign || '';
    const houseVal = String(chartDto[`${name}House`] || chartDto.planets?.[name]?.house || '');
    if (SECTION_INTROS[`${name}_sign`]) parts.push(SECTION_INTROS[`${name}_sign`].trim());
    parts.push(pick(SIGN_TEXT, signVal, ''));
    if (SECTION_INTROS[`${name}_house`]) parts.push(SECTION_INTROS[`${name}_house`].trim());
    parts.push(pick(HOUSE_TEXT, houseVal, ''));
  }

  return parts.filter(Boolean).join('\n\n');
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

// --- sending email helper -------------------------------------
async function sendReadingEmail(email, submissionId, username) {
  if (!LOOPS_API_KEY || !email) return;

  const rawBaseUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:4321';
  const baseUrl = rawBaseUrl.replace(/\/$/, '');
  const readingUrl = `${baseUrl}/reading/${submissionId}`;

  try {
    const response = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transactionalId: LOOPS_TRANSACTIONAL_ID,
        email: email,
        dataVariables: {
          'ff-link': readingUrl,
          'name': username || "Film Buff"
        }
      })
    });

    const result = await response.json();
    console.log('📧 Loops.so API Response:', JSON.stringify(result, null, 2));

    if (response.ok && (result.success || result.status === 'success')) {
      console.log(`✅ Email sent via Loops to ${email}`);
    } else {
      console.error('🟥 Loops email failure:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('🟥 Error sending email via Loops:', error.message);
  }
}




function buildBadgeHtml_OLD(reading) {
  const creationDate = reading.createdAt
    ? new Date(reading.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Unknown Date';
  const submissionID = reading.submissionId || reading.id || 'N/A';

  return `
    <style>
      .badge-container {
        width: 320px;
        max-width: 100%;
        background-color: #fff;
        border-radius: 25px;
        overflow: hidden;
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25), 0 5px 10px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        position: relative;
        transform-style: preserve-3d;
        animation: badge-float 3s ease-in-out infinite;
        margin: 0 auto 30px auto;
        font-family: 'Open Sans', sans-serif;
      }
      @keyframes badge-float {
        0% { transform: translateY(0) rotateX(0deg) rotateY(0deg); }
        50% { transform: translateY(-5px) rotateX(0.5deg) rotateY(-0.5deg); }
        100% { transform: translateY(0) rotateX(0deg) rotateY(0deg); }
      }
      .badge-header {
        flex: 0 0 55%;
        background: linear-gradient(135deg, #a8edea 0%, #fcd8d8 20%, #fbc6be 40%, #fff8b6 60%, #c1d5f5 80%, #a8edea 100%);
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 20px;
        text-align: center;
        color: #333;
        border-bottom: 2px dashed rgba(0, 0, 0, 0.1);
        box-sizing: border-box;
      }
      .badge-planet-icon {
        width: 40px;
        height: 40px;
        margin-bottom: 10px;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23333"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm0-16c-3.309 0-6 2.691-6 6h12c0-3.309-2.691-6-6-6z"/></svg>');
        background-size: contain;
        background-repeat: no-repeat;
        filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));
      }
      .badge-logo {
        font-family: 'SF Pro Display', 'Futura', sans-serif;
        font-weight: 700;
        font-size: 2.5em;
        letter-spacing: 2px;
        margin-bottom: 5px;
        text-transform: uppercase;
        text-shadow: 0 2px 4px rgba(0,0,0,0.15);
      }
      .badge-subheader {
        font-size: 0.9em;
        margin-bottom: 5px;
        font-weight: 700;
      }
      .badge-slogan {
        font-size: 0.8em;
        margin-bottom: 10px;
        max-width: 80%;
        line-height: 1.3;
      }
      .badge-est {
        font-size: 0.7em;
        font-weight: 700;
        margin-bottom: 5px;
        letter-spacing: 0.5px;
      }
      .badge-future-text {
        font-size: 0.7em;
        max-width: 80%;
      }
      .badge-body {
        flex: 1;
        background-color: #f8f8f8;
        padding: 20px;
        color: #333;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        box-sizing: border-box;
        font-size: 0.85em;
      }
      .badge-field-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      .badge-field-label {
        font-weight: 700;
        color: #555;
        text-transform: uppercase;
        font-size: 0.75em;
        letter-spacing: 0.5px;
      }
      .badge-field-value {
        font-weight: 400;
        color: #333;
        text-align: right;
        border-bottom: 1px solid #ccc;
        padding-bottom: 2px;
        flex-grow: 1;
        margin-left: 10px;
      }
      .badge-section-title {
        font-weight: 700;
        text-transform: uppercase;
        font-size: 0.9em;
        margin-bottom: 15px;
        color: #333;
        border-bottom: 1px solid #ccc;
        padding-bottom: 5px;
      }
      .badge-admit-one {
        font-weight: 700;
        font-size: 1.1em;
        text-align: center;
        margin: 15px 0;
        letter-spacing: 1px;
        color: #333;
      }
      .badge-footer-text {
        font-size: 0.65em;
        text-align: center;
        color: #555;
        line-height: 1.4;
        margin-top: auto;
        padding-top: 10px;
        border-top: 1px dashed rgba(0, 0, 0, 0.1);
      }
      .badge-cosmic-approval {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 5px;
      }
      .badge-cosmic-approval .badge-field-value {
        border-bottom: none;
        margin-left: 5px;
        text-align: left;
        flex-grow: 0;
      }
      .badge-cosmic-icon {
        width: 20px;
        height: 20px;
        margin-left: 5px;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23555"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zM12 6.5c-.276 0-.5.224-.5.5s.224.5.5.5.5-.224.5-.5-.224-.5-.5-.5zm0 2c-.276 0-.5.224-.5.5s.224.5.5.5.5-.224.5-.5-.224-.5-.5-.5zm0 2c-.276 0-.5.224-.5.5s.224.5.5.5.5-.224.5-.5-.224-.5-.5-.5zm-3.5 1c-.276 0-.5.224-.5.5s.224.5.5.5.5-.224.5-.5-.224-.5-.5-.5zm7 0c-.276 0-.5.224-.5.5s.224.5.5.5.5-.224.5-.5-.224-.5-.5-.5zM12 14c-1.381 0-2.5 1.119-2.5 2.5h5c0-1.381-1.119-2.5-2.5-2.5z"/></svg>');
        background-size: contain;
        background-repeat: no-repeat;
        opacity: 0.7;
      }
    </style>
    <div class="badge-container">
      <div class="badge-header">
        <div class="badge-planet-icon"></div>
        <div class="badge-logo">FATEFLIX</div>
        <div class="badge-subheader">+ EARLY ACCESS BADGE</div>
        <p class="badge-slogan">You had taste before<br>the app even dropped.</p>
        <div class="badge-est">EST. 2025</div>
        <p class="badge-future-text">The Future of Intuitive Entertainment</p>
      </div>
      <div class="badge-body">
        <div class="badge-section-title">EVENT: FATEFLIX SURVEY COMPLETION</div>
        <div class="badge-field-row">
          <span class="badge-field-label">DATE:</span>
          <span class="badge-field-value">${creationDate}</span>
        </div>
        <div class="badge-field-row">
          <span class="badge-field-label">TASTE LEVEL A</span>
          <span class="badge-field-value">COSMIC CURATOR</span>
        </div>
        <div class="badge-field-row">
          <span class="badge-field-label">CATEGORY</span>
          <span class="badge-field-value">ALPHA TESTER</span>
        </div>
        <div class="badge-field-row">
          <span class="badge-field-label">SUBMISSION ID</span>
          <span class="badge-field-value">${submissionID}</span>
        </div>
        <div class="badge-admit-one">ADMIT ONE — UNIVERSE: CINEMATIC</div>
        <div class="badge-footer-text">
          UNAUTHORIZED RESALE PROHIBITED
          <div class="badge-cosmic-approval">
            <span class="badge-field-value">COSMIC APPROVAL GRANTED BY FATEFLIX</span>
            <div class="badge-cosmic-icon"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------
// CHART WHEEL HTML BUILDER
// --------------------------------------------------------------
const PLANET_SYMBOLS = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '⛢', neptune: '♆', pluto: '♇'
};

function buildChartWheelHtml(chartDTO) {
  // Convert chartDTO.planets to the format expected by the chart wheel
  const planets = chartDTO.planets || {};
  const planetData = Object.entries(planets).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    symbol: PLANET_SYMBOLS[name] || '?',
    degree: data.longitude || 0
  }));

  // Calculate aspects between planets
  const aspectData = [];
  const planetList = Object.entries(planets);

  for (let i = 0; i < planetList.length; i++) {
    for (let j = i + 1; j < planetList.length; j++) {
      const [name1, data1] = planetList[i];
      const [name2, data2] = planetList[j];
      const deg1 = data1.longitude || 0;
      const deg2 = data2.longitude || 0;

      // Calculate angular distance
      let diff = Math.abs(deg1 - deg2);
      if (diff > 180) diff = 360 - diff;

      // Check for major aspects (with 8-degree orb)
      const orb = 8;
      let aspectType = null;

      if (Math.abs(diff - 0) <= orb) aspectType = 'Conjunction';
      else if (Math.abs(diff - 60) <= orb) aspectType = 'Sextile';
      else if (Math.abs(diff - 90) <= orb) aspectType = 'Square';
      else if (Math.abs(diff - 120) <= orb) aspectType = 'Trine';
      else if (Math.abs(diff - 180) <= orb) aspectType = 'Opposition';

      if (aspectType) {
        aspectData.push({
          p1: name1.charAt(0).toUpperCase() + name1.slice(1),
          p2: name2.charAt(0).toUpperCase() + name2.slice(1),
          type: aspectType
        });
      }
    }
  }

  const planetDataJson = JSON.stringify(planetData);
  const aspectDataJson = JSON.stringify(aspectData);

  return `
    <style>
      .chart-wheel-container {
        width: 100%;
        max-width: 100%;
        margin: 0 auto;
        opacity: 1;
      }
      .chart-wheel-logo-text {
        font-size: 28px;
        letter-spacing: 0.35em;
        font-weight: 200;
        opacity: 0.95;
        fill: white;
        text-anchor: middle;
        dominant-baseline: middle;
      }
    </style>
    <div id="chart-wheel-root" class="chart-wheel-container"></div>
    <script>
    (function() {
      // --- CORE GEOMETRY FUNCTIONS ---
      const degToRad = (deg) => (deg * Math.PI) / 180;
      
      const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
        const angleInRadians = degToRad(angleInDegrees - 90);
        return {
          x: centerX + radius * Math.cos(angleInRadians),
          y: centerY + radius * Math.sin(angleInRadians)
        };
      };

      const htmlHead = '<link rel="preconnect" href="https://fonts.googleapis.com">' +
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
        '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500&display=swap" rel="stylesheet">' +
        '<style>' +
          '.chart-wheel-logo-text {' +
            "font-family: 'Inter', sans-serif;" +
            'text-transform: uppercase;' +
          '}' +
        '</style>';

      const describeArc = (x, y, innerRadius, outerRadius, startAngle, endAngle) => {
        if (endAngle - startAngle >= 360) endAngle = startAngle + 359.99;
        
        const start = polarToCartesian(x, y, outerRadius, endAngle);
        const end = polarToCartesian(x, y, outerRadius, startAngle);
        const startInner = polarToCartesian(x, y, innerRadius, endAngle);
        const endInner = polarToCartesian(x, y, innerRadius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        return [
          "M", start.x, start.y,
          "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
          "L", endInner.x, endInner.y,
          "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
          "Z"
        ].join(" ");
      };

      // --- CONSTANTS AND DIMENSIONS ---
      const ZODIACS = [
        { name: 'Aries', symbol: '♈︎' }, { name: 'Pisces', symbol: '♓︎' },
        { name: 'Aquarius', symbol: '♒︎' }, { name: 'Capricorn', symbol: '♑︎' },
        { name: 'Sagittarius', symbol: '♐︎' }, { name: 'Scorpio', symbol: '♏︎' },
        { name: 'Libra', symbol: '♎︎' }, { name: 'Virgo', symbol: '♍︎' },
        { name: 'Leo', symbol: '♌︎' }, { name: 'Cancer', symbol: '♋︎' },
        { name: 'Gemini', symbol: '♊︎' }, { name: 'Taurus', symbol: '♉︎' },
      ];

      const size = 1000; // Increased for better visibility (25% larger than original 800px)
      const center = size / 2;
      const outerRadius = 400; // Scaled proportionally (320 * 1.25 = 400)
      const ringThickness = 65; // Scaled proportionally (52 * 1.25 = 65)
      const innerRadius = outerRadius - ringThickness;
      const textRadius = outerRadius - (ringThickness / 2);
      const contentRadius = innerRadius - 25; // Scaled proportionally 

      const cRing = "#2563EB"; 
      const cLine = "rgba(255, 255, 255, 0.12)";

      function renderChartWheel(planetData, aspectData) {
        const chartRoot = document.getElementById('chart-wheel-root');
        if (!chartRoot) return;
        
        let svgContent = '';

        // --- 1. ZODIAC RING ---
        let zodiacRing = '';
        ZODIACS.forEach((sign, index) => {
          const startAngle = index * 30;
          const endAngle = (index + 1) * 30;
          const midAngle = startAngle + 15;
          
          const pathData = describeArc(center, center, innerRadius, outerRadius, startAngle, endAngle);
          const textPos = polarToCartesian(center, center, textRadius, midAngle);
          const lineStart = polarToCartesian(center, center, innerRadius, startAngle);
          const lineEnd = polarToCartesian(center, center, outerRadius, startAngle);

          let rotation = midAngle;
          if (midAngle > 90 && midAngle < 270) {
            rotation += 180;
          }

          zodiacRing += '<path d="' + pathData + '" fill="' + cRing + '" stroke="none" />';
          zodiacRing += '<line x1="' + lineStart.x + '" y1="' + lineStart.y + '" x2="' + lineEnd.x + '" y2="' + lineEnd.y + '" stroke="rgba(255,255,255,0.15)" stroke-width="0.5" />';
          zodiacRing += '<text x="' + textPos.x + '" y="' + textPos.y + '" fill="white" text-anchor="middle" dominant-baseline="central" transform="rotate(' + rotation + ', ' + textPos.x + ', ' + textPos.y + ')" style="font-family: \'Inter\', sans-serif; font-size: 11px; letter-spacing: 0.2em; font-weight: 500; text-transform: uppercase; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">' + sign.name + '</text>';
        });
        
        zodiacRing += '<circle cx="' + center + '" cy="' + center + '" r="' + outerRadius + '" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />';
        zodiacRing += '<circle cx="' + center + '" cy="' + center + '" r="' + innerRadius + '" fill="none" stroke="white" stroke-width="1.2" opacity="0.9" />';
        svgContent += '<g class="zodiac-ring">' + zodiacRing + '</g>';

        // --- 2. ASPECTS ---
        let aspectsSvg = '';
        aspectData.forEach((aspect) => {
          const p1 = planetData.find(p => p.name === aspect.p1);
          const p2 = planetData.find(p => p.name === aspect.p2);
          if (!p1 || !p2) return;

          const pos1 = polarToCartesian(center, center, contentRadius, p1.degree);
          const pos2 = polarToCartesian(center, center, contentRadius, p2.degree);

          aspectsSvg += '<line x1="' + pos1.x + '" y1="' + pos1.y + '" x2="' + pos2.x + '" y2="' + pos2.y + '" stroke="url(#chartWheelGradient)" stroke-width="0.6" opacity="0.9" />';
        });
        svgContent += '<g class="aspects">' + aspectsSvg + '</g>';

        // --- 3. PLANETS ---
        let planetsSvg = '';
        planetData.forEach((planet) => {
          const pos = polarToCartesian(center, center, contentRadius, planet.degree);
          const tickStart = polarToCartesian(center, center, innerRadius, planet.degree);
          
          planetsSvg += '<g class="planet-group" data-planet-name="' + planet.name + '">';
          planetsSvg += '<line x1="' + pos.x + '" y1="' + pos.y + '" x2="' + tickStart.x + '" y2="' + tickStart.y + '" stroke="white" stroke-width="0.5" opacity="0.5" />';
          planetsSvg += '<circle cx="' + pos.x + '" cy="' + pos.y + '" r="12" fill="black" stroke="white" stroke-width="0.8" />';
          planetsSvg += '<text x="' + pos.x + '" y="' + pos.y + '" fill="white" font-size="14" dy="0.5" text-anchor="middle" dominant-baseline="central">' + planet.symbol + '</text>';
          planetsSvg += '</g>';
        });
        svgContent += '<g class="planets">' + planetsSvg + '</g>';

        // --- 4. INNER MECHANICS & AXIS ---
        svgContent += '<g class="inner-mechanics">';
        svgContent += '<circle cx="' + center + '" cy="' + center + '" r="' + contentRadius + '" fill="none" stroke="' + cLine + '" stroke-width="0.5" />';
        svgContent += '<path d="' + describeArc(center, center, contentRadius, innerRadius, 0, 359.99) + '" fill="rgba(255,255,255,0.03)" stroke="none" />';
        svgContent += '</g>';
        svgContent += '<g class="axis">';
        svgContent += '<text x="' + (center - outerRadius - 20) + '" y="' + center + '" text-anchor="end" dominant-baseline="middle" style="font-family: \'Inter\', sans-serif; font-size: 10px; font-weight: 400; letter-spacing: 0.2em; fill: rgba(255,255,255,0.5);">AC</text>';
        svgContent += '<text x="' + (center + outerRadius + 20) + '" y="' + center + '" text-anchor="start" dominant-baseline="middle" style="font-family: \'Inter\', sans-serif; font-size: 10px; font-weight: 400; letter-spacing: 0.2em; fill: rgba(255,255,255,0.5);">DC</text>';
        svgContent += '</g>';

        // --- 5. LOGO ---
        svgContent += '<g transform="translate(' + center + ', ' + center + ')">';
        svgContent += '<text x="0" y="0" class="chart-wheel-logo-text" style="font-family: \'Inter\', sans-serif; font-weight: 200; font-size: 28px; letter-spacing: 0.35em; opacity: 0.95; fill: white; text-anchor: middle; dominant-baseline: middle;">FATEFLIX</text>';
        svgContent += '</g>';

        // Final SVG structure
        const finalSvg = htmlHead + '<svg viewBox="0 0 ' + size + ' ' + size + '" style="width:100%;height:auto;overflow:visible;">' +
          '<defs><linearGradient id="chartWheelGradient" x1="0%" y1="0%" x2="100%" y2="100%">' +
          '<stop offset="0%" stop-color="rgba(255,255,255,0.02)" />' +
          '<stop offset="50%" stop-color="rgba(255,255,255,0.5)" />' +
          '<stop offset="100%" stop-color="rgba(255,255,255,0.02)" />' +
          '</linearGradient></defs>' + svgContent + '</svg>';

        chartRoot.innerHTML = finalSvg;
      }

      // Inject dynamic data from server
      const PLANET_DATA = ${planetDataJson};
      const ASPECT_DATA = ${aspectDataJson};

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { renderChartWheel(PLANET_DATA, ASPECT_DATA); });
      } else {
        renderChartWheel(PLANET_DATA, ASPECT_DATA);
      }
    })();
    </script>
  `;
}

// --------------------------------------------------------------

// dev-helpers (preview & retry tools)
app.get('/dev/no-time', (req, res) => {
  const submissionId = 'dev-no-time-' + Date.now();
  const chartId = 'dev-chart-' + Date.now();

  // Insert into mock DB
  MOCK_DB[submissionId] = {
    reading: {
      id: 'mock-reading-notime',
      submissionId,
      chartId,
      createdAt: new Date(),
      userEmail: 'dev@fateflix.app',
      summary: 'Mock No-Time Reading',
      birthDate: '2000-01-01',
      birthTime: null, // No time
      birthCity: 'Cosmic Void',
      birthCountry: 'Milky Way',
      username: 'StarGazer'
    },
    chart: {
      id: chartId,
      chartRulerPlanet: null,
      chartRulerHouse: null,
      rawChart: {
        angles: { ascendantSign: null } // Force no ascendant
      }
    }
  };

  // Redirect to the HTML view (page 2 is where the no-time logic lives)
  res.redirect(`/reading/${submissionId}/html/2`);
});

app.get('/dev/chart-ruler', (req, res) => {
  const submissionId = 'dev-chart-ruler-' + Date.now();
  const chartId = 'dev-chart-ruler-' + Date.now();

  // Mock chart with Scorpio ascendant to test Rule 2 (Co-Ruler)
  MOCK_DB[submissionId] = {
    reading: {
      id: 'mock-reading-ruler',
      submissionId,
      chartId,
      createdAt: new Date(),
      userEmail: 'dev@fateflix.app',
      summary: 'Mock Scorpio Chart Ruler Reading (Rule 2)',
      birthDate: '2000-01-01',
      birthTime: '12:00',
      birthCity: 'Cosmic Void',
      birthCountry: 'Milky Way',
      username: 'StarGazer'
    },
    chart: {
      id: chartId,
      chartRulerPlanet: 'Mars', // Traditional ruler of Scorpio
      chartRulerHouse: 8,
      rawChart: {
        angles: {
          ascendantSign: 'Scorpio',
          ascendantDeg: 210,
          mcSign: 'Leo',
          mcDeg: 120
        },
        planets: {
          mars: { sign: 'Aries', house: 6, longitude: 15 },
          pluto: { sign: 'Capricorn', house: 3, longitude: 285 },
          moon: { sign: 'Taurus', house: 7, longitude: 45 },
          sun: { sign: 'Aquarius', house: 4, longitude: 315 },
          mercury: { sign: 'Pisces', house: 9, longitude: 330 },
          venus: { sign: 'Capricorn', house: 7, longitude: 280 },
          jupiter: { sign: 'Aries', house: 10, longitude: 20 },
          saturn: { sign: 'Taurus', house: 11, longitude: 50 },
          uranus: { sign: 'Aquarius', house: 8, longitude: 310 },
          neptune: { sign: 'Aquarius', house: 8, longitude: 305 },
          pluto: { sign: 'Sagittarius', house: 6, longitude: 240 }
        },
        houseSigns: ['Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini']
      }
    }
  };

  // Redirect to the HTML view (page 2 is where the chart ruler logic lives)
  res.redirect(`/reading/${submissionId}/html/2`);
});

// Dev route for Badge preview (uses EJS template)
app.get('/dev/badge', (req, res) => {
  const creationDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const submissionID = 'dev-badge-' + Date.now();

  res.render('badge', { creationDate, submissionID });
});

// Dev route for Chart Wheel preview
app.get('/dev/chart-wheel', (req, res) => {
  const mockChartDTO = {
    planets: {
      sun: { longitude: 45, sign: 'Taurus' },
      moon: { longitude: 340, sign: 'Pisces' },
      mercury: { longitude: 65, sign: 'Gemini' },
      venus: { longitude: 25, sign: 'Aries' },
      mars: { longitude: 280, sign: 'Capricorn' },
      jupiter: { longitude: 120, sign: 'Leo' },
      saturn: { longitude: 310, sign: 'Aquarius' },
      uranus: { longitude: 200, sign: 'Libra' },
      neptune: { longitude: 230, sign: 'Scorpio' },
      pluto: { longitude: 185, sign: 'Libra' }
    }
  };

  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>FateFlix Chart Wheel Preview</title>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@600&family=Inter:wght@200;400;500&display=swap" rel="stylesheet">
    <style>
      body { 
        background-color: #000; 
        margin: 0; 
        padding: 60px 40px; 
        display: flex; 
        flex-direction: column;
        align-items: center; 
        min-height: 100vh; 
        box-sizing: border-box;
        font-family: 'Inter', sans-serif;
        color: white;
      }
      .chart-card-header {
        text-align: center;
        margin-bottom: 60px;
        width: 100%;
      }
      .chart-card-header h1 {
        font-family: 'Manrope', sans-serif;
        font-size: 42px;
        font-weight: 600;
        letter-spacing: -0.02em;
        margin: 0;
        text-shadow: 0 0 30px rgba(142, 197, 252, 0.4);
      }
      .chart-card-content {
        position: relative;
        width: 100%;
        max-width: 800px;
        aspect-ratio: 1 / 1;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .metadata-block {
        position: absolute;
        font-size: 16px;
        line-height: 1.5;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.9);
      }
      .top-left { top: -20px; left: 0; text-align: left; }
      .bottom-right { bottom: 20px; right: 0; text-align: right; }
      .label { font-weight: 200; color: rgba(255, 255, 255, 0.6); }
    </style>
  </head>
  <body>
    <div class="chart-card-header">
      <h1>My Astro-Cinematic Chart</h1>
    </div>

    <div class="chart-card-content">
      <div class="metadata-block top-left">
        <div><span class="label">Date:</span> June 10, 1991</div>
        <div><span class="label">Time:</span> 08:15 AM</div>
        <div><span class="label">Place:</span> Munich, Germany</div>
      </div>

      <div style="width: 100%; height: 100%;">
        ${buildChartWheelHtml(mockChartDTO)}
      </div>

      <div class="metadata-block bottom-right">
        <div><span class="label">username:</span> mi-gerer</div>
      </div>
    </div>
  </body>
  </html>`;

  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

app.get('/dev/email/preview/:outboxId', async (req, res) => {
  const r = await prisma.emailOutbox.findUnique({ where: { id: req.params.outboxId } });
  if (!r) return res.status(404).send('Not found');
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(r.htmlBody);
});

// root & health
app.get('/', (req, res) => {
  res.send('OK - Backend API Server');
});

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

// === Database seed status check ====================
app.get('/api/admin/seed-status', async (req, res) => {
  try {
    const sectionsCount = await prisma.surveySection.count();
    const questionsCount = await prisma.surveyQuestion.count();
    const optionsCount = await prisma.surveyOption.count();

    res.json({
      ok: true,
      seeded: questionsCount > 0,
      counts: {
        sections: sectionsCount,
        questions: questionsCount,
        options: optionsCount
      }
    });
  } catch (error) {
    console.error('❌ Seed status check failed:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// === Database response counts check ====================
app.get('/api/admin/response-counts', async (req, res) => {
  try {
    const submissionsCount = await prisma.surveySubmission.count();
    const responsesCount = await prisma.surveyResponse.count();
    const responseOptionsCount = await prisma.surveyResponseOption.count();
    const chartsCount = await prisma.chart.count();
    const readingsCount = await prisma.reading.count();

    // Get submissions with response counts
    const submissionsWithResponses = await prisma.surveySubmission.findMany({
      select: {
        id: true,
        userEmail: true,
        createdAt: true,
        _count: {
          select: {
            responses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    res.json({
      ok: true,
      counts: {
        submissions: submissionsCount,
        responses: responsesCount,
        responseOptions: responseOptionsCount,
        charts: chartsCount,
        readings: readingsCount
      },
      recentSubmissions: submissionsWithResponses.map(s => ({
        id: s.id,
        email: s.userEmail,
        createdAt: s.createdAt,
        responseCount: s._count.responses
      }))
    });
  } catch (error) {
    console.error('❌ Response counts check failed:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// === Check specific submission ====================
app.get('/api/admin/submission/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await prisma.surveySubmission.findUnique({
      where: { id: submissionId },
      include: {
        responses: {
          include: {
            question: {
              select: { key: true, text: true }
            },
            responseOptions: {
              include: {
                option: {
                  select: { value: true, label: true }
                }
              }
            }
          }
        },
        chart: {
          select: { id: true, createdAt: true }
        },
        reading: {
          select: { id: true, createdAt: true }
        }
      }
    });

    if (!submission) {
      return res.status(404).json({ ok: false, error: 'Submission not found' });
    }

    res.json({
      ok: true,
      submission: {
        id: submission.id,
        userEmail: submission.userEmail,
        createdAt: submission.createdAt,
        hasChart: !!submission.chart,
        hasReading: !!submission.reading,
        responseCount: submission.responses.length,
        responses: submission.responses.map(r => ({
          questionKey: r.question.key,
          questionText: r.question.text,
          answerText: r.answerText,
          options: r.responseOptions.map(ro => ({
            value: ro.option.value,
            label: ro.option.label
          }))
        }))
      }
    });
  } catch (error) {
    console.error('❌ Submission check failed:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// === Database seed endpoint (manual trigger) ====================
app.post('/api/admin/seed', async (req, res) => {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);

  try {
    console.log('🌱 Starting manual database seed...');
    const { stdout, stderr } = await execAsync('npm run seed', {
      cwd: __dirname,
      env: process.env,
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });

    if (stderr && !stderr.includes('Seed complete')) {
      console.error('⚠️ Seed warnings:', stderr);
    }

    console.log('✅ Seed completed successfully');
    res.json({
      ok: true,
      message: 'Database seeded successfully',
      output: stdout,
      warnings: stderr || null
    });
  } catch (error) {
    console.error('❌ Seed failed:', error);
    res.status(500).json({
      ok: false,
      error: error.message,
      stdout: error.stdout || null,
      stderr: error.stderr || null
    });
  }
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
    let { date, time, latitude, longitude, timeAccuracy } = req.body || {};
    let isUnknownTime = false;

    // Default to 12:00 (noon) if time is missing OR accuracy is unknown
    if (!time || timeAccuracy === 'unknown') {
      time = '12:00';
      isUnknownTime = true;
    }

    if (!date || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required fields (date, latitude, longitude).' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ success: false, error: 'Invalid coordinates.' });
    }

    // Dynamic Timezone Lookup
    const { find } = await import('geo-tz');
    const timezones = find(lat, lng);
    const timeZone = timezones && timezones.length > 0 ? timezones[0] : 'UTC';

    console.log(`🌍 Coordinates: ${lat}, ${lng} -> Timezone: ${timeZone}`);

    // Convert input date/time (Local zone) → UTC
    const birthDT = DateTime.fromISO(`${date}T${time}`, { zone: timeZone });

    if (!birthDT.isValid) {
      return res.status(400).json({ success: false, error: 'Invalid date or time.' });
    }
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
    const mc = normalize360(housesRes.mc);
    const housesDeg = (housesRes.house || []).map(normalize360);
    const houseSigns = housesDeg.map(signFromLongitude);

    const houseRulers = {};
    for (let i = 0; i < 12; i++) houseRulers[`house${i + 1}`] = houseSigns[i] || null;

    function houseOf(longitude) {
      for (let i = 0; i < 12; i++) {
        const start = housesDeg[i];
        const end = housesDeg[(i + 1) % 12];
        if (start <= end) { if (longitude >= start && longitude < end) return i + 1; }
        else { if (longitude >= start || longitude < end) return i + 1; }
      }
      return 12;
    }

    const planetsInHouses = {};
    for (const [planet, data] of Object.entries(planets)) {
      const house = houseOf(data.longitude);
      planetsInHouses[planet] = house;
      data.sign = signFromLongitude(data.longitude);
      data.house = house;
    }
    // --- Nodes & Chiron (compute AFTER housesDeg + houseOf exist) ---
    // NOTE: Chiron needs asteroid ephemeris files (e.g. seas_18.se1). If the file is missing,
    // we skip Chiron gracefully so the rest of the chart can compute.
    const extraBodies = {
      northNode: swisseph.SE_TRUE_NODE,  // true
      chiron: swisseph.SE_CHIRON      // requires seas_*.se1 (asteroid ephe)
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
    const icDeg = (mc + 180) % 360;
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

    if (isUnknownTime) {
      payload.angles = {
        ascendantDeg: null,
        ascendantSign: null,
        mcDeg: null,
        mcSign: null,
        descendantDeg: null,
        descendantSign: null,
        icDeg: null,
        icSign: null
      };
      payload.houses = [];
      payload.houseSigns = [];
      payload.houseRulers = {};
      payload.planetsInHouses = {};
      payload.chartRulerPlanet = null;
      payload.chartRulerHouse = null;
      if (payload.planets) {
        for (const k in payload.planets) {
          if (payload.planets[k]) payload.planets[k].house = null;
        }
      }
      if (payload.nodesAndChiron) {
        for (const k in payload.nodesAndChiron) {
          if (payload.nodesAndChiron[k]) payload.nodesAndChiron[k].house = null;
        }
      }
    }

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
        birthDateTimeUtc: birthUTC.toISOString(), tzOffsetMinutes,
        northNodeHouse: nodesAndChiron.northNode?.house ?? null,
        chironHouse: nodesAndChiron.chiron?.house ?? null,
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
    let { date, time, latitude, longitude } = req.query || {};
    let isUnknownTime = false;

    // Default to 12:00 (noon) if time is missing
    if (!time) {
      time = '12:00';
      isUnknownTime = true;
    }

    if (!date || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required fields (date, latitude, longitude).' });
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
    const mc = normalize360(housesRes.mc);
    const housesDeg = (housesRes.house || []).map(normalize360);
    const houseSigns = housesDeg.map(signFromLongitude);

    const houseRulers = {};
    for (let i = 0; i < 12; i++) houseRulers[`house${i + 1}`] = houseSigns[i] || null;

    function houseOf(longitude) {
      for (let i = 0; i < 12; i++) {
        const start = housesDeg[i];
        const end = housesDeg[(i + 1) % 12];
        if (start <= end) { if (longitude >= start && longitude < end) return i + 1; }
        else { if (longitude >= start || longitude < end) return i + 1; }
      }
      return 12;
    }

    const planetsInHouses = {};
    for (const [planet, data] of Object.entries(planets)) {
      const house = houseOf(data.longitude);
      planetsInHouses[planet] = house;
      data.sign = signFromLongitude(data.longitude);
      data.house = house;
    }

    // --- Nodes & Chiron (compute AFTER housesDeg + houseOf exist) ---
    const extraBodies = {
      northNode: swisseph.SE_TRUE_NODE,
      chiron: swisseph.SE_CHIRON
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
    const icDeg = (mc + 180) % 360;
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

    // Mask if unknown time
    if (isUnknownTime) {
      payload.angles = {
        ascendantDeg: null,
        ascendantSign: null,
        mcDeg: null,
        mcSign: null,
        descendantDeg: null,
        descendantSign: null,
        icDeg: null,
        icSign: null
      };
      payload.houses = [];
      payload.houseSigns = [];
      payload.houseRulers = {};
      payload.planetsInHouses = {};
      payload.chartRulerPlanet = null;
      payload.chartRulerHouse = null;
      if (payload.planets) {
        for (const k in payload.planets) {
          if (payload.planets[k]) payload.planets[k].house = null;
        }
      }
      if (payload.nodesAndChiron) {
        for (const k in payload.nodesAndChiron) {
          if (payload.nodesAndChiron[k]) payload.nodesAndChiron[k].house = null;
        }
      }
    }

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
        sun: { sign: planets.sun?.sign || null, house: planets.sun?.house || null },
        moon: { sign: planets.moon?.sign || null, house: planets.moon?.house || null },
        mercury: { sign: planets.mercury?.sign || null, house: planets.mercury?.house || null },
        venus: { sign: planets.venus?.sign || null, house: planets.venus?.house || null },
        mars: { sign: planets.mars?.sign || null, house: planets.mars?.house || null },
        jupiter: { sign: planets.jupiter?.sign || null, house: planets.jupiter?.house || null },
        saturn: { sign: planets.saturn?.sign || null, house: planets.saturn?.house || null },
        uranus: { sign: planets.uranus?.sign || null, house: planets.uranus?.house || null },
        neptune: { sign: planets.neptune?.sign || null, house: planets.neptune?.house || null },
        pluto: { sign: planets.pluto?.sign || null, house: planets.pluto?.house || null },
        northNode: { sign: planets.northNode?.sign || null, house: planets.northNode?.house || null },
        chiron: { sign: planets.chiron?.sign || null, house: planets.chiron?.house || null },
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
    let { date, time, latitude, longitude, userEmail, city, country, username, submissionId: existingSubmissionId } = req.body || {};

    if (!date || latitude == null || longitude == null) {
      return res.status(400).json({ ok: false, error: 'Missing date, latitude, or longitude' });
    }

    // Build absolute base URL that works in Railway (no localhost)
    const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'https');
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const base = `${proto}://${host}`;

    // 1) Compute + save chart via our own API (returns savedChartId)
    const rChart = await fetch(`${base}/api/birth-chart-swisseph`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        time,
        latitude,
        longitude,
        userEmail,
        timeAccuracy: req.body.timeAccuracy // Pass this through!
      })
    });
    if (!rChart.ok) {
      const err = await rChart.text().catch(() => '');
      return res.status(502).json({ ok: false, step: 'chart', error: err || rChart.statusText });
    }
    const chartPayload = await rChart.json();
    let chartId = chartPayload.savedChartId || null;
    let submissionId = null;

    if (chartId) {
      // 2) Create or Update submission
      if (existingSubmissionId) {
        // Try to verify it exists
        const existing = await prisma.surveySubmission.findUnique({ where: { id: existingSubmissionId } });
        if (existing) {
          // Update the chart link
          await prisma.surveySubmission.update({
            where: { id: existingSubmissionId },
            data: {
              chart: { connect: { id: chartId } },
              // Update email if provided and changed
              ...(userEmail ? { userEmail } : {})
            }
          });
          submissionId = existingSubmissionId;

          // Update or clean up old reading? We just create a new one for now or update?
          // Let's correct the reading link too
          /* 
            Ideally we update the existing reading, but simplistic approach:
            Create a new Reading linked to same submission? One-to-one?
            Schema says Reading -> Submission (unique).
            So we should update the existing reading if possible.
          */
          const existingReading = await prisma.reading.findFirst({ where: { submissionId } });
          if (existingReading) {
            await prisma.reading.update({
              where: { id: existingReading.id },
              data: { chartId, userEmail: userEmail || null }
            });
          } else {
            // Create missing reading
            await prisma.reading.create({
              data: {
                submissionId,
                chartId,
                userEmail: userEmail || null,
                summary: 'Auto-generated placeholder reading (updated).'
              }
            });
          }
        }
      }

      // If no valid existing ID, create new
      if (!submissionId) {
        const submission = await prisma.surveySubmission.create({
          data: { userEmail: userEmail || null, chart: { connect: { id: chartId } } },
          select: { id: true }
        });
        submissionId = submission.id;

        await prisma.reading.create({
          data: {
            submissionId: submission.id,
            chartId,
            userEmail: userEmail || null,
            summary: 'Auto-generated placeholder reading for dev preview.'
          },
          select: { id: true }
        });
      }

      // 3) Save survey answers (non-fatal - don't break flow if this fails)
      if (req.body.fullResponses && typeof req.body.fullResponses === 'object') {
        try {
          const { normalizeSurveyPayload } = require('./server/normalizeSurveyPayload');

          // Convert flat fullResponses object to format normalizeSurveyPayload expects
          // Frontend sends flat object like { username: "...", email: "...", gender: "..." }
          // We need to convert to sectioned format or directly normalize
          const fullResponses = req.body.fullResponses;

          // Map frontend answer keys to question keys
          // This mapping connects frontend question IDs to database question keys
          const keyMapping = {
            // Section I: Cosmic (skip - already in chart)
            // Section II: Casting
            'gender': 'casting.gender',
            'attraction_style': 'casting.attraction_style',
            'cine_level': 'casting.love_o_meter',
            'life_role': 'casting.movie_role',
            'escapism_style': 'casting.escapism_style',
            'first_crush': 'casting.first_obsession',
            // Section III: Taste
            'watch_habit': 'taste.how_you_watch',
            'fav_era': 'taste.favorite_era',
            'culture_background': 'taste.cultural_background',
            'environment_growing_up': 'taste.childhood_environment',
            // Section IV: Core Memory
            'first_feeling': 'core_memory.first_emotional',
            'life_changing': 'core_memory.life_changing',
            'comfort_watch': 'core_memory.comfort_watch',
            'power_watch': 'core_memory.power_movie',
            'date_impress': 'core_memory.impress_movie',
            // Section V: World
            'movie_universe': 'world.movie_universe',
            'villain_relate': 'world.villain',
            'forever_crush': 'world.forever_crush',
            'crave_most': 'world.crave_in_movie',
            'life_tagline': 'world.life_tagline',
            // Section VI: Screen Ed
            'tv_taste': 'screen_ed.tv_taste',
            'fav_tv': 'screen_ed.favorite_tv_show',
            'cinematography': 'screen_ed.cinematography',
            'directors': 'screen_ed.favorite_directors',
            'access_growing_up': 'screen_ed.access_growing_up',
            // Section VII: Genres
            'genres_love': 'genres.loved',
            'turn_offs': 'genres.turn_offs',
            'hated_film': 'genres.hated_but_loved',
            // Section Swipe
            'character_match': 'genres.twin_flame',
            // Section VIII: Global
            'foreign_films': 'global.foreign_films',
            // Section IX: Fit
            'selection_method': 'fit.pick_what_to_watch',
            'discovery': 'fit.found_survey',
            'email': 'fit.email',
            'beta_test': 'fit.beta_test',
            // top3_films, top3_series, top3_docs handled separately (combined into fit.hall_of_fame)
          };

          // Build answers array from fullResponses
          const answers = [];

          // Handle top3 fields separately (they combine into one hall_of_fame answer)
          let hallOfFameParts = [];
          if (fullResponses.top3_films) hallOfFameParts.push(`TOP 3 FILMS:\n${fullResponses.top3_films}`);
          if (fullResponses.top3_series) hallOfFameParts.push(`TOP 3 SERIES:\n${fullResponses.top3_series}`);
          if (fullResponses.top3_docs) hallOfFameParts.push(`TOP 3 DOCS:\n${fullResponses.top3_docs}`);
          if (hallOfFameParts.length > 0) {
            answers.push({ questionKey: 'fit.hall_of_fame', answerText: hallOfFameParts.join('\n\n') });
          }

          for (const [frontendKey, value] of Object.entries(fullResponses)) {
            // Skip birth data and metadata (already in chart)
            if (['date', 'time', 'latitude', 'longitude', 'city', 'country', 'username', 'time_accuracy', 'top3_films', 'top3_series', 'top3_docs'].includes(frontendKey)) {
              continue;
            }

            const questionKey = keyMapping[frontendKey];
            if (!questionKey) {
              // Try to find question by matching key directly
              const foundQuestion = await prisma.surveyQuestion.findFirst({
                where: { key: frontendKey }
              });
              if (foundQuestion) {
                // Direct match
                if (Array.isArray(value)) {
                  answers.push({ questionKey: frontendKey, optionValues: value });
                } else if (value != null && value !== '') {
                  answers.push({ questionKey: frontendKey, answerText: String(value) });
                }
              } else {
                console.warn(`⚠️ No mapping or database question found for key: ${frontendKey}`);
              }
              continue;
            }

            // Map to database question key
            if (Array.isArray(value)) {
              answers.push({ questionKey, optionValues: value });
            } else if (value != null && value !== '') {
              answers.push({ questionKey, answerText: String(value) });
            }
          }

          // Save answers (same logic as /api/survey/submit)
          if (answers.length > 0) {
            let savedCount = 0;
            let optionCount = 0;

            for (const a of answers) {
              const key = a?.questionKey;
              if (!key) continue;

              // Skip cosmic/meta keys (already in chart)
              // Skip meta payload keys
              if (key.startsWith('meta.')) continue;

              const q = await prisma.surveyQuestion.findUnique({
                where: { key: a.questionKey },
                include: { options: true },
              });

              if (!q) {
                console.warn("⚠️ No question found for key:", a.questionKey);
                continue;
              }

              const response = await prisma.surveyResponse.create({
                data: {
                  questionId: q.id,
                  submissionId: submissionId,
                  answerText: a.answerText ?? null,
                  userId: userEmail || "anonymous",
                },
                select: { id: true },
              });
              savedCount++;

              // Link options if provided
              if (Array.isArray(a.optionValues) && a.optionValues.length > 0) {
                const allowed = new Set(q.options.map(o => o.value));
                const chosen = a.optionValues.filter(v => allowed.has(v));
                for (const val of chosen) {
                  const opt = q.options.find(o => o.value === val);
                  if (!opt) continue;
                  await prisma.surveyResponseOption.create({
                    data: { responseId: response.id, optionId: opt.id },
                  });
                  optionCount++;
                }
              }
            }

            console.log(`✅ Saved ${savedCount} survey answers (${optionCount} options) for submission ${submissionId}`);
          } else {
            console.log(`ℹ️ No survey answers to save for submission ${submissionId}`);
          }
        } catch (answerError) {
          // Non-fatal: log but don't break the flow
          console.error('⚠️ Failed to save survey answers (non-fatal):', answerError.message);
          // Continue - don't throw
        }
      }
    } else {
      // Fallback: Mock flow if DB save failed
      console.warn('⚠️ DB save failed, using in-memory mock for visualization.');
      submissionId = 'test-submission-' + Date.now();
      chartId = 'mock-chart-' + Date.now();
      MOCK_DB[submissionId] = {
        reading: {
          id: 'mock-reading',
          submissionId,
          chartId,
          createdAt: new Date(),
          userEmail: userEmail || 'test@example.com',
          summary: 'Mock reading',
          // Mock data for HTML rendering
          birthDate: date,
          birthTime: time,
          birthCity: city || 'Unknown City',
          birthCountry: country || 'Unknown Country',
          username: username || 'Anonymous'
        },
        chart: {
          id: chartId,
          chartRulerPlanet: chartPayload.chartRulerPlanet,
          chartRulerHouse: chartPayload.chartRulerHouse,
          northNodeHouse: chartPayload.nodesAndChiron?.northNode?.house,
          chironHouse: chartPayload.nodesAndChiron?.chiron?.house,
          rawChart: chartPayload
        }
      };
    }

    // 4) Hand back URLs your FE can use immediately
    const rawBaseUrl = process.env.FRONTEND_URL || process.env.BASE_URL || base;
    const baseUrl = rawBaseUrl.replace(/\/$/, '');
    const svgUrl = `${baseUrl}/reading/${submissionId}/chart.svg`;
    const htmlUrl = `${baseUrl}/reading/${submissionId}`;

    // Send the "magic link" email (if we have an email)
    if (userEmail && submissionId) {
      console.log('📧 Attempting to send reading email via dev route to:', userEmail);
      sendReadingEmail(userEmail, submissionId, username).catch(err => console.error('Dev route email trigger failed:', err));
    }

    return res.json({ ok: true, chartId, submissionId: submissionId, svgUrl, htmlUrl });
  } catch (e) {
    console.error('💥 /api/dev/chart-to-svg error:', e);
    return res.status(500).json({ ok: false, error: e?.message || 'Unknown error' });
  }
});

// === Reading DTO by submission id =================================
app.get('/api/reading/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;
    if (!submissionId) return res.status(400).json({ ok: false, error: 'Missing submissionId' });

    const reading = await prisma.reading.findFirst({
      where: { submissionId },
      select: { id: true, summary: true, chartId: true, createdAt: true, userEmail: true },
    });
    if (!reading) return res.status(404).json({ ok: false, error: 'Reading not found' });

    let chartSummary = null;
    let builtText = null;

    if (reading.chartId) {
      const chart = await prisma.chart.findUnique({
        where: { id: reading.chartId },
        select: {
          id: true,
          chartRulerPlanet: true,
          chartRulerHouse: true,
          northNodeHouse: true,
          chironHouse: true,
          rawChart: true,
        },
      });

      if (chart) {
        const rc = chart.rawChart || {};
        const angles = rc.angles || {};
        const planets = rc.planets || {};
        chartSummary = {
          id: chart.id,
          ascSign: angles.ascendantSign || null,
          mcSign: angles.mcSign || null,
          chartRuler: { planet: chart.chartRulerPlanet || null, house: chart.chartRulerHouse || null },
          northNodeHouse: chart.northNodeHouse || rc?.nodesAndChiron?.northNode?.house || null,
          chironHouse: chart.chironHouse || rc?.nodesAndChiron?.chiron?.house || null,
          planets: {
            sun: { sign: planets.sun?.sign, house: planets.sun?.house },
            moon: { sign: planets.moon?.sign, house: planets.moon?.house },
            mercury: { sign: planets.mercury?.sign, house: planets.mercury?.house },
            venus: { sign: planets.venus?.sign, house: planets.venus?.house },
            mars: { sign: planets.mars?.sign, house: planets.mars?.house },
            jupiter: { sign: planets.jupiter?.sign, house: planets.jupiter?.house },
            saturn: { sign: planets.saturn?.sign, house: planets.saturn?.house },
            uranus: { sign: planets.uranus?.sign, house: planets.uranus?.house },
            neptune: { sign: planets.neptune?.sign, house: planets.neptune?.house },
            pluto: { sign: planets.pluto?.sign, house: planets.pluto?.house },
            northNode: { sign: rc?.nodesAndChiron?.northNode?.sign, house: rc?.nodesAndChiron?.northNode?.house },
            chiron: { sign: rc?.nodesAndChiron?.chiron?.sign, house: rc?.nodesAndChiron?.chiron?.house },
          },
          houseSigns: rc.houseSigns || null,
          houseRulers: rc.houseRulers || null,
        };

        // Build reading text from content files
        const builderDto = {
          ascendantSign: angles.ascendantSign || null,
          sunSign: planets?.sun?.sign || null,
          sunHouse: planets?.sun?.house || null,
          moonSign: planets?.moon?.sign || null,
          moonHouse: planets?.moon?.house || null,
          mercurySign: planets?.mercury?.sign || null,
          mercuryHouse: planets?.mercury?.house || null,
          venusSign: planets?.venus?.sign || null,
          venusHouse: planets?.venus?.house || null,
          marsSign: planets?.mars?.sign || null,
          marsHouse: planets?.mars?.house || null,
          jupiterSign: planets?.jupiter?.sign || null,
          jupiterHouse: planets?.jupiter?.house || null,
          saturnSign: planets?.saturn?.sign || null,
          saturnHouse: planets?.saturn?.house || null,
          uranusSign: planets?.uranus?.sign || null,
          uranusHouse: planets?.uranus?.house || null,
          neptuneSign: planets?.neptune?.sign || null,
          neptuneHouse: planets?.neptune?.house || null,
          plutoSign: planets?.pluto?.sign || null,
          plutoHouse: planets?.pluto?.house || null,
          chartRulerPlanet: chart.chartRulerPlanet || null,
          chartRulerHouse: chart.chartRulerHouse || null,
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
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
        <div>Ruler: ${esc((dto?.houseRulers && dto.houseRulers[i]) || '—')}</div>
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
  const R_outer = (size / 2) - pad; // canvas margin
  const R_border = R_outer - 2;      // thin border
  const R_signBandOuter = R_border - 2;     // sign colored ring (outer edge)
  const R_signBandInner = R_signBandOuter - 28;
  const R_majorTickOuter = R_signBandInner - 2;
  const R_majorTickInner = R_majorTickOuter - 12;
  const R_minorTickInner = R_majorTickOuter - 6;
  const R_houseOuter = R_majorTickInner - 6;
  const R_houseInner = R_houseOuter - 58;
  const R_planet = R_houseInner - 26;
  const R_center = R_planet - 18;

  const houses = rawChart?.houses || [];       // 12 cusp longitudes
  const houseSigns = rawChart?.houseSigns || []; // 12 sign names for cusps
  const planets = rawChart?.planets || {};      // { sun:{longitude, sign, house}, ... }

  // Local helpers (these rely on helpers already defined above in the file)
  const clamp360 = (d) => ((d % 360) + 360) % 360;
  const rad = (d) => (Math.PI / 180) * d;
  const pol = (r, deg) => {
    const a = rad(deg);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };
  const svgAngle = (lon) => svgAngleFromEcliptic(lon); // keep same orientation as before

  // Colors (dark theme)
  const BG = "#0b0d10";
  const PANEL = "#11151b";
  const BORDER = "#222a35";
  const GRID = "#313a46";
  const GRID_SOFT = "#2a3340";
  const TEXT = "#d8dee9";
  const TEXT_SOFT = "#aab3c0";
  const ACCENT = "#83c9f4";

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
    Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
    Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
    Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓"
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
      const pIn = pol(R_houseInner, deg);
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
    const pt = pol(R_planet, deg);
    const glyph = PLANET_GLYPH[name] || name.slice(0, 1).toUpperCase();

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
}
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

  <!-- Embedded GIF (new retouched version) -->
  <image x="100" y="150" width="600" height="400"
         xlink:href="https://result.videoplus.ai/veo2-outputs/output/result/202511/14/14035279c3124b618551dbd107200264.gif"/>

  <!-- Birthday Text Overlay with SF San Francisco font -->
  <text x="400" y="120"
        font-family="-apple-system, SF Pro Display, SF Pro Text, system-ui, sans-serif"
        font-size="52"
        font-weight="bold"
        fill="#FFD700"
        text-anchor="middle"
        stroke="#FF6B6B"
        stroke-width="2">
    Happy Birthdayyy!
  </text>

  <!-- Confetti - Upper area falling animation -->
  <!-- Row 1 - Confetti pieces -->
  <circle cx="150" cy="-20" r="8" fill="#FF6B6B" opacity="0.9">
    <animate attributeName="cy" values="-20;300" dur="3s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.9;0.3;0.9" dur="3s" repeatCount="indefinite"/>
  </circle>
  <rect x="250" y="-30" width="10" height="10" fill="#FFD700" opacity="0.9" transform="rotate(45 255 -25)">
    <animate attributeName="y" values="-30;320" dur="3.5s" repeatCount="indefinite"/>
    <animateTransform attributeName="transform" type="rotate" values="45 255 -25;405 255 295" dur="3.5s" repeatCount="indefinite"/>
  </rect>
  <circle cx="350" cy="-15" r="6" fill="#4ECDC4" opacity="0.9">
    <animate attributeName="cy" values="-15;310" dur="2.8s" repeatCount="indefinite"/>
  </circle>
  <polygon points="450,-25 458,-10 442,-10" fill="#FF6B6B" opacity="0.9">
    <animate attributeName="transform" values="translate(0,-25);translate(0,305)" dur="3.2s" repeatCount="indefinite"/>
  </polygon>
  <circle cx="550" cy="-40" r="7" fill="#A78BFA" opacity="0.9">
    <animate attributeName="cy" values="-40;290" dur="3.6s" repeatCount="indefinite"/>
  </circle>
  <rect x="650" y="-20" width="8" height="8" fill="#4ECDC4" opacity="0.9" transform="rotate(30 654 -16)">
    <animate attributeName="y" values="-20;315" dur="3.3s" repeatCount="indefinite"/>
  </rect>

  <!-- Row 2 - More confetti -->
  <circle cx="100" cy="-50" r="6" fill="#FFD700" opacity="0.9">
    <animate attributeName="cy" values="-50;280" dur="3.4s" begin="0.5s" repeatCount="indefinite"/>
  </circle>
  <rect x="200" y="-45" width="9" height="9" fill="#FF6B6B" opacity="0.9" transform="rotate(60 204.5 -40.5)">
    <animate attributeName="y" values="-45;295" dur="3.1s" begin="0.5s" repeatCount="indefinite"/>
  </rect>
  <polygon points="320,-35 326,-22 314,-22" fill="#4ECDC4" opacity="0.9">
    <animate attributeName="transform" values="translate(0,-35);translate(0,295)" dur="2.9s" begin="0.5s" repeatCount="indefinite"/>
  </polygon>
  <circle cx="420" cy="-30" r="8" fill="#A78BFA" opacity="0.9">
    <animate attributeName="cy" values="-30;300" dur="3.7s" begin="0.5s" repeatCount="indefinite"/>
  </circle>
  <rect x="520" y="-40" width="10" height="10" fill="#FFD700" opacity="0.9" transform="rotate(20 525 -35)">
    <animate attributeName="y" values="-40;285" dur="3.2s" begin="0.5s" repeatCount="indefinite"/>
  </rect>
  <circle cx="620" cy="-25" r="7" fill="#FF6B6B" opacity="0.9">
    <animate attributeName="cy" values="-25;305" dur="3.5s" begin="0.5s" repeatCount="indefinite"/>
  </circle>

  <!-- Row 3 - Even more confetti -->
  <circle cx="180" cy="-60" r="7" fill="#4ECDC4" opacity="0.9">
    <animate attributeName="cy" values="-60;270" dur="3.3s" begin="1s" repeatCount="indefinite"/>
  </circle>
  <polygon points="280,-50 288,-37 272,-37" fill="#FFD700" opacity="0.9">
    <animate attributeName="transform" values="translate(0,-50);translate(0,285)" dur="3.4s" begin="1s" repeatCount="indefinite"/>
  </polygon>
  <rect x="380" y="-55" width="9" height="9" fill="#A78BFA" opacity="0.9" transform="rotate(75 384.5 -50.5)">
    <animate attributeName="y" values="-55;275" dur="3.0s" begin="1s" repeatCount="indefinite"/>
  </rect>
  <circle cx="480" cy="-45" r="6" fill="#FF6B6B" opacity="0.9">
    <animate attributeName="cy" values="-45;290" dur="3.6s" begin="1s" repeatCount="indefinite"/>
  </circle>
  <circle cx="580" cy="-35" r="8" fill="#4ECDC4" opacity="0.9">
    <animate attributeName="cy" values="-35;295" dur="3.1s" begin="1s" repeatCount="indefinite"/>
  </circle>
  <rect x="680" y="-50" width="8" height="8" fill="#FFD700" opacity="0.9" transform="rotate(45 684 -46)">
    <animate attributeName="y" values="-50;280" dur="3.5s" begin="1s" repeatCount="indefinite"/>
  </rect>
</svg>`;
      return res.type('image/svg+xml').send(svg);
    }

    // Normal chart (after birthday or not Nov 14)
    if (!submissionId) return res.status(400).send('Missing submissionId');

    let reading, chart;

    // Check mock DB first
    if (MOCK_DB[submissionId]) {
      reading = MOCK_DB[submissionId].reading;
      chart = MOCK_DB[submissionId].chart;
    } else {
      reading = await prisma.reading.findFirst({
        where: { submissionId },
        select: {
          id: true,
          chartId: true,
          userEmail: true
        }
      });

      if (reading && reading.chartId) {
        chart = await prisma.chart.findUnique({
          where: { id: reading.chartId },
          select: {
            id: true,
            chartRulerPlanet: true,
            chartRulerHouse: true,
            rawChart: true,
            city: true,
            country: true,
            birthDateTimeUtc: true,
            tzOffsetMinutes: true
          }
        });
      }
    }

    if (!chart || !chart.rawChart) return res.status(404).send('Chart not found for submission');

    // Build chartDTO for the Blue Chart Logic
    const rc = chart.rawChart || {};
    const angles = rc.angles || {};
    const planets = rc.planets || {};

    const chartDTO = {
      id: chart.id,
      ascSign: angles.ascendantSign || null,
      mcSign: angles.mcSign || null,
      ascDeg: angles.ascendantDeg,
      mcDeg: angles.mcDeg,
      chartRuler: { planet: chart.chartRulerPlanet || null, house: chart.chartRulerHouse || null },
      houseSigns: rc.houseSigns || [],
      houseRulers: rc.houseRulers || [],
      rawHouses: rc.houses || [],
      planets: planets
    };

    // Calculate metadata variables first so we can log them
    let uName = 'Anonymous';
    if (submissionId) {
      const unameResponse = await prisma.surveyResponse.findFirst({
        where: {
          submissionId: submissionId,
          question: { key: 'cosmic.name' }
        },
        select: { answerText: true }
      });
      if (unameResponse?.answerText) {
        uName = unameResponse.answerText;
      } else if (reading?.userEmail) {
        uName = reading.userEmail.split('@')[0];
      }
    }

    let bDate = 'Unknown Date';
    let bTime = 'Unknown Time';
    let bPlace = (chart?.city && chart?.country) ? `${chart.city}, ${chart.country}` : (chart?.city || 'Unknown Place');

    if (chart?.birthDateTimeUtc) {
      const utcDT = DateTime.fromJSDate(new Date(chart.birthDateTimeUtc), { zone: 'utc' });
      const localDT = utcDT.plus({ minutes: chart.tzOffsetMinutes || 0 });
      bDate = localDT.toFormat('MMMM d, yyyy');
      bTime = localDT.toFormat('h:mm a');
    }

    // Write persistent debug log
    try {
      const logData = {
        timestamp: new Date().toISOString(),
        submissionId,
        uName,
        bDate,
        bTime,
        bPlace,
        chartDTO
      };
      fs.writeFileSync(path.join(__dirname, 'debug_log.txt'), JSON.stringify(logData, null, 2));
      console.log('✅ DEBUG: Logged data to debug_log.txt');
    } catch (err) {
      console.error('❌ DEBUG: Failed to write log file:', err);
    }

    const htmlContent = buildChartWheelHtml(chartDTO);

    console.log(`📊 Rendering Chart Card for ${uName} (${submissionId})`);

    // Wrap it in a high-fidelity HTML structure for sharing
    const fullHtml = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@600&family=Inter:wght@200;400;500&display=swap" rel="stylesheet">
      <style>
        body { 
          margin: 0; 
          padding: 60px 40px; 
          background: transparent; 
          color: white;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-sizing: border-box;
        }

        /* Header Styling - Jony Ive / Apple Style */
        .chart-card-header {
          text-align: center;
          margin-bottom: 60px;
          width: 100%;
        }
        .chart-card-header h1 {
          font-family: 'Manrope', sans-serif;
          font-size: 42px;
          font-weight: 600;
          letter-spacing: -0.02em;
          margin: 0;
          text-shadow: 0 0 30px rgba(142, 197, 252, 0.4);
        }

        /* Layout Container */
        .chart-card-content {
          position: relative;
          width: 100%;
          max-width: 800px;
          aspect-ratio: 1 / 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* Metadata Blocks */
        .metadata-block {
          position: absolute;
          font-size: 16px;
          line-height: 1.5;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.9);
          z-index: 50;
          pointer-events: none;
        }
        .top-left {
          top: -20px;
          left: 0;
          text-align: left;
        }
        .bottom-right {
          bottom: 20px;
          right: 0;
          text-align: right;
        }
        .label {
          font-weight: 200;
          color: rgba(255, 255, 255, 0.6);
        }
      </style>
    </head>
    <body>
      <div class="chart-card-header">
        <h1>My Astro-Cinematic Chart</h1>
      </div>

      <div class="chart-card-content">
        <!-- Top Left Metadata -->
        <div class="metadata-block top-left">
          <div><span class="label">Date:</span> ${bDate}</div>
          <div><span class="label">Time:</span> ${bTime}</div>
          <div><span class="label">Place:</span> ${bPlace}</div>
        </div>

        <!-- The Chart Wheel -->
        <div style="width: 100%; height: 100%;">
          ${htmlContent}
        </div>

        <!-- Bottom Right Metadata -->
        <div class="metadata-block bottom-right">
          <div><span class="label">username:</span> ${uName}</div>
        </div>
      </div>
    </body>
    </html>`;

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(fullHtml);
  } catch (e) {
    console.error('💥 /reading/:submissionId/chart.svg error:', e);
    res.status(500).send('Internal error');
  }
});

// === Screen 1: The Badge (Entry Ticket) =========================
app.get('/reading/:submissionId/badge', async (req, res) => {
  try {
    const { submissionId } = req.params;
    if (!submissionId) return res.status(400).send('Missing submissionId');

    let createdAt;

    // Check mock DB first
    if (MOCK_DB[submissionId]) {
      // Mock entries usually don't have a createdAt, so we fake it
      createdAt = new Date();
    } else {
      // Try to find submission first
      const submission = await prisma.surveySubmission.findUnique({
        where: { id: submissionId },
        select: { createdAt: true }
      });

      if (submission) {
        createdAt = submission.createdAt;
      } else {
        // Fallback: try finding by reading if submission not found directly (though unlikely)
        const reading = await prisma.reading.findFirst({
          where: { submissionId },
          select: { createdAt: true }
        });
        if (reading) createdAt = reading.createdAt;
      }
    }

    if (!createdAt) return res.status(404).send('Submission not found');

    // Format Date: "October 24, 2025"
    const creationDate = new Date(createdAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    res.render('badge', { submissionID: submissionId, creationDate });

  } catch (e) {
    console.error('💥 /reading/:submissionId/badge error:', e);
    res.status(500).send('Internal error');
  }
});

app.get('/reading/:submissionId/html', async (req, res) => {
  try {
    const { submissionId } = req.params;
    if (!submissionId) return res.status(400).send('Missing submissionId');

    let reading, chart;

    // Check mock DB first
    if (MOCK_DB[submissionId]) {
      reading = MOCK_DB[submissionId].reading;
      chart = MOCK_DB[submissionId].chart;
    } else {
      reading = await prisma.reading.findFirst({
        where: { submissionId },
        select: { id: true, summary: true, chartId: true, createdAt: true, userEmail: true }
      });
      if (reading && reading.chartId) {
        chart = await prisma.chart.findUnique({
          where: { id: reading.chartId },
          select: { id: true, chartRulerPlanet: true, chartRulerHouse: true, rawChart: true }
        });
      }
    }

    if (!reading) return res.status(404).send('Reading not found');

    let chartDTO = null;
    let builtText = null;
    if (chart) {
      const rc = chart.rawChart || {};
      const angles = rc.angles || {};
      const planets = rc.planets || {};
      chartDTO = {
        id: chart.id,
        ascSign: angles.ascendantSign || null,
        mcSign: angles.mcSign || null,
        ascDeg: angles.ascendantDeg,
        mcDeg: angles.mcDeg,
        chartRuler: { planet: chart.chartRulerPlanet || null, house: chart.chartRulerHouse || null },
        houseSigns: rc.houseSigns || [],
        houseRulers: rc.houseRulers || [],
        rawHouses: rc.houses || [],
        planets: planets
      };

      const builderDto = {
        ascendantSign: angles.ascendantSign || null,
        chartRulerPlanet: chart.chartRulerPlanet || null,
        chartRulerHouse: chart.chartRulerHouse || null,
        sunSign: planets?.sun?.sign || null,
        sunHouse: planets?.sun?.house || null,
        moonSign: planets?.moon?.sign || null,
        moonHouse: planets?.moon?.house || null,
        mercurySign: planets?.mercury?.sign || null,
        mercuryHouse: planets?.mercury?.house || null,
        venusSign: planets?.venus?.sign || null,
        venusHouse: planets?.venus?.house || null,
        marsSign: planets?.mars?.sign || null,
        marsHouse: planets?.mars?.house || null,
        jupiterSign: planets?.jupiter?.sign || null,
        jupiterHouse: planets?.jupiter?.house || null,
        saturnSign: planets?.saturn?.sign || null,
        saturnHouse: planets?.saturn?.house || null,
        uranusSign: planets?.uranus?.sign || null,
        uranusHouse: planets?.uranus?.house || null,
        neptuneSign: planets?.neptune?.sign || null,
        neptuneHouse: planets?.neptune?.house || null,
        plutoSign: planets?.pluto?.sign || null,
        plutoHouse: planets?.pluto?.house || null,
        chartRulerPlanet: chart.chartRulerPlanet || null,
        chartRulerHouse: chart.chartRulerHouse || null,
      };
      builtText = buildReadingFromContent(builderDto);
    }

    // Helpers
    const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const pickVal = (map, key) => (map && map[key]) ? map[key] : '';

    // Styles
    const styles = `
      @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Oswald:wght@500;700&family=Inter:wght@400;500;600;700&display=swap');
      
      body { 
        background: linear-gradient(135deg, #0a0118 0%, #1a0b2e 50%, #0a0118 100%);
        color: #FFFFFF; 
        font-family: 'Inter', sans-serif; 
        margin: 0; 
        padding: 0; 
        display: flex; 
        justify-content: center;
        min-height: 100vh;
      }
      .wrap { 
        width: 100%; 
        max-width: 100%; 
        padding: 20px; 
        box-sizing: border-box; 
      }
      * { box-sizing: border-box; }
      h1, h2, h3, .header-font { 
        font-family: 'Oswald', sans-serif; 
        text-transform: uppercase; 
        margin: 0;
        letter-spacing: 0.05em;
      }
      .card { 
        border: 2px solid rgba(142, 197, 252, 0.6);
        border-radius: 16px; 
        padding: 20px; 
        margin-bottom: 16px; 
        background: transparent;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05);
        transition: all 0.3s ease;
      }
      .card:hover {
        background: rgba(142, 197, 252, 0.05);
        border-color: rgba(142, 197, 252, 0.9);
        box-shadow: 0 12px 48px rgba(142, 197, 252, 0.2),
                    0 0 20px rgba(142, 197, 252, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
      .card-gold { 
        border: 2px solid rgba(255, 209, 143, 0.6);
      }
      .card-gold:hover {
        border-color: rgba(255, 209, 143, 0.9);
        box-shadow: 0 12px 48px rgba(255, 209, 143, 0.2),
                    0 0 20px rgba(255, 209, 143, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
      .section-header { 
        color: #F3DCBC; 
        font-size: 14px; 
        margin-bottom: 8px; 
        text-transform: uppercase; 
        letter-spacing: 1px;
        font-family: 'Oswald', sans-serif;
        font-weight: 600;
      }
      .content-text { 
        font-size: 16px; 
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.9);
      }
      .intro-text { 
        color: #F3DCBC; 
        text-align: center; 
        font-style: italic; 
        margin: 30px 0; 
        font-size: 18px; 
      }
      .disclaimer { 
        color: rgba(255, 255, 255, 0.5); 
        font-size: 12px; 
        text-align: left; 
        margin-top: 40px; 
        line-height: 1.4; 
      }
      .no-time { 
        color: #B6DAF7; 
        text-align: center; 
        margin: 40px 0; 
        font-size: 14px; 
        line-height: 1.6; 
      }
      .ruler-header { 
        color: #DFCDF5; 
        font-size: 16px; 
        margin-bottom: 10px;
        font-family: 'Oswald', sans-serif;
      }
      .ruler-eq { 
        color: #A2C5E2; 
        margin-bottom: 20px; 
        font-weight: bold; 
      }
      
      /* Badge Styles */
      .badge { 
        background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%); 
        color: #000; 
        border-radius: 20px; 
        padding: 0; 
        overflow: hidden; 
        margin-bottom: 30px; 
        text-align: center; 
        font-family: "Futura", sans-serif;
      }
      .badge-top { padding: 40px 20px; background: rgba(255,255,255,0.2); position: relative; }
      .badge-bottom { background: #f0f0f0; padding: 20px; font-size: 12px; color: #333; font-family: monospace; text-align: left; }
      .fateflix-title { font-size: 40px; font-weight: 800; letter-spacing: -1px; margin-bottom: 5px; }
      .early-access { font-size: 12px; letter-spacing: 1px; margin-bottom: 10px; }
      .tagline { font-family: "Graphic Web", sans-serif; font-style: italic; font-size: 16px; margin: 15px 0; }
      .row { display: flex; border-bottom: 1px solid #ccc; padding: 8px 0; }
      .col { flex: 1; padding: 0 5px; }
      .border-left { border-left: 1px solid #ccc; }
      @media (max-width: 768px) {
        .wrap { padding: 10px; }
        .card { padding: 15px; }
      }
    `;

    let contentHtml = '';

    if (chartDTO) {
      // My Astro-Cinematic-Chart
      const bDate = reading.birthDate ? new Date(reading.birthDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown Date';
      const bTime = reading.birthTime || 'Unknown Time';
      const bPlace = (reading.birthCity && reading.birthCountry) ? `${reading.birthCity}, ${reading.birthCountry}` : (reading.birthCity || 'Unknown Place');
      const uName = reading.username || 'Unknown';
      const uEmail = reading.userEmail || 'Unknown';

      contentHtml += `
         <div style="position: relative; margin: 30px 0;">
           <!-- Header with subtle glow -->
           <div style="text-align: center; margin-bottom: 40px;">
             <h1 style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #FFFFFF; text-transform: uppercase; font-size: 28px; font-weight: 600; letter-spacing: 0.15em; margin: 0; text-shadow: 0 0 20px rgba(142, 197, 252, 0.6), 0 0 40px rgba(142, 197, 252, 0.3), 0 2px 4px rgba(0, 0, 0, 0.5);">
               My Astro-Cinematic Chart
             </h1>
           </div>
           

           <!-- Metadata below the chart -->
           <div style="display: none; justify-content: space-between; font-size: 12px; color: #fff; margin-top: 20px;">
             <div style="text-align: left;">
                Date: ${bDate}<br/>
                Time: ${bTime}<br/>
                Place: ${bPlace}
             </div>
             <div style="text-align: right;">
                username: ${uName}<br/>
                email: ${uEmail}
             </div>
           </div>

           <div style="position: relative; width: 270px; margin: 0 auto 30px auto;">
               <img src="/assets/planet_purple.png" style="display: block; width: 100%; height: auto; opacity: 0.9;" alt="" />
               
               <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 100%; text-align: center; z-index: 10; font-family: 'Futura', sans-serif; font-style: italic; font-size: 20px; color: #F3DCBC; line-height: 1.4; text-shadow: 0 2px 10px rgba(0,0,0,0.7); white-space: nowrap;">
                  <span style="position: relative; top: -8px; margin-right: 4px;">
                    <img src="/assets/starglow_large.png" style="width: 18px;" alt="" />
                  </span>
                  Your planets = the cast.
                  <br/>
                  Your signs = the characters they play.
                  <span style="position: relative; top: 8px; margin-left: 4px;">
                    <img src="/assets/starglow_large.png" style="width: 22px;" alt="" />
                  </span>
               </div>
           </div>
         </div>
       `;

      const p = chartDTO.planets || {};
      const list = [
        // Only include Rising/Ascendant if we have an ascendant sign
        ...(chartDTO.ascSign ? [{ name: 'Rising / Ascendant', sign: chartDTO.ascSign, intro: SECTION_INTROS.ascendant, text: pickVal(ASCENDANT_TEXT, chartDTO.ascSign) }] : []),
        { name: 'Sun', sign: p.sun?.sign, intro: SECTION_INTROS.sun_sign, text: pickVal(SUN_SIGN_TEXT, p.sun?.sign) },
        { name: 'Moon', sign: p.moon?.sign, intro: SECTION_INTROS.moon_sign, text: pickVal(MOON_SIGN_TEXT, p.moon?.sign) },
        { name: 'Mercury', sign: p.mercury?.sign, intro: SECTION_INTROS.mercury_sign, text: pickVal(MERCURY_SIGN_TEXT, p.mercury?.sign) },
        { name: 'Venus', sign: p.venus?.sign, intro: SECTION_INTROS.venus_sign, text: pickVal(VENUS_SIGN_TEXT, p.venus?.sign) },
        { name: 'Mars', sign: p.mars?.sign, intro: SECTION_INTROS.mars_sign, text: pickVal(MARS_SIGN_TEXT, p.mars?.sign) },
        { name: 'Jupiter', sign: p.jupiter?.sign, intro: SECTION_INTROS.jupiter_sign, text: pickVal(JUPITER_SIGN_TEXT, p.jupiter?.sign) },
        { name: 'Saturn', sign: p.saturn?.sign, intro: SECTION_INTROS.saturn_sign, text: pickVal(SATURN_SIGN_TEXT, p.saturn?.sign) },
        { name: 'Pluto', sign: p.pluto?.sign, intro: SECTION_INTROS.pluto_sign, text: pickVal(PLUTO_SIGN_TEXT, p.pluto?.sign) },
        { name: 'Uranus', sign: p.uranus?.sign, intro: SECTION_INTROS.uranus_sign, text: pickVal(URANUS_SIGN_TEXT, p.uranus?.sign) },
        { name: 'Neptune', sign: p.neptune?.sign, intro: SECTION_INTROS.neptune_sign, text: pickVal(NEPTUNE_SIGN_TEXT, p.neptune?.sign) },
      ];

      list.forEach(item => {
        contentHtml += `
        <div class="card">
             <h2 class="section-header">${esc(item.name)}</h2>
             <div style="font-size:12px; opacity:0.7; margin-bottom:8px">${esc(item.intro || '')}</div>
             <div class="content-text">${esc(item.text || `${item.name} in ${item.sign}`)}</div>
          </div>
         `;
      });

      // Footer Text inserted before Button
      contentHtml += `
         <div style="text-align:center; margin: 40px 0; padding: 0 20px;">
           <img src="/assets/starglow_large.png" class="star-decoration" alt="" />
           <p style="color:#F3DCBC; font-family:'Inter',sans-serif; font-style:italic; font-size:16px; line-height:1.5;">
             You’re now part of Fateflix’s origin story. <br/>
             And that’s legendary. <br/>Thank you for building
             the future of<br/>intuitive entertainment with us.
           </p>
           <img src="/assets/starglow_large.png" class="star-decoration" alt="" />
         </div>
       `;

      // Navigation buttons
      contentHtml += `
       `;

    } else {
      contentHtml = '<p>No chart data available.</p>';
    }

    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>FateFlix Reading – ${esc(submissionId)}</title>
      <style>${styles}</style>
    </head>
    <body>
      <div class="wrap">
        ${contentHtml}
      </div>
    </body>
    </html>`;

    res.type('html').send(html);

  } catch (e) {
    console.error('💥 /reading/:submissionId/html error:', e);
    res.status(500).send('Internal error');
  }
});

// Page 2: Chart Ruler + Houses + Footer
app.get('/reading/:submissionId/html/2', async (req, res) => {
  try {
    const { submissionId } = req.params;
    if (!submissionId) return res.status(400).send('Missing submissionId');

    let reading, chart;

    // Check mock DB first
    if (MOCK_DB[submissionId]) {
      reading = MOCK_DB[submissionId].reading;
      chart = MOCK_DB[submissionId].chart;
    } else {
      reading = await prisma.reading.findFirst({
        where: { submissionId },
        select: { id: true, summary: true, chartId: true, createdAt: true, userEmail: true }
      });
      if (reading && reading.chartId) {
        chart = await prisma.chart.findUnique({
          where: { id: reading.chartId },
          select: { id: true, chartRulerPlanet: true, chartRulerHouse: true, rawChart: true }
        });
      }
    }

    if (!reading) return res.status(404).send('Reading not found');

    let chartDTO = null;
    if (chart) {
      const rc = chart.rawChart || {};
      const angles = rc.angles || {};
      const planets = rc.planets || {};
      chartDTO = {
        id: chart.id,
        ascSign: angles.ascendantSign || null,
        mcSign: angles.mcSign || null,
        ascDeg: angles.ascendantDeg,
        mcDeg: angles.mcDeg,
        chartRuler: { planet: chart.chartRulerPlanet || null, house: chart.chartRulerHouse || null },
        houseSigns: rc.houseSigns || [],
        houseRulers: rc.houseRulers || [],
        rawHouses: rc.houses || [],
        planets: planets
      };
    }

    // Helpers
    const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const pickVal = (map, key) => (map && map[key]) ? map[key] : '';

    // Styles (Same as page 1)
    const styles = `
      @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Oswald:wght@500;700&family=Inter:wght@400;500;600;700&display=swap');
      
      body { 
        background: linear-gradient(135deg, #0a0118 0%, #1a0b2e 50%, #0a0118 100%);
        color: #FFFFFF; 
        font-family: 'Inter', sans-serif; 
        margin: 0; 
        padding: 0; 
        display: flex; 
        justify-content: center;
        min-height: 100vh;
      }
      .wrap { 
        width: 100%; 
        max-width: 100%; 
        padding: 20px; 
        box-sizing: border-box; 
      }
      * { box-sizing: border-box; }
      h1, h2, h3, .header-font { 
        font-family: 'Oswald', sans-serif; 
        text-transform: uppercase; 
        margin: 0;
        letter-spacing: 0.05em;
      }
      .card { 
        border: 2px solid rgba(142, 197, 252, 0.6);
        border-radius: 16px; 
        padding: 20px; 
        margin-bottom: 16px; 
        background: transparent;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05);
        transition: all 0.3s ease;
      }
      .card:hover {
        background: rgba(142, 197, 252, 0.05);
        border-color: rgba(142, 197, 252, 0.9);
        box-shadow: 0 12px 48px rgba(142, 197, 252, 0.2),
                    0 0 20px rgba(142, 197, 252, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
      .card-gold { 
        border: 2px solid rgba(255, 209, 143, 0.6);
      }
      .card-gold:hover {
        border-color: rgba(255, 209, 143, 0.9);
        box-shadow: 0 12px 48px rgba(255, 209, 143, 0.2),
                    0 0 20px rgba(255, 209, 143, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
      .section-header { 
        color: #F3DCBC; 
        font-size: 14px; 
        margin-bottom: 8px; 
        text-transform: uppercase; 
        letter-spacing: 1px;
        font-family: 'Oswald', sans-serif;
        font-weight: 600;
      }
      .content-text { 
        font-size: 16px; 
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.9);
      }
      .intro-text { 
        color: #F3DCBC; 
        text-align: center; 
        font-style: italic; 
        margin: 30px 0; 
        font-size: 18px; 
      }
      .disclaimer { 
        color: rgba(255, 255, 255, 0.5); 
        font-size: 12px; 
        text-align: left; 
        margin-top: 40px; 
        line-height: 1.4; 
      }
      .no-time { 
        color: #B6DAF7; 
        text-align: center; 
        margin: 40px 0; 
        font-size: 14px; 
        line-height: 1.6; 
      }
      .ruler-header { 
        color: #DFCDF5; 
        font-size: 16px; 
        margin-bottom: 10px;
        font-family: 'Oswald', sans-serif;
      }
      .ruler-eq { 
        color: #A2C5E2; 
        margin-bottom: 20px; 
        font-weight: bold; 
      }
      .page-break { margin-top: 50px; margin-bottom: 50px; }
      .img-responsive { max-width: 100%; height: auto; display: block; margin: 0 auto; }
      .star-decoration { width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px; }
      @media (max-width: 768px) {
        .wrap { padding: 10px; }
        .card { padding: 15px; }
      }
    `;

    let contentHtml = '';

    if (chartDTO) {
      const p = chartDTO.planets || {};
      const ascendant = chartDTO.ascSign; // Identify variable

      // Refactored "No Time" Template
      const noTimeHtml = `
          <div class="no-time" style="position: relative; padding-top: 40px; overflow: visible;">
             <!-- Top Section: Text -->
             <div style="position: relative; margin-bottom: 20px; padding: 0 20px; text-align: center;">
                <img src="/assets/starglow_large.png" style="position:absolute; left: 10%; top: -20px; width: 18px; opacity: 0.8;" alt="" />
                
                <p style="color:#F3DCBC; font-family:'Inter', sans-serif; font-style: italic; line-height: 1.6; font-size: 18px; margin: 0; position: relative; z-index: 2; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
                  No exact birth time?<br/>
                  Then your Rising sign, chart ruler, and house<br/>
                  placements will stay a mystery<br/>
                  ...for now
                </p>

                <!-- Purple Ring & Glow: Positioned BELOW the text, right aligned -->
                <!-- Purple Ring & Glow: Positioned BELOW the text, right aligned -->
                <img src="/assets/planet_purple_ring.png" style="width:200px; position:absolute; right: -40px; top: 60px; z-index: 0; opacity: 0.9;" alt="" />
                <img src="/assets/starglow_large.png" style="position:absolute; right: 25%; top: 140px; width: 12px; opacity: 0.6;" alt="" />
                <!-- New star: slightly right and underneath the planet -->
                <img src="/assets/starglow_large.png" style="position:absolute; right: 20px; top: 200px; width: 20px; opacity: 0.9;" alt="" />
             </div>

             <!-- Center Image (Blue Planet) - Large -->
             <div style="text-align: center; margin: 10px 0 -60px; position: relative; z-index: 1;">
                <img src="/assets/blue_planet.png" class="img-responsive" style="max-width: 800px; width: 120%; filter: drop-shadow(0 0 30px rgba(78, 205, 196, 0.3)); margin-left: -10%;" alt="Earth" />
             </div>

             <!-- Bottom Section: Green Glow Background -->
             <div style="position: relative; padding: 40px 20px; text-align: center; margin-top: 0px;">
                
                <!-- Responsive Glow Background (Large, Spilling Out) -->
             <div style="
                   position: absolute;
                   top: -30%;
                   bottom: -30%;
                   left: -20%;
                   right: -20%;
                   background: url('/assets/greenglow.png') center center / contain no-repeat;
                   z-index: 0;
                   opacity: 0.5;
                   filter: blur(10px);
                   pointer-events: none;
                "></div>

                <!-- Content -->
                <div style="position: relative; z-index: 1;">
                   <img src="/assets/starglow_large.png" style="position:absolute; left: 0; top: 0; width: 22px;" alt="" />

                   <p style="color: #B6DAF7; font-family: 'Inter', sans-serif; font-style: italic; font-size: 17px; margin-bottom: 20px; line-height: 1.5; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">
                  If you don't know the timecode from<br/>
                  when you entered this planet earth, do<br/>
                  yourself a favour
                </p>
                
                   <p style="color: #B6DAF7; font-family: 'Inter', sans-serif; font-style: italic; font-size: 17px; line-height: 1.6; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">
                  Call your mom.<br/>
                  Check your birth certificate.<br/>
                  Or contact the galaxy you came from<br/>
                  for the correct digits.
                </p>

                   <img src="/assets/starglow_large.png" style="position:absolute; right: 0; bottom: -10px; width: 28px;" alt="" />
                </div>
             </div>
          </div>
       `;

      // Rule 1: No Time
      if (!ascendant) {
        contentHtml += noTimeHtml;
      } else {
        // Rule 2 & 3 Logic
        const CO_RULERS = { Scorpio: 'Pluto', Aquarius: 'Uranus', Pisces: 'Neptune' };
        const coRulerSigns = ['Scorpio', 'Aquarius', 'Pisces', 'Virgo', 'Taurus'];
        const isCoRuler = coRulerSigns.includes(ascendant) && CO_RULERS[ascendant];

        const ruler1 = chartDTO.chartRuler?.planet;
        const ruler2 = CO_RULERS[ascendant] || null;

        let crSignText = '', crHouseText = '';
        if (ruler2) {
          const r2 = ruler2.toLowerCase();
          const mapSign = { pluto: PLUTO_SIGN_TEXT, uranus: URANUS_SIGN_TEXT, neptune: NEPTUNE_SIGN_TEXT };
          const mapHouse = { pluto: PLUTO_HOUSE_TEXT, uranus: URANUS_HOUSE_TEXT, neptune: NEPTUNE_HOUSE_TEXT };
          crSignText = pickVal(mapSign[r2], p[r2]?.sign);
          crHouseText = pickVal(mapHouse[r2], String(p[r2]?.house));
        }

        // Title for the Ruler Section
        contentHtml += `
             <div class="page-break"></div>
             <!-- Header with subtle glow -->
             <div style="text-align: center; margin: 40px 0 20px;">
               <h1 style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #FFFFFF; text-transform: uppercase; font-size: 28px; font-weight: 600; letter-spacing: 0.15em; margin: 0 0 20px 0; text-shadow: 0 0 20px rgba(142, 197, 252, 0.6), 0 0 40px rgba(142, 197, 252, 0.3), 0 2px 4px rgba(0, 0, 0, 0.5);">
                 My Astro-Cinematic Chart II
               </h1>
               <img src="/assets/planet_ring_pinkish.png" style="width:80px; margin-bottom:10px;" alt="Planet" />
               <h2 style="color:#FFD7F3; font-family:'Oswald',sans-serif; text-transform:uppercase; font-weight: 600;">Chart Ruler</h2>
               <div style="color:#FAF1E4; font-family:'Inter',sans-serif; font-size:14px; margin-top:15px; font-style:italic; line-height:1.5; padding:0 20px;">
                 Your chart ruler is the ruling planet of your<br/>
                 Ascendant sign. Its sign and house show how your<br/>
                 storyline unfolds and who's directing the vibe<br/>
                 behind the scenes.
               </div>
             </div>
           `;

        // Rule 2: Co-Ruler
        if (isCoRuler) {
          contentHtml += `
                <div class="card card-gold" style="text-align:center">
                   <div class="ruler-eq">Your Chart Ruler + Co-Chart Ruler = ${ruler2 || 'Unknown'} + ${ruler1}</div>
                   
                   <div class="ruler-header">Chart Ruler in the Sign</div>
                   <div class="card" style="border-color:#8FBCFF">${esc(pickVal(CHART_RULER_TEXT, p[ruler1.toLowerCase()]?.sign) || `${ruler1} in Sign`)}</div>
                   
                   <div class="ruler-header">Chart Ruler in the House</div>
                   <div class="card" style="border-color:#8FBCFF">${esc(pickVal(CHART_RULER_HOUSE_TEXT, String(chartDTO.chartRuler?.house)) || `House ${chartDTO.chartRuler?.house}`)}</div>

                   <div class="ruler-header">Co-Chart Ruler in the Sign</div>
                   <div class="card" style="border-color:#8FBCFF">${esc(crSignText || `${ruler2} in ${p[ruler2?.toLowerCase()]?.sign}`)}</div>

                   <div class="ruler-header">Co-Chart Ruler in the House</div>
                   <div class="card" style="border-color:#8FBCFF">${esc(crHouseText || `House ${p[ruler2?.toLowerCase()]?.house}`)}</div>
                </div>
              `;
        } else {
          // Rule 3: Single Ruler
          const ruler1Lower = ruler1?.toLowerCase();
          const rulerSign = p[ruler1Lower]?.sign || '';
          const rulerHouse = chartDTO.chartRuler?.house || '';

          const rulerSignText = pickVal(CHART_RULER_TEXT, rulerSign) || `Chart Ruler in ${rulerSign}`;
          const rulerHouseText = pickVal(CHART_RULER_HOUSE_TEXT, String(rulerHouse)) || `House ${rulerHouse}`;

          contentHtml += `
                <div style="text-align:center; margin: 30px 0;">
                   <div class="ruler-eq" style="color:#A2C5E2; font-family:'Oswald',sans-serif; font-weight:bold; font-size:18px; margin-bottom:20px;">Your Chart Ruler = ${ruler1}</div>
                   <img src="/assets/star_pink.png" style="width:140px; margin: 20px auto; display:block;" alt="Star" />
                </div>
                
                <div style="display: flex; gap: 15px; margin: 30px 0; flex-wrap: wrap; align-items: stretch;">
                   <!-- Left Box: Chart Ruler in the Sign -->
                   <div style="flex: 1; min-width: 200px; display: flex; flex-direction: column;">
                      <h2 style="color:#FFD7F3; font-family:'Oswald',sans-serif; text-transform:uppercase; margin-bottom:10px; text-align:center;">Chart Ruler in the Sign</h2>
                      <div class="card" style="border-color:#8FBCFF; text-align:center; padding:20px; flex: 1; display: flex; flex-direction: column;">
                         <div style="font-weight:bold; color:#FFFFFF; font-family:'Oswald',sans-serif; margin-bottom:10px;">Chart Ruler in ${rulerSign}</div>
                         <div style="color:#B6DAF7; font-family:'Inter',sans-serif; font-size:14px; line-height:1.5; flex: 1;">${esc(rulerSignText)}</div>
                      </div>
                   </div>
                   
                   <!-- Right Box: Chart Ruler in the House -->
                   <div style="flex: 1; min-width: 200px; display: flex; flex-direction: column;">
                      <h2 style="color:#FFD7F3; font-family:'Oswald',sans-serif; text-transform:uppercase; margin-bottom:10px; text-align:center;">Chart Ruler in the House</h2>
                      <div style="color:#B6DAF7; font-family:'Inter',sans-serif; font-size:12px; margin-bottom:15px; text-align:center; font-style:italic;">Where Your Story Unfolds</div>
                      <div class="card" style="border-color:#8FBCFF; text-align:center; padding:20px; flex: 1; display: flex; flex-direction: column;">
                         <div style="font-weight:bold; color:#FFFFFF; font-family:'Oswald',sans-serif; margin-bottom:10px;">Chart Ruler in the ${rulerHouse}${rulerHouse ? (rulerHouse === 1 ? 'st' : rulerHouse === 2 ? 'nd' : rulerHouse === 3 ? 'rd' : 'th') : ''} House</div>
                         <div style="color:#B6DAF7; font-family:'Inter',sans-serif; font-size:14px; line-height:1.5; flex: 1;">${esc(rulerHouseText)}</div>
                      </div>
                   </div>
                </div>
              `;
        }

        // Astrological Houses - only show if we have house signs (which we should if ascendant exists)
        if (chartDTO.houseSigns && chartDTO.houseSigns.length > 0 && chartDTO.houseSigns.some(s => s !== null && s !== undefined)) {
          contentHtml += `
               <div class="page-break"></div>
               <div style="text-align:center; margin:40px 0 20px">
                 <h2 style="color:#FFD7F3; font-family:'Oswald',sans-serif; text-transform:uppercase;">Astrological Houses</h2>
                 <div style="font-size:14px; color:#FAF1E4; font-family:'Inter',sans-serif; font-style:italic; margin-top:10px; line-height:1.4;">
                   Every house is a different part of your life: identity, money, love, glow-ups, chaos, karma — all of it.<br/>
                   The sign on each house shows how you express yourself in that area. It's not the "what," it's the vibe.
                 </div>
                 <img src="/assets/starglow_medium.png" style="width:30px; margin-top:15px;" alt="Glow" />
               </div>
             `;
          const HOUSE_TEXTS = [HOUSE_1_TEXT, HOUSE_2_TEXT, HOUSE_3_TEXT, HOUSE_4_TEXT, HOUSE_5_TEXT, HOUSE_6_TEXT, HOUSE_7_TEXT, HOUSE_8_TEXT, HOUSE_9_TEXT, HOUSE_10_TEXT, HOUSE_11_TEXT, HOUSE_12_TEXT];

          // Archetypes for sub-headers
          const HOUSES_ARCHETYPES = [
            "Identity, Persona, Physical Body - AC",
            "Money, Values, Self-Worth",
            "Communication, Siblings, Daily Environment",
            "Home, Family, Roots",
            "Creativity, Romance, Play",
            "Work, Health, Daily Routines - IC",
            "Partnerships, Love, Mirrors - DC",
            "Sex, Transformation, Power",
            "Travel, Philosophy, Belief",
            "Career, Reputation, Legacy - MC",
            "Friends, Future, Community",
            "Subconscious, Dreams, Secrets"
          ];

          // Start Grid Wrapper
          contentHtml += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">`;

          chartDTO.houseSigns.forEach((sign, i) => {
            if (sign !== null && sign !== undefined) {
              const txt = pickVal(HOUSE_TEXTS[i], sign) || `${i + 1} House in ${sign}`;
              const archetype = HOUSES_ARCHETYPES[i] || "";

              const suffix = (n) => {
                const j = n % 10, k = n % 100;
                if (j == 1 && k != 11) return n + "st";
                if (j == 2 && k != 12) return n + "nd";
                if (j == 3 && k != 13) return n + "rd";
                return n + "th";
              };

              contentHtml += `
                    <div style="display: flex; flex-direction: column;">
                       <h3 style="color:#FFFFFF; font-family:'Oswald',sans-serif; font-size:20px; font-weight:bold; margin:0 0 5px 0;">${suffix(i + 1)} House</h3>
                       <div style="color:#B6DAF7; font-family:'Inter',sans-serif; font-size:12px; font-style:italic; margin-bottom:10px; opacity:0.8;">${archetype}</div>
                       
                       <div class="card" style="border:1px solid #8FBCFF; border-radius:12px; padding:20px; background:transparent; flex: 1; box-sizing: border-box; display: flex; flex-direction: column;">
                          <div style="font-size:14px; opacity:0.8; margin-bottom:8px; font-weight:bold; color:#DFCDF5;">${sign}</div>
                          <div class="content-text" style="font-size:14px; color:#FFFFFF; line-height:1.5; flex: 1;">${esc(txt)}</div>
                       </div>
                    </div>
                 `;
            }
          });

          // End Grid Wrapper
          contentHtml += `</div>`;
        }


        // --- Planets in Houses (Vertical Stack) ---
        const PLANETS_ORDER = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
        const PLANET_Keys = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
        const PLANET_TEXTS = [SUN_HOUSE_TEXT, MOON_HOUSE_TEXT, MERCURY_HOUSE_TEXT, VENUS_HOUSE_TEXT, MARS_HOUSE_TEXT, JUPITER_HOUSE_TEXT, SATURN_HOUSE_TEXT, URANUS_HOUSE_TEXT, NEPTUNE_HOUSE_TEXT, PLUTO_HOUSE_TEXT];

        const PLANET_ARCHETYPES = {
          Sun: "Where You Radiate",
          Moon: "Your Emotional Habitat",
          Mercury: "Your Mind's Operating System",
          Venus: "Love Language & Aesthetic Aura",
          Mars: "Your Drive & Action Style",
          Jupiter: "Where You Expand & Grow",
          Saturn: "Your Responsibilities & Lessons",
          Uranus: "Where You Innovate",
          Neptune: "Your Imagination & Dreams",
          Pluto: "Your Power & Transformation"
        };


        contentHtml += `
            <div class="page-break"></div>
             <div style="text-align:center; margin:40px 0 40px">
               <img src="/assets/starglow_large.png" style="width:20px; vertical-align:middle; margin-right:10px;" alt="" />
               <h2 style="display:inline; color:#FFD7F3; font-family:'Oswald',sans-serif; text-transform:uppercase; font-style:normal;">Planets in the Houses</h2>
               <img src="/assets/starglow_large.png" style="width:20px; vertical-align:middle; margin-left:10px;" alt="" />
               
               <div style="font-size:14px; color:#FAF1E4; font-family:'Inter',sans-serif; font-style:italic; margin-top:20px; line-height:1.5;">
                 Planets show what the energy is.<br/>
                 Houses show where it hits.<br/>
                 Put them together and you<br/>
                 get the true plot of your chart.
               </div>
             </div>
             <div style="display: flex; flex-wrap: wrap; gap: 15px;">
           `;

        PLANETS_ORDER.forEach((pName, idx) => {
          const pKey = PLANET_Keys[idx];
          const houseNum = chartDTO.planets?.[pKey]?.house;
          if (houseNum) {
            const textMap = PLANET_TEXTS[idx];
            let rawText = pickVal(textMap, String(houseNum));

            const suffix = (n) => {
              const j = n % 10, k = n % 100;
              if (j == 1 && k != 11) return n + "st";
              if (j == 2 && k != 12) return n + "nd";
              if (j == 3 && k != 13) return n + "rd";
              return n + "th";
            };

            let title = `${pName} in the ${suffix(houseNum)} House`;
            let body = rawText;

            if (rawText.includes('—')) {
              const parts = rawText.split('—');
              if (parts.length > 1) body = parts.slice(1).join('—').trim();
            } else if (rawText.includes(' - ')) {
              const parts = rawText.split(' - ');
              if (parts.length > 1) body = parts.slice(1).join(' - ').trim();
            }

            contentHtml += `
                 <div style="display: flex; flex-direction: column; flex: 1 1 calc(50% - 15px); min-width: 0; max-width: 100%;">
                    <h3 style="color:#FFFFFF; font-family:'Oswald',sans-serif; font-size:16px; font-weight:bold; margin:0 0 5px 0;">${pName} in the House</h3>
                    <div style="color:#B6DAF7; font-family:'Inter',sans-serif; font-size:12px; font-style:italic; margin-bottom:10px; opacity:0.8;">${PLANET_ARCHETYPES[pName] || ''}</div>
                    
                    <div class="card" style="border:1px solid #FFD18F; border-radius:12px; padding:20px; background:transparent; flex: 1; box-sizing: border-box; display: flex; flex-direction: column;">
                       <div style="font-weight:bold; color:#FFFFFF; font-family:'Oswald',sans-serif; margin-bottom:8px; font-size:16px;">${title}</div>
                       <div class="content-text" style="font-size:14px; color:#FFFFFF; line-height:1.5; flex: 1;">${esc(body)}</div>
                    </div>
                 </div>
               `;
          }
        });

        contentHtml += `</div>`; // Close grid
      }

      // Navigation buttons
      contentHtml += `
       `;

      // Always render footer/disclaimer
      contentHtml += `
          <div class="disclaimer" style="text-align: left; margin-top: 40px; font-size: 9px; line-height: 1.4;">
             <strong>MINI-DISCLAIMER</strong><br/>
             We'll use your birth info to match you with movie recs based on planetary vibes. Your data is sacred. Like a vintage VHS. It's not sold, rented, or streamed.
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px; font-size: 14px;">
             <a href="https://www.fateflix.app" style="color:#fff; text-decoration:none">www.fateflix.app</a>
             <span>@fateflixapp</span>
          </div>
       `;

    } else {
      contentHtml = '<p>No chart data available.</p>';
    }

    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>FateFlix Reading – ${esc(submissionId)}</title>
      <style>${styles}</style>
    </head>
    <body>
      <div class="wrap">
        ${contentHtml}
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
    let { date, time, latitude, longitude, timeAccuracy } = req.body || {};
    let isUnknownTime = false;

    // Default to 12:00 (noon) if time is missing OR accuracy is unknown
    if (!time || timeAccuracy === 'unknown') {
      time = '12:00';
      isUnknownTime = true;
    }

    if (!date || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required fields (date, latitude, longitude).' });
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
    const mc = normalize360(housesRes.mc);
    const houseCusps = (housesRes.house || []).map(normalize360);

    const descendantDeg = (ascendant + 180) % 360;
    const icDeg = (mc + 180) % 360;
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

    const houseSigns = houseCusps.map(signFromLongitude);
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
      p.sign = signFromLongitude(p.longitude);
      p.house = planetsInHouses[name];
    }

    // Mask if unknown time
    if (isUnknownTime) {
      // angles
      angles.ascendantDeg = null;
      angles.ascendantSign = null;
      angles.mcDeg = null;
      angles.mcSign = null;
      angles.descendantDeg = null;
      angles.descendantSign = null;
      angles.icDeg = null;
      angles.icSign = null;

      // houses
      // houseCusps is an array of numbers
      for (let i = 0; i < houseCusps.length; i++) houseCusps[i] = null;

      for (let i = 0; i < houseSigns.length; i++) houseSigns[i] = null;
      for (let i = 0; i < houseRulers.length; i++) houseRulers[i] = null;

      for (const k in planetsInHouses) planetsInHouses[k] = null;
      for (let i = 0; i < planetsByHouse.length; i++) planetsByHouse[i] = [];

      for (const k in planets) {
        if (planets[k]) planets[k].house = null;
      }
    }

    return res.json({
      success: true,
      jd, ascendant: isUnknownTime ? null : ascendant, mc: isUnknownTime ? null : mc, angles,
      houses: houseCusps, houseSigns, houseRulers,
      planetsInHouses, planetsByHouse, planets
    });
  } catch (error) {
    console.error('Error in /api/chart-houses:', error);
    return res.status(500).json({ success: false, error: error.message || String(error) });
  }
});
app.get('/reading/:id/html', readingHtmlHandler);
// chart.svg endpoint moved up to line 1056 with birthday logic
chartSvgAlias(app);  // adds /api/chart/:id/svg redirect  

// === Get survey state (public, for resuming progress) =================
app.get("/api/survey/state/:submissionId", async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await prisma.surveySubmission.findUnique({
      where: { id: submissionId },
      include: {
        responses: {
          include: {
            question: {
              select: { key: true }
            },
            responseOptions: {
              include: {
                option: {
                  select: { value: true }
                }
              }
            }
          }
        },
        chart: {
          select: { id: true }
        }
      }
    });

    if (!submission) {
      return res.status(404).json({ ok: false, error: "Submission not found" });
    }

    // Transform to simple map: questionKey -> answerValue
    const answers = {};
    for (const r of submission.responses) {
      if (r.responseOptions.length > 0) {
        const values = r.responseOptions.map(ro => ro.option.value);
        answers[r.question.key] = values.length === 1 ? values[0] : values;
      } else {
        answers[r.question.key] = r.answerText;
      }
    }

    // Also include userEmail if present
    if (submission.userEmail) {
      answers["email"] = submission.userEmail;
    }

    res.json({
      ok: true,
      submissionId: submission.id,
      chartId: submission.chart ? submission.chart.id : null,
      answers
    });
  } catch (error) {
    console.error("❌ State retrieval failed:", error);
    res.status(500).json({ ok: false, error: "Internal Error" });
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

// === Survey submit (normalized via shim) ======================
app.post("/api/survey/submit", async (req, res) => {
  try {
    console.log("submit route v2 hit", new Date().toISOString());
    const safeBody = JSON.parse(JSON.stringify(req.body));
    if (safeBody?.survey?.section1?.chartData) safeBody.survey.section1.chartData = "(omitted)";
    console.log("submit v2 body (safe):", safeBody);

    const { userEmail: shimEmail, answers } = normalizeSurveyPayload(req.body);

    // Attempt multiple locations for userEmail
    const userEmail = shimEmail
      || req.body?.survey?.section1?.email
      || req.body?.survey?.['section-ix']?.email
      || req.body?.survey?.section9?.email
      || answers.find(a => a.questionKey?.endsWith('.email'))?.answerText
      || null;

    console.log('📧 Extracted userEmail:', userEmail);

    const username = req.body?.survey?.section1?.username
      || answers.find(a => a.questionKey === 'cosmic.username')?.answerText
      || null;
    console.log('👤 Extracted username for email:', username);

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

    // Send the "magic link" email
    if (userEmail) {
      console.log('📧 Attempting to send reading email to:', userEmail);
      // We don't await this so it doesn't block the UI response
      sendReadingEmail(userEmail, submission.id, username).catch(err => console.error('Email trigger failed:', err));
    }

    let madeResponses = 0;
    let linkedOptions = 0;

    for (const a of answers) {
      const key = a?.questionKey;
      if (!key) continue;
      // Skip non-question payload keys (birth-data & meta)
      // Skip meta payload keys
      if (key.startsWith('meta.')) continue;
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
        for (const val of a.optionValues) {
          if (val == null || val === '') continue;

          // 1. Try Strict Match (Value)
          let opt = q.options.find(o => o.value === val);

          // 2. Fallback: Match by Label (if strict match failed)
          if (!opt) {
            opt = q.options.find(o => o.label === val); // Exact label match
            if (opt) {
              console.warn(`⚠️  Survey Option Mismatch Resolved: Question "${q.key}" received "${val}", matched to Option "${opt.value}" via Label.`);
            }
          }

          // 3. Fallback: Case-insensitive Label (desperate measure)
          if (!opt && typeof val === 'string') {
            opt = q.options.find(o => o.label.toLowerCase() === val.toLowerCase());
            if (opt) {
              console.warn(`⚠️  Survey Option Fuzzy Matched: Question "${q.key}" received "${val}", matched to Option "${opt.value}" via fuzzy Label.`);
            }
          }

          if (opt) {
            await prisma.surveyResponseOption.create({
              data: { responseId: response.id, optionId: opt.id },
            });
            linkedOptions++;
          } else {
            console.warn(`❌ Survey Option Drop: Question "${q.key}" received "${val}" which matched NOTHING.`);
          }
        }
      }
    }
    const rawBaseUrl = process.env.FRONTEND_URL || process.env.BASE_URL || '';
    const baseUrl = rawBaseUrl.replace(/\/$/, '');
    const htmlUrl = `${baseUrl}/reading/${submission.id}`;
    return res.json({ ok: true, submissionId: submission.id, htmlUrl, responses: madeResponses, optionLinks: linkedOptions });
  } catch (e) {
    console.error("💥 submit error:", e);
    return res.status(500).json({ ok: false, error: e?.message ?? "Unknown error" });
  }
});

// === Save individual answer (for real-time saving) ==================
app.post("/api/survey/save-answer", async (req, res) => {
  try {
    const { submissionId, questionKey: frontendKey, answerValue, userEmail } = req.body;

    if (!submissionId) {
      return res.status(400).json({ ok: false, error: "submissionId is required" });
    }
    if (!frontendKey) {
      return res.status(400).json({ ok: false, error: "questionKey is required" });
    }

    // Verify submission exists
    const submission = await prisma.surveySubmission.findUnique({
      where: { id: submissionId },
      select: { id: true },
    });

    if (!submission) {
      return res.status(404).json({ ok: false, error: "Submission not found" });
    }

    // Map frontend key to database question key (same mapping as in /api/dev/chart-to-svg)
    const keyMapping = {
      // Section II: Casting
      'gender': 'casting.gender',
      'attraction_style': 'casting.attraction_style',
      'cine_level': 'casting.love_o_meter',
      'life_role': 'casting.movie_role',
      'escapism_style': 'casting.escapism_style',
      'first_crush': 'casting.first_obsession',
      // Section III: Taste
      'watch_habit': 'taste.how_you_watch',
      'fav_era': 'taste.favorite_era',
      'culture_background': 'taste.cultural_background',
      'environment_growing_up': 'taste.childhood_environment',
      // Section IV: Core Memory
      'first_feeling': 'core_memory.first_emotional',
      'life_changing': 'core_memory.life_changing',
      'comfort_watch': 'core_memory.comfort_watch',
      'power_watch': 'core_memory.power_movie',
      'date_impress': 'core_memory.impress_movie',
      // Section V: World
      'movie_universe': 'world.movie_universe',
      'villain_relate': 'world.villain',
      'forever_crush': 'world.forever_crush',
      'crave_most': 'world.crave_in_movie',
      'life_tagline': 'world.life_tagline',
      // Section VI: Screen Ed
      'tv_taste': 'screen_ed.tv_taste',
      'fav_tv': 'screen_ed.favorite_tv_show',
      'cinematography': 'screen_ed.cinematography',
      'directors': 'screen_ed.favorite_directors',
      'access_growing_up': 'screen_ed.access_growing_up',
      // Section VII: Genres
      'genres_love': 'genres.loved',
      'turn_offs': 'genres.turn_offs',
      'hated_film': 'genres.hated_but_loved',
      // Section Swipe
      'character_match': 'genres.twin_flame',
      // Section VIII: Global
      'foreign_films': 'global.foreign_films',
      // Section IX: Fit
      'selection_method': 'fit.pick_what_to_watch',
      'discovery': 'fit.found_survey',
      'email': 'fit.email',
      'beta_test': 'fit.beta_test',
      // Special case: frontend can send 'hall_of_fame' directly (combined top3 fields)
      'hall_of_fame': 'fit.hall_of_fame',
    };

    // Skip birth data keys (already in chart, but 'cosmic.name' should be saved)
    if (['date', 'time', 'latitude', 'longitude', 'city', 'country', 'time_accuracy'].includes(frontendKey)) {
      return res.json({ ok: true, skipped: true, reason: 'birth_data' });
    }

    // Get database question key
    const dbQuestionKey = keyMapping[frontendKey] || frontendKey;

    // Skip cosmic/meta keys
    // Skip meta keys
    if (dbQuestionKey.startsWith('meta.')) {
      return res.json({ ok: true, skipped: true, reason: 'meta' });
    }

    // Find question in database
    const question = await prisma.surveyQuestion.findUnique({
      where: { key: dbQuestionKey },
      include: { options: true },
    });

    if (!question) {
      return res.status(404).json({ ok: false, error: `Question not found for key: ${dbQuestionKey}` });
    }

    // Delete existing response for this question (upsert behavior)
    await prisma.surveyResponse.deleteMany({
      where: {
        submissionId: submissionId,
        questionId: question.id,
      },
    });

    // Determine if answer is array (checkbox) or single value
    const isArray = Array.isArray(answerValue);
    const answerText = isArray ? null : (answerValue != null && answerValue !== '' ? String(answerValue) : null);
    const optionValues = isArray ? answerValue.filter(v => v != null && v !== '') : [];

    // Create new response
    const response = await prisma.surveyResponse.create({
      data: {
        questionId: question.id,
        submissionId: submissionId,
        answerText: answerText,
        userId: userEmail || "anonymous",
      },
      select: { id: true },
    });

    // Link options if provided
    let optionCount = 0;
    if (optionValues.length > 0) {
      const allowed = new Set(question.options.map(o => o.value));
      const chosen = optionValues.filter(v => allowed.has(v));
      for (const val of chosen) {
        const opt = question.options.find(o => o.value === val);
        if (opt) {
          await prisma.surveyResponseOption.create({
            data: { responseId: response.id, optionId: opt.id },
          });
          optionCount++;
        }
      }
    }

    return res.json({
      ok: true,
      responseId: response.id,
      questionKey: dbQuestionKey,
      optionCount: optionCount,
    });
  } catch (e) {
    console.error("💥 save-answer error:", e);
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