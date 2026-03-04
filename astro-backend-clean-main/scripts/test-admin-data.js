const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

// Mock helpers from server.js
function parseAnswer(answerText, responseOptions = []) {
    if (responseOptions && responseOptions.length > 0) {
        return responseOptions.map(ro => ro.option?.label || ro.option?.value).join('; ');
    }

    let answer = answerText;
    if (answer === null || answer === undefined) return '';
    if (answer === '[object Object]') return '(Data error)';

    if (typeof answer === 'object') {
        if (Array.isArray(answer)) {
            return answer.map(item => {
                if (typeof item === 'object' && item !== null) {
                    return item.label || item.value || item.text || JSON.stringify(item);
                }
                return String(item);
            }).join('; ');
        }

        if (answer.selected !== undefined) {
            if (Array.isArray(answer.selected)) {
                let result = answer.selected.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return item.label || item.value || item.text || JSON.stringify(item);
                    }
                    return String(item);
                }).join('; ');
                if (answer.otherText) result += '; ' + answer.otherText;
                return result;
            }
            if (typeof answer.selected === 'string') {
                return (answer.selected === 'other' && answer.otherText) ? answer.otherText : answer.selected;
            }
        }
        return JSON.stringify(answer);
    }

    if (typeof answer === 'string') {
        try {
            if (answer.startsWith('[') || answer.startsWith('{')) {
                const parsed = JSON.parse(answer);
                return parseAnswer(parsed);
            }
        } catch (e) { }
    }

    return String(answer);
}

const TEST_EMAIL_PATTERNS = ['@test.com', '@example.com', '@fateflix.app', 'test@', 'demo@', 'admin@'];
const FOUNDER_EMAILS = ['saraellenpicard@icloud.com'];
const TEST_NAME_PATTERNS = ['test', 'demo', 'admin', 'asdf', 'xxx', 'aaa', 'bbb'];

function isTestSubmission(submission, username = '', discoverySource = '', responseCount = 0, totalQuestions = 50) {
    const email = (submission?.userEmail || '').toLowerCase();
    const nameLower = (username || '').toLowerCase().trim();

    for (const pattern of TEST_EMAIL_PATTERNS) {
        if (email.includes(pattern.toLowerCase())) return { isTest: true, reason: `Pattern: ${pattern}` };
    }
    const completionRate = totalQuestions > 0 ? (responseCount / totalQuestions) : 0;
    for (const founderEmail of FOUNDER_EMAILS) {
        if (email === founderEmail.toLowerCase()) {
            if (completionRate < 0.9) return { isTest: true, reason: `Founder email low completion` };
        }
    }
    for (const pattern of TEST_NAME_PATTERNS) {
        if (nameLower === pattern || nameLower.includes(pattern)) return { isTest: true, reason: `Name pattern: ${pattern}` };
    }
    if (nameLower.length > 0 && nameLower.length <= 2) return { isTest: true, reason: 'Name too short' };

    return { isTest: false, reason: 'Real' };
}

const SURVEY_QUESTION_ORDER = [
    'cosmic.username', 'cosmic.date', 'cosmic.time', 'cosmic.time_accuracy', 'cosmic.city', 'cosmic.latitude', 'cosmic.longitude',
    'casting.gender', 'casting.attraction_style', 'casting.cine_level', 'casting.life_role', 'casting.escapism_style',
    'casting.top_3_movies', 'casting.first_crush',
    'taste.watch_habit', 'taste.fav_era', 'taste.culture_background', 'taste.environment_growing_up',
    'core_memory.first_feeling', 'core_memory.life_changing', 'core_memory.comfort_watch', 'core_memory.power_watch', 'core_memory.date_impress',
    'world.movie_universe', 'world.villain_relate', 'world.forever_crush', 'world.crave_most',
    'screen_ed.tv_taste', 'screen_ed.top_3_series_detailed', 'screen_ed.cinematography', 'screen_ed.directors', 'screen_ed.access_growing_up',
    'genres.genres_love', 'genres.turn_offs', 'genres.hated_film', 'genres.hype_style',
    'genres.character_match',
    'global.foreign_films',
    'fit.selection_method', 'fit.discovery_apps', 'fit.discovery', 'fit.email', 'fit.beta_test', 'fit.open_feedback'
];

async function testAdminData() {
    console.log('--- Testing /admin/data Logic ---');
    try {
        const { surveySchema } = require('../src/config/surveySchema');
        const dynamicColumns = [];
        surveySchema.forEach(section => {
            if (section.questions && Array.isArray(section.questions)) {
                section.questions.forEach(q => {
                    if (['text', 'radio', 'checkbox', 'textarea', 'email', 'date', 'time', 'number', 'hero_start'].includes(q.type)) {
                        if (!dynamicColumns.find(col => col.key === q.id)) {
                            dynamicColumns.push({ key: q.id, text: q.text, sectionId: section.id });
                        }
                    }
                });
            }
        });

        console.log(`Dynamic Columns: ${dynamicColumns.length}`);

        const submissions = await prisma.surveySubmission.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                chart: { select: { risingSign: true, sunSign: true, moonSign: true, city: true, birthDateTimeUtc: true } },
                responses: {
                    include: {
                        question: { select: { key: true } },
                        responseOptions: { include: { option: { select: { label: true, value: true } } } }
                    }
                }
            }
        });

        const rows = submissions.map(sub => {
            const answerMap = {};
            const fullData = (sub.fullData && typeof sub.fullData === 'object') ? sub.fullData : {};

            for (const resp of sub.responses) {
                const key = resp.question?.key;
                if (!key) continue;
                if (!answerMap[key]) {
                    answerMap[key] = parseAnswer(resp.answerText, resp.responseOptions);
                }
            }

            dynamicColumns.forEach(cat => {
                if (fullData[cat.key] !== undefined) {
                    answerMap[cat.key] = parseAnswer(fullData[cat.key]);
                }
            });

            const username = answerMap['cosmic.username'] || answerMap['username'] || '';
            const discoverySource = answerMap['fit.discovery'] || answerMap['discovery'] || '';
            const testResult = isTestSubmission(sub, username, discoverySource, sub.responses.length + Object.keys(fullData).length, 50);

            return { id: sub.id, answers: answerMap, isTest: testResult.isTest };
        });

        console.log(`Processed ${rows.length} rows.`);

        const orderedQuestions = [];
        for (const key of SURVEY_QUESTION_ORDER) {
            const col = dynamicColumns.find(c => c.key === key);
            if (col) orderedQuestions.push(col);
        }
        dynamicColumns.forEach(col => {
            if (!SURVEY_QUESTION_ORDER.includes(col.key)) {
                orderedQuestions.push(col);
            }
        });

        console.log(`Ordered Questions: ${orderedQuestions.length}`);
        console.log('✅ /admin/data logic finished successfully.');
    } catch (error) {
        console.error('❌ /admin/data logic failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAdminData();
