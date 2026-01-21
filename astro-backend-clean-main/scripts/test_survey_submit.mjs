// scripts/test_survey_submit.mjs
// Simple test to submit a survey response to your API

const API_URL = 'http://localhost:3001';

async function testSubmit() {
  console.log('🧪 Testing survey submission...\n');

  // Sample survey answers (using real question keys from your DB)
  const payload = {
    userEmail: 'test@example.com',
    chartId: null, // or provide an existing chart ID
    answers: [
      { questionKey: 'cosmic.name', answerText: 'Jane Doe' },
      { questionKey: 'cosmic.birth_location', answerText: 'New York, USA' },
      { questionKey: 'cosmic.time_accuracy', optionValues: ['exact'] },
      { questionKey: 'casting.gender', optionValues: ['female'] },
    ]
  };

  try {
    const response = await fetch(`${API_URL}/api/survey/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Success!');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Failed');
      console.log('Status:', response.status);
      console.log('Error:', data);
    }
  } catch (err) {
    console.error('❌ Request failed:', err.message);
    console.log('\n💡 Make sure your server is running on port 3001');
    console.log('   Run: node server.js');
  }
}

testSubmit();
