/**
 * Phase 5 Feature Testing Script
 * Tests calendar, availability, and booking request features
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const TEST_AGENT_ID = 'f2d2c702-3702-4717-9f44-7e5a860f81bf';
const TEST_EMAIL = 'hello.meareg@gmail.com';

let authToken = '';
let testEventId = '';
let testBookingId = '';

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
  console.log('\n🚀 Starting Phase 5 Feature Tests...\n');
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
    // 2. SET AGENT AVAILABILITY
    // =====================================================
    console.log('\n📅 Test 2: Set Agent Availability');
    try {
      const schedule = [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true }, // Monday
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true }, // Tuesday
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true }, // Wednesday
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true }, // Thursday
        { dayOfWeek: 5, startTime: '09:00', endTime: '15:00', isAvailable: true }  // Friday
      ];

      const response = await axios.post(
        `${BASE_URL}/calendar/availability/${TEST_AGENT_ID}`,
        { schedule },
        { headers }
      );

      logTest('Set Availability', response.status === 200, `Set ${schedule.length} availability slots`);
    } catch (error) {
      handleError('Set Availability', error);
    }

    // =====================================================
    // 3. GET AGENT AVAILABILITY
    // =====================================================
    console.log('\n📅 Test 3: Get Agent Availability');
    try {
      const response = await axios.get(
        `${BASE_URL}/calendar/availability/${TEST_AGENT_ID}`
      );

      logTest('Get Availability', response.data.length > 0, `Found ${response.data.length} availability slots`);
    } catch (error) {
      handleError('Get Availability', error);
    }

    // =====================================================
    // 4. CREATE CALENDAR EVENT
    // =====================================================
    console.log('\n📆 Test 4: Create Calendar Event');
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(11, 0, 0, 0);

      const eventData = {
        title: 'Test Property Showing',
        description: 'Showing property to potential buyer',
        startTime: tomorrow.toISOString(),
        endTime: endTime.toISOString(),
        location: '123 Main St, Boston, MA',
        eventType: 'showing',
        agentId: TEST_AGENT_ID,
        reminderMinutes: [15, 60]
      };

      const response = await axios.post(
        `${BASE_URL}/calendar/events`,
        eventData,
        { headers }
      );

      testEventId = response.data.id;
      logTest('Create Event', response.status === 201, `Event ID: ${testEventId}`);
    } catch (error) {
      handleError('Create Event', error);
    }

    // =====================================================
    // 5. GET AGENT EVENTS
    // =====================================================
    console.log('\n📆 Test 5: Get Agent Events');
    try {
      const startDate = new Date();
      startDate.setDate(1); // First day of month
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0); // Last day of month

      const response = await axios.get(
        `${BASE_URL}/calendar/events/agent/${TEST_AGENT_ID}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        { headers }
      );

      logTest('Get Agent Events', response.data.length > 0, `Found ${response.data.length} events`);
    } catch (error) {
      handleError('Get Agent Events', error);
    }

    // =====================================================
    // 6. GET SINGLE EVENT
    // =====================================================
    console.log('\n📆 Test 6: Get Single Event');
    try {
      const response = await axios.get(
        `${BASE_URL}/calendar/events/${testEventId}`,
        { headers }
      );

      logTest('Get Single Event', response.data.id === testEventId, `Title: ${response.data.title}`);
    } catch (error) {
      handleError('Get Single Event', error);
    }

    // =====================================================
    // 7. UPDATE EVENT
    // =====================================================
    console.log('\n📆 Test 7: Update Event');
    try {
      const response = await axios.put(
        `${BASE_URL}/calendar/events/${testEventId}`,
        { title: 'Updated Property Showing' },
        { headers }
      );

      logTest('Update Event', response.data.title === 'Updated Property Showing', 'Title updated successfully');
    } catch (error) {
      handleError('Update Event', error);
    }

    // =====================================================
    // 8. GET AVAILABLE TIME SLOTS
    // =====================================================
    console.log('\n⏰ Test 8: Get Available Time Slots');
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const response = await axios.get(
        `${BASE_URL}/calendar/availability/${TEST_AGENT_ID}/slots?date=${dateStr}&duration=60`
      );

      logTest('Get Available Slots', response.data.slots.length > 0, `Found ${response.data.slots.length} available slots`);
    } catch (error) {
      handleError('Get Available Slots', error);
    }

    // =====================================================
    // 9. CREATE BOOKING REQUEST (Public)
    // =====================================================
    console.log('\n📝 Test 9: Create Booking Request');
    try {
      const requestDate = new Date();
      requestDate.setDate(requestDate.getDate() + 3);

      const bookingData = {
        agentId: TEST_AGENT_ID,
        leadName: 'John Doe',
        leadEmail: 'john.doe@example.com',
        leadPhone: '(555) 123-4567',
        requestedDate: requestDate.toISOString(),
        requestedTime: '14:00',
        duration: 60,
        message: 'Interested in viewing properties in downtown area'
      };

      const response = await axios.post(
        `${BASE_URL}/calendar/bookings`,
        bookingData
      );

      testBookingId = response.data.id;
      logTest('Create Booking Request', response.status === 201, `Booking ID: ${testBookingId}`);
    } catch (error) {
      handleError('Create Booking Request', error);
    }

    // =====================================================
    // 10. GET BOOKING REQUESTS
    // =====================================================
    console.log('\n📝 Test 10: Get Booking Requests');
    try {
      const response = await axios.get(
        `${BASE_URL}/calendar/bookings/agent/${TEST_AGENT_ID}?status=pending`,
        { headers }
      );

      logTest('Get Booking Requests', response.data.length > 0, `Found ${response.data.length} pending requests`);
    } catch (error) {
      handleError('Get Booking Requests', error);
    }

    // =====================================================
    // 11. CONFIRM BOOKING REQUEST
    // =====================================================
    console.log('\n✅ Test 11: Confirm Booking Request');
    try {
      const startTime = new Date();
      startTime.setDate(startTime.getDate() + 3);
      startTime.setHours(14, 0, 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(15, 0, 0, 0);

      const response = await axios.post(
        `${BASE_URL}/calendar/bookings/${testBookingId}/confirm`,
        {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          location: '456 Oak Ave, Boston, MA'
        },
        { headers }
      );

      logTest('Confirm Booking', response.data.bookingRequest.status === 'confirmed', 'Booking confirmed and event created');
    } catch (error) {
      handleError('Confirm Booking', error);
    }

    // =====================================================
    // 12. CANCEL EVENT
    // =====================================================
    console.log('\n❌ Test 12: Cancel Event');
    try {
      const response = await axios.patch(
        `${BASE_URL}/calendar/events/${testEventId}/cancel`,
        {},
        { headers }
      );

      logTest('Cancel Event', response.data.status === 'cancelled', 'Event cancelled successfully');
    } catch (error) {
      handleError('Cancel Event', error);
    }

    // =====================================================
    // 13. CREATE RECURRING EVENT
    // =====================================================
    console.log('\n🔄 Test 13: Create Recurring Event');
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 7);
      startDate.setHours(9, 0, 0, 0);

      const endTime = new Date(startDate);
      endTime.setHours(10, 0, 0, 0);

      const recurringEvent = {
        title: 'Weekly Team Meeting',
        description: 'Recurring team meeting every Monday',
        startTime: startDate.toISOString(),
        endTime: endTime.toISOString(),
        eventType: 'meeting',
        agentId: TEST_AGENT_ID,
        isRecurring: true,
        recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO;COUNT=10'
      };

      const response = await axios.post(
        `${BASE_URL}/calendar/events`,
        recurringEvent,
        { headers }
      );

      logTest('Create Recurring Event', response.data.isRecurring === true, 'Recurring event created');
    } catch (error) {
      handleError('Create Recurring Event', error);
    }

    // =====================================================
    // 14. FILTER EVENTS BY TYPE
    // =====================================================
    console.log('\n🔍 Test 14: Filter Events by Type');
    try {
      const startDate = new Date();
      startDate.setDate(1);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const response = await axios.get(
        `${BASE_URL}/calendar/events/agent/${TEST_AGENT_ID}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&eventType=showing`,
        { headers }
      );

      logTest('Filter Events by Type', response.status === 200, `Found ${response.data.length} showing events`);
    } catch (error) {
      handleError('Filter Events by Type', error);
    }

    // =====================================================
    // SUMMARY
    // =====================================================
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Phase 5 Testing Complete!\n');
    console.log('Features Tested:');
    console.log('  ✓ Agent availability management');
    console.log('  ✓ Calendar event CRUD operations');
    console.log('  ✓ Available time slot calculation');
    console.log('  ✓ Public booking requests');
    console.log('  ✓ Booking confirmation workflow');
    console.log('  ✓ Event cancellation');
    console.log('  ✓ Recurring events');
    console.log('  ✓ Event filtering');
    console.log('\n📝 Note: Google Calendar and Outlook sync require additional setup');
    console.log('   See backend/services/googleCalendarService.js for instructions\n');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Run the tests
runTests();
