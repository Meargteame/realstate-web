const prisma = require('./config/prisma');

async function deleteProperty() {
  try {
    await prisma.property.delete({
      where: { id: '2688dd65-436d-4006-97b6-241eee92cab3' }
    });
    console.log('✅ Property deleted successfully');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteProperty();
