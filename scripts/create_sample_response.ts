// scripts/create_sample_response.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1) Pick any radio question (first one we find)
  const q = await prisma.surveyQuestion.findFirst({
    where: { type: "radio" },
    include: { options: true },
  });
  if (!q || q.options.length === 0) {
    throw new Error("No radio question with options found.");
  }

  // 2) Create the response row
  const response = await prisma.surveyResponse.create({
    data: {
      questionId: q.id,
      userId: "test-user-123",
      // answerText: null  // not used for radio
    },
  });

  // 4) Link the selected option (take the first for demo)
  const chosen = q.options[0];
  await prisma.surveyResponseOption.create({
    data: {
      responseId: response.id,
      optionId: chosen.id,
    },
  });

  console.log("✅ Created response:", {
    responseId: response.id,
    questionKey: q.key,
    chosenOption: chosen.value,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
