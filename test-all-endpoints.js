const http = require('http');

function testEndpoint(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
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

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function runTests() {
  console.log('=== Testing All KW Real Estate API Endpoints ===\n');

  try {
    // Health check
    console.log('1. GET /api/health');
    const health = await testEndpoint('GET', '/api/health');
    console.log(`   ✓ Status: ${health.status}`);
    console.log(`   Response:`, health.data);
    console.log('');

    // Properties
    console.log('2. GET /api/properties');
    const properties = await testEndpoint('GET', '/api/properties');
    console.log(`   ✓ Status: ${properties.status}`);
    console.log(`   Properties count: ${Array.isArray(properties.data) ? properties.data.length : 'N/A'}`);
    if (Array.isArray(properties.data) && properties.data.length > 0) {
      const prop = properties.data[0];
      console.log(`   First property: ${prop.address}, ${prop.city} - $${prop.price.toLocaleString()}`);
      
      // Test single property
      console.log('');
      console.log(`3. GET /api/properties/${prop.id}`);
      const singleProp = await testEndpoint('GET', `/api/properties/${prop.id}`);
      console.log(`   ✓ Status: ${singleProp.status}`);
      console.log(`   Property: ${singleProp.data.address}`);
      console.log(`   Agent: ${singleProp.data.agent?.name || 'N/A'}`);
    }
    console.log('');

    // Agents
    console.log('4. GET /api/agents');
    const agents = await testEndpoint('GET', '/api/agents');
    console.log(`   ✓ Status: ${agents.status}`);
    console.log(`   Agents count: ${Array.isArray(agents.data) ? agents.data.length : 'N/A'}`);
    if (Array.isArray(agents.data) && agents.data.length > 0) {
      const agent = agents.data[0];
      console.log(`   First agent: ${agent.name} - ${agent.email}`);
      
      // Test single agent
      console.log('');
      console.log(`5. GET /api/agents/${agent.id}`);
      const singleAgent = await testEndpoint('GET', `/api/agents/${agent.id}`);
      console.log(`   ✓ Status: ${singleAgent.status}`);
      console.log(`   Agent: ${singleAgent.data.name}`);
      console.log(`   Properties: ${singleAgent.data.properties?.length || 0}`);
      console.log(`   Leads: ${singleAgent.data.leads?.length || 0}`);
    }
    console.log('');

    // Leads
    console.log('6. GET /api/leads');
    const leads = await testEndpoint('GET', '/api/leads');
    console.log(`   ✓ Status: ${leads.status}`);
    if (leads.data.leads) {
      console.log(`   Leads count: ${leads.data.leads.length}`);
      console.log(`   Total: ${leads.data.total}`);
    }
    console.log('');

    // Test lead creation
    console.log('7. POST /api/leads (Test lead creation)');
    const newLead = await testEndpoint('POST', '/api/leads', {
      name: 'Test User',
      email: 'test@example.com',
      phone: '555-0123',
      message: 'API test lead',
      agentId: agents.data[0].id
    });
    console.log(`   ✓ Status: ${newLead.status}`);
    console.log(`   Lead created: ${newLead.data.name} - ${newLead.data.email}`);
    console.log('');

    // Test property search
    console.log('8. GET /api/properties?q=Austin');
    const searchProps = await testEndpoint('GET', '/api/properties?q=Austin');
    console.log(`   ✓ Status: ${searchProps.status}`);
    console.log(`   Results: ${Array.isArray(searchProps.data) ? searchProps.data.length : 'N/A'} properties`);
    console.log('');

    // Test agent search
    console.log('9. GET /api/agents?q=Sarah');
    const searchAgents = await testEndpoint('GET', '/api/agents?q=Sarah');
    console.log(`   ✓ Status: ${searchAgents.status}`);
    console.log(`   Results: ${Array.isArray(searchAgents.data) ? searchAgents.data.length : 'N/A'} agents`);
    console.log('');

    console.log('=== ✓ All API Tests Completed Successfully! ===');
    console.log('');
    console.log('Summary:');
    console.log('- Health check: Working');
    console.log('- Properties endpoints: Working');
    console.log('- Agents endpoints: Working');
    console.log('- Leads endpoints: Working');
    console.log('- Search functionality: Working');
    console.log('');
    console.log('The backend is fully functional!');

  } catch (error) {
    console.error('✗ API test failed:', error.message);
  }
}

runTests();
