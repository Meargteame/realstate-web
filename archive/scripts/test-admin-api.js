const fetch = require('node-fetch');

async function testAdminAPI() {
  try {
    // First login as admin
    console.log('🔐 Logging in as admin...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@torra.com',
        password: 'password123'
      })
    });

    if (!loginRes.ok) {
      console.error('❌ Login failed:', await loginRes.text());
      return;
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✅ Login successful');

    // Test agents endpoint
    console.log('\n📊 Testing /api/admin/agents...');
    const agentsRes = await fetch('http://localhost:5000/api/admin/agents?page=1&limit=10', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!agentsRes.ok) {
      console.error('❌ Agents request failed:', await agentsRes.text());
      return;
    }

    const agentsData = await agentsRes.json();
    console.log('✅ Agents response:', JSON.stringify(agentsData, null, 2));

    // Test users endpoint
    console.log('\n📊 Testing /api/admin/users...');
    const usersRes = await fetch('http://localhost:5000/api/admin/users?page=1&limit=10', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!usersRes.ok) {
      console.error('❌ Users request failed:', await usersRes.text());
      return;
    }

    const usersData = await usersRes.json();
    console.log('✅ Users response:', JSON.stringify(usersData, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdminAPI();
