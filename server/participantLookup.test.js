// Run with: node --test server/participantLookup.test.js
const test = require('node:test');
const assert = require('node:assert');
const { normalizeEmail, hasValidKey, findFinishedSurveyByEmail, participantLookupHandler } = require('./participantLookup');

function fakePrisma({ submissions = [], readings = [] }) {
  return {
    surveySubmission: {
      findMany: async ({ where }) => {
        const f = where.userEmail;
        return submissions.filter((s) => {
          const value = (s.userEmail || '').toLowerCase();
          if (f.equals) return value === f.equals.toLowerCase();
          return value.includes(f.contains.toLowerCase());
        });
      },
    },
    reading: {
      findFirst: async ({ where }) => {
        const list = readings
          .filter((r) => where.submissionId.in.includes(r.submissionId))
          .sort((a, b) => b.createdAt - a.createdAt);
        return list[0] ?? null;
      },
    },
  };
}

function fakeRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
  };
}

test('normalizeEmail trims and lowercases, rejects non-emails', () => {
  assert.strictEqual(normalizeEmail('  Mi@Example.COM '), 'mi@example.com');
  for (const bad of [undefined, null, 42, '', 'nope', 'a@b', 'a b@c.de']) assert.strictEqual(normalizeEmail(bad), null);
});

test('hasValidKey needs the exact bearer key', () => {
  assert.strictEqual(hasValidKey('Bearer secret-key', 'secret-key'), true);
  assert.strictEqual(hasValidKey('Bearer other', 'secret-key'), false);
  assert.strictEqual(hasValidKey('secret-key', 'secret-key'), false);
  assert.strictEqual(hasValidKey(undefined, 'secret-key'), false);
  assert.strictEqual(hasValidKey('Bearer secret-key', undefined), false);
});

test('finds the newest finished survey, ignoring case and stray spaces', async () => {
  const prisma = fakePrisma({
    submissions: [
      { id: 'c-old', userEmail: 'Mi@Example.com' },
      { id: 'c-new', userEmail: ' mi@example.com ' },
      { id: 'c-other', userEmail: 'someone@else.com' },
    ],
    readings: [
      { submissionId: 'c-old', createdAt: new Date('2026-05-01T10:00:00Z') },
      { submissionId: 'c-new', createdAt: new Date('2026-06-01T10:00:00Z') },
    ],
  });
  assert.deepStrictEqual(await findFinishedSurveyByEmail(prisma, 'mi@example.com'), {
    submissionId: 'c-new',
    completedAt: '2026-06-01T10:00:00.000Z',
  });
});

test('an unfinished survey (no reading) does not count', async () => {
  const prisma = fakePrisma({ submissions: [{ id: 'c1', userEmail: 'mi@example.com' }], readings: [] });
  assert.strictEqual(await findFinishedSurveyByEmail(prisma, 'mi@example.com'), null);
});

test('handler: switched off without a key, 401 with a wrong key, found/not found otherwise', async () => {
  const prisma = fakePrisma({
    submissions: [{ id: 'c1', userEmail: 'mi@example.com' }],
    readings: [{ submissionId: 'c1', createdAt: new Date('2026-05-01T10:00:00Z') }],
  });
  const handler = participantLookupHandler(prisma);
  const saved = process.env.PARTICIPANT_LOOKUP_KEY;
  try {
    delete process.env.PARTICIPANT_LOOKUP_KEY;
    let res = fakeRes();
    await handler({ headers: {}, body: { email: 'mi@example.com' } }, res);
    assert.strictEqual(res.statusCode, 503);

    process.env.PARTICIPANT_LOOKUP_KEY = 'k';
    res = fakeRes();
    await handler({ headers: { authorization: 'Bearer wrong' }, body: { email: 'mi@example.com' } }, res);
    assert.strictEqual(res.statusCode, 401);

    res = fakeRes();
    await handler({ headers: { authorization: 'Bearer k' }, body: { email: 'not-an-email' } }, res);
    assert.strictEqual(res.statusCode, 400);

    res = fakeRes();
    await handler({ headers: { authorization: 'Bearer k' }, body: { email: 'MI@example.com' } }, res);
    assert.deepStrictEqual(res.body, { ok: true, found: true, submissionId: 'c1', completedAt: '2026-05-01T10:00:00.000Z' });

    res = fakeRes();
    await handler({ headers: { authorization: 'Bearer k' }, body: { email: 'nobody@example.com' } }, res);
    assert.deepStrictEqual(res.body, { ok: true, found: false });
  } finally {
    if (saved === undefined) delete process.env.PARTICIPANT_LOOKUP_KEY; else process.env.PARTICIPANT_LOOKUP_KEY = saved;
  }
});
