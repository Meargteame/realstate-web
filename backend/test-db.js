const prisma = require('./config/prisma');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    const agentCount = await prisma.agent.count();
    console.log(`✓ Agents in database: ${agentCount}`);
    
    const propertyCount = await prisma.property.count();
    console.log(`✓ Properties in database: ${propertyCount}`);
    
    const userCount = await prisma.user.count();
    console.log(`✓ Users in database: ${userCount}`);
    
    const leadCount = await prisma.lead.count();
    console.log(`✓ Leads in database: ${leadCount}`);
    
    if (agentCount === 0) {
      console.log('\n⚠️  Database is empty! Run: node prisma/seed.js');
    } else {
      console.log('\n✓ Database has data!');
    }
    
  } catch (error) {
    console.error('✗ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
