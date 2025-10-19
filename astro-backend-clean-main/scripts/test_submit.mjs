// scripts/test_submit.mjs
// scripts/test_submit.mjs
const url = "http://localhost:3001/api/survey/submit";

// replace these with real values from step 2 if needed
const QUESTION_KEY = "II.4";
const OPTION_VALUE = "yes";

const payload = {
  userEmail: "sara@example.com",
  answers: [
    { questionKey: QUESTION_KEY, optionValues: [OPTION_VALUE] }, // radio
    { questionKey: "I.1",  answerText: "Call me Sara" }          // text
  ],
};

// simple timeout so it doesn't hang forever
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 6000);

(async () => {
  try {
    console.log("POST", url, payload);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const text = await res.text();
    let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
    console.log("HTTP", res.status, json);
  } catch (e) {
    clearTimeout(timer);
    console.error("Request failed:", e.name, e.message);
  }
})();
