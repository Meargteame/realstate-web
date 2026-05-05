const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProperty() {
  try {
    const property = await prisma.property.findUnique({
      where: { id: '2688dd65-436d-4006-97b6-241eee92cab3' },
      include: { agent: true }
    });
    
    console.log('Property found:', JSON.stringify(property, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProperty();
