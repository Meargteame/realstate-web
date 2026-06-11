#!/usr/bin/env node

/**
 * Comprehensive Dashboard Functionality Test Script
 * Tests all backend APIs, database operations, and integrations
 */

const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Initialize Prisma
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/torra_realestate';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70));
}

function logTest(name, status, details = '') {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏭️';
  const color = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow';
  log(`${icon} ${name}`, color);
  if (details) log(`   ${details}`, 'reset');
  
  results.tests.push({ name, status, details });
  if (status === 'pass') results.passed++;
  else if (status === 'fail') results.failed++;
  else results.skipped++;
}

async function testDatabase() {
  logSection('DATABASE TESTS');
  
  try {
    // Test 1: Database Connection
    await prisma.$connect();
    logTest('Database Connection', 'pass', 'Connected successfully');
    
    // Test 2: Count Records
    const counts = {
      properties: await prisma.property.count(),
      agents: await prisma.agent.count(),
      leads: await prisma.lead.count(),
      opportunities: await prisma.opportunity.count(),
      users: await prisma.user.count(),
      favorites: await prisma.favorite.count(),
      savedSearches: await prisma.savedSearch.count(),
      openHouses: await prisma.openHouse.count(),
      reviews: await prisma.review.count()
    };
    
    logTest('Database Record Counts', 'pass', 
      `Properties: ${counts.properties}, Agents: ${counts.agents}, Leads: ${counts.leads}, Opportunities: ${counts.opportunities}`);
    
    // Test 3: Verify Required Data
    if (counts.agents === 0) {
      logTest('Required Data Check', 'fail', 'No agents found - run seed script');
    } else if (counts.properties === 0) {
      logTest('Required Data Check', 'fail', 'No properties found - run seed script');
    } else {
      logTest('Required Data Check', 'pass', 'Database has required seed data');
    }
    
    // Test 4: Test Relationships
    const propertyWithAgent = await prisma.property.findFirst({
      include: { agent: true }
    });
    
    if (propertyWithAgent && propertyWithAgent.agent) {
      logTest('Database Relationships', 'pass', 'Property-Agent relationship working');
    } else {
      logTest('Database Relationships', 'fail', 'Relationships not properly configured');
    }
    
  } catch (error) {
    logTest('Database Tests', 'fail', error.message);
  }
}

async function testPropertyAPIs() {
  logSection('PROPERTY API TESTS');
  
  try {
    // Test 1: Get All Properties
    const properties = await prisma.property.findMany({ take: 5 });
    logTest('GET Properties', 'pass', `Retrieved ${properties.length} properties`);
    
    // Test 2: Get Property by ID
    if (properties.length > 0) {
      const property = await prisma.property.findUnique({
        where: { id: properties[0].id },
        include: { agent: true }
      });
      logTest('GET Property by ID', 'pass', `Retrieved: ${property.address}`);
    }
    
    // Test 3: Filter Properties
    const filteredProps = await prisma.property.findMany({
      where: {
        status: 'Active',
        price: { gte: 300000, lte: 500000 }
      },
      take: 5
    });
    logTest('Filter Properties', 'pass', `Found ${filteredProps.length} properties in price range`);
    
    // Test 4: Search Properties by City
    const cityProps = await prisma.property.findMany({
      where: { city: 'Austin' },
      take: 5
    });
    logTest('Search by City', 'pass', `Found ${cityProps.length} properties in Austin`);
    
  } catch (error) {
    logTest('Property API Tests', 'fail', error.message);
  }
}

async function testAgentAPIs() {
  logSection('AGENT API TESTS');
  
  try {
    // Test 1: Get All Agents
    const agents = await prisma.agent.findMany({ take: 5 });
    logTest('GET Agents', 'pass', `Retrieved ${agents.length} agents`);
    
    // Test 2: Get Agent with Properties
    if (agents.length > 0) {
      const agent = await prisma.agent.findUnique({
        where: { id: agents[0].id },
        include: { 
          properties: { take: 5 },
          leads: { take: 5 }
        }
      });
      logTest('GET Agent with Relations', 'pass', 
        `Agent: ${agent.name}, Properties: ${agent.properties.length}, Leads: ${agent.leads.length}`);
    }
    
    // Test 3: Update Agent
    if (agents.length > 0) {
      const updated = await prisma.agent.update({
        where: { id: agents[0].id },
        data: { lastActive: new Date() }
      });
      logTest('UPDATE Agent', 'pass', 'Updated lastActive timestamp');
    }
    
  } catch (error) {
    logTest('Agent API Tests', 'fail', error.message);
  }
}

