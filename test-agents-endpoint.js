const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  console.log('Testing agents endpoint...\n');

  // Login
  const loginRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@kw.com', password: 'password123' });

  if (loginRes.status !== 200) {
    console.error('Login failed:', loginRes);
    return;
  }

  const token = loginRes.data.token;
  console.log('✅ Login successful\n');

  // Test agents
  console.log('Testing GET /api/admin/agents...');
  const agentsRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/agents?page=1&limit=10&search=',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  console.log('Status:', agentsRes.status);
  if (agentsRes.status === 200) {
    console.log('✅ Success!');
    console.log('Agents count:', agentsRes.data.agents?.length || 0);
    console.log('Total:', agentsRes.data.pagination?.total || 0);
  } else {
    console.log('❌ Error:', JSON.stringify(agentsRes.data, null, 2));
  }
}

test().catch(console.error);
