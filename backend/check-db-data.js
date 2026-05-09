const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 Checking database data...\n');

    const agentCount = await prisma.agent.count();
    console.log(`📊 Total Agents: ${agentCount}`);

    if (agentCount > 0) {
      const agents = await prisma.agent.findMany({
        take: 3,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      });
      console.log('Sample agents:', JSON.stringify(agents, null, 2));
    }

    const userCount = await prisma.user.count();
    console.log(`\n📊 Total Users: ${userCount}`);

    if (userCount > 0) {
      const users = await prisma.user.findMany({
        take: 3,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          agentId: true,
          createdAt: true
        }
      });
      console.log('Sample users:', JSON.stringify(users, null, 2));
    }

    const propertyCount = await prisma.property.count();
    console.log(`\n📊 Total Properties: ${propertyCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
