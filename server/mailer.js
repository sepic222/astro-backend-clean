// server/mailer.js
const { Resend } = require('resend');

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || 'FateFlix <noreply@example.com>';

let resend = null;
if (apiKey) {
  resend = new Resend(apiKey);
}

async function sendHtmlEmail({ to, subject, html }) {
  if (!resend) throw new Error('RESEND_API_KEY missing');
  const r = await resend.emails.send({ from, to, subject, html });
  if (r?.error) throw new Error(r.error?.message || 'Send failed');
  return r;
}

module.exports = { sendHtmlEmail };