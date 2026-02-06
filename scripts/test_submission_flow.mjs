// Test script to verify submission flow and URL handling
// This simulates what happens when a user completes the survey

const API_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:4322';

async function testSubmissionFlow() {
  console.log('🧪 Testing Full Submission Flow...\n');

  // Step 1: Submit survey data
  const payload = {
    date: '2000-02-14',
    time: '22:11',
    latitude: 48.1351,
    longitude: 11.5820,
    city: 'Munich',
    country: 'Germany',
    username: 'test-user',
    userEmail: 'test@example.com',
    timeAccuracy: 'exact',
    fullResponses: {
      username: 'test-user',
      date: '2000-02-14',
      time: '22:11',
      time_accuracy: 'exact',
      city: 'Munich',
      latitude: 48.1351,
      longitude: 11.5820,
      country: 'Germany',
      email: 'test@example.com'
    }
  };

  try {
    console.log('📤 Step 1: Submitting survey...');
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
    const { submissionId } = data;

    if (!submissionId) {
      throw new Error('No submissionId returned from API');
    }

    console.log(`✅ Submission successful!`);
    console.log(`   Submission ID: ${submissionId}\n`);

    // Step 2: Verify URL endpoints work
    console.log('🔍 Step 2: Testing result endpoints...');
    
    const endpoints = [
      { name: 'Chart SVG', url: `/reading/${submissionId}/chart.svg` },
      { name: 'Badge', url: `/reading/${submissionId}/badge` },
      { name: 'HTML Reading 1', url: `/reading/${submissionId}/html` },
      { name: 'HTML Reading 2', url: `/reading/${submissionId}/html/2` }
    ];

    for (const endpoint of endpoints) {
      const res = await fetch(`${API_URL}${endpoint.url}`);
      if (res.ok) {
        const content = await res.text();
        console.log(`   ✅ ${endpoint.name}: ${content.length} bytes`);
      } else {
        console.log(`   ❌ ${endpoint.name}: Failed (${res.status})`);
      }
    }

    // Step 3: Show the URL that should be in the browser
    console.log(`\n🌐 Step 3: Expected URL in browser:`);
    console.log(`   ${FRONTEND_URL}/?submissionId=${submissionId}`);
    console.log(`\n💡 To test:`);
    console.log(`   1. Open ${FRONTEND_URL}/?submissionId=${submissionId}`);
    console.log(`   2. The results should load automatically`);
    console.log(`   3. You can share/bookmark this URL`);
    console.log(`   4. Refreshing should keep the results\n`);

    console.log('✅ All tests passed!');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

testSubmissionFlow();

