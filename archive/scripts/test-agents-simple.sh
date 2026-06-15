#!/bin/bash

# Login and get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kw.com","password":"password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: ${TOKEN:0:20}..."

# Test agents endpoint
echo ""
echo "Testing /api/admin/agents..."
curl -v -X GET "http://localhost:5000/api/admin/agents?page=1&limit=10&search=" \
  -H "Authorization: Bearer $TOKEN" 2>&1 | head -100
