# 👥 User Roles & Workflows - KW Real Estate Platform

## Overview

The platform has **3 main roles**:

1. **Public User** (No login required)
2. **Registered User** (role: "user")
3. **Agent** (role: "agent")
4. **Admin** (role: "admin") - *Not fully implemented*

---

## 1️⃣ PUBLIC USER (No Login)

### Access Level
- Can browse the website without creating an account
- Limited to public-facing features only

### Workflow & Tasks

#### A. Property Search
1. Visit homepage
2. Search for properties by city/location
3. Use advanced filters:
   - Price range ($0 - $5M)
   - Bedrooms (Any, 1+, 2+, 3+, 4+, 5+)
   - Bathrooms (Any, 1+, 2+, 3+, 4+)
   - Property type (Single Family, Condo, Townhouse, etc.)
   - Sort by: Newest, Price (Low/High), Bedrooms, Sq Ft
4. View property details
5. See property location on map
6. View agent information for each property

#### B. Agent Discovery
1. Browse all agents
2. Search agents by name
3. Filter by:
   - Languages spoken
   - Luxury specialist
4. View agent profiles:
   - Contact information
   - Active listings
   - Reviews and ratings
   - Specialties

#### C. Lead Capture Tools
1. **Mortgage Calculator**:
   - Input home price, down payment, interest rate, loan term
   - See monthly payment calculation
   - Submit contact info to get matched with loan specialist
   
2. **Home Value Estimator**:
   - Enter property address
   - Provide contact information
   - Request free home valuation from local agent

#### D. City Landing Pages
1. Visit city-specific pages (e.g., /homes/austin)
2. View market statistics for that city
3. Browse featured listings
4. Request home valuation for properties in that area

#### E. Contact Agents
1. Fill out contact form on property pages
2. Submit inquiry (becomes a lead for the agent)
3. Agent receives notification and can respond

### Expected Tasks
- ✅ Browse properties
- ✅ Search and filter listings
- ✅ View property details
- ✅ Find and contact agents
- ✅ Use mortgage calculator
- ✅ Request home valuations
- ✅ Submit inquiries (creates leads)
- ❌ Cannot save favorites
- ❌ Cannot access dashboard
- ❌ Cannot manage listings

---

## 2️⃣ REGISTERED USER (role: "user")

### Access Level
- All public features PLUS
- Personal account management
- Saved searches (not yet implemented)
- Favorites (not yet implemented)

### Workflow & Tasks

#### A. Account Creation
1. Click "Sign Up" from homepage
2. Provide:
   - First name
   - Last name
   - Email address
   - Password
3. Account created automatically
4. Redirected to dashboard (currently shows agent dashboard - needs fix)

#### B. Login
1. Click "Login" from homepage
2. Enter email and password
3. Access personal account

#### C. Profile Management
1. View/edit personal information
2. Update contact details
3. Change password

#### D. Enhanced Property Features (Planned)
- Save favorite properties
- Create saved searches
- Get notifications for new listings
- Track property viewing history

### Expected Tasks
- ✅ All public user tasks
- ✅ Create and manage account
- ✅ Login/logout
- ⚠️ Save favorite properties (not implemented)
- ⚠️ Saved searches (not implemented)
- ⚠️ Property alerts (not implemented)

### Current Limitation
- Regular users currently see agent dashboard (needs role-based routing fix)
- Should have a separate user dashboard for saved properties and searches

---

## 3️⃣ AGENT (role: "agent")

### Access Level
- All public features PLUS
- Full agent dashboard at `/command`
- Lead management system
- Property listing management
- Sales pipeline tools

### Workflow & Tasks

#### A. Agent Onboarding
1. Admin creates agent account (or agent signs up via "Become an Agent")
2. Agent profile created with:
   - Name, license number
   - Brokerage information
   - Contact details
   - Languages spoken
   - Specialties (luxury, first-time buyers, etc.)
   - Profile photo

#### B. Login & Dashboard Access
1. Login with agent credentials
2. Redirected to `/command` (agent dashboard)
3. View KPIs:
   - Active listings count
   - Total portfolio volume
   - New leads count
   - Sales pipeline count

#### C. Property Management (`/command/listings`)

