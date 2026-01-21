const { normalizeSurveyPayload } = require('../server/normalizeSurveyPayload');

const mockPayload = {
    survey: {
        "section-iii": {
            watch_habit: ["solo", "bed"], // Checkbox
            fav_era: "1990s"
        }
    }
};

console.log("Testing section-iii mapping...");
const normalized = normalizeSurveyPayload(mockPayload);
console.log("Answers:", JSON.stringify(normalized.answers, null, 2));

const watchHabitAns = normalized.answers.find(a => a.questionKey === 'taste.how_you_watch');
if (watchHabitAns && JSON.stringify(watchHabitAns.optionValues) === JSON.stringify(["solo", "bed"])) {
    console.log("✅ SUCCESS: section-iii.watch_habit -> taste.how_you_watch");
} else {
    console.log("❌ FAILED: watch_habit mapping incorrect");
}

const favEraAns = normalized.answers.find(a => a.questionKey === 'taste.favorite_era');
if (favEraAns && favEraAns.answerText === '1990s') {
    console.log("✅ SUCCESS: section-iii.fav_era -> taste.favorite_era");
} else {
    console.log("❌ FAILED: fav_era mapping incorrect");
}
