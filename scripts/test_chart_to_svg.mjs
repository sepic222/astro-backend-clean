// scripts/test_chart_to_svg.mjs
// Test the /api/dev/chart-to-svg endpoint

const API_URL = 'http://localhost:3009';

async function testChartToSvg() {
  console.log('🧪 Testing /api/dev/chart-to-svg endpoint...\n');

    const payload = {
    date: '2000-02-14',
    time: '22:11',
    latitude: 51.2254,
    longitude: 6.7763,
    city: 'Munich',
    country: 'Germany',
    userEmail: 'test@example.com',
    username: 'testuser'
  };

  try {
    console.log('📤 Sending request...');
    console.log('Payload:', JSON.stringify(payload, null, 2));
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
      console.log('💡 You can open these URLs in your browser to view the chart!');
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

testChartToSvg();

