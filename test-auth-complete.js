const fetch = require('node-fetch');

async function testAuth() {
  console.log('=== TESTING AUTHENTICATION ===\n');

  // Test 1: Health check
  console.log('1. Testing health endpoint...');
  try {
    const healthRes = await fetch('http://localhost:5000/api/health');
    console.log('Health status:', healthRes.status);
    const healthData = await healthRes.text();
    console.log('Health response:', healthData);
  } catch (error) {
    console.error('Health check failed:', error.message);
  }

  // Test 2: Register new user
  console.log('\n2. Testing registration...');
  try {
    const registerRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser' + Date.now() + '@test.com',
        password: 'password123',
        role: 'agent'
      })
    });
    console.log('Register status:', registerRes.status);
    const registerData = await registerRes.json();
    console.log('Register response:', registerData);
  } catch (error) {
    console.error('Registration failed:', error.message);
  }

  // Test 3: Login with test account
  console.log('\n3. Testing login with test account...');
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sarah.j@kw.com',
        password: 'password123'
      })
    });
    console.log('Login status:', loginRes.status);
    const loginData = await loginRes.json();
    console.log('Login response:', loginData);
  } catch (error) {
    console.error('Login failed:', error.message);
  }

  // Test 4: Login with user's email
  console.log('\n4. Testing login with hello.meareg@gmail.com...');
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'hello.meareg@gmail.com',
        password: 'password123'
      })
    });
    console.log('Login status:', loginRes.status);
    const loginData = await loginRes.json();
    console.log('Login response:', loginData);
  } catch (error) {
    console.error('Login failed:', error.message);
  }

  // Test 5: Check agent endpoint
  console.log('\n5. Testing agent endpoint...');
  try {
    const agentRes = await fetch('http://localhost:5000/api/agents/f2d2c702-3702-4717-9f44-7e5a860f81bf');
    console.log('Agent status:', agentRes.status);
    const agentData = await agentRes.text();
    console.log('Agent response:', agentData);
  } catch (error) {
    console.error('Agent check failed:', error.message);
  }
}

testAuth().catch(console.error);
