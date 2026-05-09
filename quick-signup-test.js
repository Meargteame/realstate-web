const http = require('http');

const data = JSON.stringify({
  firstName: 'Quick',
  lastName: 'Test',
  email: 'quicktest@example.com',
  password: 'password123',
  role: 'user'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },
  timeout: 5000
};

console.log('Testing signup endpoint...');
console.log('Request:', data);

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Response:', body);
    try {
      const json = JSON.parse(body);
      console.log('Parsed:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Not JSON');
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.on('timeout', () => {
  console.error('Request timed out!');
  req.destroy();
});

req.write(data);
req.end();

setTimeout(() => {
  console.log('Test complete');
  process.exit(0);
}, 6000);