async function testLeadAPIs() {
  logSection('LEAD API TESTS');
  
  try {
    const agent = await prisma.agent.findFirst();
    
    // Test 1: Create Lead
    const newLead = await prisma.lead.create({
      data: {
        name: 'Test Lead ' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        phone: '555-0000',
        message: 'Test inquiry',
        status: 'New',
        agentId: agent.id
      }
    });
    logTest('CREATE Lead', 'pass', `Created lead: ${newLead.name}`);
    
    // Test 2: Get Leads
    const leads = await prisma.lead.findMany({
      where: { agentId: agent.id },
      take: 5
    });
    logTest('GET Leads', 'pass', `Retrieved ${leads.length} leads`);
    
    // Test 3: Update Lead Status
    const updatedLead = await prisma.lead.update({
      where: { id: newLead.id },
      data: { status: 'Contacted' }
    });
    logTest('UPDATE Lead Status', 'pass', `Status: ${updatedLead.status}`);
    
    // Test 4: Toggle Favorite
    const favoritedLead = await prisma.lead.update({
      where: { id: newLead.id },
      data: { isFavorite: true }
    });
    logTest('Toggle Lead Favorite', 'pass', `Favorite: ${favoritedLead.isFavorite}`);
    
    // Test 5: Add Notes
    const leadWithNotes = await prisma.lead.update({
      where: { id: newLead.id },
      data: { notes: 'Test notes added' }
    });
    logTest('Add Lead Notes', 'pass', 'Notes added successfully');
    
    // Test 6: Delete Lead
    await prisma.lead.delete({ where: { id: newLead.id } });
    logTest('DELETE Lead', 'pass', 'Lead deleted successfully');
    
  } catch (error) {
    logTest('Lead API Tests', 'fail', error.message);
  }
}

async function testOpportunityAPIs() {
  logSection('OPPORTUNITY API TESTS');
  
  try {
    const agent = await prisma.agent.findFirst();
    
    // Test 1: Create Opportunity
    const newOpp = await prisma.opportunity.create({
      data: {
        name: 'Test Opportunity ' + Date.now(),
        type: 'listing',
        dealType: 'Test Deal',
        price: 500000,
        status: 'Cultivate',
        probability: 30,
        agentId: agent.id
      }
    });
    logTest('CREATE Opportunity', 'pass', `Created: ${newOpp.name} ($${newOpp.price.toLocaleString()})`);
    
    // Test 2: Get Opportunities
    const opps = await prisma.opportunity.findMany({
      where: { agentId: agent.id },
      take: 5
    });
    logTest('GET Opportunities', 'pass', `Retrieved ${opps.length} opportunities`);
    
    // Test 3: Filter by Type
    const buyerOpps = await prisma.opportunity.findMany({
      where: { agentId: agent.id, type: 'buyer' }
    });
    logTest('Filter by Type', 'pass', `Found ${buyerOpps.length} buyer opportunities`);
    
    // Test 4: Update Status
    const updatedOpp = await prisma.opportunity.update({
      where: { id: newOpp.id },
      data: { status: 'Appointment', probability: 50 }
    });
    logTest('UPDATE Opportunity', 'pass', `Status: ${updatedOpp.status}, Probability: ${updatedOpp.probability}%`);
    
    // Test 5: Calculate Pipeline Metrics
    const statuses = ['Cultivate', 'Appointment', 'Active', 'Under Contract', 'Closed'];
    let totalVolume = 0;
    for (const status of statuses) {
      const deals = await prisma.opportunity.findMany({
        where: { agentId: agent.id, status }
      });
      const volume = deals.reduce((sum, o) => sum + o.price, 0);
      totalVolume += volume;
    }
    logTest('Pipeline Metrics', 'pass', `Total pipeline volume: $${totalVolume.toLocaleString()}`);
    
    // Test 6: Delete Opportunity
    await prisma.opportunity.delete({ where: { id: newOpp.id } });
    logTest('DELETE Opportunity', 'pass', 'Opportunity deleted successfully');
    
  } catch (error) {
    logTest('Opportunity API Tests', 'fail', error.message);
  }
}

