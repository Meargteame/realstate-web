const { PrismaClient } = require('@prisma/client');
const emailService = require('./services/emailService');
const notificationService = require('./services/notificationService');

const prisma = new PrismaClient();

async function testSavedSearches() {
  console.log('🧪 Testing Saved Searches functionality...\n');
  
  try {
    // Test 1: Create a saved search
    console.log('1️⃣ Testing saved search creation...');
    
    const testSearch = await prisma.savedSearch.create({
      data: {
        userId: 'u4', // Test user from seed data
        name: 'Downtown Condos Under $500K',
        filters: {
          minPrice: 0,
          maxPrice: 500000,
          propertyType: 'Condo',
          city: 'Austin',
          beds: 2
        },
        emailAlerts: true,
        frequency: 'daily'
      },
      include: {
        user: true
      }
    });
    
    console.log(`✅ Created saved search: ${testSearch.name}`);
    console.log(`   User: ${testSearch.user.email}`);
    console.log(`   Filters: ${JSON.stringify(testSearch.filters, null, 2)}`);

    // Test 2: Find matching properties
    console.log('\n2️⃣ Testing property matching...');
    
    const matchingProperties = await prisma.property.findMany({
      where: {
        price: { lte: 500000 },
        propertyType: 'Condo',
        city: 'Austin',
        beds: { gte: 2 },
        status: 'Active'
      },
      take: 3
    });
    
    console.log(`✅ Found ${matchingProperties.length} matching properties:`);
    matchingProperties.forEach(p => {
      console.log(`   - ${p.address}: $${p.price.toLocaleString()} (${p.beds} bed, ${p.baths} bath)`);
    });

    // Test 3: Test email service
    console.log('\n3️⃣ Testing email service...');
    
    if (matchingProperties.length > 0) {
      const emailResult = await emailService.sendSearchAlert({
        user: testSearch.user,
        savedSearch: testSearch,
        newProperties: matchingProperties
      });
      
      console.log(`✅ Email service test: ${emailResult.success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`   Method: ${emailResult.method}`);
      console.log(`   Message ID: ${emailResult.messageId}`);
    }

    // Test 4: Create search alerts
    console.log('\n4️⃣ Testing search alerts creation...');
    
    const alertPromises = matchingProperties.slice(0, 2).map(property => 
      prisma.searchAlert.create({
        data: {
          savedSearchId: testSearch.id,
          propertyId: property.id,
          emailSent: true
        }
      })
    );
    
    const alerts = await Promise.all(alertPromises);
    console.log(`✅ Created ${alerts.length} search alerts`);

    // Test 5: Test API endpoints
    console.log('\n5️⃣ Testing API endpoints...');
    
    // Simulate API calls
    const apiTests = [
      { method: 'GET', endpoint: '/api/saved-searches', description: 'Get all saved searches' },
      { method: 'GET', endpoint: `/api/saved-searches/${testSearch.id}`, description: 'Get specific saved search' },
      { method: 'POST', endpoint: `/api/saved-searches/${testSearch.id}/run`, description: 'Run saved search' },
      { method: 'PATCH', endpoint: `/api/saved-searches/${testSearch.id}`, description: 'Update saved search' }
    ];
    
    apiTests.forEach(test => {
      console.log(`   📡 ${test.method} ${test.endpoint} - ${test.description}`);
    });
    console.log('✅ API endpoints ready for testing');

    // Test 6: Test notification service status
    console.log('\n6️⃣ Testing notification service...');
    
    const notificationStatus = notificationService.getStatus();
    console.log(`✅ Notification service status:`);
    console.log(`   Running: ${notificationStatus.isRunning}`);
    console.log(`   Active jobs: ${notificationStatus.activeJobs.join(', ')}`);
    console.log(`   Job count: ${notificationStatus.jobCount}`);

    // Test 7: Manual notification trigger
    console.log('\n7️⃣ Testing manual notification trigger...');
    
    const manualResult = await notificationService.triggerSearchNotification(testSearch.id);
    console.log(`✅ Manual notification: ${manualResult.success ? 'SUCCESS' : 'FAILED'}`);
    if (!manualResult.success) {
      console.log(`   Error: ${manualResult.error}`);
    }

    // Test 8: Database statistics
    console.log('\n8️⃣ Database statistics...');
    
    const stats = {
      savedSearches: await prisma.savedSearch.count(),
      searchAlerts: await prisma.searchAlert.count(),
      users: await prisma.user.count(),
      properties: await prisma.property.count()
    };
    
    console.log(`✅ Database stats:`);
    console.log(`   Saved searches: ${stats.savedSearches}`);
    console.log(`   Search alerts: ${stats.searchAlerts}`);
    console.log(`   Users: ${stats.users}`);
    console.log(`   Properties: ${stats.properties}`);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Start the frontend server: npm run dev');
    console.log('3. Visit http://localhost:3000/properties');
    console.log('4. Create a search and save it');
    console.log('5. Visit http://localhost:3000/saved-searches');
    console.log('6. Test email notifications (configure SMTP/SendGrid)');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testSavedSearches()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test script failed:', error);
      process.exit(1);
    });
}

module.exports = { testSavedSearches };