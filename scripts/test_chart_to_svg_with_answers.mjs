// scripts/test_chart_to_svg_with_answers.mjs
// Test the /api/dev/chart-to-svg endpoint with survey answers

const API_URL = 'http://localhost:3001';

async function testChartToSvgWithAnswers() {
  console.log('🧪 Testing /api/dev/chart-to-svg with survey answers...\n');

  // Simulate what the frontend sends
  const payload = {
    date: '2000-02-14',
    time: '22:11',
    latitude: 51.2254,
    longitude: 6.7763,
    city: 'Düsseldorf',
    country: 'Germany',
    username: 'TestUser',
    userEmail: 'test-answers@example.com',
    timeAccuracy: 'exact',
    fullResponses: {
      // Birth data (should be skipped - already in chart)
      username: 'TestUser',
      date: '2000-02-14',
      time: '22:11',
      latitude: 51.2254,
      longitude: 6.7763,
      city: 'Düsseldorf',
      country: 'Germany',
      time_accuracy: 'exact',
      
      // Section II: Casting
      gender: 'female',
      attraction_style: 'queer',
      cine_level: 'cinephile',
      life_role: 'rescuer',
      escapism_style: 'heartbreak',
      first_crush: 'Wednesday Addams was my first obsession',
      
      // Section III: Taste
      watch_habit: ['solo', 'late_night'],
      fav_era: ['1990s', '2000s'],
      culture_background: ['usa', 'mixed'],
      environment_growing_up: ['artistic', 'internet'],
      
      // Section IV: Core Memory
      first_feeling: 'Bambi - the shock of death',
      life_changing: 'Lost in Translation changed everything',
      comfort_watch: 'Pride and Prejudice (2005)',
      power_watch: 'Kill Bill',
      date_impress: 'The Grand Budapest Hotel',
      
      // Section V: World
      movie_universe: ['aesthetic', 'romantic'],
      villain_relate: 'Amy Dunne - because chaos',
      forever_crush: 'Timothée Chalamet',
      crave_most: ['emotional', 'chemistry', 'stylish'],
      life_tagline: 'escape',
      
      // Section VI: Screen Ed
      tv_taste: ['prestige', 'dark'],
      fav_tv: 'Succession',
      cinematography: 'obsessed',
      directors: ['gerwig', 'coppola', 'wes_anderson'],
      access_growing_up: ['streaming', 'cinema'],
      
      // Section VII: Genres
      genres_love: ['romcom', 'arthouse', 'drama'],
      turn_offs: ['gore', 'scary'],
      hated_film: 'Avatar - too long and boring',
      
      // Section Swipe
      character_match: 'Fleabag',
      
      // Section VIII: Global
      foreign_films: 'love',
      
      // Section IX: Fit
      selection_method: ['letterboxd', 'vibes'],
      discovery: 'friend',
      email: 'test-answers@example.com',
      beta_test: 'yes',
      top3_films: '1. Lost in Translation\n2. Her\n3. Call Me by Your Name',
      top3_series: '1. Succession\n2. Fleabag\n3. The White Lotus',
      top3_docs: '1. My Octopus Teacher\n2. Jiro Dreams of Sushi\n3. Won\'t You Be My Neighbor?'
    }
  };

  try {
    console.log('📤 Sending request with survey answers...');
    console.log('Payload keys:', Object.keys(payload));
    console.log('FullResponses keys:', Object.keys(payload.fullResponses));
    console.log('');

    const response = await fetch(`${API_URL}/api/dev/chart-to-svg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Success!');
      console.log('Response:', JSON.stringify(data, null, 2));
      console.log('');
      console.log('🔗 URLs:');
      console.log(`  SVG:  ${data.svgUrl}`);
      console.log(`  HTML: ${data.htmlUrl}`);
      console.log('');
      console.log('📊 Submission ID:', data.submissionId);
      console.log('💡 Check the server logs for answer saving confirmation');
      console.log('💡 Use Prisma Studio to verify answers were saved:');
      console.log('   npx prisma studio');
      console.log('   Then check: SurveySubmission -> SurveyResponse');
    } else {
      console.log('❌ Failed');
      console.log('Status:', response.status);
      console.log('Error:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('❌ Request failed:', err.message);
    console.log('\n💡 Make sure your server is running on port 3001');
    console.log('   Run: node server.js');
  }
}

testChartToSvgWithAnswers();

