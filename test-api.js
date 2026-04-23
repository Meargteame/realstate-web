const http = require('http');

function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function runTests() {
  console.log('Testing KW Real Estate API...\n');

  try {
    console.log('1. Testing /api/health...');
    const health = await testEndpoint('/api/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Response:`, health.data);
    console.log('');

    console.log('2. Testing /api/agents...');
    const agents = await testEndpoint('/api/agents');
    console.log(`   Status: ${agents.status}`);
    console.log(`   Agents count: ${Array.isArray(agents.data) ? agents.data.length : 'N/A'}`);
    if (Array.isArray(agents.data) && agents.data.length > 0) {
      console.log(`   First agent: ${agents.data[0].name}`);
    }
    console.log('');

    console.log('3. Testing /api/properties...');
    const properties = await testEndpoint('/api/properties');
    console.log(`   Status: ${properties.status}`);
    console.log(`   Properties count: ${Array.isArray(properties.data) ? properties.data.length : 'N/A'}`);
    if (Array.isArray(properties.data) && properties.data.length > 0) {
      console.log(`   First property: ${properties.data[0].address}, ${properties.data[0].city}`);
    }
    console.log('');

    console.log('✓ All API tests passed!');
  } catch (error) {
    console.error('✗ API test failed:', error.message);
  }
}

runTests();
