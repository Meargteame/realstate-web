#!/bin/bash

echo "Testing Admin API..."

# Login
echo "1. Logging in..."
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kw.com","password":"password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Login successful"
echo "Token: ${TOKEN:0:20}..."

# Test agents endpoint
echo ""
echo "2. Testing /api/admin/agents..."
curl -s -X GET "http://localhost:5000/api/admin/agents?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Test users endpoint
echo ""
echo "3. Testing /api/admin/users..."
curl -s -X GET "http://localhost:5000/api/admin/users?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
