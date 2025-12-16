# Real-Time Answer Saving Implementation

## Overview
Survey answers are now saved to the database in real-time as users fill them in, with a 500ms debounce delay to prevent excessive API calls.

## How It Works

### Timeline of Answer Saving

1. **Section 1 (Astro Data)** - User fills in birth data
   - User clicks "Next" → Chart is computed, submission is created
   - `submissionId` is stored in context
   - Answers from Section 1 are NOT saved yet (birth data is in chart)

2. **Sections 2-9** - User fills in survey answers
   - **Each time user types/selects an answer:**
     - Answer is stored in React state (immediate)
     - After 500ms delay (debounce), answer is saved to database
     - Silent save - no UI feedback, errors only logged to console

3. **Final Submit** - User clicks "Submit Survey Now"
   - Top3 fields (films/series/docs) are combined and saved
   - Chart is recomputed if needed (if submissionId wasn't created after Section 1)
   - Reading is generated
   - All answers are ensured saved via `fullResponses` in backend

## Technical Implementation

### Backend Changes

**New Endpoint: `/api/survey/save-answer`**
- Accepts: `submissionId`, `questionKey`, `answerValue`, `userEmail`
- Maps frontend question keys to database question keys
- Upserts answers (deletes old response, creates new one)
- Handles both text answers and option-based answers (checkboxes/radios)

**Updated Endpoint: `/api/dev/chart-to-svg`**
- Still saves all answers from `fullResponses` on final submit
- Acts as fallback if real-time saving fails

### Frontend Changes

**SurveyContext (`src/context/SurveyContext.jsx`)**
- Added `submissionId`, `chartId`, `userEmail` to context state
- Added debounced `saveAnswerToServer` function (500ms delay)
- Modified `setAnswer` to trigger real-time saving when `submissionId` exists
- Skips saving birth data and cosmic keys (already in chart)
- Skips top3 fields in real-time (handled on final submit)

**SurveyControls (`src/components/FateFlixSurvey.jsx`)**
- After Section 1: Computes chart and creates submission
- Stores `submissionId` in context for real-time saving
- On final submit: Ensures top3 fields are saved, then proceeds normally

## Answer Saving Behavior

### Answers Saved in Real-Time
- All survey questions (Sections 2-9)
- Text inputs: Saved 500ms after user stops typing
- Radio buttons: Saved immediately (500ms debounce)
- Checkboxes: Saved immediately when changed

### Answers NOT Saved in Real-Time
- Birth data (date, time, latitude, longitude, city, country, username, time_accuracy)
  - These are stored in the chart, not as survey responses
- Top3 fields (top3_films, top3_series, top3_docs)
  - These are combined into one `fit.hall_of_fame` answer
  - Saved on final submit

### Fallback Behavior
- If chart computation fails after Section 1: No real-time saving, but all answers saved on final submit
- If real-time save fails: Error logged, but user flow continues
- On final submit: Backend ensures all answers are saved via `fullResponses`

## Benefits

1. **No Data Loss** - Answers saved as user progresses
2. **Resume Capability** - Can implement resume from last saved answer
3. **Better UX** - Users don't lose work if browser crashes
4. **Non-Breaking** - Errors in real-time saving don't break the flow
5. **Efficient** - Debouncing prevents excessive API calls

## Testing

To test real-time saving:
1. Fill in Section 1 and click "Next"
2. Check console for: `✅ Chart computed, submission created: <submissionId>`
3. Fill in answers in Section 2+
4. Check server logs for: Individual answer save attempts (500ms after typing stops)
5. Check database: SurveyResponse records should appear as user fills answers
6. Complete survey and verify all answers are saved

## Key Files Modified

- `server.js` - Added `/api/survey/save-answer` endpoint
- `src/context/SurveyContext.jsx` - Added real-time saving logic
- `src/components/FateFlixSurvey.jsx` - Added chart computation after Section 1

