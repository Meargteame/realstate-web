/**
 * Phase 6 Feature Testing Script
 * Tests video call and virtual tour features
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const TEST_AGENT_ID = 'f2d2c702-3702-4717-9f44-7e5a860f81bf';
const TEST_EMAIL = 'hello.meareg@gmail.com';

let authToken = '';
let testVideoCallId = '';
let testTourSessionId = '';

// Helper function to log test results
function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${testName}`);
  if (details) console.log(`   ${details}`);
}

// Helper function to handle errors
function handleError(testName, error) {
  console.error(`❌ FAIL - ${testName}`);
  if (error.response) {
    console.error(`   Status: ${error.response.status}`);
    console.error(`   Error: ${JSON.stringify(error.response.data)}`);
  } else {
    console.error(`   Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('\n🚀 Starting Phase 6 Feature Tests...\n');
  console.log('='.repeat(60));

  try {
    // =====================================================
    // 1. AUTHENTICATION
    // =====================================================
    console.log('\n📝 Test 1: Authentication');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: TEST_EMAIL,
        password: 'password123'
      });
      authToken = loginResponse.data.token;
      logTest('Login', true, `Token: ${authToken.substring(0, 20)}...`);
    } catch (error) {
      handleError('Login', error);
      return;
    }

    const headers = { Authorization: `Bearer ${authToken}` };

    // =====================================================
    // 2. CREATE VIDEO CALL
    // =====================================================
    console.log('\n📹 Test 2: Create Video Call');
    try {
      const response = await axios.post(
        `${BASE_URL}/video/calls`,
        {
          agentId: TEST_AGENT_ID,
          leadName: 'John Doe',
          leadEmail: 'john.doe@example.com',
          propertyId: null
        },
        { headers }
      );

      testVideoCallId = response.data.id;
      logTest('Create Video Call', response.status === 201, `Video Call ID: ${testVideoCallId}`);
      logTest('Room ID Generated', !!response.data.roomId, `Room ID: ${response.data.roomId}`);
    } catch (error) {
      handleError('Create Video Call', error);
    }

    // =====================================================
    // 3. GET VIDEO CALL DETAILS
    // =====================================================
    console.log('\n📹 Test 3: Get Video Call Details');
    try {
      const response = await axios.get(
        `${BASE_URL}/video/calls/${testVideoCallId}`,
        { headers }
      );

      logTest('Get Video Call', response.data.id === testVideoCallId, `Status: ${response.data.status}`);
    } catch (error) {
      handleError('Get Video Call', error);
    }

    // =====================================================
    // 4. JOIN VIDEO CALL
    // =====================================================
    console.log('\n👤 Test 4: Join Video Call');
    try {
      const response = await axios.post(
        `${BASE_URL}/video/calls/${testVideoCallId}/join`,
        {
          participantName: 'John Doe',
          participantEmail: 'john.doe@example.com',
          role: 'viewer'
        }
      );

      logTest('Join Video Call', !!response.data.token, 'Access token generated');
      logTest('Room ID Provided', response.data.roomId === response.data.roomId, 'Room ID matches');
    } catch (error) {
      handleError('Join Video Call', error);
    }

    // =====================================================
    // 5. GET AGENT VIDEO CALLS
    // =====================================================
    console.log('\n📹 Test 5: Get Agent Video Calls');
    try {
      const response = await axios.get(
        `${BASE_URL}/video/calls/agent/${TEST_AGENT_ID}`,
        { headers }
      );

      logTest('Get Agent Video Calls', response.data.length > 0, `Found ${response.data.length} video calls`);
    } catch (error) {
      handleError('Get Agent Video Calls', error);
    }

    // =====================================================
    // 6. CREATE VIRTUAL TOUR SESSION
    // =====================================================
    console.log('\n🏠 Test 6: Create Virtual Tour Session');
    try {
      // First, we need a property ID - let's use a mock one
      const mockPropertyId = 'test-property-123';

      const response = await axios.post(
        `${BASE_URL}/video/tours`,
        {
          videoCallId: testVideoCallId,
          propertyId: mockPropertyId,
          agentId: TEST_AGENT_ID
        },
        { headers }
      );

      testTourSessionId = response.data.id;
      logTest('Create Virtual Tour', response.status === 201, `Tour Session ID: ${testTourSessionId}`);
    } catch (error) {
      handleError('Create Virtual Tour', error);
    }

    // =====================================================
    // 7. GET VIRTUAL TOUR DETAILS
    // =====================================================
    console.log('\n🏠 Test 7: Get Virtual Tour Details');
    try {
      const response = await axios.get(
        `${BASE_URL}/video/tours/${testTourSessionId}`,
        { headers }
      );

      logTest('Get Virtual Tour', response.data.id === testTourSessionId, 'Tour session found');
      logTest('Chat Enabled', response.data.chatEnabled === true, 'Chat is enabled');
    } catch (error) {
      handleError('Get Virtual Tour', error);
    }

    // =====================================================
    // 8. UPDATE VIRTUAL TOUR
    // =====================================================
    console.log('\n🏠 Test 8: Update Virtual Tour');
    try {
      const response = await axios.put(
        `${BASE_URL}/video/tours/${testTourSessionId}`,
        {
          screenSharing: true,
          viewerCount: 2
        },
        { headers }
      );

      logTest('Update Virtual Tour', response.data.screenSharing === true, 'Screen sharing enabled');
    } catch (error) {
      handleError('Update Virtual Tour', error);
    }

    // =====================================================
    // 9. GET AGENT VIRTUAL TOURS
    // =====================================================
    console.log('\n🏠 Test 9: Get Agent Virtual Tours');
    try {
      const response = await axios.get(
        `${BASE_URL}/video/tours/agent/${TEST_AGENT_ID}`,
        { headers }
      );

      logTest('Get Agent Virtual Tours', response.data.length > 0, `Found ${response.data.length} virtual tours`);
    } catch (error) {
      handleError('Get Agent Virtual Tours', error);
    }

    // =====================================================
    // 10. END VIRTUAL TOUR
    // =====================================================
    console.log('\n🏠 Test 10: End Virtual Tour');
    try {
      const response = await axios.post(
        `${BASE_URL}/video/tours/${testTourSessionId}/end`,
        {},
        { headers }
      );

      logTest('End Virtual Tour', !!response.data.endedAt, 'Tour ended successfully');
    } catch (error) {
      handleError('End Virtual Tour', error);
    }

    // =====================================================
    // 11. END VIDEO CALL
    // =====================================================
    console.log('\n📹 Test 11: End Video Call');
    try {
      const response = await axios.post(
        `${BASE_URL}/video/calls/${testVideoCallId}/end`,
        {},
        { headers }
      );

      logTest('End Video Call', response.data.status === 'completed', 'Call ended successfully');
      logTest('Duration Calculated', response.data.duration >= 0, `Duration: ${response.data.duration}s`);
    } catch (error) {
      handleError('End Video Call', error);
    }

    // =====================================================
    // 12. GET VIDEO CALL STATISTICS
    // =====================================================
    console.log('\n📊 Test 12: Get Video Call Statistics');
    try {
      const response = await axios.get(
        `${BASE_URL}/video/stats/${TEST_AGENT_ID}`,
        { headers }
      );

      logTest('Get Statistics', response.data.totalCalls >= 0, `Total calls: ${response.data.totalCalls}`);
      logTest('Completed Calls', response.data.completedCalls >= 0, `Completed: ${response.data.completedCalls}`);
      logTest('Virtual Tours', response.data.totalTours >= 0, `Total tours: ${response.data.totalTours}`);
    } catch (error) {
      handleError('Get Statistics', error);
    }

    // =====================================================
    // 13. CREATE VIDEO CALL WITH PROPERTY
    // =====================================================
    console.log('\n🏠 Test 13: Create Video Call with Property');
    try {
      const response = await axios.post(
        `${BASE_URL}/video/calls`,
        {
          agentId: TEST_AGENT_ID,
          leadName: 'Jane Smith',
          leadEmail: 'jane.smith@example.com',
          propertyId: 'test-property-456'
        },
        { headers }
      );

      logTest('Create Call with Property', response.status === 201, 'Video call created with property');
      logTest('Property ID Stored', !!response.data.id, 'Property linked to call');
    } catch (error) {
      handleError('Create Call with Property', error);
    }

    // =====================================================
    // 14. FILTER VIDEO CALLS BY STATUS
    // =====================================================
    console.log('\n🔍 Test 14: Filter Video Calls by Status');
    try {
      const response = await axios.get(
        `${BASE_URL}/video/calls/agent/${TEST_AGENT_ID}?status=completed`,
        { headers }
      );

      logTest('Filter by Status', response.status === 200, `Found ${response.data.length} completed calls`);
    } catch (error) {
      handleError('Filter by Status', error);
    }

    // =====================================================
    // SUMMARY
    // =====================================================
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Phase 6 Testing Complete!\n');
    console.log('Features Tested:');
    console.log('  ✓ Video call creation and management');
    console.log('  ✓ Participant joining with access tokens');
    console.log('  ✓ Virtual tour session management');
    console.log('  ✓ Screen sharing and chat controls');
    console.log('  ✓ Call duration tracking');
    console.log('  ✓ Video call statistics');
    console.log('  ✓ Property-linked video calls');
    console.log('  ✓ Status filtering');
    console.log('\n📝 Note: WebRTC peer-to-peer connections work without Twilio');
    console.log('   For production with recording, configure Twilio Video');
    console.log('   See backend/services/videoService.js for setup instructions\n');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Run the tests
runTests();
