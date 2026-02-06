import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  // 1) Create a submission
  const submission = await prisma.surveySubmission.create({
    data: { userEmail: "debug@example.com" },
    select: { id: true },
  });

  // 2) Pick any radio question that actually has options
  const q = await prisma.surveyQuestion.findFirst({
    where: { type: "radio" },
    include: { options: true },
  });
  if (!q || q.options.length === 0) {
    throw new Error("No radio question with options found.");
  }

  // 3) Create a response linked to the submission
 const resp = await prisma.surveyResponse.create({
        data: {
          submissionId: submission.id,
          questionId: q.id,
          answerText: null,
          userId: "debug@example.com",           // 👈 required by your schema
        },
        select: { id: true },
      });
      

  // 4) Link the first option
  await prisma.surveyResponseOption.create({
    data: { responseId: resp.id, optionId: q.options[0].id },
  });

  console.log({ submissionId: submission.id, responseId: resp.id, questionKey: q.key, optionValue: q.options[0].value });
  await prisma.$disconnect();
}

run().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
