#!/bin/bash

echo "🔍 QUICK SERVER STATUS CHECK"
echo "================================"
echo ""

echo "📊 SERVICE STATUS:"
echo "├─ Nginx: $(systemctl is-active nginx 2>/dev/null || echo 'not found')"
echo "├─ PostgreSQL: $(systemctl is-active postgresql 2>/dev/null || echo 'not found')"
echo "└─ PM2: $(pm2 list 2>/dev/null | grep -q 'online' && echo 'online' || echo 'offline')"
echo ""

echo "🌐 PORT STATUS:"
echo "├─ Port 80 (HTTP): $(ss -tlnp | grep :80 >/dev/null && echo '✅ listening' || echo '❌ not listening')"
echo "├─ Port 5000 (Backend): $(ss -tlnp | grep :5000 >/dev/null && echo '✅ listening' || echo '❌ not listening')"
echo "└─ Port 5432 (PostgreSQL): $(ss -tlnp | grep :5432 >/dev/null && echo '✅ listening' || echo '❌ not listening')"
echo ""

echo "🧪 LOCAL CONNECTIVITY:"
echo "├─ Frontend (Nginx): $(curl -s -o /dev/null -w '%{http_code}' http://localhost/ 2>/dev/null)"
echo "└─ Backend API: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:5000/api/health 2>/dev/null)"
echo ""

echo "🔥 FIREWALL STATUS:"
echo "├─ UFW: $(ufw status 2>/dev/null | head -1 || echo 'not installed')"
echo "└─ iptables: $(iptables -L INPUT 2>/dev/null | grep -c 'ACCEPT' || echo 'no rules') ACCEPT rules"
echo ""

echo "📁 FILE STATUS:"
echo "├─ Frontend files: $(ls /var/www/kw-realestate/frontend/ 2>/dev/null | wc -l) files"
echo "├─ Backend files: $(ls /var/www/kw-realestate/backend/ 2>/dev/null | wc -l) files"
echo "└─ Nginx config: $(test -f /etc/nginx/sites-enabled/kw-realestate && echo '✅ exists' || echo '❌ missing')"
echo ""

echo "🎯 DIAGNOSIS:"
if systemctl is-active nginx >/dev/null 2>&1 && ss -tlnp | grep :80 >/dev/null; then
    if curl -s -o /dev/null -w '%{http_code}' http://localhost/ | grep -q '200'; then
        echo "✅ Server is working correctly"
        echo "❌ Issue: External firewall blocking access"
        echo "🔧 Solution: Fix Hostinger firewall settings"
        echo ""
        echo "📋 NEXT STEPS:"
        echo "1. Open https://hpanel.hostinger.com/"
        echo "2. Go to VPS → srv1610837 → Firewall"
        echo "3. Attach firewall to server"
        echo "4. Test http://2.24.223.106/"
    else
        echo "❌ Nginx not serving files correctly"
        echo "🔧 Check Nginx configuration"
    fi
else
    echo "❌ Services not running properly"
    echo "🔧 Check service status and restart if needed"
fi

echo ""
echo "================================"
echo "🚀 Run this script on your server to diagnose issues"