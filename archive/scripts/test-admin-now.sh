#!/bin/bash

echo "🔐 Testing Admin API Endpoints..."
echo ""

# Login
echo "1️⃣ Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kw.com","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful"
echo ""

# Test agents endpoint
echo "2️⃣ Testing GET /api/admin/agents..."
AGENTS_RESPONSE=$(curl -s -X GET "http://localhost:5000/api/admin/agents?page=1&limit=3" \
  -H "Authorization: Bearer $TOKEN")

echo "$AGENTS_RESPONSE" | head -c 500
echo ""
echo ""

# Test users endpoint
echo "3️⃣ Testing GET /api/admin/users..."
USERS_RESPONSE=$(curl -s -X GET "http://localhost:5000/api/admin/users?page=1&limit=3" \
  -H "Authorization: Bearer $TOKEN")

echo "$USERS_RESPONSE" | head -c 500
echo ""
