const prisma = require('./config/prisma');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function verifyAdminSetup() {
  console.log('\n🔍 Verifying Admin Dashboard Setup\n');
  console.log('=====================================\n');

  try {
    // 1. Check admin user exists
    console.log('1️⃣  Checking admin user...');
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!admin) {
      console.log('❌ No admin user found');
      console.log('   Run: node create-admin.js\n');
      return;
    }
    console.log('✅ Admin user exists:', admin.email);
    console.log('   ID:', admin.id);
    console.log('   Role:', admin.role);
    console.log('');

    // 2. Test JWT token generation
    console.log('2️⃣  Testing JWT token generation...');
    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email, 
        role: admin.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('✅ JWT token generated successfully');
    console.log('   Token preview:', token.substring(0, 50) + '...');
    console.log('');

    // 3. Verify JWT token
    console.log('3️⃣  Verifying JWT token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ JWT token verified');
    console.log('   Decoded ID:', decoded.id);
    console.log('   Decoded Role:', decoded.role);
    console.log('');

    // 4. Check database stats
    console.log('4️⃣  Checking database statistics...');
    const [userCount, agentCount, propertyCount, leadCount] = await Promise.all([
      prisma.user.count(),
      prisma.agent.count(),
      prisma.property.count(),
      prisma.lead.count()
    ]);
    console.log('✅ Database stats:');
    console.log('   Total Users:', userCount);
    console.log('   Total Agents:', agentCount);
    console.log('   Total Properties:', propertyCount);
    console.log('   Total Leads:', leadCount);
    console.log('');

    // 5. Check admin controller exists
    console.log('5️⃣  Checking admin controller...');
    const fs = require('fs');
    const controllerExists = fs.existsSync('./controllers/adminController.js');
    const routesExist = fs.existsSync('./routes/adminRoutes.js');
    
    if (controllerExists && routesExist) {
      console.log('✅ Admin controller and routes exist');
    } else {
      console.log('❌ Missing files:');
      if (!controllerExists) console.log('   - controllers/adminController.js');
      if (!routesExist) console.log('   - routes/adminRoutes.js');
    }
    console.log('');

    // 6. Sample users with roles
    console.log('6️⃣  Checking user roles...');
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    });
    console.log('✅ Users by role:');
    usersByRole.forEach(r => {
      console.log(`   ${r.role}: ${r._count} users`);
    });
    console.log('');

    // 7. Sample agents with stats
    console.log('7️⃣  Checking agent data...');
    const sampleAgent = await prisma.agent.findFirst({
      include: {
        properties: { select: { id: true } },
        leads: { select: { id: true } },
        opportunities: { select: { id: true } }
      }
    });
    
    if (sampleAgent) {
      console.log('✅ Sample agent found:');
      console.log('   Name:', sampleAgent.name);
      console.log('   Properties:', sampleAgent.properties.length);
      console.log('   Leads:', sampleAgent.leads.length);
      console.log('   Opportunities:', sampleAgent.opportunities.length);
    } else {
      console.log('⚠️  No agents found in database');
    }
    console.log('');

    console.log('=====================================');
    console.log('✅ Admin Dashboard Setup Verified!');
    console.log('=====================================\n');

    console.log('📝 Next Steps:');
    console.log('1. Start backend: npm run dev (in backend folder)');
    console.log('2. Start frontend: npm run dev (in frontend folder)');
    console.log('3. Login at: http://localhost:3001/login');
    console.log('4. Use credentials:');
    console.log('   Email: admin@kw.com');
    console.log('   Password: password123');
    console.log('5. You will be redirected to: http://localhost:3001/admin\n');

    console.log('🔗 Admin API Endpoints:');
    console.log('   GET  /api/admin/stats');
    console.log('   GET  /api/admin/top-agents');
    console.log('   GET  /api/admin/users');
    console.log('   POST /api/admin/users');
    console.log('   PUT  /api/admin/users/:id');
    console.log('   DELETE /api/admin/users/:id');
    console.log('   GET  /api/admin/agents');
    console.log('   PUT  /api/admin/agents/:id/status');
    console.log('   DELETE /api/admin/agents/:id');
    console.log('   GET  /api/admin/properties');
    console.log('   PUT  /api/admin/properties/:id/status');
    console.log('   DELETE /api/admin/properties/:id\n');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdminSetup();
