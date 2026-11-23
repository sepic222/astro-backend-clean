// Survey participant lookup for the FateFlix app.
//
// Everyone who finished the taste-test survey gets free use of the app. When they sign up in the
// app with the same email they used for the survey, the app's Supabase function `verify-survey-id`
// asks this route whether that email has a finished survey, and links the two.
//
// Read only: it never changes survey data. It is locked with a shared key (PARTICIPANT_LOOKUP_KEY,
// set on Railway and as a Supabase function secret) so it cannot be used to test arbitrary emails.
// Without the key configured the route is switched off (503).

const crypto = require('crypto');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Lowercased, trimmed email, or null when it cannot be an email. */
function normalizeEmail(value) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (email.length === 0 || email.length > 320 || !EMAIL_PATTERN.test(email)) return null;
  return email;
}

/** Constant-time check of `Authorization: Bearer <key>` against the configured key. */
function hasValidKey(authorizationHeader, configuredKey) {
  if (!configuredKey || typeof authorizationHeader !== 'string') return false;
  const match = authorizationHeader.match(/^Bearer (.+)$/i);
  if (!match) return false;
  const given = crypto.createHash('sha256').update(match[1]).digest();
  const expected = crypto.createHash('sha256').update(configuredKey).digest();
  return crypto.timingSafeEqual(given, expected);
}

/**
 * The newest finished survey for this email: a submission with that email (any letter case) that
 * has a reading, which the survey creates when it is finished. Returns null when there is none.
 */
async function findFinishedSurveyByEmail(prisma, email) {
  // `contains` also catches older rows with stray spaces around the email; the exact check follows.
  const candidates = await prisma.surveySubmission.findMany({
    where: { userEmail: { contains: email, mode: 'insensitive' } },
    select: { id: true, userEmail: true },
  });
  const ids = new Set(
    candidates.filter((s) => (s.userEmail || '').trim().toLowerCase() === email).map((s) => s.id),
  );
  if (ids.size === 0) return null;

  const reading = await prisma.reading.findFirst({
    where: { submissionId: { in: [...ids] } },
    orderBy: { createdAt: 'desc' },
    select: { submissionId: true, createdAt: true },
  });
  if (!reading) return null;
  return { submissionId: reading.submissionId, completedAt: reading.createdAt.toISOString() };
}

/** Express handler for POST /api/participants/lookup  { email } */
function participantLookupHandler(prisma) {
  return async (req, res) => {
    const configuredKey = process.env.PARTICIPANT_LOOKUP_KEY;
    if (!configuredKey) return res.status(503).json({ ok: false, error: 'Lookup is not configured' });
    if (!hasValidKey(req.headers.authorization, configuredKey)) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
    const email = normalizeEmail(req.body?.email);
    if (!email) return res.status(400).json({ ok: false, error: 'A valid email is required' });

    try {
      const found = await findFinishedSurveyByEmail(prisma, email);
      if (!found) return res.json({ ok: true, found: false });
      return res.json({ ok: true, found: true, ...found });
    } catch (e) {
      console.error('💥 /api/participants/lookup error:', e?.message);
      return res.status(500).json({ ok: false, error: 'Lookup failed' });
    }
  };
}

module.exports = { normalizeEmail, hasValidKey, findFinishedSurveyByEmail, participantLookupHandler };
