#!/bin/bash

echo "=== KW Real Estate Platform Diagnostics ==="
echo ""

echo "1. Checking if backend is running..."
if lsof -i :5000 > /dev/null 2>&1; then
    echo "✓ Backend is running on port 5000"
else
    echo "✗ Backend is NOT running on port 5000"
fi
echo ""

echo "2. Checking if frontend is running..."
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✓ Frontend is running on port 3000"
else
    echo "✗ Frontend is NOT running on port 3000"
fi
echo ""

echo "3. Testing backend API health..."
if command -v curl > /dev/null 2>&1; then
    HEALTH=$(curl -s http://localhost:5000/api/health 2>&1)
    if [ $? -eq 0 ]; then
        echo "✓ Backend API responding: $HEALTH"
    else
        echo "✗ Backend API not responding"
    fi
else
    echo "⚠ curl not available, skipping API test"
fi
echo ""

echo "4. Checking database data..."
cd backend
node -e "
const prisma = require('./config/prisma');
(async () => {
  try {
    const agents = await prisma.agent.count();
    const properties = await prisma.property.count();
    const users = await prisma.user.count();
    const leads = await prisma.lead.count();
    
    console.log('✓ Database connection successful');
    console.log('  - Agents:', agents);
    console.log('  - Properties:', properties);
    console.log('  - Users:', users);
    console.log('  - Leads:', leads);
    
    if (agents === 0) {
      console.log('\\n⚠ Database is EMPTY! Need to run seed script.');
    }
  } catch (error) {
    console.log('✗ Database error:', error.message);
  } finally {
    await prisma.\$disconnect();
  }
})();
" 2>&1
cd ..
echo ""

echo "5. Testing API endpoints..."
if command -v curl > /dev/null 2>&1; then
    echo "Testing /api/agents..."
    AGENTS=$(curl -s http://localhost:5000/api/agents 2>&1 | head -c 100)
    if [ $? -eq 0 ]; then
        echo "✓ Agents endpoint responding: ${AGENTS}..."
    else
        echo "✗ Agents endpoint not responding"
    fi
    
    echo "Testing /api/properties..."
    PROPS=$(curl -s http://localhost:5000/api/properties 2>&1 | head -c 100)
    if [ $? -eq 0 ]; then
        echo "✓ Properties endpoint responding: ${PROPS}..."
    else
        echo "✗ Properties endpoint not responding"
    fi
fi
echo ""

echo "=== Diagnostics Complete ==="
