const prisma = require('./backend/config/prisma');
const bcrypt = require('bcryptjs');
const fs = require('fs');

async function checkAndFix() {
  const log = [];
  
  try {
    log.push('=== CHECKING DATABASE STATE ===\n');

    // Check all users
    const users = await prisma.user.findMany();
    log.push(`USERS TABLE (${users.length} records):`);
    users.forEach(u => {
      log.push(`  - ${u.email} | role: ${u.role} | agentId: ${u.agentId || 'NULL'}`);
    });

    // Check all agents
    const agents = await prisma.agent.findMany();
    log.push(`\nAGENTS TABLE (${agents.length} records):`);
    agents.forEach(a => {
      log.push(`  - ${a.id} | ${a.name} | ${a.email}`);
    });

    // Check specific user
    const specificUser = await prisma.user.findUnique({
      where: { email: 'hello.meareg@gmail.com' }
    });
    log.push('\nSPECIFIC USER (hello.meareg@gmail.com):');
    log.push(JSON.stringify(specificUser, null, 2));

    // Check specific agent
    const specificAgent = await prisma.agent.findUnique({
      where: { id: 'f2d2c702-3702-4717-9f44-7e5a860f81bf' }
    });
    log.push('\nSPECIFIC AGENT (f2d2c702-3702-4717-9f44-7e5a860f81bf):');
    log.push(JSON.stringify(specificAgent, null, 2));

    // FIX: Create agent if it doesn't exist
    if (!specificAgent) {
      log.push('\n=== CREATING MISSING AGENT ===');
      const newAgent = await prisma.agent.create({
        data: {
          id: 'f2d2c702-3702-4717-9f44-7e5a860f81bf',
          name: 'Meareg Agent',
          email: 'hello.meareg@gmail.com',
          phone: '+1234567890',
          imageUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
          brokerage: 'TORRA Commercial Real Estate Group',
          license: 'TR-2024-001',
          languages: ['English']
        }
      });
      log.push('✅ Agent created: ' + JSON.stringify(newAgent, null, 2));
    }

    // FIX: Update user's agentId if needed
    if (specificUser && specificUser.agentId !== 'f2d2c702-3702-4717-9f44-7e5a860f81bf') {
      log.push('\n=== UPDATING USER AGENT ID ===');
      const updatedUser = await prisma.user.update({
        where: { email: 'hello.meareg@gmail.com' },
        data: { agentId: 'f2d2c702-3702-4717-9f44-7e5a860f81bf', role: 'agent' }
      });
      log.push('✅ User updated: ' + JSON.stringify(updatedUser, null, 2));
    }

    // FIX: Create user if doesn't exist
    if (!specificUser) {
      log.push('\n=== CREATING MISSING USER ===');
      const hashedPassword = await bcrypt.hash('password123', 10);
      const newUser = await prisma.user.create({
        data: {
          name: 'Meareg Agent',
          email: 'hello.meareg@gmail.com',
          password: hashedPassword,
          role: 'agent',
          agentId: 'f2d2c702-3702-4717-9f44-7e5a860f81bf'
        }
      });
      log.push('✅ User created: ' + JSON.stringify(newUser, null, 2));
    }

    log.push('\n=== VERIFICATION ===');
    const finalUser = await prisma.user.findUnique({
      where: { email: 'hello.meareg@gmail.com' }
    });
    const finalAgent = await prisma.agent.findUnique({
      where: { id: 'f2d2c702-3702-4717-9f44-7e5a860f81bf' }
    });
    log.push('Final User: ' + JSON.stringify(finalUser, null, 2));
    log.push('Final Agent: ' + JSON.stringify(finalAgent, null, 2));

    log.push('\n✅ DATABASE CHECK AND FIX COMPLETE');

    await prisma.$disconnect();
    
    // Write to file
    fs.writeFileSync('db-check-result.txt', log.join('\n'));
    console.log('Results written to db-check-result.txt');
    
  } catch (error) {
    log.push('\n❌ ERROR: ' + error.message);
    log.push(error.stack);
    fs.writeFileSync('db-check-result.txt', log.join('\n'));
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkAndFix();
