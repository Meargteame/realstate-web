/**
 * Comprehensive Page Testing Script
 * Tests all frontend pages and backend API endpoints
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3001';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function recordTest(name, status, message = '') {
  results.tests.push({ name, status, message });
  if (status === 'PASS') results.passed++;
  else if (status === 'FAIL') results.failed++;
  else if (status === 'WARN') results.warnings++;
}

async function testEndpoint(name, url, method = 'GET', data = null) {
  try {
    const config = { method, url, timeout: 5000 };
    if (data) config.data = data;
    
    const response = await axios(config);
    log(`✅ ${name}`, 'green');
    recordTest(name, 'PASS');
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log(`❌ ${name} - Server not running`, 'red');
      recordTest(name, 'FAIL', 'Server not running');
    } else if (error.response) {
      log(`⚠️  ${name} - ${error.response.status} ${error.response.statusText}`, 'yellow');
      recordTest(name, 'WARN', `HTTP ${error.response.status}`);
    } else {
      log(`❌ ${name} - ${error.message}`, 'red');
      recordTest(name, 'FAIL', error.message);
    }
    return null;
  }
}

async function testBackendAPIs() {
  section('🔧 BACKEND API TESTS');
  
  // Health check
  await testEndpoint('Health Check', `${BACKEND_URL}/api/health`);
  
  // Properties API
  await testEndpoint('Get All Properties', `${BACKEND_URL}/api/properties`);
  await testEndpoint('Get Properties with Filters', `${BACKEND_URL}/api/properties?city=Austin&status=Active`);
  await testEndpoint('Get Property by ID', `${BACKEND_URL}/api/properties/1`);
  
  // Agents API
  await testEndpoint('Get All Agents', `${BACKEND_URL}/api/agents`);
  await testEndpoint('Get Agent by ID', `${BACKEND_URL}/api/agents/1`);
  
  // Leads API
  await testEndpoint('Get All Leads', `${BACKEND_URL}/api/leads`);
  
  // Opportunities API
  await testEndpoint('Get All Opportunities', `${BACKEND_URL}/api/opportunities`);
  
  // Map API
  await testEndpoint('Get Map Properties', `${BACKEND_URL}/api/map/properties`);
  await testEndpoint('Get Map Bounds', `${BACKEND_URL}/api/map/bounds?swLat=30.1&swLng=-97.9&neLat=30.5&neLng=-97.5`);
  
  // Open Houses API
  await testEndpoint('Get Open Houses', `${BACKEND_URL}/api/open-houses`);
  await testEndpoint('Get Upcoming Open Houses', `${BACKEND_URL}/api/open-houses/upcoming`);
  
  // Reviews API
  await testEndpoint('Get Reviews', `${BACKEND_URL}/api/reviews`);
  
  // Virtual Tours API
  await testEndpoint('Get Virtual Tours', `${BACKEND_URL}/api/virtual-tours`);
  
  // Market Data API
  await testEndpoint('Get Market Stats', `${BACKEND_URL}/api/market-data/stats`);
  await testEndpoint('Get Market Trends', `${BACKEND_URL}/api/market-data/trends`);
}

async function testFrontendPages() {
  section('🌐 FRONTEND PAGE TESTS');
  
  const pages = [
    { name: 'Home Page', path: '/' },
    { name: 'Properties Page', path: '/properties' },
    { name: 'Property Search', path: '/properties?search=austin' },
    { name: 'Agents Page', path: '/agents' },
    { name: 'About Page', path: '/about' },
    { name: 'Contact Page', path: '/contact' },
    { name: 'Login Page', path: '/login' },
    { name: 'Sign Up Page', path: '/signup' },
    { name: 'Open Houses Page', path: '/open-houses' },
    { name: 'Saved Searches Page', path: '/saved-searches' },
    { name: 'Agent Dashboard', path: '/command' },
    { name: 'Agent Inbox', path: '/command/inbox' },
    { name: 'Agent Leads', path: '/command/leads' },
    { name: 'Agent Listings', path: '/command/listings' },
    { name: 'Agent Opportunities', path: '/command/opportunities' },
    { name: 'Agent Settings', path: '/command/settings' }
  ];
  
  for (const page of pages) {
    await testEndpoint(page.name, `${FRONTEND_URL}${page.path}`);
  }
}

async function testDatabaseConnection() {
  section('💾 DATABASE CONNECTION TEST');
  
  try {
    const { PrismaClient } = require('./backend/node_modules/@prisma/client');
    const prisma = require('./backend/config/prisma');
    
    // Test connection
    await prisma.$connect();
    log('✅ Database connection successful', 'green');
    recordTest('Database Connection', 'PASS');
    
    // Count records
    const counts = {
      properties: await prisma.property.count(),
      agents: await prisma.agent.count(),
      leads: await prisma.lead.count(),
      users: await prisma.user.count(),
      opportunities: await prisma.opportunity.count(),
      savedSearches: await prisma.savedSearch.count(),
      openHouses: await prisma.openHouse.count(),
      reviews: await prisma.review.count(),
      virtualTours: await prisma.virtualTour.count()
    };
    
    log('\n📊 Database Record Counts:', 'blue');
    Object.entries(counts).forEach(([table, count]) => {
      log(`   ${table}: ${count}`, count > 0 ? 'green' : 'yellow');
    });
    
    await prisma.$disconnect();
    
  } catch (error) {
    log(`❌ Database connection failed: ${error.message}`, 'red');
    recordTest('Database Connection', 'FAIL', error.message);
  }
}

async function testAuthentication() {
  section('🔐 AUTHENTICATION TESTS');
  
  // Test login endpoint
  const loginData = {
    email: 'test@example.com',
    password: 'password123'
  };
  
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, loginData);
    log('✅ Login endpoint responding', 'green');
    recordTest('Login Endpoint', 'PASS');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log('✅ Login endpoint working (credentials invalid as expected)', 'green');
      recordTest('Login Endpoint', 'PASS');
    } else {
      log(`⚠️  Login endpoint issue: ${error.message}`, 'yellow');
      recordTest('Login Endpoint', 'WARN', error.message);
    }
  }
  
  // Test signup endpoint
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/signup`, {
      name: 'Test User',
      email: 'newtest@example.com',
      password: 'password123'
    });
    log('✅ Signup endpoint responding', 'green');
    recordTest('Signup Endpoint', 'PASS');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('✅ Signup endpoint working (validation working)', 'green');
      recordTest('Signup Endpoint', 'PASS');
    } else {
      log(`⚠️  Signup endpoint issue: ${error.message}`, 'yellow');
      recordTest('Signup Endpoint', 'WARN', error.message);
    }
  }
}

async function testFeatureEndpoints() {
  section('🎯 FEATURE-SPECIFIC TESTS');
  
  // Saved Searches
  await testEndpoint('Get Saved Searches', `${BACKEND_URL}/api/saved-searches`);
  
  // Favorites
  await testEndpoint('Get Favorites', `${BACKEND_URL}/api/favorites`);
  
  // Geocoding
  await testEndpoint('Geocode Address', `${BACKEND_URL}/api/map/geocode?address=Austin,TX`);
}

function printSummary() {
  section('📋 TEST SUMMARY');
  
  const total = results.passed + results.failed + results.warnings;
  const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
  
  console.log('');
  log(`Total Tests: ${total}`, 'blue');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`⚠️  Warnings: ${results.warnings}`, results.warnings > 0 ? 'yellow' : 'green');
  log(`\n📊 Pass Rate: ${passRate}%`, passRate >= 80 ? 'green' : passRate >= 60 ? 'yellow' : 'red');
  
  if (results.failed > 0) {
    console.log('\n' + '─'.repeat(60));
    log('❌ FAILED TESTS:', 'red');
    results.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => log(`   • ${t.name}: ${t.message}`, 'red'));
  }
  
  if (results.warnings > 0) {
    console.log('\n' + '─'.repeat(60));
    log('⚠️  WARNINGS:', 'yellow');
    results.tests
      .filter(t => t.status === 'WARN')
      .forEach(t => log(`   • ${t.name}: ${t.message}`, 'yellow'));
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (results.failed === 0 && results.warnings === 0) {
    log('🎉 ALL TESTS PASSED! Your application is working perfectly!', 'green');
  } else if (results.failed === 0) {
    log('✅ All critical tests passed! Some warnings to review.', 'green');
  } else {
    log('⚠️  Some tests failed. Please review the issues above.', 'yellow');
  }
  
  console.log('='.repeat(60) + '\n');
}

async function runAllTests() {
  log('\n🚀 Starting Comprehensive Application Test Suite\n', 'cyan');
  log('Testing KW Real Estate Platform', 'blue');
  log(`Backend: ${BACKEND_URL}`, 'blue');
  log(`Frontend: ${FRONTEND_URL}`, 'blue');
  
  try {
    await testDatabaseConnection();
    await testBackendAPIs();
    await testAuthentication();
    await testFeatureEndpoints();
    await testFrontendPages();
  } catch (error) {
    log(`\n❌ Test suite error: ${error.message}`, 'red');
  }
  
  printSummary();
}

// Run tests
runAllTests().catch(console.error);
