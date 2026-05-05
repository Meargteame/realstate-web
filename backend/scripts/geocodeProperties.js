const { PrismaClient } = require('@prisma/client');
const geocodingService = require('../services/geocodingService');

const prisma = new PrismaClient();

async function geocodeAllProperties() {
  console.log('🗺️  Starting property geocoding...');
  
  try {
    // Find properties without coordinates
    const properties = await prisma.property.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null },
          { geocoded: false }
        ]
      },
      select: {
        id: true,
        address: true,
        city: true,
        state: true,
        zip: true
      }
    });

    console.log(`📍 Found ${properties.length} properties to geocode`);

    if (properties.length === 0) {
      console.log('✅ All properties are already geocoded!');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    // Process properties with progress tracking
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const progress = Math.round(((i + 1) / properties.length) * 100);
      
      try {
        const fullAddress = `${property.address}, ${property.city}, ${property.state} ${property.zip}`;
        console.log(`[${i + 1}/${properties.length}] (${progress}%) Geocoding: ${fullAddress}`);
        
        const result = await geocodingService.geocodeAddress(fullAddress);

        if (result && result.latitude && result.longitude) {
          // Update property with coordinates
          await prisma.property.update({
            where: { id: property.id },
            data: {
              latitude: result.latitude,
              longitude: result.longitude,
              geocoded: true
            }
          });

          console.log(`  ✅ Success: ${result.latitude}, ${result.longitude} (${result.provider})`);
          successCount++;
        } else {
          console.log(`  ❌ Failed: Could not geocode address`);
          errorCount++;
        }

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`  ❌ Error geocoding property ${property.id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Geocoding Summary:');
    console.log(`✅ Successfully geocoded: ${successCount} properties`);
    console.log(`❌ Failed to geocode: ${errorCount} properties`);
    console.log(`📈 Success rate: ${Math.round((successCount / properties.length) * 100)}%`);

    // Show final statistics
    const totalGeocoded = await prisma.property.count({
      where: {
        geocoded: true,
        latitude: { not: null },
        longitude: { not: null }
      }
    });

    const totalProperties = await prisma.property.count();

    console.log(`\n🎯 Overall Statistics:`);
    console.log(`📍 Total geocoded properties: ${totalGeocoded}/${totalProperties}`);
    console.log(`📊 Overall geocoding rate: ${Math.round((totalGeocoded / totalProperties) * 100)}%`);

  } catch (error) {
    console.error('❌ Geocoding script error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  geocodeAllProperties()
    .then(() => {
      console.log('\n🎉 Geocoding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { geocodeAllProperties };