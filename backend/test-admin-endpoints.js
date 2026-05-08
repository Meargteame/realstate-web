const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Test admin endpoints
async function testAdminEndpoints() {
  console.log('🧪 Testing Admin Dashboard Endpoints\n');
  console.log('=====================================\n');

  // Get admin user from database
  const prisma = require('./config/prisma');
  
  try {
    // Find admin user
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!admin) {
      console.error('❌ No admin user found. Run: node create-admin.js');
      process.exit(1);
    }

    console.log('✅ Admin user found:', admin.email);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email, 
        role: admin.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ JWT token generated\n');

    const baseURL = 'http://localhost:5000';
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test 1: Platform Stats
    console.log('📊 Test 1: GET /api/admin/stats');
    try {
      const res = await fetch(`${baseURL}/api/admin/stats`, { headers });
      const data = await res.json();
      
      if (res.ok) {
        console.log('✅ Status:', res.status);
        console.log('   Total Users:', data.totalUsers);
        console.log('   Total Agents:', data.totalAgents);
        console.log('   Total Properties:', data.totalProperties);
        console.log('   Total Revenue:', data.totalRevenue);
        console.log('   New Users This Month:', data.newUsersThisMonth);
        console.log('   Active Listings:', data.activeListings);
      } else {
        console.log('❌ Failed:', res.status, data);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    console.log('');

    // Test 2: Top Agents
    console.log('🏆 Test 2: GET /api/admin/top-agents');
    try {
      const res = await fetch(`${baseURL}/api/admin/top-agents?limit=5`, { headers });
      const data = await res.json();
      
      if (res.ok) {
        console.log('✅ Status:', res.status);
        console.log('   Top Agents:', data.length);
        if (data.length > 0) {
          console.log('   #1:', data[0].name, '- Score:', data[0].performanceScore.toFixed(2));
        }
      } else {
        console.log('❌ Failed:', res.status, data);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    console.log('');

    // Test 3: Get Users
    console.log('👥 Test 3: GET /api/admin/users');
    try {
      const res = await fetch(`${baseURL}/api/admin/users?page=1&limit=5`, { headers });
      const data = await res.json();
      
      if (res.ok) {
        console.log('✅ Status:', res.status);
        console.log('   Users returned:', data.users?.length || 0);
        console.log('   Total users:', data.pagination?.total || 0);
        console.log('   Total pages:', data.pagination?.totalPages || 0);
      } else {
        console.log('❌ Failed:', res.status, data);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    console.log('');

    // Test 4: Get Agents
    console.log('🏢 Test 4: GET /api/admin/agents');
    try {
      const res = await fetch(`${baseURL}/api/admin/agents?page=1&limit=5`, { headers });
      const data = await res.json();
      
      if (res.ok) {
        console.log('✅ Status:', res.status);
        console.log('   Agents returned:', data.agents?.length || 0);
        console.log('   Total agents:', data.pagination?.total || 0);
        if (data.agents?.length > 0) {
          const agent = data.agents[0];
          console.log('   Sample agent:', agent.name);
          console.log('   - Listings:', agent.stats?.totalListings || 0);
          console.log('   - Leads:', agent.stats?.totalLeads || 0);
        }
      } else {
        console.log('❌ Failed:', res.status, data);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    console.log('');

    // Test 5: Get Properties
    console.log('🏠 Test 5: GET /api/admin/properties');
    try {
      const res = await fetch(`${baseURL}/api/admin/properties?page=1&limit=5`, { headers });
      const data = await res.json();
      
      if (res.ok) {
        console.log('✅ Status:', res.status);
        console.log('   Properties returned:', data.properties?.length || 0);
        console.log('   Total properties:', data.pagination?.total || 0);
        if (data.properties?.length > 0) {
          const prop = data.properties[0];
          console.log('   Sample property:', prop.title);
          console.log('   - Price: $' + (prop.price?.toLocaleString() || 0));
          console.log('   - Status:', prop.status);
        }
      } else {
        console.log('❌ Failed:', res.status, data);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    console.log('');

    // Test 6: Search Users
    console.log('🔍 Test 6: Search Users');
    try {
      const res = await fetch(`${baseURL}/api/admin/users?page=1&limit=5&search=admin`, { headers });
      const data = await res.json();
      
      if (res.ok) {
        console.log('✅ Status:', res.status);
        console.log('   Search results:', data.users?.length || 0);
      } else {
        console.log('❌ Failed:', res.status, data);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    console.log('');

    // Test 7: Filter Properties by Status
    console.log('🔍 Test 7: Filter Properties by Status');
    try {
      const res = await fetch(`${baseURL}/api/admin/properties?page=1&limit=5&status=Active`, { headers });
      const data = await res.json();
      
      if (res.ok) {
        console.log('✅ Status:', res.status);
        console.log('   Active properties:', data.properties?.length || 0);
      } else {
        console.log('❌ Failed:', res.status, data);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    console.log('');

    console.log('=====================================');
    console.log('✅ All admin endpoint tests completed!');
    console.log('=====================================\n');

    console.log('📝 Admin Credentials:');
    console.log('   Email:', admin.email);
    console.log('   Password: password123');
    console.log('   Token:', token.substring(0, 50) + '...\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testAdminEndpoints();
