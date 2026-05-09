#!/bin/bash

echo "Testing signup endpoint..."

curl -v -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "testuser@example.com",
    "password": "password123",
    "role": "user"
  }' 2>&1 | head -100
