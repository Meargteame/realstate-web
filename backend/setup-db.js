const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function setupDatabase() {
  console.log('🔧 Setting up database...\n');

  try {
    // Step 1: Generate Prisma Client
    console.log('1️⃣ Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma Client generated\n');

    // Step 2: Push schema to database
    console.log('2️⃣ Pushing schema to database...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Schema pushed to database\n');

    // Step 3: Test connection
    console.log('3️⃣ Testing database connection...');
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Step 4: Check tables
    console.log('4️⃣ Verifying tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log('📊 Tables created:', tables.map(t => t.table_name).join(', '));
    console.log('✅ Database setup complete!\n');

    await prisma.$disconnect();
    
    console.log('🎉 Ready to seed! Run: npm run seed\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check if PostgreSQL is running: pg_isready');
    console.error('   2. Verify DATABASE_URL in .env file');
    console.error('   3. Ensure database exists: createdb kw_realestate');
    console.error('   4. Check connection: psql postgresql://meareg@127.0.0.1:5432/kw_realestate\n');
    process.exit(1);
  }
}

setupDatabase();
