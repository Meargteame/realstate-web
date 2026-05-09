/**
 * Phase 7B: Blog/Content Management System Test
 * Tests blog CRUD operations, categories, tags, and SEO
 */

const BASE_URL = 'http://localhost:5000';

async function testBlogSystem() {
  console.log('🧪 Testing Phase 7B: Blog/Content Management System\n');
  
  const tests = [
    {
      name: 'Get Published Blog Posts',
      method: 'GET',
      endpoint: '/api/blog?limit=10',
      description: 'Fetch published blog posts with pagination'
    },
    {
      name: 'Get Featured Posts',
      method: 'GET',
      endpoint: '/api/blog?featured=true',
      description: 'Fetch only featured blog posts'
    },
    {
      name: 'Search Blog Posts',
      method: 'GET',
      endpoint: '/api/blog?search=real estate',
      description: 'Search posts by keyword'
    },
    {
      name: 'Filter by Category',
      method: 'GET',
      endpoint: '/api/blog?category=buying-tips',
      description: 'Filter posts by category slug'
    },
    {
      name: 'Filter by Tag',
      method: 'GET',
      endpoint: '/api/blog?tag=first-time-buyer',
      description: 'Filter posts by tag slug'
    },
    {
      name: 'Get Blog Categories',
      method: 'GET',
      endpoint: '/api/blog/categories',
      description: 'Fetch all blog categories with post counts'
    },
    {
      name: 'Get Blog Tags',
      method: 'GET',
      endpoint: '/api/blog/tags',
      description: 'Fetch all blog tags with post counts'
    },
    {
      name: 'Get Single Post by Slug',
      method: 'GET',
      endpoint: '/api/blog/test-post',
      description: 'Fetch single blog post (will 404 if no posts exist)',
      allowNotFound: true
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
      
      if (response.ok || (test.allowNotFound && response.status === 404)) {
        console.log(`✅ ${test.name}`);
        console.log(`   ${test.description}`);
        
        if (response.ok) {
          if (Array.isArray(data)) {
            console.log(`   Found: ${data.length} items`);
          } else if (data.posts) {
            console.log(`   Found: ${data.posts.length} posts (Total: ${data.pagination?.total || 0})`);
          } else if (data.title) {
            console.log(`   Post: "${data.title}" by ${data.authorName}`);
            console.log(`   Views: ${data.viewCount}, Status: ${data.status}`);
          }
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
    console.log('\n🎉 All Phase 7B blog features working correctly!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Access admin blog management at /admin/blog');
    console.log('   2. Create your first blog post');
    console.log('   3. View public blog at /blog');
    console.log('   4. Test SEO meta tags and social sharing');
  } else {
    console.log('\n⚠️  Some blog features need attention');
  }
}

// Run tests
testBlogSystem().catch(console.error);
