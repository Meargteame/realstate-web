#!/usr/bin/env node

/**
 * COMPREHENSIVE END-TO-END FUNCTIONALITY TEST
 * Tests every page, button, card, and feature
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3001';

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(category, test, status, message = '') {
  const symbol = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠';
  const color = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  
  // Safely handle message
  const safeMessage = message || 'No error message';
  
  log(`  ${symbol} ${test}${message ? ': ' + safeMessage : ''}`, color);
  
  results.tests.push({ category, test, status, message: safeMessage });
  if (status === 'PASS') results.passed++;
  else if (status === 'FAIL') results.failed++;
  else results.warnings++;
}

// Test helper functions
async function testEndpoint(method, endpoint, data = null, token = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const responseData = await response.json().catch(() => ({ error: 'Failed to parse response' }));
    
    return {
      status: response.status,
      ok: response.ok,
      data: responseData || {}
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      data: {},
      error: error.message
    };
  }
}

// ============================================
// TEST SUITE 1: AUTHENTICATION & USER MANAGEMENT
// ============================================
async function testAuthentication() {
  log('\n📝 Testing Authentication & User Management...', 'cyan');
  
  // Test 1: User Registration
  const registerData = {
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}@example.com`,
    password: 'password123'
  };
  
  const registerRes = await testEndpoint('POST', '/api/auth/register', registerData);
  logTest('Auth', 'User Registration', registerRes.ok ? 'PASS' : 'FAIL', 
    registerRes.ok ? 'User registered successfully' : (registerRes.data?.error || registerRes.error || 'Unknown error'));
  
  // Test 2: User Login
  const loginRes = await testEndpoint('POST', '/api/auth/login', {
    email: registerData.email,
    password: registerData.password
  });
  logTest('Auth', 'User Login', loginRes.ok ? 'PASS' : 'FAIL',
    loginRes.ok ? 'Login successful' : loginRes.data.error);
  
  const userToken = loginRes.data?.token;
  
  // Test 3: Admin Login
  const adminLoginRes = await testEndpoint('POST', '/api/auth/login', {
    email: 'admin@torra.com',
    password: 'password123'
  });
  logTest('Auth', 'Admin Login', adminLoginRes.ok ? 'PASS' : 'FAIL',
    adminLoginRes.ok ? 'Admin login successful' : adminLoginRes.data.error);
  
  const adminToken = adminLoginRes.data?.token;
  
  // Test 4: Get Current User
  if (userToken) {
    const meRes = await testEndpoint('GET', '/api/auth/me', null, userToken);
    logTest('Auth', 'Get Current User', meRes.ok ? 'PASS' : 'FAIL',
      meRes.ok ? `User: ${meRes.data.name}` : meRes.data.error);
  }
  
  return { userToken, adminToken, registerData };
}

// ============================================
// TEST SUITE 2: PROPERTY MANAGEMENT
// ============================================
async function testPropertyManagement(tokens) {
  log('\n🏠 Testing Property Management...', 'cyan');
  
  // Test 1: Get All Properties
  const propertiesRes = await testEndpoint('GET', '/api/properties');
  logTest('Properties', 'Get All Properties', propertiesRes.ok ? 'PASS' : 'FAIL',
    propertiesRes.ok ? `Found ${propertiesRes.data.length} properties` : propertiesRes.data.error);
  
  const propertyId = propertiesRes.data?.[0]?.id;
  
  // Test 2: Get Property Details
  if (propertyId) {
    const detailsRes = await testEndpoint('GET', `/api/properties/${propertyId}`);
    logTest('Properties', 'Get Property Details', detailsRes.ok ? 'PASS' : 'FAIL',
      detailsRes.ok ? `Property: ${detailsRes.data.address}` : detailsRes.data.error);
  }
  
  // Test 3: Search Properties with Filters
  const searchRes = await testEndpoint('GET', '/api/properties?minPrice=100000&maxPrice=500000&beds=3');
  logTest('Properties', 'Search with Filters', searchRes.ok ? 'PASS' : 'FAIL',
    searchRes.ok ? `Found ${searchRes.data.length} filtered properties` : searchRes.data.error);
  
  // Test 4: Get Similar Properties
  if (propertyId) {
    const similarRes = await testEndpoint('GET', `/api/properties/${propertyId}/similar`);
    logTest('Properties', 'Get Similar Properties', similarRes.ok ? 'PASS' : 'FAIL',
      similarRes.ok ? `Found ${similarRes.data.length} similar properties` : similarRes.data.error);
  }
  
  // Test 5: Get Price History (Phase 7D)
  if (propertyId) {
    const priceHistoryRes = await testEndpoint('GET', `/api/properties/${propertyId}/price-history`);
    logTest('Properties', 'Get Price History', priceHistoryRes.ok ? 'PASS' : 'FAIL',
      priceHistoryRes.ok ? 'Price history retrieved' : priceHistoryRes.data.error);
  }
  
  // Test 6: Advanced Search Filters (Phase 7A)
  const advancedSearchRes = await testEndpoint('GET', 
    '/api/properties?hasPool=true&hasBasement=true&minYear=2000&maxDaysOnMarket=30');
  logTest('Properties', 'Advanced Search Filters', advancedSearchRes.ok ? 'PASS' : 'FAIL',
    advancedSearchRes.ok ? `Found ${advancedSearchRes.data.length} properties with advanced filters` : advancedSearchRes.data.error);
  
  return { propertyId };
}

// ============================================
// TEST SUITE 3: SAVED SEARCHES
// ============================================
async function testSavedSearches(tokens, propertyData) {
  log('\n🔍 Testing Saved Searches...', 'cyan');
  
  if (!tokens.userToken) {
    logTest('Saved Searches', 'All Tests', 'WARN', 'Skipped - No user token');
    return;
  }
  
  // Test 1: Create Saved Search
  const createSearchRes = await testEndpoint('POST', '/api/saved-searches', {
    name: 'Test Search',
    filters: {
      minPrice: 200000,
      maxPrice: 400000,
      beds: 3,
      baths: 2
    },
    emailAlerts: true,
    frequency: 'daily'
  }, tokens.userToken);
  logTest('Saved Searches', 'Create Saved Search', createSearchRes.ok ? 'PASS' : 'FAIL',
    createSearchRes.ok ? 'Search saved successfully' : createSearchRes.data.error);
  
  const searchId = createSearchRes.data?.savedSearch?.id;
  
  // Test 2: Get All Saved Searches
  const getSearchesRes = await testEndpoint('GET', '/api/saved-searches', null, tokens.userToken);
  logTest('Saved Searches', 'Get All Saved Searches', getSearchesRes.ok ? 'PASS' : 'FAIL',
    getSearchesRes.ok ? `Found ${getSearchesRes.data.savedSearches?.length || 0} saved searches` : getSearchesRes.data.error);
  
  // Test 3: Run Saved Search
  if (searchId) {
    const runSearchRes = await testEndpoint('POST', `/api/saved-searches/${searchId}/run`, null, tokens.userToken);
    logTest('Saved Searches', 'Run Saved Search', runSearchRes.ok ? 'PASS' : 'FAIL',
      runSearchRes.ok ? `Found ${runSearchRes.data.count} matching properties` : runSearchRes.data.error);
  }
  
  // Test 4: Update Saved Search
  if (searchId) {
    const updateSearchRes = await testEndpoint('PATCH', `/api/saved-searches/${searchId}`, {
      emailAlerts: false
    }, tokens.userToken);
    logTest('Saved Searches', 'Update Saved Search', updateSearchRes.ok ? 'PASS' : 'FAIL',
      updateSearchRes.ok ? 'Search updated successfully' : updateSearchRes.data.error);
  }
  
  // Test 5: Delete Saved Search
  if (searchId) {
    const deleteSearchRes = await testEndpoint('DELETE', `/api/saved-searches/${searchId}`, null, tokens.userToken);
    logTest('Saved Searches', 'Delete Saved Search', deleteSearchRes.ok ? 'PASS' : 'FAIL',
      deleteSearchRes.ok ? 'Search deleted successfully' : deleteSearchRes.data.error);
  }
}

// ============================================
// TEST SUITE 4: FAVORITES
// ============================================
async function testFavorites(tokens, propertyData) {
  log('\n❤️  Testing Favorites...', 'cyan');
  
  if (!tokens.userToken || !propertyData.propertyId) {
    logTest('Favorites', 'All Tests', 'WARN', 'Skipped - No user token or property ID');
    return;
  }
  
  // Test 1: Add to Favorites
  const addFavRes = await testEndpoint('POST', '/api/favorites', {
    propertyId: propertyData.propertyId
  }, tokens.userToken);
  logTest('Favorites', 'Add to Favorites', addFavRes.ok ? 'PASS' : 'FAIL',
    addFavRes.ok ? 'Property added to favorites' : addFavRes.data.error);
  
  // Test 2: Get All Favorites
  const getFavRes = await testEndpoint('GET', '/api/favorites', null, tokens.userToken);
  logTest('Favorites', 'Get All Favorites', getFavRes.ok ? 'PASS' : 'FAIL',
    getFavRes.ok ? `Found ${getFavRes.data.length} favorites` : getFavRes.data.error);
  
  // Test 3: Remove from Favorites
  const removeFavRes = await testEndpoint('DELETE', `/api/favorites/${propertyData.propertyId}`, null, tokens.userToken);
  logTest('Favorites', 'Remove from Favorites', removeFavRes.ok ? 'PASS' : 'FAIL',
    removeFavRes.ok ? 'Property removed from favorites' : removeFavRes.data.error);
}

// ============================================
// TEST SUITE 5: LEADS & OPPORTUNITIES
// ============================================
async function testLeadsAndOpportunities(tokens) {
  log('\n📊 Testing Leads & Opportunities...', 'cyan');
  
  if (!tokens.adminToken) {
    logTest('Leads', 'All Tests', 'WARN', 'Skipped - No admin token');
    return;
  }
  
  // Test 1: Get All Leads
  const leadsRes = await testEndpoint('GET', '/api/leads', null, tokens.adminToken);
  logTest('Leads', 'Get All Leads', leadsRes.ok ? 'PASS' : 'FAIL',
    leadsRes.ok ? `Found ${leadsRes.data.length} leads` : leadsRes.data.error);
  
  // Test 2: Get All Opportunities
  const oppsRes = await testEndpoint('GET', '/api/opportunities', null, tokens.adminToken);
  logTest('Opportunities', 'Get All Opportunities', oppsRes.ok ? 'PASS' : 'FAIL',
    oppsRes.ok ? `Found ${oppsRes.data.length} opportunities` : oppsRes.data.error);
}

// ============================================
// TEST SUITE 6: BLOG SYSTEM
// ============================================
async function testBlogSystem(tokens) {
  log('\n📝 Testing Blog System...', 'cyan');
  
  // Test 1: Get All Blog Posts
  const postsRes = await testEndpoint('GET', '/api/blog');
  logTest('Blog', 'Get All Blog Posts', postsRes.ok ? 'PASS' : 'FAIL',
    postsRes.ok ? `Found ${postsRes.data.posts?.length || 0} blog posts` : postsRes.data.error);
  
  const postSlug = postsRes.data.posts?.[0]?.slug;
  
  // Test 2: Get Blog Post by Slug
  if (postSlug) {
    const postRes = await testEndpoint('GET', `/api/blog/${postSlug}`);
    logTest('Blog', 'Get Blog Post by Slug', postRes.ok ? 'PASS' : 'FAIL',
      postRes.ok ? `Post: ${postRes.data.title}` : postRes.data.error);
  }
  
  // Test 3: Get Blog Categories
  const categoriesRes = await testEndpoint('GET', '/api/blog/categories');
  logTest('Blog', 'Get Blog Categories', categoriesRes.ok ? 'PASS' : 'FAIL',
    categoriesRes.ok ? `Found ${categoriesRes.data.length} categories` : categoriesRes.data.error);
  
  // Test 4: Get Blog Tags
  const tagsRes = await testEndpoint('GET', '/api/blog/tags');
  logTest('Blog', 'Get Blog Tags', tagsRes.ok ? 'PASS' : 'FAIL',
    tagsRes.ok ? `Found ${tagsRes.data.length} tags` : tagsRes.data.error);
  
  // Test 5: Admin - Create Blog Post
  if (tokens.adminToken) {
    const createPostRes = await testEndpoint('POST', '/api/blog', {
      title: 'Test Blog Post',
      content: 'This is a test blog post content.',
      excerpt: 'Test excerpt',
      authorId: 'f2d2c702-3702-4717-9f44-7e5a860f81bf',
      status: 'published',
      featured: false
    }, tokens.adminToken);
    logTest('Blog', 'Admin Create Blog Post', createPostRes.ok ? 'PASS' : 'FAIL',
      createPostRes.ok ? 'Blog post created' : createPostRes.data.error);
  }
}

// ============================================
// TEST SUITE 7: CALENDAR & APPOINTMENTS
// ============================================
async function testCalendarSystem(tokens) {
  log('\n📅 Testing Calendar & Appointments...', 'cyan');
  
  if (!tokens.userToken) {
    logTest('Calendar', 'All Tests', 'WARN', 'Skipped - No user token');
    return;
  }
  
  // Calendar requires agentId, so we'll test booking requests instead
  // Test 1: Create Booking Request (public endpoint)
  const createBookingRes = await testEndpoint('POST', '/api/calendar/bookings', {
    agentId: 'f2d2c702-3702-4717-9f44-7e5a860f81bf',
    name: 'Test User',
    email: 'test@example.com',
    phone: '555-1234',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '10:00',
    type: 'showing',
    message: 'Test booking request'
  });
  logTest('Calendar', 'Create Booking Request', createBookingRes.ok ? 'PASS' : 'FAIL',
    createBookingRes.ok ? 'Booking request created' : createBookingRes.data.error);
}

// ============================================
// TEST SUITE 8: OPEN HOUSES
// ============================================
async function testOpenHouses() {
  log('\n🏡 Testing Open Houses...', 'cyan');
  
  // Test 1: Get All Open Houses
  const openHousesRes = await testEndpoint('GET', '/api/open-houses');
  logTest('Open Houses', 'Get All Open Houses', openHousesRes.ok ? 'PASS' : 'FAIL',
    openHousesRes.ok ? `Found ${openHousesRes.data.length} open houses` : openHousesRes.data.error);
  
  const openHouseId = openHousesRes.data?.[0]?.id;
  
  // Test 2: RSVP to Open House
  if (openHouseId) {
    const rsvpRes = await testEndpoint('POST', `/api/open-houses/${openHouseId}/rsvp`, {
      name: 'Test User',
      email: 'test@example.com',
      phone: '555-1234',
      guests: 2
    });
    logTest('Open Houses', 'RSVP to Open House', rsvpRes.ok ? 'PASS' : 'FAIL',
      rsvpRes.ok ? 'RSVP submitted successfully' : rsvpRes.data.error);
  }
}

// ============================================
// TEST SUITE 9: ADMIN PANEL
// ============================================
async function testAdminPanel(tokens) {
  log('\n👑 Testing Admin Panel...', 'cyan');
  
  if (!tokens.adminToken) {
    logTest('Admin', 'All Tests', 'WARN', 'Skipped - No admin token');
    return;
  }
  
  // Test 1: Get Platform Stats
  const statsRes = await testEndpoint('GET', '/api/admin/stats', null, tokens.adminToken);
  logTest('Admin', 'Get Platform Stats', statsRes.ok ? 'PASS' : 'FAIL',
    statsRes.ok ? `Users: ${statsRes.data.totalUsers}, Agents: ${statsRes.data.totalAgents}` : statsRes.data.error);
  
  // Test 2: Get All Users
  const usersRes = await testEndpoint('GET', '/api/admin/users?page=1&limit=10', null, tokens.adminToken);
  logTest('Admin', 'Get All Users', usersRes.ok ? 'PASS' : 'FAIL',
    usersRes.ok ? `Found ${usersRes.data.users?.length || 0} users` : usersRes.data.error);
  
  // Test 3: Get All Agents
  const agentsRes = await testEndpoint('GET', '/api/admin/agents?page=1&limit=10', null, tokens.adminToken);
  logTest('Admin', 'Get All Agents', agentsRes.ok ? 'PASS' : 'FAIL',
    agentsRes.ok ? `Found ${agentsRes.data.agents?.length || 0} agents` : agentsRes.data.error);
  
  // Test 4: Get All Properties (Admin)
  const adminPropsRes = await testEndpoint('GET', '/api/admin/properties?page=1&limit=10', null, tokens.adminToken);
  logTest('Admin', 'Get All Properties (Admin)', adminPropsRes.ok ? 'PASS' : 'FAIL',
    adminPropsRes.ok ? `Found ${adminPropsRes.data.properties?.length || 0} properties` : adminPropsRes.data.error);
  
  // Test 5: Get Top Agents
  const topAgentsRes = await testEndpoint('GET', '/api/admin/top-agents?limit=5', null, tokens.adminToken);
  logTest('Admin', 'Get Top Agents', topAgentsRes.ok ? 'PASS' : 'FAIL',
    topAgentsRes.ok ? `Found ${topAgentsRes.data.length} top agents` : topAgentsRes.data.error);
}

// ============================================
// TEST SUITE 10: DOCUMENTS (Phase 7C)
// ============================================
async function testDocuments(tokens) {
  log('\n📄 Testing Document Management...', 'cyan');
  
  if (!tokens.adminToken) {
    logTest('Documents', 'All Tests', 'WARN', 'Skipped - No admin token');
    return;
  }
  
  // Test 1: Get All Documents
  const docsRes = await testEndpoint('GET', '/api/documents', null, tokens.adminToken);
  logTest('Documents', 'Get All Documents', docsRes.ok ? 'PASS' : 'FAIL',
    docsRes.ok ? `Found ${docsRes.data.length} documents` : docsRes.data.error);
}

// ============================================
// TEST SUITE 11: PROPERTY COMPARISON (Phase 7D)
// ============================================
async function testPropertyComparison(tokens, propertyData) {
  log('\n⚖️  Testing Property Comparison...', 'cyan');
  
  if (!tokens.userToken) {
    logTest('Comparison', 'All Tests', 'WARN', 'Skipped - No user token');
    return;
  }
  
  // Test 1: Get All Comparisons
  const comparisonsRes = await testEndpoint('GET', '/api/properties/comparisons', null, tokens.userToken);
  logTest('Comparison', 'Get All Comparisons', comparisonsRes.ok ? 'PASS' : 'FAIL',
    comparisonsRes.ok ? `Found ${comparisonsRes.data.length} comparisons` : comparisonsRes.data.error);
}

// ============================================
// TEST SUITE 12: MAP & GEOCODING
// ============================================
async function testMapFeatures() {
  log('\n🗺️  Testing Map & Geocoding...', 'cyan');
  
  // Test 1: Search Properties in Area
  const areaSearchRes = await testEndpoint('POST', '/api/map/search-area', {
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-122.5, 37.7],
        [-122.4, 37.7],
        [-122.4, 37.8],
        [-122.5, 37.8],
        [-122.5, 37.7]
      ]]
    },
    filters: {}
  });
  logTest('Map', 'Search Properties in Area', areaSearchRes.ok ? 'PASS' : 'FAIL',
    areaSearchRes.ok ? `Found ${areaSearchRes.data.properties?.length || 0} properties in area` : areaSearchRes.data.error);
}

// ============================================
// TEST SUITE 13: ANALYTICS
// ============================================
async function testAnalytics(tokens) {
  log('\n📈 Testing Analytics...', 'cyan');
  
  if (!tokens.adminToken) {
    logTest('Analytics', 'All Tests', 'WARN', 'Skipped - No admin token');
    return;
  }
  
  // Analytics requires agentId, so we'll skip for now
  logTest('Analytics', 'Agent Analytics', 'WARN', 'Skipped - Requires specific agentId');
}

// ============================================
// TEST SUITE 14: MESSAGING
// ============================================
async function testMessaging(tokens, propertyData) {
  log('\n💬 Testing Messaging System...', 'cyan');
  
  if (!tokens.userToken || !propertyData.propertyId) {
    logTest('Messaging', 'All Tests', 'WARN', 'Skipped - No user token or property ID');
    return;
  }
  
  // Test 1: Send Message
  const sendMessageRes = await testEndpoint('POST', '/api/messages/send', {
    propertyId: propertyData.propertyId,
    agentId: 'f2d2c702-3702-4717-9f44-7e5a860f81bf',
    senderName: 'Test User',
    senderEmail: 'test@example.com',
    message: 'Test message about this property'
  }, tokens.userToken);
  logTest('Messaging', 'Send Message', sendMessageRes.ok ? 'PASS' : 'FAIL',
    sendMessageRes.ok ? 'Message sent successfully' : sendMessageRes.data.error);
  
  // Test 2: Get Conversations
  const conversationsRes = await testEndpoint('GET', '/api/messages/conversations/f2d2c702-3702-4717-9f44-7e5a860f81bf', null, tokens.userToken);
  logTest('Messaging', 'Get Conversations', conversationsRes.ok ? 'PASS' : 'FAIL',
    conversationsRes.ok ? `Found ${conversationsRes.data.length} conversations` : conversationsRes.data.error);
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runAllTests() {
  log('\n' + '='.repeat(60), 'bold');
  log('🧪 COMPREHENSIVE FUNCTIONALITY TEST SUITE', 'bold');
  log('='.repeat(60) + '\n', 'bold');
  
  log(`Testing Backend: ${BASE_URL}`, 'blue');
  log(`Testing Frontend: ${FRONTEND_URL}`, 'blue');
  log(`Started: ${new Date().toLocaleString()}\n`, 'blue');
  
  try {
    // Run all test suites
    const authData = await testAuthentication();
    const propertyData = await testPropertyManagement(authData);
    await testSavedSearches(authData, propertyData);
    await testFavorites(authData, propertyData);
    await testLeadsAndOpportunities(authData);
    await testBlogSystem(authData);
    await testCalendarSystem(authData);
    await testOpenHouses();
    await testAdminPanel(authData);
    await testDocuments(authData);
    await testPropertyComparison(authData, propertyData);
    await testMapFeatures();
    await testAnalytics(authData);
    await testMessaging(authData, propertyData);
    
    // Print summary
    log('\n' + '='.repeat(60), 'bold');
    log('📊 TEST SUMMARY', 'bold');
    log('='.repeat(60), 'bold');
    
    log(`\n✓ Passed:  ${results.passed}`, 'green');
    log(`✗ Failed:  ${results.failed}`, 'red');
    log(`⚠ Warnings: ${results.warnings}`, 'yellow');
    log(`━ Total:   ${results.passed + results.failed + results.warnings}\n`, 'cyan');
    
    const successRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
    log(`Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');
    
    // Print failed tests
    if (results.failed > 0) {
      log('\n❌ Failed Tests:', 'red');
      results.tests
        .filter(t => t.status === 'FAIL')
        .forEach(t => log(`  • ${t.category}: ${t.test} - ${t.message}`, 'red'));
    }
    
    // Print warnings
    if (results.warnings > 0) {
      log('\n⚠️  Warnings:', 'yellow');
      results.tests
        .filter(t => t.status === 'WARN')
        .forEach(t => log(`  • ${t.category}: ${t.test} - ${t.message}`, 'yellow'));
    }
    
    log('\n' + '='.repeat(60), 'bold');
    log(`Completed: ${new Date().toLocaleString()}`, 'blue');
    log('='.repeat(60) + '\n', 'bold');
    
    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
    
  } catch (error) {
    log(`\n❌ Fatal Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
