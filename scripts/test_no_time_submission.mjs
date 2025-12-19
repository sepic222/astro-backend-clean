// Test script for "no time" scenario with survey answers
// This tests the full submission flow when user doesn't know their birth time

const API_URL = 'https://myreading.fateflix.app';

async function testNoTimeSubmission() {
  console.log('🧪 Testing "No Time" Scenario with Survey Answers...\n');

  // Test payload: No time provided (or time_accuracy: 'Unknown')
  const payload = {
    date: '1995-06-15',
    // No time provided - this should trigger "no time" logic
    latitude: 40.7128,
    longitude: -74.0060,
    city: 'New York',
    country: 'United States',
    username: 'test-no-time-user',
    userEmail: 'notime@test.example.com',
    timeAccuracy: 'unknown', // Explicitly set to unknown
    fullResponses: {
      // Birth data
      username: 'test-no-time-user',
      date: '1995-06-15',
      time_accuracy: 'unknown',
      city: 'New York',
      latitude: 40.7128,
      longitude: -74.0060,
      country: 'United States',
      email: 'notime@test.example.com',
      
      // Section II: Casting
      gender: 'Non-binary',
      attraction_style: 'Across spectrum',
      cine_level: 'Movie Lover',
      life_role: ['Rescuer', 'Dreamy outsider'],
      escapism_style: 'Cozy Comdown',
      first_crush: 'Meryl Streep in The Devil Wears Prada',
      
      // Section III: Taste
      watch_habit: ['Alone', 'With friends'],
      fav_era: ['1970s', '1980s'],
      culture_background: 'Mixed heritage',
      environment_growing_up: 'Artistic/progressive',
      
      // Section IV: Core Memory
      first_emotional: 'The Lion King - cried when Mufasa died',
      life_changing: 'Eternal Sunshine of the Spotless Mind',
      comfort_watch: 'Friends TV show',
      power_movie: 'Kill Bill',
      impress_movie: 'Parasite',
      
      // Section V: Screen Education
      tv_taste: 'Prestige TV',
      favorite_directors: ['Wes Anderson', 'Greta Gerwig'],
      access_growing_up: 'Streaming services',
      
      // Section VI: Genres
      loved: ['Sci-fi', 'Romance', 'Thriller'],
      turn_offs: ['Horror'],
      twin_flame: 'Before Sunrise',
      
      // Section VII: Global
      foreign_films: 'Yes, regularly',
      
      // Section VIII: Fit
      found_survey: 'Social media',
      email: 'notime@test.example.com'
    }
  };

  try {
    console.log('📤 Step 1: Submitting survey with NO TIME...');
    console.log('   Date:', payload.date);
    console.log('   Time: NOT PROVIDED (unknown)');
    console.log('   Location:', payload.city, payload.country);
    console.log('   Time Accuracy:', payload.timeAccuracy);
    console.log('   Survey Answers:', Object.keys(payload.fullResponses).length, 'fields\n');

    const response = await fetch(`${API_URL}/api/dev/chart-to-svg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Submission failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const { submissionId, chartId } = data;

    if (!submissionId) {
      throw new Error('No submissionId returned from API');
    }

    console.log('✅ Submission successful!');
    console.log(`   Submission ID: ${submissionId}`);
    console.log(`   Chart ID: ${chartId || 'N/A (no time = no chart)'}\n`);

    // Step 2: Check seed status to verify questions exist
    console.log('🔍 Step 2: Verifying database seed status...');
    const seedStatus = await fetch(`${API_URL}/api/admin/seed-status`);
    if (seedStatus.ok) {
      const status = await seedStatus.json();
      console.log(`   ✅ Database seeded: ${status.seeded}`);
      console.log(`   Questions: ${status.counts.questions}, Options: ${status.counts.options}\n`);
    }

    // Step 3: Verify the reading endpoints work (should show "no time" screen)
    console.log('🔍 Step 3: Testing reading endpoints...');
    
    const endpoints = [
      { name: 'Badge', url: `/reading/${submissionId}/badge` },
      { name: 'HTML Reading', url: `/reading/${submissionId}/html` },
      { name: 'HTML Reading Page 2', url: `/reading/${submissionId}/html/2` }
    ];

    for (const endpoint of endpoints) {
      const res = await fetch(`${API_URL}${endpoint.url}`);
      if (res.ok) {
        const content = await res.text();
        const hasNoTime = content.includes('No exact birth time') || 
                         content.includes('no-time') ||
                         content.includes('Blue Planet') ||
                         content.includes('blue planet');
        console.log(`   ✅ ${endpoint.name}: ${content.length} bytes ${hasNoTime ? '(contains no-time content)' : ''}`);
      } else {
        console.log(`   ❌ ${endpoint.name}: Failed (${res.status})`);
      }
    }

    console.log('\n📊 Step 4: Expected Results:');
    console.log('   ✓ Chart should be created WITHOUT ascendant/houses (no time)');
    console.log('   ✓ Reading should show "No Time" screen with Blue Planet asset');
    console.log('   ✓ Survey responses should be saved to database');
    console.log('   ✓ Survey response options should be linked for checkbox/radio answers\n');

    console.log('🌐 Step 5: Test URLs:');
    console.log(`   Badge: ${API_URL}/reading/${submissionId}/badge`);
    console.log(`   Reading: ${API_URL}/reading/${submissionId}/html`);
    console.log(`   Reading Page 2: ${API_URL}/reading/${submissionId}/html/2\n`);

    console.log('💡 Next Steps:');
    console.log('   1. Check Railway logs for: "✅ Saved X survey answers"');
    console.log('   2. Check database tables:');
    console.log('      - survey_submissions (should have 1 record)');
    console.log('      - survey_responses (should have multiple records)');
    console.log('      - survey_response_options (should have records for checkbox/radio answers)');
    console.log('   3. Verify "No Time" screen appears in reading HTML\n');

    console.log('✅ Test completed successfully!');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
    if (err.stack) {
      console.error('Stack:', err.stack);
    }
    process.exit(1);
  }
}

testNoTimeSubmission();



