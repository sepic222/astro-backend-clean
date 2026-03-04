const fetch = require('node-fetch');

async function verifyExport() {
    const apiBase = 'http://localhost:3001';
    // Use default admin credentials from .env or fallback
    const auth = Buffer.from('admin:cosmos').toString('base64');

    console.log('🚀 Downloading export CSV from /admin/export (with Auth)...');
    try {
        const response = await fetch(`${apiBase}/admin/export`, {
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });

        if (response.ok) {
            const csvText = await response.text();
            console.log('✅ Export successful! First 500 characters:');
            console.log('---');
            console.log(csvText.substring(0, 500));
            console.log('---');

            if (csvText.includes('Rising Sign') && csvText.includes('Sun House') && csvText.includes('Reading Content')) {
                console.log('✅ Headers "Rising Sign", "Sun House", and "Reading Content" confirmed present.');
            } else {
                console.error('❌ Missing expected headers (Chart Data/Reading Content).');
            }

        } else {
            console.error('❌ Export failed:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('❌ Error during verification:', error.message);
    }
}

verifyExport();
