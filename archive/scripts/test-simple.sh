#!/bin/bash
echo "=== Testing Backend ==="
echo ""
echo "1. Testing register..."
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test'$(date +%s)'@test.com","password":"password123","role":"agent"}' \
  | python3 -m json.tool || echo "Failed"

echo ""
echo "2. Testing login with sarah.j@kw.com..."
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah.j@kw.com","password":"password123"}' \
  | python3 -m json.tool || echo "Failed"

echo ""
echo "3. Testing login with hello.meareg@gmail.com..."
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hello.meareg@gmail.com","password":"password123"}' \
  | python3 -m json.tool || echo "Failed"

echo ""
echo "=== Tests Complete ==="
