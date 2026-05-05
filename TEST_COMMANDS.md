# 🧪 Test Commands - Quick Diagnostics

## Run These Commands on Your Server

Copy and paste these commands into your SSH terminal to diagnose the issue.

---

## 🔍 Quick Test (30 seconds)

```bash
# All-in-one test
echo "=== Quick Connectivity Test ===" && \
echo "1. Nginx status:" && systemctl is-active nginx && \
echo "2. Port 80 listening:" && ss -tlnp | grep :80 && \
echo "3. Backend API:" && curl -s http://localhost:5000/api/health && \
echo "4. Frontend (localhost):" && curl -I -s http://localhost/ | head -1 && \
echo "5. Frontend (IP):" && curl -I -s http://2.24.223.106/ | head -1 && \
echo "=== Test Complete ==="
```

**Expected output:**
```
=== Quick Connectivity Test ===
1. Nginx status:
active
2. Port 80 listening:
LISTEN 0      511          0.0.0.0:80         0.0.0.0:*    users:(("nginx"...
3. Backend API:
{"status":"ok","message":"KW Real Estate Backend is active."}
4. Frontend (localhost):
HTTP/1.1 200 OK
5. Frontend (IP):
HTTP/1.1 200 OK
=== Test Complete ===
```

**If all show ✅ but browser still hangs** → Firewall is blocking external access

---

## 🔥 Firewall Check

```bash
# Check UFW status
echo "=== UFW Firewall ===" && \
ufw status verbose && \
echo "" && \
echo "=== IPTables Rules ===" && \
iptables -L INPUT -n --line-numbers
```

**Expected output:**
```
=== UFW Firewall ===
Status: inactive

=== IPTables Rules ===
Chain INPUT (policy ACCEPT)
num  target     prot opt source               destination
```

**If UFW is inactive and iptables is empty** → Server firewall is not blocking

**This means** → Hostinger's firewall is the issue

---

## 🌐 Network Test

```bash
# Test if server can reach outside
echo "=== Network Connectivity ===" && \
echo "1. Can reach Google DNS:" && \
ping -c 2 8.8.8.8 > /dev/null 2>&1 && echo "✅ Yes" || echo "❌ No" && \
echo "2. Can reach Google:" && \
curl -I -s https://www.google.com | head -1 && \
echo "3. Server IP:" && \
hostname -I | awk '{print $1}'
```

**Expected output:**
```
=== Network Connectivity ===
1. Can reach Google DNS:
✅ Yes
2. Can reach Google:
HTTP/2 200
3. Server IP:
2.24.223.106
```

---

## 📊 Full Diagnostic

```bash
# Run the diagnostic script
chmod +x test-connectivity.sh
./test-connectivity.sh
```

This runs a comprehensive test and gives you a summary.

---

## 🔧 Fix Commands

### Option 1: Enable Server Firewall (UFW)

```bash
# Enable UFW and allow necessary ports
ufw enable && \
ufw allow 22/tcp && \
ufw allow 80/tcp && \
ufw allow 443/tcp && \
ufw status verbose
```

**Warning**: Make sure SSH (port 22) is allowed before enabling UFW!

### Option 2: Test Without Any Firewall

```bash
# Temporarily disable UFW (if enabled)
ufw disable

# Check if iptables has any rules
iptables -L -n

# If there are rules, flush them (CAREFUL!)
# iptables -F  # Uncomment only if you know what you're doing
```

---

## 🧪 External Test (From Your Computer)

Run these on **your local computer** (not the server):

```bash
# Test if port 80 is reachable
curl -I http://2.24.223.106/

# Test with timeout
curl -I --max-time 5 http://2.24.223.106/

# Test with verbose output
curl -v http://2.24.223.106/
```

**If it hangs or times out** → Port 80 is blocked by Hostinger firewall

**Alternative test (if you have telnet):**
```bash
telnet 2.24.223.106 80
```

**Alternative test (if you have nc/netcat):**
```bash
nc -zv 2.24.223.106 80
```

**Expected if working:**
```
Connection to 2.24.223.106 80 port [tcp/http] succeeded!
```

