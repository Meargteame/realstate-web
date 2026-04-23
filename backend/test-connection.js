const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL || 'Not set, using default from schema');
    
    await prisma.$connect();
    console.log('✅ Connected successfully!');
    
    // Try to query
    const result = await prisma.$queryRaw`SELECT current_database(), current_user;`;
    console.log('✅ Query successful:', result);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testConnection();
