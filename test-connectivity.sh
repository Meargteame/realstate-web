#!/bin/bash

# Connectivity Test Script for KW Real Estate Platform
# Run this on your server to diagnose the firewall issue

echo "=========================================="
echo "KW Real Estate - Connectivity Diagnostics"
echo "=========================================="
echo ""

echo "1. Server Information"
echo "---------------------"
echo "Hostname: $(hostname)"
echo "IP Address: $(hostname -I | awk '{print $1}')"
echo "Date: $(date)"
echo ""

echo "2. Port 80 Listeners"
echo "--------------------"
ss -tlnp | grep :80
echo ""

echo "3. Nginx Status"
echo "---------------"
systemctl is-active nginx
echo ""

echo "4. PM2 Backend Status"
echo "---------------------"
pm2 status | grep kw-backend || echo "Backend not found in PM2"
echo ""

echo "5. Server Firewall (UFW)"
echo "------------------------"
ufw status
echo ""

echo "6. IPTables Rules"
echo "-----------------"
iptables -L INPUT -n | head -10
echo ""

echo "7. Local Access Test"
echo "--------------------"
echo "Testing http://localhost/"
curl -I -s http://localhost/ | head -5
echo ""

echo "8. IP Access Test (from server)"
echo "--------------------------------"
echo "Testing http://2.24.223.106/"
curl -I -s http://2.24.223.106/ | head -5
echo ""

echo "9. Backend API Test"
echo "-------------------"
echo "Testing http://localhost:5000/api/health"
curl -s http://localhost:5000/api/health
echo ""
echo ""

echo "10. Network Connectivity"
echo "------------------------"
echo "Can reach Google DNS (8.8.8.8):"
ping -c 2 8.8.8.8 > /dev/null 2>&1 && echo "✅ Yes" || echo "❌ No"
echo ""

echo "=========================================="
echo "Diagnostic Summary"
echo "=========================================="
echo ""

# Check if nginx is running
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx: Running"
else
    echo "❌ Nginx: Not running"
fi

# Check if port 80 is listening
if ss -tlnp | grep -q :80; then
    echo "✅ Port 80: Listening"
else
    echo "❌ Port 80: Not listening"
fi

# Check if backend is accessible
if curl -s http://localhost:5000/api/health | grep -q "ok"; then
    echo "✅ Backend API: Working"
else
    echo "❌ Backend API: Not responding"
fi

# Check if frontend is accessible locally
if curl -I -s http://localhost/ | grep -q "200 OK"; then
    echo "✅ Frontend (local): Working"
else
    echo "❌ Frontend (local): Not working"
fi

# Check if frontend is accessible via IP from server
if curl -I -s http://2.24.223.106/ | grep -q "200 OK"; then
    echo "✅ Frontend (IP from server): Working"
else
    echo "❌ Frontend (IP from server): Not working"
fi

echo ""
echo "=========================================="
echo "Next Steps"
echo "=========================================="
echo ""
echo "If all checks above are ✅ but browser still hangs:"
echo "→ The issue is with Hostinger's firewall"
echo "→ Check Hostinger dashboard to attach firewall to srv1610837"
echo "→ Or contact Hostinger support"
echo ""
echo "If any checks are ❌:"
echo "→ Fix those issues first before checking firewall"
echo ""
