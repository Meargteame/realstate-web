/**
 * Middleware Isolation Test
 * Tests each middleware component individually to identify which one is blocking requests
 */

const express = require('express');
const cors = require('cors');

// Test each middleware component
async function testMiddleware() {
  console.log('🧪 Testing Middleware Components...\n');

  // Test 1: Security Middleware
  console.log('Test 1: Security Middleware');
  try {
    const { securityHeaders, sanitizeInput, preventParameterPollution } = require('./middleware/security');
    console.log('✅ Security middleware loaded successfully');
    
    // Test if it blocks requests
    const app1 = express();
    app1.use(securityHeaders);
    app1.use(sanitizeInput);
    app1.use(preventParameterPollution);
    app1.get('/test', (req, res) => res.json({ ok: true }));
    
    const server1 = app1.listen(5001);
    
    // Make a test request
    const response1 = await fetch('http://localhost:5001/test');
    const data1 = await response1.json();
    
    if (data1.ok) {
      console.log('✅ Security middleware works correctly\n');
    } else {
      console.log('❌ Security middleware blocks requests\n');
    }
    
    server1.close();
  } catch (error) {
    console.log('❌ Security middleware error:', error.message, '\n');
  }

  // Test 2: Rate Limiter
  console.log('Test 2: Rate Limiter');
  try {
    const { globalLimiter } = require('./middleware/rateLimiter');
    console.log('✅ Rate limiter loaded successfully');
    
    const app2 = express();
    app2.use(cors());
    app2.use(express.json());
    app2.use('/api/', globalLimiter);
    app2.get('/api/test', (req, res) => res.json({ ok: true }));
    
    const server2 = app2.listen(5002);
    
    // Make a test request
    const response2 = await fetch('http://localhost:5002/api/test');
    const data2 = await response2.json();
    
    if (data2.ok) {
      console.log('✅ Rate limiter works correctly\n');
    } else {
      console.log('❌ Rate limiter blocks requests\n');
    }
    
    server2.close();
  } catch (error) {
    console.log('❌ Rate limiter error:', error.message, '\n');
  }

  // Test 3: Monitoring Middleware
  console.log('Test 3: Monitoring Middleware');
  try {
    const { performanceMonitor, requestLogger, errorTracker } = require('./middleware/monitoring');
    console.log('✅ Monitoring middleware loaded successfully');
    
    const app3 = express();
    app3.use(cors());
    app3.use(express.json());
    app3.use(requestLogger);
    app3.use(performanceMonitor.trackRequest());
    app3.get('/test', (req, res) => res.json({ ok: true }));
    app3.use(errorTracker);
    
    const server3 = app3.listen(5003);
    
    // Make a test request
    const response3 = await fetch('http://localhost:5003/test');
    const data3 = await response3.json();
    
    if (data3.ok) {
      console.log('✅ Monitoring middleware works correctly\n');
    } else {
      console.log('❌ Monitoring middleware blocks requests\n');
    }
    
    server3.close();
  } catch (error) {
    console.log('❌ Monitoring middleware error:', error.message, '\n');
  }

  // Test 4: All Together
  console.log('Test 4: All Middleware Together');
  try {
    const { securityHeaders, sanitizeInput, preventParameterPollution } = require('./middleware/security');
    const { globalLimiter } = require('./middleware/rateLimiter');
    const { performanceMonitor, requestLogger, errorTracker } = require('./middleware/monitoring');
    
    const app4 = express();
    app4.use(cors());
    app4.use(express.json());
    app4.use(securityHeaders);
    app4.use(sanitizeInput);
    app4.use(preventParameterPollution);
    app4.use(requestLogger);
    app4.use(performanceMonitor.trackRequest());
    app4.use('/api/', globalLimiter);
    app4.post('/api/test', (req, res) => res.json({ ok: true, body: req.body }));
    app4.use(errorTracker);
    
    const server4 = app4.listen(5004);
    
    // Make a test POST request with body
    const response4 = await fetch('http://localhost:5004/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' })
    });
    const data4 = await response4.json();
    
    if (data4.ok) {
      console.log('✅ All middleware works together correctly\n');
    } else {
      console.log('❌ Combined middleware blocks requests\n');
    }
    
    server4.close();
  } catch (error) {
    console.log('❌ Combined middleware error:', error.message, '\n');
  }

  console.log('========================================');
  console.log('🎯 Test Complete');
  console.log('========================================\n');
  
  console.log('Analysis:');
  console.log('- If all tests pass: Middleware is working, issue is elsewhere');
  console.log('- If specific test fails: That middleware component needs fixing');
  console.log('- Check the error messages above for details\n');
  
  process.exit(0);
}

// Run tests
testMiddleware().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
