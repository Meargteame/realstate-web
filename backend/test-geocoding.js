const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    const count = await prisma.property.count();
    console.log(`Found ${count} properties in database`);
    
    const propertiesWithoutCoords = await prisma.property.count({
      where: {
        OR: [
          { latitude: null },
          { longitude: null },
          { geocoded: false }
        ]
      }
    });
    
    console.log(`Properties needing geocoding: ${propertiesWithoutCoords}`);
    
    // Test a simple update
    const firstProperty = await prisma.property.findFirst({
      where: {
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      }
    });
    
    if (firstProperty) {
      console.log(`Sample property: ${firstProperty.address}, ${firstProperty.city}, ${firstProperty.state}`);
      
      // Add sample coordinates (San Francisco area)
      await prisma.property.update({
        where: { id: firstProperty.id },
        data: {
          latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
          longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
          geocoded: true
        }
      });
      
      console.log('✅ Successfully updated property with sample coordinates');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();