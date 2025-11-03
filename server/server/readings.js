// server/readings.js

function shortSign(s) {
    return s || '—';
  }
  
  // Minimal MVP: stitch a short summary from the computed chart + a few answers.
  // Extend this later with your pre-written blocks per sign/house/question.
  function buildReading({ chartPayload, answersByKey }) {
    const sun = chartPayload?.planets?.sun?.sign;
    const moon = chartPayload?.planets?.moon?.sign;
    const asc  = chartPayload?.angles?.ascendantSign;
    const favGenres = (answersByKey['genres.loved'] || []).join(', ');
    const desire = answersByKey['world.crave_in_movie'];
  
    const lines = [];
    lines.push(`Your core astro mix: Sun in ${shortSign(sun)}, Moon in ${shortSign(moon)}, ASC ${shortSign(asc)}.`);
    if (favGenres) lines.push(`Genres you love: ${favGenres}.`);
    if (desire) lines.push(`You seek in stories: ${desire}.`);
  
    // Example rule flavor
    if (sun === 'Aquarius') lines.push(`Aquarius Suns often enjoy inventive, world-building cinema.`);
    if (moon === 'Gemini')  lines.push(`Gemini Moons like variety and witty dialogue.`);
  
    return lines.join(' ');
  }
  
  module.exports = { buildReading };