**Expected if blocked:**
```
Connection timed out
```

---

## 📋 Checklist Format

Run each command and check the result:

```bash
# 1. Nginx running?
systemctl status nginx | grep "Active:"
# Expected: Active: active (running)

# 2. Port 80 listening?
ss -tlnp | grep :80
# Expected: LISTEN ... nginx

# 3. Backend API working?
curl -s http://localhost:5000/api/health | grep "ok"
# Expected: "status":"ok"

# 4. Frontend working locally?
curl -I http://localhost/ 2>&1 | grep "200 OK"
# Expected: HTTP/1.1 200 OK

# 5. Frontend working via IP (from server)?
curl -I http://2.24.223.106/ 2>&1 | grep "200 OK"
# Expected: HTTP/1.1 200 OK

# 6. UFW disabled?
ufw status | grep "Status:"
# Expected: Status: inactive

# 7. No iptables blocks?
iptables -L INPUT -n | grep -c "DROP\|REJECT"
# Expected: 0
```

---

## 🎯 Interpretation

### Scenario A: All Tests Pass on Server ✅

**Meaning**: Server is working perfectly
**Problem**: Hostinger firewall blocking external access
**Solution**: Attach firewall to srv1610837 in Hostinger dashboard

### Scenario B: Some Tests Fail ❌

**If Nginx not running:**
```bash
systemctl start nginx
systemctl enable nginx
```

**If Backend not responding:**
```bash
pm2 restart kw-backend
pm2 logs kw-backend
```

**If Port 80 not listening:**
```bash
nginx -t
systemctl restart nginx
```

### Scenario C: External Test Works ✅

**Meaning**: Everything is working!
**Action**: Open browser and enjoy your live site! 🎉

---

## 🚀 Quick Fix Test

After you fix the firewall (either in Hostinger or with UFW), run this:

```bash
# Wait 30 seconds after making changes, then:
echo "Testing external access..." && \
curl -I --max-time 5 http://2.24.223.106/ && \
echo "" && \
echo "✅ SUCCESS! Website is accessible!" || \
echo "❌ Still blocked. Check firewall settings."
```

---

## 📊 Expected Results Summary

| Test | Expected Result | If Failed |
|------|----------------|-----------|
| Nginx status | active (running) | `systemctl start nginx` |
| Port 80 | LISTEN ... nginx | `systemctl restart nginx` |
| Backend API | {"status":"ok"} | `pm2 restart kw-backend` |
| Frontend (local) | HTTP/1.1 200 OK | Check nginx config |
| Frontend (IP) | HTTP/1.1 200 OK | Check nginx config |
| UFW | inactive | `ufw disable` |
| IPTables | No DROP/REJECT | `iptables -F` (careful!) |
| External access | HTTP/1.1 200 OK | Fix Hostinger firewall |

---

## 🎯 One-Line Test

```bash
curl -I --max-time 5 http://2.24.223.106/ && echo "✅ WORKING!" || echo "❌ BLOCKED"
```

Run this after each fix attempt to see if it worked.

---

## 📞 What to Share if Asking for Help

If you need help, run this and share the output:

```bash
echo "=== System Info ===" && \
echo "Hostname: $(hostname)" && \
echo "IP: $(hostname -I | awk '{print $1}')" && \
echo "" && \
echo "=== Service Status ===" && \
echo "Nginx: $(systemctl is-active nginx)" && \
echo "PostgreSQL: $(systemctl is-active postgresql)" && \
echo "PM2: $(pm2 list | grep kw-backend | awk '{print $10}')" && \
echo "" && \
echo "=== Port 80 ===" && \
ss -tlnp | grep :80 && \
echo "" && \
echo "=== Firewall ===" && \
echo "UFW: $(ufw status | grep Status)" && \
echo "" && \
echo "=== Local Test ===" && \
curl -I -s http://localhost/ | head -1 && \
echo "" && \
echo "=== IP Test (from server) ===" && \
curl -I -s http://2.24.223.106/ | head -1
```

---

**Use these commands to quickly diagnose and fix the issue! 🔧**
