const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const submissionIds = [
    'cmkhc6up400fnn11lvormflun',
    'cmkhalrmi008dn11lura0e9x9',
    'cmk8eu8gx04mcl61lxxe4v92y',
    'cmk71vhlv047yl61lcurm8pld',
    'cmk5x3fxv03sul61l6fd7utta',
    'cmk5s35so03hrl61l3ljoolys',
    'cmk5barsk038ll61lxfmjcsbb',
    'cmk4mf5zy02tsl61lie68eczg',
    'cmk4kp9lg02m9l61lw0kpvpp2',
    'cmk4cz7xf01tal61lksgdu6sv',
    'cmk4bquh901ecl61lkcrqifhu',
    'cmk4a93f300vpl61ljdhioq6g',
    'cmk4a7w9k00tal61l4lmop5ut',
    'cmk47jlhc00chl61l4yl43j5i',
    'cmk3yhig70078mm1l9041l570',
    'cmjukw5sb003mll1lc7wejoyg',
    'cmjg340ov01hpmj1lxw9lpsq4',
    'cmi3q9t6d0004mx19hdd28tq6'
];

async function main() {
    console.log(`Fetching data for ${submissionIds.length} submissions...\n`);

    // Get all questions to build column reference
    const allQuestions = await prisma.surveyQuestion.findMany({
        orderBy: [
            { section: { sortOrder: 'asc' } },
            { sortOrder: 'asc' }
        ],
        include: { section: true }
    });

    const questionKeys = allQuestions.map((q, i) => ({
        id: q.id,
        key: q.key,
        numberedId: `Q${i + 1}_${q.key}`
    }));

    // Fetch submissions
    const submissions = await prisma.surveySubmission.findMany({
        where: { id: { in: submissionIds } },
        include: {
            chart: true,
            responses: {
                include: {
                    question: true,
                    responseOptions: {
                        include: { option: true }
                    }
                }
            }
        }
    });

    console.log(`Found ${submissions.length} out of ${submissionIds.length} submissions.`);

    // Mapping logic for a single submission
    const dataRows = submissions.map(sub => {
        const rc = sub.chart?.rawChart || {};
        const planets = rc.planets || {};
        const angles = rc.angles || {};

        // Robust answer extraction
        const answerMap = {};
        for (const r of sub.responses) {
            let answerDisplay = '';
            if (r.responseOptions && r.responseOptions.length > 0) {
                const values = r.responseOptions.map(ro => ro.option.label || ro.option.value);
                answerDisplay = values.join('; ');
            }
            if (!answerDisplay || answerDisplay === 'null') {
                const raw = (r.answerText || '').trim();
                if (raw && raw !== 'null' && raw !== '[object Object]') {
                    try {
                        if (raw.startsWith('[') || raw.startsWith('{')) {
                            const parsed = JSON.parse(raw);
                            if (Array.isArray(parsed)) answerDisplay = parsed.join('; ');
                            else if (typeof parsed === 'object' && parsed.selected) {
                                answerDisplay = Array.isArray(parsed.selected) ? parsed.selected.join('; ') : String(parsed.selected);
                            } else answerDisplay = raw;
                        } else answerDisplay = raw;
                    } catch (e) {
                        answerDisplay = raw;
                    }
                }
            }
            if (answerDisplay === 'null' || answerDisplay === '[object Object]') answerDisplay = '';
            answerMap[r.questionId] = answerDisplay;
        }

        // Build the row based on the template
        // Row 2 Fields: Prisma Name...	SubID	Email	Date	City	Country	[Empty]	Desc	IC	MC	SunS	SunH	MoonS	MoonH	MerS	MerH	VenS	VenH	MarS	MarH	JupS	JupH?	SatS	SatH	UraS	UraH	NepS	NepH	PluS	PluH	CRulerS	CRulerH	NodeH
        const row = [
            'Submission', // Prisma Name of data entry
            sub.id,
            sub.userEmail || '',
            sub.createdAt ? sub.createdAt.toISOString() : '',
            sub.chart?.city || '',
            sub.chart?.country || '',
            angles.ascendantSign || '', // Col 7: Rising_Sign (from row 3 headers)
            angles.descendantSign || '',
            angles.icSign || '',
            angles.mcSign || '',
            planets.sun?.sign || '',
            planets.sun?.house || '',
            planets.moon?.sign || '',
            planets.moon?.house || '',
            planets.mercury?.sign || '',
            planets.mercury?.house || '',
            planets.venus?.sign || '',
            planets.venus?.house || '',
            planets.mars?.sign || '',
            planets.mars?.house || '',
            planets.jupiter?.sign || '',
            planets.jupiter?.house || '', // Row 2 said jupiterSign twice, but House makes sense
            planets.saturn?.sign || '',
            planets.saturn?.house || '',
            planets.uranus?.sign || '',
            planets.uranus?.house || '',
            planets.neptune?.sign || '',
            planets.neptune?.house || '',
            planets.pluto?.sign || '',
            planets.pluto?.house || '',
            rc.chartRulerPlanet || '', // Simple ruler name if sign not explicit
            rc.chartRulerHouse || '',
            rc.nodesAndChiron?.northNode?.house || '',
            // Survey Answers (start at Col 34 if count is right)
            ...questionKeys.map(q => {
                const ans = answerMap[q.id] || '';
                return String(ans).replace(/\t/g, ' ').replace(/\n/g, ' | ');
            })
        ];
        return row;
    });

    // Headers from the draft file (reconstructed to be safe)
    const line1 = "Table 1";
    const line2 = ["Prisma Name of data entry", "Submission ID (id A)", "userEmail", "Created_At", "City", "Country", "", "descendantSign", "icSign", "mcSign", "sunSign", "sunHouse", "moonSign", "moonHouse", "mercurySign", "mercuryHouse", "venusSign", "venusHouse", "marsSign", "marsHouse", "jupiterSign", "jupiterHouse", "saturnSign", "saturnHouse", "uranusSign", "uranusHouse", "neptuneSign", "neptuneHouse", "plutoSign", "plutoHouse", "ChartRulerSign", "ChartRulerHouse", "northNodeHouse"].join('\t');
    const line3 = ["Other name of data entry", "Submission_ID", "Email", "Created_At", "Birth_City", "Birth_Country", "Rising_Sign", "", "", "Sun_Sign", "", "Moon_Sign", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ...questionKeys.map(q => q.numberedId)].join('\t');

    const content = [
        line1,
        line2,
        line3,
        ...dataRows.map(r => r.join('\t'))
    ].join('\n');

    const outputPath = path.join(__dirname, '..', 'Database Master test_export.tsv');
    fs.writeFileSync(outputPath, content, 'utf-8');

    console.log(`\n✅ Combined report created!`);
    console.log(`📄 File: ${outputPath}`);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
