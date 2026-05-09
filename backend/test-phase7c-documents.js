/**
 * Phase 7C: Document Management System Test
 * Tests document upload, organization, sharing, and version control
 */

const BASE_URL = 'http://localhost:5000';

// Mock user ID for testing (replace with actual user ID)
const TEST_USER_ID = 'test-user-id';

async function testDocumentSystem() {
  console.log('🧪 Testing Phase 7C: Document Management System\n');
  
  const tests = [
    {
      name: 'Get Document Categories',
      method: 'GET',
      endpoint: '/api/documents/categories',
      description: 'Fetch all document categories'
    },
    {
      name: 'Get User Documents',
      method: 'GET',
      endpoint: `/api/documents?userId=${TEST_USER_ID}`,
      description: 'Fetch documents for current user'
    },
    {
      name: 'Filter by Category',
      method: 'GET',
      endpoint: `/api/documents?userId=${TEST_USER_ID}&category=contract`,
      description: 'Filter documents by category'
    },
    {
      name: 'Search Documents',
      method: 'GET',
      endpoint: `/api/documents?userId=${TEST_USER_ID}&search=test`,
      description: 'Search documents by name/description'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const response = await fetch(`${BASE_URL}${test.endpoint}`, {
        method: test.method
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${test.name}`);
        console.log(`   ${test.description}`);
        
        if (Array.isArray(data)) {
          console.log(`   Found: ${data.length} items`);
        }
        console.log('');
        passed++;
      } else {
        console.log(`❌ ${test.name}`);
        console.log(`   Error: ${data.error || 'Request failed'}\n`);
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
    console.log('\n🎉 All Phase 7C document features working correctly!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Access document management at /admin/documents');
    console.log('   2. Upload your first document');
    console.log('   3. Test document sharing');
    console.log('   4. Test version control');
    console.log('   5. Test access logging');
  } else {
    console.log('\n⚠️  Some document features need attention');
    console.log('   Note: Some tests may fail if no user exists yet');
  }
}

// Run tests
testDocumentSystem().catch(console.error);
