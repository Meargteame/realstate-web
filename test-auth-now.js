#!/usr/bin/env node
const http = require('http');

function makeRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  console.log('\n=== TESTING AUTH ENDPOINTS ===\n');

  // Test 1: Register
  console.log('1. Testing REGISTER with new user...');
  const registerResult = await makeRequest('POST', '/api/auth/register', {
    firstName: 'New',
    lastName: 'User',
    email: 'newuser' + Date.now() + '@test.com',
    password: 'password123',
    role: 'agent'
  });
  console.log('Status:', registerResult.status);
  console.log('Response:', registerResult.body);

  // Test 2: Login with test account
  console.log('\n2. Testing LOGIN with sarah.j@kw.com...');
  const loginResult = await makeRequest('POST', '/api/auth/login', {
    email: 'sarah.j@kw.com',
    password: 'password123'
  });
  console.log('Status:', loginResult.status);
  console.log('Response:', loginResult.body);

  // Test 3: Login with user's email
  console.log('\n3. Testing LOGIN with hello.meareg@gmail.com...');
  const userLoginResult = await makeRequest('POST', '/api/auth/login', {
    email: 'hello.meareg@gmail.com',
    password: 'password123'
  });
  console.log('Status:', userLoginResult.status);
  console.log('Response:', userLoginResult.body);

  console.log('\n=== TESTS COMPLETE ===\n');
}

test().catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
