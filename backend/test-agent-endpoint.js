const axios = require('axios');

async function testAgent() {
  try {
    console.log('🔍 Testing agent endpoint...\n');
    
    const agentId = 'f2d2c702-3702-4717-9f44-7e5a860f81bf';
    const url = `http://localhost:5000/api/agents/${agentId}`;
    
    console.log(`GET ${url}\n`);
    
    const response = await axios.get(url);
    
    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ ERROR!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testAgent();
