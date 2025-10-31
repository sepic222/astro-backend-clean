import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
(async () => {
  const out = {
    sections: await p.surveySection.count(),
    questions: await p.surveyQuestion.count(),
    options: await p.surveyOption.count(),
    responses: await p.surveyResponse.count(),
    links: await p.surveyResponseOption.count(),
  };
  console.log(out);
  await p.$disconnect();
})();
