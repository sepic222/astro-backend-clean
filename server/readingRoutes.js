// server/readingRoutes.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// If you want to use your builder here later:
// const { buildReading } = require('./readings');

function readingHtmlHandler(req, res) {
  (async () => {
    try {
      const { id } = req.params;
      const chart = await prisma.chart.findUnique({ where: { id } });
      if (!chart) return res.status(404).send(`<h1>404</h1><p>No chart found for id: ${id}</p>`);

      // (optional) hook your builder later:
      // const { text } = buildReading({ chartPayload: /* map from chart */, answersByKey: {} });

      const html = `<!doctype html>
<html><head><meta charset="utf-8"/>
<title>FateFlix Reading – ${id}</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:24px}
table{border-collapse:collapse} th,td{border:1px solid #ddd;padding:8px}
</style>
</head>
<body>
<h1>FateFlix — Reading</h1>
<p>Chart ID: <code>${id}</code></p>
<table>
  <tr><th>Ascendant</th><td>${chart.risingSign ?? '-'}</td></tr>
  <tr><th>MC</th><td>${chart.mcSign ?? '-'}</td></tr>
  <tr><th>Chart ruler</th><td>${chart.chartRulerPlanet ?? '-'} in house ${chart.chartRulerHouse ?? '-'}</td></tr>
  <tr><th>North Node</th><td>${chart.northNodeHouse ?? '-'}</td></tr>
  <tr><th>Chiron</th><td>${chart.chironHouse ?? '-'}</td></tr>
</table>
<p>SVG wheel: <a href="/reading/${id}/chart.svg">/reading/${id}/chart.svg</a></p>
</body></html>`;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(html);
    } catch (err) {
      console.error('[readingHtmlHandler] error:', err);
      res.status(500).send('Reading render failed');
    }
  })();
}

function readingSvgHandler(req, res) {
  (async () => {
    try {
      const { id } = req.params;
      const chart = await prisma.chart.findUnique({ where: { id } });
      if (!chart) return res.status(404).send('Not Found');

      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs><style>
    .ring{fill:none;stroke:#222;stroke-width:2}
    .tick{stroke:#999;stroke-width:1}
    .title{font:14px system-ui;-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
  </style></defs>
  <circle cx="200" cy="200" r="150" class="ring"/>
  <circle cx="200" cy="200" r="120" class="ring"/>
  ${Array.from({length:12}).map((_,i)=>{
    const a=(i*Math.PI*2)/12; const x1=200+150*Math.cos(a); const y1=200+150*Math.sin(a);
    const x2=200+120*Math.cos(a); const y2=200+120*Math.sin(a);
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="tick"/>`;
  }).join('')}
  <text x="200" y="24" text-anchor="middle" class="title">FateFlix • ${id}</text>
  <text x="200" y="44" text-anchor="middle" class="title">Asc ${chart.risingSign ?? '-'} • MC ${chart.mcSign ?? '-'}</text>
</svg>`;
      res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      res.status(200).send(svg);
    } catch (err) {
      console.error('[readingSvgHandler] error:', err);
      res.status(500).send('SVG render failed');
    }
  })();
}

module.exports = { readingHtmlHandler, readingSvgHandler };