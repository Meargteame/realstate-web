const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAgent() {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: 'b4635613-0a48-49e5-b3c1-69f0fd47e41e' }
    });
    
    console.log('Agent found:', agent?.name);
    console.log('Agent imageUrl:', agent?.imageUrl);
    console.log('Agent email:', agent?.email);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAgent();
