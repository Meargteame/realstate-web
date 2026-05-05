# KW Real Estate Dashboard Guide

## What Dashboard Are You Seeing?

You're looking at the **Agent Command Center** - the main dashboard for real estate agents to manage their business.

## Dashboard Overview

### Top Header Shows:
- **Welcome back, [Your Name]** - Personalized greeting
- **Logged in as [ROLE]** - Your account role (AGENT/ADMIN/USER)
- **Search bar** - Quick search for contacts
- **Notification bell** - New lead alerts
- **Create Listing button** - Add new properties

### Left Sidebar Shows:
- **Your Profile**
  - Name: Meareg Tsaane
  - Role: AGENT Account (now displayed in green)
  - Profile picture
  
- **Navigation Menu:**
  - 📊 Dashboard - Overview of your business
  - 📥 Inbox - Messages and communications
  - 👥 Contacts / Leads - Manage your clients
  - 🏠 My Listings - Your property listings
  - 📈 Opportunities - Sales pipeline
  - ⚙️ Settings - Account settings
  - 🚪 Logout - Sign out

### Main Dashboard Widgets:

1. **Active Listings**
   - Shows: 0 total units
   - Your currently listed properties

2. **Total Active Volume**
   - Shows: $0
   - Combined value of all active listings

3. **New Leads**
   - Shows: 0 leads captured
   - Recent inquiries from potential clients

4. **Sales Pipeline**
   - Shows: 0 pending transactions
   - Deals in progress

5. **Recent Lead Activity**
   - Table showing: Contact, Status, Inquiry, Date, Action
   - Currently empty (no leads yet)

6. **Your Active Listings**
   - Grid of your property listings
   - Currently empty (no listings yet)

---

## User Roles in the System

### 1. **AGENT** (Your Current Role)
**What you can do:**
- ✅ Create and manage property listings
- ✅ View and respond to leads
- ✅ Manage contacts and opportunities
- ✅ Track sales pipeline
- ✅ Update your profile and settings
- ✅ Access agent dashboard and analytics

**What you CANNOT do:**
- ❌ Access admin panel
- ❌ Manage other agents
- ❌ Change system settings
- ❌ View all properties (only yours)

### 2. **ADMIN** Role
**What admins can do:**
- ✅ Everything agents can do, PLUS:
- ✅ Manage all agents in the system
- ✅ View all properties and leads
- ✅ Access system-wide analytics
- ✅ Configure system settings
- ✅ Manage user accounts
- ✅ Access admin dashboard

### 3. **USER** Role (Public Users)
**What regular users can do:**
- ✅ Browse properties
- ✅ Save favorite properties
- ✅ Create saved searches
- ✅ Contact agents
- ✅ Schedule property viewings
- ✅ Receive email alerts

**What users CANNOT do:**
- ❌ Access agent dashboard
- ❌ Create listings
- ❌ View leads
- ❌ Access command center

---

## Role Display Improvements (Just Added! ✅)

I've just updated your dashboard to clearly show your role:

### In the Sidebar (Left):
```
[Profile Picture]
Meareg Tsaane
AGENT ACCOUNT ← Now shown in green
```

### In the Header (Top):
```
Welcome back, Meareg
Logged in as AGENT ← Now shown in green
```

---

## How to Get Started

### Step 1: Create Your First Listing
1. Click the red **"Create Listing"** button (top right)
2. Fill in property details
3. Upload photos
4. Publish

### Step 2: Add Contacts/Leads
1. Click **"Contacts / Leads"** in sidebar
2. Click **"Add New Lead"**
3. Enter contact information
4. Track their status

### Step 3: Manage Opportunities
1. Click **"Opportunities"** in sidebar
2. Create new opportunities from leads
3. Track deal progress
4. Update status as deals move forward

---

## Understanding Your Dashboard Metrics

### Active Listings (0)
- **What it means**: Number of properties you currently have listed
- **How to increase**: Click "Create Listing" to add properties

### Total Active Volume ($0)
- **What it means**: Combined price of all your active listings
- **Example**: If you have 3 properties listed at $300K, $450K, and $250K, this shows $1,000,000

### New Leads (0)
- **What it means**: Number of new inquiries you've received
- **How leads come in**: 
  - Public users contact you through property listings
  - You manually add leads
  - Leads from saved search alerts

### Sales Pipeline (0)
- **What it means**: Number of active deals in progress
- **Stages**: New → Contacted → Qualified → Negotiating → Closing

---

## Test Your Dashboard

### Quick Test Commands:

1. **Check your role in terminal:**
```bash
# This will show your stored user data
node -e "console.log(JSON.parse(localStorage.getItem('kw_user')))"
```

2. **View your user data in browser console:**
```javascript
// Open browser console (F12) and run:
JSON.parse(localStorage.getItem('kw_user'))
```

You should see:
```json
{
  "id": "...",
  "agentId": "...",
  "firstName": "Meareg",
  "name": "Meareg Tsaane",
  "email": "your-email@example.com",
  "role": "agent"
}
```

---

## Common Questions

### Q: Why is everything showing 0?
**A:** You just logged in! The dashboard is empty because:
- You haven't created any listings yet
- You don't have any leads yet
- No opportunities have been created

This is normal for a new account.

### Q: How do I know what role I have?
**A:** Look at:
1. **Sidebar** - Shows "AGENT ACCOUNT" in green
2. **Header** - Shows "Logged in as AGENT" in green
3. **Menu items** - Agents see "My Listings", Admins see "All Listings"

### Q: Can I change my role?
**A:** No, roles are assigned by administrators. Contact your system admin to change roles.

### Q: What if I need admin access?
**A:** You need to:
1. Contact your system administrator
2. They can update your role in the database
3. Log out and log back in to see changes

---

## Role-Based Navigation

### Agent Dashboard (What You See):
```
Dashboard → Your metrics and overview
Inbox → Your messages
Contacts/Leads → Your leads only
My Listings → Your properties only
Opportunities → Your deals only
Settings → Your account settings
```

### Admin Dashboard (If You Were Admin):
```
Dashboard → System-wide metrics
All Agents → Manage all agents
All Properties → View all listings
All Leads → System-wide leads
System Settings → Configure platform
User Management → Manage accounts
```

---

## Next Steps

1. ✅ **Role display is now working** - You can see you're logged in as AGENT
2. 📝 **Create your first listing** - Click "Create Listing"
3. 👥 **Add some test leads** - Go to "Contacts / Leads"
4. 📊 **Watch your dashboard populate** - Metrics will update automatically

---

## Need Help?

- **Dashboard not loading?** - Check if backend is running on port 5000
- **Role not showing?** - Clear browser cache and log in again
- **Can't create listings?** - Make sure you're logged in as an agent
- **Missing features?** - Check your role - some features are role-restricted

---

**Your dashboard is now properly configured with role display! 🎉**

Refresh your browser to see the changes.