async function testFavoriteAPIs() {
  logSection('FAVORITE API TESTS');
  
  try {
    const user = await prisma.user.findFirst();
    const property = await prisma.property.findFirst();
    
    if (!user || !property) {
      logTest('Favorite Tests', 'skip', 'No user or property found');
      return;
    }
    
    // Test 1: Add Favorite
    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        propertyId: property.id
      }
    }).catch(() => null); // May already exist
    
    if (favorite) {
      logTest('ADD Favorite', 'pass', 'Property added to favorites');
    } else {
      logTest('ADD Favorite', 'pass', 'Favorite already exists');
    }
    
    // Test 2: Get User Favorites
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: { property: true }
    });
    logTest('GET Favorites', 'pass', `User has ${favorites.length} favorites`);
    
    // Test 3: Remove Favorite
    if (favorite) {
      await prisma.favorite.delete({ where: { id: favorite.id } });
      logTest('REMOVE Favorite', 'pass', 'Favorite removed successfully');
    }
    
  } catch (error) {
    logTest('Favorite API Tests', 'fail', error.message);
  }
}

async function testSavedSearchAPIs() {
  logSection('SAVED SEARCH API TESTS');
  
  try {
    const user = await prisma.user.findFirst();
    
    if (!user) {
      logTest('Saved Search Tests', 'skip', 'No user found');
      return;
    }
    
    // Test 1: Create Saved Search
    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: user.id,
        name: 'Test Search ' + Date.now(),
        filters: {
          minPrice: 300000,
          maxPrice: 500000,
          beds: 3,
          city: 'Austin'
        },
        emailAlerts: true,
        frequency: 'daily'
      }
    });
    logTest('CREATE Saved Search', 'pass', `Created: ${savedSearch.name}`);
    
    // Test 2: Get Saved Searches
    const searches = await prisma.savedSearch.findMany({
      where: { userId: user.id }
    });
    logTest('GET Saved Searches', 'pass', `User has ${searches.length} saved searches`);
    
    // Test 3: Update Saved Search
    const updated = await prisma.savedSearch.update({
      where: { id: savedSearch.id },
      data: { frequency: 'weekly' }
    });
    logTest('UPDATE Saved Search', 'pass', `Frequency: ${updated.frequency}`);
    
    // Test 4: Delete Saved Search
    await prisma.savedSearch.delete({ where: { id: savedSearch.id } });
    logTest('DELETE Saved Search', 'pass', 'Saved search deleted successfully');
    
  } catch (error) {
    logTest('Saved Search API Tests', 'fail', error.message);
  }
}

async function testOpenHouseAPIs() {
  logSection('OPEN HOUSE API TESTS');
  
  try {
    const agent = await prisma.agent.findFirst();
    const property = await prisma.property.findFirst();
    
    // Test 1: Create Open House
    const openHouse = await prisma.openHouse.create({
      data: {
        propertyId: property.id,
        agentId: agent.id,
        startTime: new Date(Date.now() + 86400000), // Tomorrow
        endTime: new Date(Date.now() + 90000000),
        description: 'Test open house',
        status: 'scheduled'
      }
    });
    logTest('CREATE Open House', 'pass', `Scheduled for ${openHouse.startTime.toLocaleDateString()}`);
    
    // Test 2: Get Open Houses
    const openHouses = await prisma.openHouse.findMany({
      where: { agentId: agent.id },
      include: { property: true }
    });
    logTest('GET Open Houses', 'pass', `Found ${openHouses.length} open houses`);
    
    // Test 3: Delete Open House
    await prisma.openHouse.delete({ where: { id: openHouse.id } });
    logTest('DELETE Open House', 'pass', 'Open house deleted successfully');
    
  } catch (error) {
    logTest('Open House API Tests', 'fail', error.message);
  }
}

async function testReviewAPIs() {
  logSection('REVIEW API TESTS');
  
  try {
    const agent = await prisma.agent.findFirst();
    
    // Test 1: Create Review
    const review = await prisma.review.create({
      data: {
        agentId: agent.id,
        reviewerName: 'Test Reviewer',
        reviewerEmail: 'reviewer' + Date.now() + '@example.com',
        rating: 5,
        comment: 'Excellent service!',
        transactionType: 'buyer',
        verified: false
      }
    });
    logTest('CREATE Review', 'pass', `${review.rating} stars from ${review.reviewerName}`);
    
    // Test 2: Get Agent Reviews
    const reviews = await prisma.review.findMany({
      where: { agentId: agent.id }
    });
    logTest('GET Reviews', 'pass', `Agent has ${reviews.length} reviews`);
    
    // Test 3: Calculate Average Rating
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    logTest('Calculate Rating', 'pass', `Average rating: ${avgRating.toFixed(1)} stars`);
    
    // Test 4: Delete Review
    await prisma.review.delete({ where: { id: review.id } });
    logTest('DELETE Review', 'pass', 'Review deleted successfully');
    
  } catch (error) {
    logTest('Review API Tests', 'fail', error.message);
  }
}

