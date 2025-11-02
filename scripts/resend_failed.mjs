import { PrismaClient } from '@prisma/client';
import { sendHtmlEmail } from '../server/mailer.js';

const prisma = new PrismaClient();
const failed = await prisma.emailOutbox.findMany({ where: { status: 'FAILED' } });
for (const m of failed) {
  try {
    await sendHtmlEmail({ to: m.toEmail, subject: m.subject, html: m.htmlBody });
    await prisma.emailOutbox.update({ where: { id: m.id }, data: { status: 'SENT', sentAt: new Date(), error: null }});
    console.log('resent:', m.id);
  } catch (e) {
    console.error('still failing:', m.id, e?.message || e);
  }
}
process.exit(0);