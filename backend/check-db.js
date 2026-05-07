const prisma = require('./config/prisma');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database...\n');
    
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `;
    
    console.log('📋 Tables in database:');
    tables.forEach(t => console.log(`  - ${t.tablename}`));
    console.log(`\n✅ Total: ${tables.length} tables\n`);
    
    // Check if Agent table exists
    const hasAgent = tables.some(t => t.tablename.toLowerCase() === 'agent');
    const hasAgents = tables.some(t => t.tablename === 'agents');
    
    console.log('🔎 Agent table check:');
    console.log(`  - "Agent" (capital): ${hasAgent ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    console.log(`  - "agents" (lowercase): ${hasAgents ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
