const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/torra_realestate';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Get first agent
    const agent = await prisma.agent.findFirst();
    console.log('✅ Found agent:', agent ? agent.name : 'No agents found');
    
    if (!agent) {
      console.log('❌ No agents in database. Please run seed script first.');
      process.exit(1);
    }
    
    // Count leads
    const leadCount = await prisma.lead.count();
    console.log(`✅ Current leads in database: ${leadCount}`);
    
    // Count opportunities
    const oppCount = await prisma.opportunity.count();
    console.log(`✅ Current opportunities in database: ${oppCount}`);
    
    console.log('\n✅ All basic tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
