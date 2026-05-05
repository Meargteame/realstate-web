# 🔥 Hostinger Firewall - Step-by-Step Fix

## The Problem

Your website works on the server but hangs in the browser because **port 80 is blocked** by Hostinger's firewall.

---

## 🎯 Solution: Attach Firewall to Your Server

### Step 1: Go to Hostinger Dashboard

1. **Open**: https://hpanel.hostinger.com/
2. **Login** with your credentials
3. **Navigate to**: VPS section

### Step 2: Find Your Server

1. **Look for**: srv1610837 (your server name)
2. **Or look for**: IP 2.24.223.106
3. **Click** on the server to open its management page

### Step 3: Locate Firewall Section

Look for one of these sections (varies by Hostinger interface):
- "Firewall"
- "Security"
- "Network Security"
- "Firewall Rules"

**Common locations:**
- Left sidebar menu
- Top navigation tabs
- Settings section
- Security section

### Step 4: Check Firewall Status

You should see:
- **Firewall name**: (the one you created)
- **Status**: Should show "Active" or "Enabled"
- **Attached to**: Should show "srv1610837" or your server name

**If you see "Not attached" or "No server":**
→ This is the problem! Continue to Step 5.

**If you see "Attached to srv1610837":**
→ Firewall is attached but may need synchronization. Continue to Step 6.

### Step 5: Attach Firewall to Server

**Option A: If there's an "Attach" button:**
1. Click "Attach to Server" or "Apply to Server"
2. Select "srv1610837" from dropdown
3. Click "Confirm" or "Apply"
4. Wait 30-60 seconds

**Option B: If there's a dropdown:**
1. Find "Server" or "Apply to" dropdown
2. Select "srv1610837"
3. Click "Save" or "Apply"
4. Wait 30-60 seconds

**Option C: If firewall is in a list:**
1. Find your firewall in the list
2. Click the "..." or "Actions" menu
3. Select "Attach to server"
4. Choose "srv1610837"
5. Confirm

### Step 6: Verify Firewall Rules

Make sure these rules exist:

| Type | Protocol | Port | Source | Action |
|------|----------|------|--------|--------|
| Inbound | TCP | 22 | 0.0.0.0/0 | Allow |
| Inbound | TCP | 80 | 0.0.0.0/0 | Allow |
| Inbound | TCP | 443 | 0.0.0.0/0 | Allow |

**If rules are missing:**
1. Click "Add Rule" or "Create Rule"
2. Add each missing rule
3. Save changes

### Step 7: Synchronize/Apply Changes

Look for one of these buttons:
- "Synchronize"
- "Apply Changes"
- "Save and Apply"
- "Update Firewall"

**Click it** and wait for confirmation.

### Step 8: Test Access

**Wait 30-60 seconds**, then:

1. **Open browser**
2. **Go to**: `http://2.24.223.106/`
3. **Expected**: Website loads!

---

## 🔍 Alternative: Check Network Security Groups

Some Hostinger plans have an additional "Network" section:

### Step 1: Find Network Section

Look for:
- "Network"
- "Security Groups"
- "Network Security"
- "VPC" (Virtual Private Cloud)

### Step 2: Check Security Group

1. **Find**: Default security group or your server's security group
2. **Check**: Inbound rules
3. **Ensure**: Ports 80 and 443 are allowed

### Step 3: Modify if Needed

If ports are blocked:
1. Click "Edit Rules" or "Modify"
2. Add inbound rules for TCP 80 and 443
3. Source: 0.0.0.0/0 (anywhere)
4. Save changes

---

## 🚨 If You Can't Find Firewall Section

### Option 1: Search Function

1. Look for a **search bar** in Hostinger dashboard
2. Type: "firewall" or "security"
3. Follow the results

### Option 2: Help/Documentation

1. Click "Help" or "?" icon
2. Search for "firewall configuration"
3. Follow the guide

### Option 3: Different Interface

Hostinger has different interfaces for different plans:

**KVM VPS (your plan):**
- Usually has "Firewall" in left sidebar
- Or under "Settings" → "Security"

**Cloud VPS:**
- May have "Network" → "Firewall"
- Or "Security Groups"

