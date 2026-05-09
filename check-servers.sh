#!/bin/bash

echo "=== Checking Server Status ==="
echo ""

echo "1. Checking Backend (port 5000)..."
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is RUNNING on port 5000"
else
    echo "❌ Backend is NOT responding on port 5000"
fi

echo ""
echo "2. Checking Frontend (port 3001)..."
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ Frontend is RUNNING on port 3001"
else
    echo "❌ Frontend is NOT responding on port 3001"
fi

echo ""
echo "3. Checking processes..."
ps aux | grep -E "node.*server.js|vite" | grep -v grep || echo "No Node processes found"

echo ""
echo "=== Done ==="
