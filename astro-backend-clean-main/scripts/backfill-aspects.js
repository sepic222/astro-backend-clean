/**
 * backfill-aspects.js
 * One-time script to compute and store Major Aspects for all existing
 * real, complete submissions with a known birth time (ascendant not null).
 *
 * Run with:  node scripts/backfill-aspects.js
 * Dry-run:   node scripts/backfill-aspects.js --dry-run
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DRY_RUN = process.argv.includes('--dry-run');

// ─── Test-detection helpers (mirrored from server.js) ────────────────────────
const TEST_EMAIL_PATTERNS = ['@test.com', '@example.com', '@fateflix.app', 'test@', 'demo@', 'admin@'];
const FOUNDER_EMAILS = ['saraellenpicard@icloud.com'];
const TEST_NAME_PATTERNS = ['test', 'demo', 'admin', 'asdf', 'xxx', 'aaa', 'bbb'];

function isTestSubmission(submission, username = '', responseCount = 0) {
    const email = (submission?.userEmail || '').toLowerCase();
    const nameLower = (username || '').toLowerCase().trim();

    for (const pattern of TEST_EMAIL_PATTERNS) {
        if (email.includes(pattern.toLowerCase())) return true;
    }
    const completionRate = responseCount > 0 ? (responseCount / 50) : 0;
    for (const founderEmail of FOUNDER_EMAILS) {
        if (email === founderEmail.toLowerCase() && completionRate < 0.9) return true;
    }
    for (const pattern of TEST_NAME_PATTERNS) {
        if (nameLower === pattern || nameLower.includes(pattern)) return true;
    }
    if (nameLower.length > 0 && nameLower.length <= 2) return true;

    return false;
}

// ─── Aspect engine (mirrored from server.js) ─────────────────────────────────
const ASPECT_ORB = 8;
const PERSONAL_PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars'];
const OUTER_PLANETS = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const ALL_TEN_PLANETS = [...PERSONAL_PLANETS, ...OUTER_PLANETS];

const MAJOR_ASPECT_ANGLES = { Conjunction: 0, Opposition: 180 };

function computeAspects(planets, ascendantDeg = null, mcDeg = null) {
    const aspects = [];

    const angularDiff = (a, b) => {
        const diff = Math.abs(((a - b) + 360) % 360);
        return diff > 180 ? 360 - diff : diff;
    };

    const check = (label1, lon1, label2, lon2) => {
        for (const [aspectName, targetAngle] of Object.entries(MAJOR_ASPECT_ANGLES)) {
            const deviation = Math.abs(angularDiff(lon1, lon2) - targetAngle);
            if (deviation <= ASPECT_ORB) {
                aspects.push({
                    planet1: label1,
                    planet2: label2,
                    aspect: aspectName,
                    orb: Math.round(deviation * 100) / 100,
                    isExact: deviation < 1
                });
            }
        }
    };

    // Personal × Outer (50 pairs)
    for (const p of PERSONAL_PLANETS) {
        if (!planets[p]) continue;
        for (const o of OUTER_PLANETS) {
            if (!planets[o]) continue;
            check(p, planets[p].longitude, o, planets[o].longitude);
        }
    }

    // All 10 planets × AC and MC (40 pairs — only when birth time is known)
    if (ascendantDeg !== null && mcDeg !== null) {
        for (const p of ALL_TEN_PLANETS) {
            if (!planets[p]) continue;
            check(p, planets[p].longitude, 'ascendant', ascendantDeg);
            check(p, planets[p].longitude, 'mc', mcDeg);
        }
    }

    return aspects;
}

// Planet enum map (only these can be stored in ChartAspect)
const PLANET_ENUM_MAP = {
    sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus',
    mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn',
    uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto'
};

// ─── Main backfill ────────────────────────────────────────────────────────────
async function backfillAspects() {
    console.log(`\n🔭 Major Aspects Backfill Script`);
    console.log(`   Mode: ${DRY_RUN ? '🟡 DRY RUN (no writes)' : '🟢 LIVE'}\n`);

    // 1. Fetch all charts with a non-null ascendant (birth time known)
    //    Include their linked submission for test detection
    const charts = await prisma.chart.findMany({
        where: {
            ascendant: { not: null },   // birth time must be known
        },
        select: {
            id: true,
            ascendant: true,
            mc: true,
            rawChart: true,
            submissions: {
                select: {
                    id: true,
                    userEmail: true,
                    fullData: true,
                    _count: { select: { responses: true } }
                }
            }
        }
    });

    console.log(`   Found ${charts.length} charts with known birth time.\n`);

    let processed = 0, skipped_test = 0, skipped_no_planets = 0,
        skipped_existing = 0, written = 0, errors = 0;

    for (const chart of charts) {
        try {
            // ── FILTER: needs a linked real submission ──────────────────────
            const submission = chart.submissions?.[0];
            if (!submission) { skipped_test++; continue; }

            const fullData = (submission.fullData && typeof submission.fullData === 'object') ? submission.fullData : {};
            const username = fullData.username || fullData['cosmic.username'] || '';
            const responseCount = (submission._count?.responses || 0) + Object.keys(fullData).length;

            if (isTestSubmission(submission, username, responseCount)) {
                skipped_test++;
                continue;
            }

            // ── FILTER: needs planet longitude data in rawChart ─────────────
            const rawChart = (chart.rawChart && typeof chart.rawChart === 'object') ? chart.rawChart : {};
            const planets = rawChart.planets || {};

            if (!planets.sun || !planets.sun.longitude) {
                skipped_no_planets++;
                continue;
            }

            // ── FILTER: if aspects already exist for this chart, skip ───────
            const existingCount = await prisma.chartAspect.count({ where: { chartId: chart.id } });
            if (existingCount > 0) {
                skipped_existing++;
                continue;
            }

            // ── Compute aspects ─────────────────────────────────────────────
            const acDeg = typeof chart.ascendant === 'number' ? chart.ascendant : null;
            const mcDeg = chart.mc ?? rawChart.angles?.mcDeg ?? null;
            const aspects = computeAspects(planets, acDeg, typeof mcDeg === 'number' ? mcDeg : null);

            if (aspects.length === 0) {
                // Unusual but valid — no aspects within orb
                processed++;
                continue;
            }

            // Filter out angle aspects (ascendant/mc not in Planet enum)
            const aspectRows = aspects
                .filter(a => PLANET_ENUM_MAP[a.planet1] && PLANET_ENUM_MAP[a.planet2])
                .map(a => ({
                    chartId: chart.id,
                    a: PLANET_ENUM_MAP[a.planet1],
                    b: PLANET_ENUM_MAP[a.planet2],
                    aspect: a.aspect,
                    orb: a.orb,
                    strength: Math.round((1 - a.orb / 8) * 100)
                }));

            // ── Write to DB ─────────────────────────────────────────────────
            if (!DRY_RUN && aspectRows.length > 0) {
                await prisma.chartAspect.createMany({ data: aspectRows, skipDuplicates: true });
            }

            written += aspectRows.length;
            processed++;

            console.log(
                `   ✅ ${submission.userEmail || 'anon'} (chart: ${chart.id.slice(-8)}) ` +
                `→ ${aspectRows.length} planet aspects${aspects.length - aspectRows.length > 0 ? ` + ${aspects.length - aspectRows.length} angle aspects (in memory only)` : ''}`
            );

        } catch (err) {
            errors++;
            console.error(`   ❌ Chart ${chart.id}: ${err.message}`);
        }
    }

    // ── Summary ─────────────────────────────────────────────────────────────────
    console.log('\n─────────────────────────────────────────');
    console.log(`  Charts processed:      ${processed}`);
    console.log(`  Aspect rows ${DRY_RUN ? 'would write' : 'written'}:  ${written}`);
    console.log(`  Skipped (test):        ${skipped_test}`);
    console.log(`  Skipped (no planets):  ${skipped_no_planets}`);
    console.log(`  Skipped (already had): ${skipped_existing}`);
    if (errors > 0) console.log(`  Errors:                ${errors}`);
    console.log('─────────────────────────────────────────');
    if (DRY_RUN) console.log('\n  🟡 DRY RUN — nothing was written to the database.');
    else console.log('\n  🟢 Done! Aspects saved to ChartAspect table.');

    await prisma.$disconnect();
}

backfillAspects().catch(async (e) => {
    console.error('Fatal error:', e);
    await prisma.$disconnect();
    process.exit(1);
});