**Shared Hosting:**
- Firewall is managed automatically
- No manual configuration needed

---

## 📸 What to Look For (Visual Guide)

### Firewall Attached (Good ✅)

```
┌─────────────────────────────────────┐
│ Firewall: my-firewall               │
│ Status: Active                      │
│ Attached to: srv1610837             │
│                                     │
│ Rules:                              │
│ ✓ TCP 22  (SSH)                    │
│ ✓ TCP 80  (HTTP)                   │
│ ✓ TCP 443 (HTTPS)                  │
│                                     │
│ [Edit Rules] [Detach]              │
└─────────────────────────────────────┘
```

### Firewall Not Attached (Problem ❌)

```
┌─────────────────────────────────────┐
│ Firewall: my-firewall               │
│ Status: Created                     │
│ Attached to: None                   │
│                                     │
│ Rules:                              │
│ ✓ TCP 22  (SSH)                    │
│ ✓ TCP 80  (HTTP)                   │
│ ✓ TCP 443 (HTTPS)                  │
│                                     │
│ [Attach to Server] [Edit Rules]    │
└─────────────────────────────────────┘
```

---

## 🔧 Commands to Run on Server

While you're checking the dashboard, run this on your server:

```bash
# Make script executable
chmod +x test-connectivity.sh

# Run diagnostics
./test-connectivity.sh
```

This will show you exactly what's working and what's not.

---

## ⏱️ Timeline

| Step | Action | Time |
|------|--------|------|
| 1 | Login to Hostinger | 30 sec |
| 2 | Find firewall section | 1 min |
| 3 | Attach firewall to server | 30 sec |
| 4 | Wait for propagation | 30-60 sec |
| 5 | Test in browser | 10 sec |
| **Total** | **~3-4 minutes** | |

---

## ✅ Success Indicators

You'll know it worked when:

1. **Hostinger Dashboard shows**:
   - Firewall: Active
   - Attached to: srv1610837
   - Status: Synchronized

2. **Browser shows**:
   - `http://2.24.223.106/` loads your website
   - No hanging or timeout

3. **Server test shows**:
   ```bash
   curl -I http://2.24.223.106/
   # Returns: HTTP/1.1 200 OK
   ```

---

## 🆘 Still Not Working?

### Quick Fixes to Try:

**1. Disable and Re-enable Firewall**
- Detach firewall
- Wait 30 seconds
- Re-attach firewall
- Test again

**2. Create New Firewall**
- Delete old firewall
- Create new one with same rules
- Attach to srv1610837
- Test again

**3. Use Server Firewall Instead**

Run on server:
```bash
# Enable UFW
ufw enable

# Allow ports
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Check status
ufw status verbose

# Test
curl -I http://2.24.223.106/
```

**4. Contact Hostinger Support**

If nothing works, contact support:
- **Method**: Live chat or ticket
- **Subject**: "Port 80 blocked on srv1610837"
- **Include**: Server IP (2.24.223.106), issue description
- **Evidence**: "curl from server works, browser hangs"

---

## 📞 Hostinger Support Contact

**Live Chat:**
- Available 24/7
- Click "Help" icon in dashboard
- Usually responds in 2-5 minutes

**Support Ticket:**
- Dashboard → Support → Submit Ticket
- Response time: 15-30 minutes

**What to Say:**
```
Hello,

I need help with firewall configuration on my VPS.

Server: srv1610837
IP: 2.24.223.106
Issue: Port 80 blocked from external access

I created firewall rules (TCP 80, 443, 22) but external 
browser access still hangs. The server works internally 
(curl from server returns 200 OK).

Can you please:
1. Verify the firewall is properly attached to srv1610837
2. Check if there's a network-level firewall blocking port 80
3. Help me resolve this connectivity issue

Thank you!
```

---

## 🎯 Most Likely Solution

Based on your situation, the most likely fix is:

**The firewall exists but is not attached to srv1610837.**

**Fix:**
1. Go to Hostinger dashboard
2. Find your firewall
3. Click "Attach to Server"
4. Select srv1610837
5. Wait 30-60 seconds
6. Test: `http://2.24.223.106/`

**This should take 2-3 minutes and solve the problem!**

---

**Let's get your site live! 🚀**
