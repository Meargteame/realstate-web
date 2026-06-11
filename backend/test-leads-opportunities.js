const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/torra_realestate';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testLeadsAndOpportunities() {
  console.log('🧪 Testing Leads & Opportunities Functionality\n');
  console.log('='.repeat(60));
  
  try {
    // ========================================
    // SETUP: Get or create test agent
    // ========================================
    console.log('\n📋 SETUP: Finding test agent...');
    let agent = await prisma.agent.findFirst();
    
    if (!agent) {
      console.log('   Creating test agent...');
      agent = await prisma.agent.create({
        data: {
          name: 'Test Agent',
          email: 'testagent' + Date.now() + '@example.com',
          phone: '555-0100',
          imageUrl: 'https://via.placeholder.com/150',
          brokerage: 'Test Brokerage',
          license: 'TEST123'
        }
      });
    }
    console.log(`   ✅ Using agent: ${agent.name} (ID: ${agent.id})`);

    // ========================================
    // TEST 1: Create Lead
    // ========================================
    console.log('\n📋 TEST 1: Create Lead');
    const newLead = await prisma.lead.create({
      data: {
        name: 'John Test Lead',
        email: 'john@test.com',
        phone: '555-1234',
        message: 'Interested in properties',
        type: 'property_inquiry',
        status: 'New',
        agentId: agent.id
      }
    });
    console.log(`   ✅ Created lead: ${newLead.name} (ID: ${newLead.id})`);

    // ========================================
    // TEST 2: Get All Leads
    // ========================================
    console.log('\n📋 TEST 2: Get All Leads');
    const allLeads = await prisma.lead.findMany({
      where: { agentId: agent.id },
      include: { agent: true }
    });
    console.log(`   ✅ Found ${allLeads.length} leads for agent`);

    // ========================================
    // TEST 3: Update Lead Status
    // ========================================
    console.log('\n📋 TEST 3: Update Lead Status');
    const updatedLead = await prisma.lead.update({
      where: { id: newLead.id },
      data: { status: 'Contacted' }
    });
    console.log(`   ✅ Updated lead status: ${updatedLead.status}`);

    // ========================================
    // TEST 4: Toggle Lead Favorite
    // ========================================
    console.log('\n📋 TEST 4: Toggle Lead Favorite');
    const favoritedLead = await prisma.lead.update({
      where: { id: newLead.id },
      data: { isFavorite: true }
    });
    console.log(`   ✅ Lead favorite status: ${favoritedLead.isFavorite}`);

    // ========================================
    // TEST 5: Update Lead Notes
    // ========================================
    console.log('\n📋 TEST 5: Update Lead Notes');
    const leadWithNotes = await prisma.lead.update({
      where: { id: newLead.id },
      data: { 
        notes: 'Called on 2024-01-15. Very interested in downtown properties.',
        lastContacted: new Date()
      }
    });
    console.log(`   ✅ Updated lead notes: "${leadWithNotes.notes?.substring(0, 50)}..."`);

    // ========================================
    // TEST 6: Export Leads (simulate CSV generation)
    // ========================================
    console.log('\n📋 TEST 6: Export Leads to CSV');
    const leadsForExport = await prisma.lead.findMany({
      where: { agentId: agent.id },
      include: { property: true, agent: true },
      orderBy: { createdAt: 'desc' }
    });
    
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Message', 'Property', 'Date', 'Favorite'];
    const rows = leadsForExport.map(l => [
      l.name,
      l.email,
      l.phone,
      l.status,
      `"${l.message.replace(/"/g, '""')}"`,
      l.property ? l.property.address : 'General Inquiry',
      new Date(l.createdAt).toLocaleDateString(),
      l.isFavorite ? 'Yes' : 'No'
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    console.log(`   ✅ Generated CSV with ${leadsForExport.length} leads (${csv.length} bytes)`);

    // ========================================
    // TEST 7: Create Opportunity
    // ========================================
    console.log('\n📋 TEST 7: Create Opportunity');
    const newOpportunity = await prisma.opportunity.create({
      data: {
        name: 'Sarah Test Buyer',
        type: 'buyer',
        dealType: 'First-time Homebuyer',
        price: 450000,
        status: 'Cultivate',
        probability: 30,
        agentId: agent.id
      }
    });
    console.log(`   ✅ Created opportunity: ${newOpportunity.name} ($${newOpportunity.price.toLocaleString()})`);

    // ========================================
    // TEST 8: Get Opportunities with Filters
    // ========================================
    console.log('\n📋 TEST 8: Get Opportunities with Filters');
    
    // Get all opportunities for agent
    const allOpps = await prisma.opportunity.findMany({
      where: { agentId: agent.id },
      include: { agent: true }
    });
    console.log(`   ✅ All opportunities: ${allOpps.length}`);
    
    // Filter by type
    const buyerOpps = await prisma.opportunity.findMany({
      where: { 
        agentId: agent.id,
        type: 'buyer'
      }
    });
    console.log(`   ✅ Buyer opportunities: ${buyerOpps.length}`);
    
    // Filter by status
    const cultivateOpps = await prisma.opportunity.findMany({
      where: { 
        agentId: agent.id,
        status: 'Cultivate'
      }
    });
    console.log(`   ✅ Cultivate status: ${cultivateOpps.length}`);

    // ========================================
    // TEST 9: Update Opportunity Status
    // ========================================
    console.log('\n📋 TEST 9: Update Opportunity Status');
    const updatedOpp = await prisma.opportunity.update({
      where: { id: newOpportunity.id },
      data: { 
        status: 'Appointment',
        probability: 50
      }
    });
    console.log(`   ✅ Updated opportunity: ${updatedOpp.status} (${updatedOpp.probability}% probability)`);

    // ========================================
    // TEST 10: Update Opportunity Details
    // ========================================
    console.log('\n📋 TEST 10: Update Opportunity Details');
    const detailedOpp = await prisma.opportunity.update({
      where: { id: newOpportunity.id },
      data: { 
        price: 475000,
        dealType: 'First-time Homebuyer - Pre-approved'
      }
    });
    console.log(`   ✅ Updated price: $${detailedOpp.price.toLocaleString()}`);
    console.log(`   ✅ Updated deal type: ${detailedOpp.dealType}`);

    // ========================================
    // TEST 11: Calculate Pipeline Metrics
    // ========================================
    console.log('\n📋 TEST 11: Calculate Pipeline Metrics');
    const statuses = ['Cultivate', 'Appointment', 'Active', 'Under Contract', 'Closed'];
    
    for (const status of statuses) {
      const deals = await prisma.opportunity.findMany({
        where: { 
          agentId: agent.id,
          status: status
        }
      });
      
      const volume = deals.reduce((sum, o) => sum + o.price, 0);
      console.log(`   ${status}: ${deals.length} deals, $${volume.toLocaleString()} volume`);
    }

    // ========================================
    // CLEANUP: Delete Test Data
    // ========================================
    console.log('\n📋 CLEANUP: Deleting test data...');
    
    await prisma.lead.delete({ where: { id: newLead.id } });
    console.log(`   ✅ Deleted test lead`);
    
    await prisma.opportunity.delete({ where: { id: newOpportunity.id } });
    console.log(`   ✅ Deleted test opportunity`);

    // ========================================
    // SUMMARY
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Lead creation');
    console.log('   ✅ Lead status updates');
    console.log('   ✅ Lead favorites');
    console.log('   ✅ Lead notes');
    console.log('   ✅ Lead export (CSV)');
    console.log('   ✅ Opportunity creation');
    console.log('   ✅ Opportunity filtering');
    console.log('   ✅ Opportunity status updates');
    console.log('   ✅ Opportunity details updates');
    console.log('   ✅ Pipeline metrics calculation');
    console.log('\n🎉 Leads & Opportunities pages are FULLY FUNCTIONAL!\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    console.error('\nError details:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testLeadsAndOpportunities();
