import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  const resp = await client.responses.create({
    model: "gpt-4o-mini",
    input: "Say 'pong' only.",
  });
  const text = resp.output_text ?? resp.content?.[0]?.text ?? "";
  console.log(String(text).trim());
}

main().catch((e) => {
  console.error("Smoke test failed:", e?.message ?? e);
  process.exit(1);
});
