const { PrismaClient } = require('@prisma/client');

async function simpleTest() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    const userCount = await prisma.user.count();
    console.log(`✅ Connected! Found ${userCount} users`);
    
    console.log('Testing SavedSearch model...');
    const savedSearchCount = await prisma.savedSearch.count();
    console.log(`✅ SavedSearch model works! Found ${savedSearchCount} saved searches`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

simpleTest();