const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:root@localhost:5432/torra_realestate'
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkAgents() {
  try {
    console.log('🔍 Checking agents in database...\n');
    
    const agents = await prisma.agent.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    console.log(`Found ${agents.length} agents:\n`);
    agents.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name}`);
      console.log(`   ID: ${agent.id}`);
      console.log(`   Email: ${agent.email}`);
      console.log(`   Role: ${agent.role}\n`);
    });
    
    // Check for the specific email
    const targetAgent = agents.find(a => a.email === 'hello.meareg@gmail.com');
    if (targetAgent) {
      console.log('✅ Found agent with email hello.meareg@gmail.com:');
      console.log(`   ID: ${targetAgent.id}`);
      console.log(`   Name: ${targetAgent.name}`);
    } else {
      console.log('❌ No agent found with email hello.meareg@gmail.com');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkAgents();
