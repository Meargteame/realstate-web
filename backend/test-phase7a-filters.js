/**
 * Phase 7A: Advanced Search Filters Test
 * Tests all 17 new filter options
 */

const BASE_URL = 'http://localhost:5000';

async function testAdvancedFilters() {
  console.log('🧪 Testing Phase 7A: Advanced Search Filters\n');
  
  const tests = [
    {
      name: 'Year Built Range',
      params: 'minYear=2010&maxYear=2020',
      description: 'Properties built between 2010-2020'
    },
    {
      name: 'Lot Size Range',
      params: 'minLotSize=5000&maxLotSize=10000',
      description: 'Lot size between 5,000-10,000 sq ft'
    },
    {
      name: 'HOA Fees Range',
      params: 'minHoaFees=0&maxHoaFees=200',
      description: 'HOA fees under $200/month'
    },
    {
      name: 'Garage Spaces',
      params: 'minGarageSpaces=2',
      description: 'At least 2 garage spaces'
    },
    {
      name: 'Has Pool',
      params: 'hasPool=true',
      description: 'Properties with pool'
    },
    {
      name: 'Has Basement',
      params: 'hasBasement=true',
      description: 'Properties with basement'
    },
    {
      name: 'Has Fireplace',
      params: 'hasFireplace=true',
      description: 'Properties with fireplace'
    },
    {
      name: 'Waterfront',
      params: 'isWaterfront=true',
      description: 'Waterfront properties'
    },
    {
      name: 'Pet Friendly',
      params: 'isPetFriendly=true',
      description: 'Pet-friendly properties'
    },
    {
      name: 'Stories Range',
      params: 'minStories=2&maxStories=3',
      description: '2-3 story properties'
    },
    {
      name: 'Property Condition',
      params: 'condition=Excellent',
      description: 'Properties in excellent condition'
    },
    {
      name: 'Days on Market',
      params: 'maxDaysOnMarket=30',
      description: 'Listed within last 30 days'
    },
    {
      name: 'Combined Filters',
      params: 'minPrice=300000&maxPrice=500000&beds=3&hasPool=true&minGarageSpaces=2',
      description: '$300K-$500K, 3+ beds, pool, 2+ garage'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const response = await fetch(`${BASE_URL}/api/properties?${test.params}`);
      const data = await response.json();
      
      if (response.ok && Array.isArray(data)) {
        console.log(`✅ ${test.name}`);
        console.log(`   ${test.description}`);
        console.log(`   Found: ${data.length} properties\n`);
        passed++;
      } else {
        console.log(`❌ ${test.name}`);
        console.log(`   Error: ${data.error || 'Invalid response'}\n`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${error.message}\n`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(50));
  
  if (failed === 0) {
    console.log('\n🎉 All Phase 7A filters working correctly!');
  } else {
    console.log('\n⚠️  Some filters need attention');
  }
}

// Run tests
testAdvancedFilters().catch(console.error);