**Create New Listing:**
1. Click "Create New" button
2. Fill out property form:
   - Address (street, city, state, zip)
   - Price
   - Bedrooms, bathrooms, square footage
   - Property type
   - Status (Active, Pending, Sold)
   - Photos (URL for now)
3. Submit to publish listing
4. Property appears on public site immediately

**Manage Existing Listings:**
1. View all properties in table format
2. Search/filter listings
3. Edit property details
4. Update status (Active → Pending → Sold)
5. Delete listings
6. View property on public site

#### D. Lead Management (`/command/leads`)

**View All Leads:**
1. See table of all inquiries
2. Lead information includes:
   - Contact name, email, phone
   - Message/inquiry details
   - Property of interest (if applicable)
   - Date received
   - Current status

**Update Lead Status:**
1. Change status via dropdown:
   - **New** → Just received, needs attention
   - **Contacted** → Agent has reached out
   - **Qualified** → Serious buyer, pre-approved
   - **Closed** → Deal completed
   - **Lost** → Opportunity lost
2. Status updates automatically save

**Contact Leads:**
1. Click email link to send email
2. Click phone link to call
3. View full conversation history

#### E. Lead Inbox (`/command/inbox`)

**Message Management:**
1. View leads in inbox sidebar
2. Click lead to see full details:
   - Complete message
   - Contact information
   - Referenced property (if any)
3. Reply to leads (UI ready, backend needs implementation)
4. Star important leads
5. Archive/delete old leads

#### F. Opportunities Pipeline (`/command/opportunities`)

**Sales Pipeline Management:**
1. View deals in kanban board:
   - **Cultivate** → Early stage prospects
   - **Appointment** → Scheduled viewings
   - **Active** → Actively negotiating
   - **Under Contract** → Offer accepted
   - **Closed** → Deal completed
2. Each deal card shows:
   - Client name
   - Property type
   - Deal value
   - Probability percentage
3. Track total volume per stage
4. Create new opportunities
5. Toggle between Listings and Buyers views

#### G. Agent Settings (`/command/settings`)

**Profile Management:**
1. Update personal information:
   - Name, email, phone
   - Service area
   - Specialties
   - Professional bio
2. Upload profile photo
3. Update contact preferences
4. Change password

#### H. Public Profile
1. Agent profile visible at `/agents/:id`
2. Shows:
   - Contact information
   - Active listings
   - Reviews and ratings
   - Specialties and languages
3. Public can contact agent directly

### Expected Tasks

**Daily Tasks:**
- ✅ Check new leads in dashboard
- ✅ Respond to inquiries via email/phone
- ✅ Update lead statuses
- ✅ Review opportunities pipeline
- ✅ Update property statuses

**Weekly Tasks:**
- ✅ Add new listings
- ✅ Update property information
- ✅ Review and respond to all leads
- ✅ Move deals through pipeline
- ✅ Update profile information

**Monthly Tasks:**
- ✅ Review closed deals
- ✅ Analyze lead sources
- ✅ Update portfolio statistics
- ✅ Clean up old/inactive leads

### Agent Success Metrics
- Number of active listings
- Total portfolio value
- Lead response time
- Conversion rate (leads → closed deals)
- Average deal size

---

## 4️⃣ ADMIN (role: "admin")

### Access Level (Planned - Not Fully Implemented)
- All agent features PLUS
- User management
- Agent approval/management
- Platform analytics
- System configuration

### Planned Workflow & Tasks

#### A. User Management
- View all users
- Create/edit/delete user accounts
- Assign roles
- Reset passwords
- Suspend accounts

#### B. Agent Management
- Approve new agent applications
- Verify licenses
- Manage agent profiles
- Assign territories
- Monitor agent performance

#### C. Content Management
- Manage property listings
- Moderate reviews
- Update city pages
- Manage featured listings

#### D. Analytics & Reporting
- Platform usage statistics
- Lead generation metrics
- Property performance
- Agent performance reports
- Revenue tracking

#### E. System Configuration
- Update platform settings
- Manage email templates
- Configure integrations
- Set commission rates

### Expected Tasks (When Implemented)
- ⚠️ Approve agent applications
- ⚠️ Monitor platform activity
- ⚠️ Generate reports
- ⚠️ Manage users and permissions
- ⚠️ Configure system settings

