const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMapAPI() {
  console.log('🗺️  Testing Map API functionality...\n');
  
  try {
    // Test 1: Count total properties
    const totalProperties = await prisma.property.count();
    console.log(`📊 Total properties in database: ${totalProperties}`);

    // Test 2: Count geocoded properties
    const geocodedProperties = await prisma.property.count({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        geocoded: true
      }
    });
    console.log(`📍 Geocoded properties: ${geocodedProperties}/${totalProperties}`);

    // Test 3: Get sample properties with coordinates
    const sampleProperties = await prisma.property.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      },
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        latitude: true,
        longitude: true
      },
      take: 5
    });

    console.log('\n📋 Sample properties with coordinates:');
    sampleProperties.forEach(p => {
      console.log(`  ${p.address}, ${p.city} - $${p.price.toLocaleString()} - (${p.latitude}, ${p.longitude})`);
    });

    // Test 4: Calculate bounds for all properties
    const propertiesForBounds = await prisma.property.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      },
      select: {
        latitude: true,
        longitude: true
      }
    });

    if (propertiesForBounds.length > 0) {
      const lats = propertiesForBounds.map(p => p.latitude);
      const lngs = propertiesForBounds.map(p => p.longitude);

      const bounds = {
        southwest: {
          lat: Math.min(...lats),
          lng: Math.min(...lngs)
        },
        northeast: {
          lat: Math.max(...lats),
          lng: Math.max(...lngs)
        }
      };

      console.log('\n🗺️  Map bounds for all properties:');
      console.log(`  Southwest: ${bounds.southwest.lat.toFixed(4)}, ${bounds.southwest.lng.toFixed(4)}`);
      console.log(`  Northeast: ${bounds.northeast.lat.toFixed(4)}, ${bounds.northeast.lng.toFixed(4)}`);
    }

    // Test 5: Test price-based filtering
    const luxuryProperties = await prisma.property.count({
      where: {
        price: { gte: 1000000 },
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    console.log(`\n💎 Luxury properties ($1M+): ${luxuryProperties}`);

    const affordableProperties = await prisma.property.count({
      where: {
        price: { lte: 500000 },
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    console.log(`🏠 Affordable properties (<$500K): ${affordableProperties}`);

    // Test 6: Test city-based distribution
    const cityCounts = await prisma.property.groupBy({
      by: ['city'],
      where: {
        latitude: { not: null },
        longitude: { not: null }
      },
      _count: {
        id: true
      }
    });

    console.log('\n🏙️  Properties by city:');
    cityCounts.forEach(city => {
      console.log(`  ${city.city}: ${city._count.id} properties`);
    });

    console.log('\n✅ Map API test completed successfully!');

  } catch (error) {
    console.error('❌ Map API test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testMapAPI()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testMapAPI };