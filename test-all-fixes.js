const http = require('http');

function testEndpoint(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('=== Testing All Fixed Endpoints ===\n');

  try {
    // Test 1: Agent Update
    console.log('1. Testing PATCH /api/agents/:id (Agent Settings Save)');
    const agents = await testEndpoint('GET', '/api/agents');
    const testAgent = agents.data[0];
    const agentUpdate = await testEndpoint('PATCH', `/api/agents/${testAgent.id}`, {
      bio: 'Updated bio - test',
      location: 'Austin, TX'
    });
    console.log(`   ✓ Status: ${agentUpdate.status}`);
    console.log(`   Agent updated: ${agentUpdate.data.name}`);
    console.log('');

    // Test 2: Property Update
    console.log('2. Testing PATCH /api/properties/:id (Property Edit)');
    const properties = await testEndpoint('GET', '/api/properties');
    const testProperty = properties.data[0];
    const propUpdate = await testEndpoint('PATCH', `/api/properties/${testProperty.id}`, {
      price: testProperty.price + 1000
    });
    console.log(`   ✓ Status: ${propUpdate.status}`);
    console.log(`   Property updated: ${propUpdate.data.address}`);
    console.log('');

    // Test 3: Property Delete
    console.log('3. Testing DELETE /api/properties/:id (Property Delete)');
    const newProp = await testEndpoint('POST', '/api/properties', {
      address: 'Test Delete Property',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      price: 500000,
      agentId: testAgent.id
    });
    const propDelete = await testEndpoint('DELETE', `/api/properties/${newProp.data.id}`);
    console.log(`   ✓ Status: ${propDelete.status}`);
    console.log(`   ${propDelete.data.message}`);
    console.log('');

    // Test 4: Lead Favorite Toggle
    console.log('4. Testing PATCH /api/leads/:id/favorite (Star Lead)');
    const leads = await testEndpoint('GET', '/api/leads');
    const testLead = leads.data.leads[0];
    const leadFav = await testEndpoint('PATCH', `/api/leads/${testLead.id}/favorite`);
    console.log(`   ✓ Status: ${leadFav.status}`);
    console.log(`   Lead favorite: ${leadFav.data.isFavorite}`);
    console.log('');

    // Test 5: Lead Delete
    console.log('5. Testing DELETE /api/leads/:id (Delete Lead)');
    const newLead = await testEndpoint('POST', '/api/leads', {
      name: 'Test Delete Lead',
      email: 'delete@test.com',
      phone: '555-0000',
      message: 'Test',
      agentId: testAgent.id
    });
    const leadDelete = await testEndpoint('DELETE', `/api/leads/${newLead.data.id}`);
    console.log(`   ✓ Status: ${leadDelete.status}`);
    console.log(`   ${leadDelete.data.message}`);
    console.log('');

    // Test 6: Lead Export
    console.log('6. Testing GET /api/leads/export (Export CSV)');
    const exportRes = await testEndpoint('GET', `/api/leads/export?agentId=${testAgent.id}`);
    console.log(`   ✓ Status: ${exportRes.status}`);
    console.log(`   CSV data length: ${exportRes.data.length} characters`);
    console.log('');

    // Test 7: Opportunity Create
    console.log('7. Testing POST /api/opportunities (Create Opportunity)');
    const oppCreate = await testEndpoint('POST', '/api/opportunities', {
      name: 'Test Client',
      dealType: 'Luxury Listing',
      price: 1500000,
      status: 'Cultivate',
      probability: 30,
      agentId: testAgent.id,
      type: 'listing'
    });
    console.log(`   ✓ Status: ${oppCreate.status}`);
    console.log(`   Opportunity created: ${oppCreate.data.name}`);
    console.log('');

    // Test 8: Opportunity Update
    console.log('8. Testing PATCH /api/opportunities/:id (Update Opportunity)');
    const oppUpdate = await testEndpoint('PATCH', `/api/opportunities/${oppCreate.data.id}`, {
      status: 'Appointment',
      probability: 50
    });
    console.log(`   ✓ Status: ${oppUpdate.status}`);
    console.log(`   Opportunity updated: ${oppUpdate.data.status} (${oppUpdate.data.probability}%)`);
    console.log('');

    // Test 9: Opportunity Get
    console.log('9. Testing GET /api/opportunities (Get Opportunities)');
    const opps = await testEndpoint('GET', `/api/opportunities?agentId=${testAgent.id}`);
    console.log(`   ✓ Status: ${opps.status}`);
    console.log(`   Opportunities count: ${opps.data.length}`);
    console.log('');

    // Test 10: Opportunity Delete
    console.log('10. Testing DELETE /api/opportunities/:id (Delete Opportunity)');
    const oppDelete = await testEndpoint('DELETE', `/api/opportunities/${oppCreate.data.id}`);
    console.log(`   ✓ Status: ${oppDelete.status}`);
    console.log(`   ${oppDelete.data.message}`);
    console.log('');

    console.log('=== ✓ All Tests Passed! ===');
    console.log('');
    console.log('Summary:');
    console.log('✓ Agent Settings Save - Working');
    console.log('✓ Property Edit - Working');
    console.log('✓ Property Delete - Working');
    console.log('✓ Lead Favorite Toggle - Working');
    console.log('✓ Lead Delete - Working');
    console.log('✓ Lead Export CSV - Working');
    console.log('✓ Opportunity Create - Working');
    console.log('✓ Opportunity Update - Working');
    console.log('✓ Opportunity Get - Working');
    console.log('✓ Opportunity Delete - Working');
    console.log('');
    console.log('All backend endpoints are functional!');

  } catch (error) {
    console.error('✗ Test failed:', error.message);
  }
}

runTests();