---

## 🔄 Complete User Journey Examples

### Example 1: Home Buyer Journey

1. **Public User** visits site
2. Searches for properties in Austin
3. Filters: $400K-$600K, 3+ beds, 2+ baths
4. Views property details
5. Fills out contact form → **Creates Lead**
6. **Agent** receives lead notification
7. Agent changes status to "Contacted"
8. Agent calls buyer
9. Agent schedules showing
10. Agent moves to "Qualified" status
11. Buyer makes offer
12. Agent moves to "Under Contract"
13. Deal closes
14. Agent marks as "Closed"

### Example 2: Home Seller Journey

1. **Public User** visits site
2. Goes to "Home Value" page
3. Enters property address
4. Submits contact info → **Creates Lead**
5. **Agent** receives valuation request
6. Agent contacts seller
7. Agent provides market analysis
8. Seller agrees to list
9. **Agent** creates new listing
10. Property appears on public site
11. Buyers inquire → **New Leads**
12. Agent manages showings
13. Offer accepted
14. Agent updates status to "Pending"
15. Deal closes
16. Agent updates to "Sold"

### Example 3: Agent Daily Workflow

**Morning:**
1. Login to dashboard
2. Check new leads (3 new overnight)
3. Respond to urgent inquiries
4. Update lead statuses

**Midday:**
1. Add new listing from client
2. Update photos for existing property
3. Change property status to "Pending"

**Afternoon:**
1. Check opportunities pipeline
2. Move 2 deals to "Under Contract"
3. Follow up with qualified leads

**Evening:**
1. Review day's activity
2. Plan tomorrow's showings
3. Respond to remaining messages

---

## 📊 Role Comparison Table

| Feature | Public | User | Agent | Admin |
|---------|--------|------|-------|-------|
| Browse Properties | ✅ | ✅ | ✅ | ✅ |
| Search & Filter | ✅ | ✅ | ✅ | ✅ |
| View Property Details | ✅ | ✅ | ✅ | ✅ |
| Contact Agents | ✅ | ✅ | ✅ | ✅ |
| Mortgage Calculator | ✅ | ✅ | ✅ | ✅ |
| Home Value Tool | ✅ | ✅ | ✅ | ✅ |
| Create Account | ✅ | ✅ | ✅ | ✅ |
| Save Favorites | ❌ | ⚠️ | ✅ | ✅ |
| Saved Searches | ❌ | ⚠️ | ✅ | ✅ |
| Agent Dashboard | ❌ | ❌ | ✅ | ✅ |
| Manage Listings | ❌ | ❌ | ✅ | ✅ |
| Lead Management | ❌ | ❌ | ✅ | ✅ |
| Sales Pipeline | ❌ | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ❌ | ⚠️ |
| Platform Analytics | ❌ | ❌ | ❌ | ⚠️ |

**Legend:**
- ✅ Fully implemented
- ⚠️ Partially implemented or planned
- ❌ Not available

---

## 🎯 Test Accounts

### Agent Accounts (Full Dashboard Access)
```
Email: sarah.j@kw.com
Password: password123
Role: agent
Has: 3 properties, 2 leads
```

```
Email: m.chen@kw.com
Password: password123
Role: agent
Has: 3 properties, 2 leads
```

```
Email: j.martinez@kw.com
Password: password123
Role: agent
Has: 2 properties, 2 leads
```

### Regular User Account
```
Email: test@example.com
Password: password123
Role: user
Has: No properties or leads
```

### Admin Account
```
Email: admin@kw.com
Password: password123
Role: admin
Has: Full access (when implemented)
```

---

## 🚀 Next Steps for Role Enhancement

### For Regular Users:
1. Create separate user dashboard
2. Implement saved properties
3. Add saved searches
4. Property viewing history
5. Email notifications for new listings

### For Agents:
1. Email integration for lead responses
2. Calendar integration for showings
3. Document management
4. Commission calculator
5. Performance analytics

### For Admins:
1. Complete admin dashboard
2. User management interface
3. Agent approval workflow
4. Platform analytics
5. System configuration panel

---

**Current Status**: Phases 1-4 complete with full agent workflow implemented. Regular user and admin features are partially implemented and ready for enhancement in Phase 5.
