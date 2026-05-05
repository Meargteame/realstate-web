const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Austin area coordinates for realistic property locations
const austinCoordinates = [
  { lat: 30.2672, lng: -97.7431 }, // Downtown Austin
  { lat: 30.2430, lng: -97.7738 }, // South Austin
  { lat: 30.2711, lng: -97.8298 }, // Westlake
  { lat: 30.3588, lng: -97.7278 }, // North Austin
  { lat: 30.2515, lng: -97.7506 }, // South Congress
  { lat: 30.2295, lng: -97.8589 }, // Barton Creek
  { lat: 30.2669, lng: -97.7364 }, // East 6th Street
  { lat: 30.2953, lng: -97.7073 }, // Mueller
  { lat: 30.2851, lng: -97.7698 }, // Tarrytown
  { lat: 30.2341, lng: -97.7297 }, // Riverside
  { lat: 30.3134, lng: -97.7289 }, // Hyde Park
  { lat: 30.3456, lng: -97.7234 }, // Allandale
  { lat: 30.2634, lng: -97.8456 }, // Rob Roy
  { lat: 30.2634, lng: -97.7389 }, // Rainey Street
  { lat: 30.2456, lng: -97.7623 }, // Bouldin
  { lat: 30.2789, lng: -97.8234 }, // Scenic Drive
  { lat: 30.2789, lng: -97.7089 }, // Manor Road
  { lat: 30.2823, lng: -97.7567 }, // Clarksville
  { lat: 30.2934, lng: -97.7634 }, // Pemberton Heights
  { lat: 30.2567, lng: -97.7234 }, // East Cesar Chavez
  { lat: 30.2389, lng: -97.7456 }, // Travis Heights
];

// Round Rock coordinates
const roundRockCoordinates = [
  { lat: 30.5083, lng: -97.6789 },
  { lat: 30.5128, lng: -97.6647 },
  { lat: 30.5234, lng: -97.6423 },
];

// Cedar Park coordinates
const cedarParkCoordinates = [
  { lat: 30.5052, lng: -97.8203 },
  { lat: 30.5189, lng: -97.8156 },
  { lat: 30.4967, lng: -97.8234 },
];

// Pflugerville coordinates
const pflugervilleCoordinates = [
  { lat: 30.4394, lng: -97.6200 },
  { lat: 30.4456, lng: -97.6134 },
  { lat: 30.4523, lng: -97.6089 },
];

async function addCoordinatesToProperties() {
  console.log('🗺️  Adding coordinates to existing properties...');
  
  try {
    // Get all properties
    const properties = await prisma.property.findMany({
      orderBy: { id: 'asc' }
    });

    console.log(`📍 Found ${properties.length} properties to update`);

    let coordinateIndex = 0;
    let successCount = 0;

    for (const property of properties) {
      try {
        let coordinates;
        
        // Assign coordinates based on city
        if (property.city === 'Austin') {
          coordinates = austinCoordinates[coordinateIndex % austinCoordinates.length];
        } else if (property.city === 'Round Rock') {
          coordinates = roundRockCoordinates[coordinateIndex % roundRockCoordinates.length];
        } else if (property.city === 'Cedar Park') {
          coordinates = cedarParkCoordinates[coordinateIndex % cedarParkCoordinates.length];
        } else if (property.city === 'Pflugerville') {
          coordinates = pflugervilleCoordinates[coordinateIndex % pflugervilleCoordinates.length];
        } else {
          // Default to Austin downtown
          coordinates = austinCoordinates[0];
        }

        // Add small random offset for variety
        const latitude = coordinates.lat + (Math.random() - 0.5) * 0.02;
        const longitude = coordinates.lng + (Math.random() - 0.5) * 0.02;

        await prisma.property.update({
          where: { id: property.id },
          data: {
            latitude: latitude,
            longitude: longitude,
            geocoded: true
          }
        });

        console.log(`✅ Updated ${property.id}: ${property.address} -> ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        successCount++;
        coordinateIndex++;

      } catch (error) {
        console.error(`❌ Error updating property ${property.id}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully updated ${successCount}/${properties.length} properties with coordinates`);

    // Verify the update
    const geocodedCount = await prisma.property.count({
      where: {
        geocoded: true,
        latitude: { not: null },
        longitude: { not: null }
      }
    });

    console.log(`📊 Total geocoded properties: ${geocodedCount}`);

  } catch (error) {
    console.error('❌ Error adding coordinates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  addCoordinatesToProperties()
    .then(() => {
      console.log('\n🎉 Coordinate update complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { addCoordinatesToProperties };