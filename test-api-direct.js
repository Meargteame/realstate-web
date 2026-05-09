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
  console.log('🔐 Testing Admin API...\n');

  // Login
  console.log('1. Login as admin...');
  const loginRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@kw.com', password: 'password123' });

  if (loginRes.status !== 200) {
    console.error('❌ Login failed:', loginRes);
    return;
  }

  const token = loginRes.data.token;
  console.log('✅ Login successful\n');

  // Test agents
  console.log('2. GET /api/admin/agents...');
  const agentsRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/agents?page=1&limit=3',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  console.log('Status:', agentsRes.status);
  console.log('Agents:', JSON.stringify(agentsRes.data, null, 2).substring(0, 800));
  console.log('\n');

  // Test users
  console.log('3. GET /api/admin/users...');
  const usersRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/users?page=1&limit=3',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  console.log('Status:', usersRes.status);
  console.log('Users:', JSON.stringify(usersRes.data, null, 2).substring(0, 800));
}

test().catch(console.error);