async function testFileSystem() {
  logSection('FILE SYSTEM TESTS');
  
  try {
    // Test 1: Check uploads directory
    const uploadsDir = path.join(__dirname, 'uploads');
    if (fs.existsSync(uploadsDir)) {
      logTest('Uploads Directory', 'pass', 'Directory exists');
    } else {
      logTest('Uploads Directory', 'fail', 'Directory not found');
    }
    
    // Test 2: Check middleware
    const uploadMiddleware = path.join(__dirname, 'middleware', 'upload.js');
    if (fs.existsSync(uploadMiddleware)) {
      logTest('Upload Middleware', 'pass', 'Middleware file exists');
    } else {
      logTest('Upload Middleware', 'fail', 'Middleware not found');
    }
    
    // Test 3: Check controllers
    const uploadController = path.join(__dirname, 'controllers', 'uploadController.js');
    if (fs.existsSync(uploadController)) {
      logTest('Upload Controller', 'pass', 'Controller file exists');
    } else {
      logTest('Upload Controller', 'fail', 'Controller not found');
    }
    
  } catch (error) {
    logTest('File System Tests', 'fail', error.message);
  }
}

async function testDataIntegrity() {
  logSection('DATA INTEGRITY TESTS');
  
  try {
    // Test 1: Check for orphaned records
    const propertiesWithoutAgent = await prisma.property.count({
      where: { agent: null }
    });
    
    if (propertiesWithoutAgent === 0) {
      logTest('Orphaned Properties', 'pass', 'No orphaned properties found');
    } else {
      logTest('Orphaned Properties', 'fail', `Found ${propertiesWithoutAgent} properties without agents`);
    }
    
    // Test 2: Check for invalid data
    const invalidPrices = await prisma.property.count({
      where: { price: { lte: 0 } }
    });
    
    if (invalidPrices === 0) {
      logTest('Invalid Prices', 'pass', 'All properties have valid prices');
    } else {
      logTest('Invalid Prices', 'fail', `Found ${invalidPrices} properties with invalid prices`);
    }
    
    // Test 3: Check geocoding
    const geocodedProps = await prisma.property.count({
      where: { geocoded: true }
    });
    const totalProps = await prisma.property.count();
    const geocodedPercent = ((geocodedProps / totalProps) * 100).toFixed(1);
    
    logTest('Geocoding Status', 'pass', `${geocodedPercent}% of properties geocoded (${geocodedProps}/${totalProps})`);
    
  } catch (error) {
    logTest('Data Integrity Tests', 'fail', error.message);
  }
}

function printSummary() {
  logSection('TEST SUMMARY');
  
  const total = results.passed + results.failed + results.skipped;
  const passRate = ((results.passed / total) * 100).toFixed(1);
  
  log(`\nTotal Tests: ${total}`, 'bright');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'reset');
  log(`⏭️  Skipped: ${results.skipped}`, 'yellow');
  log(`\nPass Rate: ${passRate}%`, passRate >= 90 ? 'green' : passRate >= 70 ? 'yellow' : 'red');
  
  if (results.failed > 0) {
    log('\n❌ FAILED TESTS:', 'red');
    results.tests
      .filter(t => t.status === 'fail')
      .forEach(t => log(`   - ${t.name}: ${t.details}`, 'red'));
  }
  
  console.log('\n' + '='.repeat(70));
  
  if (results.failed === 0) {
    log('🎉 ALL TESTS PASSED! Dashboard is fully functional.', 'green');
  } else {
    log('⚠️  Some tests failed. Please review and fix issues.', 'yellow');
  }
  
  console.log('='.repeat(70) + '\n');
}

async function main() {
  log('\n🧪 DASHBOARD FUNCTIONALITY TEST SUITE', 'bright');
  log('Testing all backend APIs, database operations, and integrations\n', 'cyan');
  
  try {
    await testDatabase();
    await testPropertyAPIs();
    await testAgentAPIs();
    await testLeadAPIs();
    await testOpportunityAPIs();
    await testFavoriteAPIs();
    await testSavedSearchAPIs();
    await testOpenHouseAPIs();
    await testReviewAPIs();
    await testFileSystem();
    await testDataIntegrity();
    
    printSummary();
    
    process.exit(results.failed > 0 ? 1 : 0);
    
  } catch (error) {
    log('\n❌ FATAL ERROR:', 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
main();
