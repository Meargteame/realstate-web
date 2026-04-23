# 🏢 PHASE C: AGENT TESTING (Full Dashboard - CRITICAL)

**Goal**: Test complete agent workflow and all dashboard features

**Time Estimate**: 45-60 minutes

**Prerequisites**:
- Phase A and B completed successfully
- Backend and frontend running
- Database seeded with agent data
- Use fresh browser session

**Test Account**:
- Email: sarah.j@kw.com
- Password: password123
- Has: 3 properties, 2 leads

---

## C1: Agent Login & Dashboard Overview (10 min)

### Test Steps:

#### Login as Agent:
1. Logout if currently logged in
2. Go to login page
3. Enter credentials:
   - Email: sarah.j@kw.com
   - Password: password123
4. Click "Log In"
5. Verify:
   - [ ] Login successful
   - [ ] Redirected to /command (agent dashboard)
   - [ ] "Sarah Jenkins" appears in header
   - [ ] No console errors

#### Dashboard KPIs:
6. Check all 4 KPI cards display:
   - [ ] **Active Listings**: Shows number (should be 3)
   - [ ] **Total Active Volume**: Shows dollar amount
   - [ ] **New Leads**: Shows count with badge if > 0
   - [ ] **Sales Pipeline**: Shows count

7. Verify KPI calculations:
   - [ ] Active Listings count matches actual properties
   - [ ] Volume = sum of all property prices
   - [ ] New Leads = leads with status "New"
   - [ ] Pipeline = leads with status "Contacted"

#### Recent Activity Section:
8. Check "Recent Lead Activity" table:
   - [ ] Table displays with columns: Contact, Status, Inquiry, Date, Action
   - [ ] Shows Sarah's leads (should see 2 leads)
   - [ ] Each row shows:
     - Contact name and phone
     - Status tag (colored)
     - Message preview
     - Date received
     - Reply button

9. Check "Your Active Listings" sidebar:
   - [ ] Shows Sarah's properties (should see 3)
   - [ ] Each listing shows:
     - Property image
     - Price
     - Address
     - Status tag
     - Arrow button to view

10. **Test Navigation**:
    - [ ] Click on a lead - should show details
    - [ ] Click on a listing - should go to property page
    - [ ] Click "View All" button - should go to leads page

**Expected Result**: Dashboard loads with correct data, all KPIs accurate

---

## C2: Lead Management Page (15 min)

### Test Steps:

#### Navigate to Leads:
1. Click "Leads" in left navigation
2. Verify /command/leads page loads
3. Check page displays:
   - [ ] Page title: "Contact Pipeline"
   - [ ] Search bar
   - [ ] Filters button
   - [ ] Export CSV button
   - [ ] Leads table with all columns

#### View Leads Table:
4. Check table displays correctly:
   - [ ] NAME column with avatar and ID
   - [ ] STATUS column with dropdown
   - [ ] PROPERTY INTEREST column with link
   - [ ] CONTACT INFO column (email, phone)
   - [ ] RECEIVED column with date
   - [ ] ACTION column with Call/Message buttons

5. Verify lead data:
   - [ ] Count total leads (should match dashboard)
   - [ ] Check each lead has complete information
   - [ ] Verify dates are formatted correctly
   - [ ] Check property links work (if applicable)

#### Test Status Updates:
6. Find a lead with status "New"
7. Click status dropdown
8. Change to "Contacted"
9. Verify:
   - [ ] Dropdown updates immediately
   - [ ] Success message appears
   - [ ] Status tag color changes
   - [ ] Dashboard KPI updates (refresh dashboard to check)

10. Test all status transitions:
    - [ ] New → Contacted (works)
    - [ ] Contacted → Qualified (works)
    - [ ] Qualified → Closed (works)
    - [ ] Any → Lost (works)

#### Test Contact Actions:
11. Click email link on a lead
12. Verify:
    - [ ] Opens email client with pre-filled address
    - [ ] Or shows email in browser

13. Click phone link on a lead
14. Verify:
    - [ ] Opens phone app (mobile)
    - [ ] Or shows phone number (desktop)

#### Test Search:
15. Use search bar to search for lead name
16. Type "John" (or any lead name)
17. Verify:
    - [ ] Table filters to matching leads only
    - [ ] Count updates
    - [ ] Clear search returns all leads

#### Test Pagination:
18. If more than 10 leads:
    - [ ] Check pagination controls appear
    - [ ] Click page 2
    - [ ] Verify next set of leads loads
    - [ ] Test page size dropdown (10, 20, 50)

**Expected Result**: All leads display, status updates work, search/filter functional

---

## C3: Lead Inbox (10 min)

### Test Steps:

#### Navigate to Inbox:
1. Click "Inbox" in left navigation
2. Verify /command/inbox page loads
3. Check layout:
   - [ ] Left sidebar with lead list
   - [ ] Right panel for lead details
   - [ ] Search bar in sidebar

#### Inbox Sidebar:
4. Check lead list displays:
   - [ ] All leads shown in chronological order
   - [ ] Each item shows:
     - Lead name
     - Message preview (truncated)
     - Date
     - "New" badge if status is New

5. Test lead selection:
   - [ ] Click on first lead
   - [ ] Verify right panel updates
   - [ ] Check selected lead highlights (red background)
   - [ ] Click different lead
   - [ ] Verify panel updates to new lead

#### Lead Detail Panel:
6. With a lead selected, verify displays:
   - [ ] Large avatar with initial
   - [ ] Full name as title
   - [ ] Email address with icon
   - [ ] Phone number with icon
   - [ ] Star button (favorite)
   - [ ] Delete button

7. Check message section:
   - [ ] Full message text displays
   - [ ] "INQUIRY" tag shows
   - [ ] Timestamp shows
   - [ ] Message is readable (not truncated)

8. If lead references a property:
   - [ ] "Referenced Property" section shows
   - [ ] Property image displays
   - [ ] Property address shows
   - [ ] Property price shows
   - [ ] "View Listing Details" link works

#### Test Actions:
9. Click star button
10. Verify:
    - [ ] Star fills/unfills
    - [ ] Visual feedback

11. Click "Reply to Lead" button
12. Verify:
    - [ ] Button shows (even if not functional)
    - [ ] No errors occur

13. Test search in inbox:
    - [ ] Type lead name in search
    - [ ] Verify list filters
    - [ ] Clear search

**Expected Result**: Inbox displays all leads, selection works, details show correctly

---

## C4: Listings Management (15 min)

### Test Steps:

#### Navigate to Listings:
1. Click "Listings" in left navigation
2. Verify /command/listings page loads
3. Check page displays:
   - [ ] Page title: "My Listings"
   - [ ] Search bar
   - [ ] "Create New" button
   - [ ] Listings table

#### View Listings Table:
4. Check table displays:
   - [ ] PROPERTY column (image + address)
   - [ ] PRICE column (formatted currency)
   - [ ] STATUS column (colored tags)
   - [ ] BED/BATH column
   - [ ] ACTION column (View, Edit, Delete buttons)

5. Verify Sarah's listings:
   - [ ] Count matches dashboard (should be 3)
   - [ ] All property details correct
   - [ ] Images load
   - [ ] Prices formatted correctly

#### Test View Action:
6. Click "View" button on a listing
7. Verify:
   - [ ] Opens property detail page in same/new tab
   - [ ] Property displays correctly
   - [ ] Can navigate back

#### Test Create New Listing:
8. Click "Create New" button
9. Verify modal opens with form
10. Check form fields:
    - [ ] Property Address (required)
    - [ ] City, State, ZIP (required)
    - [ ] Listing Price (required)
    - [ ] Property Type dropdown
    - [ ] Bedrooms, Bathrooms, Sq Footage
    - [ ] Status dropdown

11. **Test Form Validation**:
    - [ ] Try submitting empty form
    - [ ] Verify required field errors
    - [ ] Enter invalid data
    - [ ] Check validation messages

12. **Create Test Listing**:
    - [ ] Fill out complete form:
      - Address: "999 Test Property Lane"
      - City: "Austin"
      - State: "TX"
      - ZIP: "78701"
      - Price: 750000
      - Type: "Single Family"
      - Bedrooms: 4
      - Bathrooms: 3
      - Sqft: 2500
      - Status: "Active"
    - [ ] Click "Publish Listing"
    - [ ] Verify success message
    - [ ] Check new listing appears in table
    - [ ] Verify count increases to 4

13. **Verify New Listing**:
    - [ ] Go to public properties page
    - [ ] Search for "999 Test Property"
    - [ ] Verify listing appears publicly
    - [ ] Check all details correct

#### Test Edit Listing:
14. Click "Edit" button on a listing
15. Verify:
    - [ ] Edit modal/form opens
    - [ ] Fields pre-filled with current data
    - [ ] Can modify fields
    - [ ] Save button works

#### Test Delete Listing:
16. Click "Delete" button on test listing (999 Test Property)
17. Verify:
    - [ ] Confirmation dialog appears
    - [ ] Warning message shows
    - [ ] "Yes, Delete" and "Cancel" buttons

18. Click "Yes, Delete"
19. Verify:
    - [ ] Listing removed from table
    - [ ] Success message appears
    - [ ] Count decreases back to 3
    - [ ] Listing removed from public site

#### Test Search:
20. Use search bar to filter listings
21. Type property address
22. Verify table filters correctly

**Expected Result**: Can view, create, edit, delete listings successfully

---

## C5: Opportunities Pipeline (10 min)

### Test Steps:

#### Navigate to Opportunities:
1. Click "Opportunities" in left navigation
2. Verify /command/opportunities page loads
3. Check page displays:
   - [ ] Page title: "Opportunities"
   - [ ] Listings/Buyers toggle
   - [ ] "Create Opportunity" button
   - [ ] 5 pipeline columns

#### Pipeline Columns:
4. Verify all 5 stages display:
   - [ ] **Cultivate** - Early prospects
   - [ ] **Appointment** - Scheduled viewings
   - [ ] **Active** - Actively negotiating
   - [ ] **Under Contract** - Offer accepted
   - [ ] **Closed** - Deal completed

5. Check each column shows:
   - [ ] Stage name
   - [ ] Deal count badge
   - [ ] Total volume
   - [ ] Deal cards (if any)

#### Deal Cards:
6. For each deal card, verify displays:
   - [ ] Client name
   - [ ] Property type
   - [ ] Deal value (price)
   - [ ] Probability percentage
   - [ ] Progress bar
   - [ ] More options button (...)

7. Check volume calculations:
   - [ ] Each column total = sum of deals in that column
   - [ ] Totals formatted as currency

#### Test Toggle:
8. Click "Buyers" toggle
9. Verify:
   - [ ] View switches (if different data)
   - [ ] Or shows same data

10. Click "Listings" toggle
11. Verify returns to listings view

#### Test Create Opportunity:
12. Click "Create Opportunity" button
13. Verify:
    - [ ] Button shows (even if not fully functional)
    - [ ] No errors occur

**Expected Result**: Pipeline displays correctly, all stages show, volumes calculate

---

## C6: Agent Settings (5 min)

### Test Steps:

#### Navigate to Settings:
1. Click "Settings" in left navigation
2. Verify /command/settings page loads
3. Check page layout:
   - [ ] Left card with profile photo
   - [ ] Right card with form

#### Profile Card:
4. Check displays:
   - [ ] Large profile photo (or placeholder)
   - [ ] "Change Photo" button
   - [ ] Agent name: "Sarah Jenkins"
   - [ ] Brokerage name
   - [ ] Role: "Licensed Associate Broker"
   - [ ] Member since date

#### Settings Form:
5. Check form fields pre-filled:
   - [ ] Full Name: "Sarah Jenkins"
   - [ ] Email: "sarah.j@kw.com"
   - [ ] Phone: "(512) 555-0198"
   - [ ] Location/Service Area
   - [ ] Specialties
   - [ ] Professional Biography

6. **Test Profile Update**:
   - [ ] Change phone to "(512) 555-9999"
   - [ ] Update specialties to "Luxury Homes, First-time Buyers"
   - [ ] Add bio: "Experienced luxury real estate specialist..."
   - [ ] Click "Save Changes"
   - [ ] Verify success message
   - [ ] Refresh page
   - [ ] Verify changes saved

7. **Test Photo Upload**:
   - [ ] Click "Change Photo"
   - [ ] Verify file picker or UI shows
   - [ ] Note: Actual upload not implemented

**Expected Result**: Settings load, profile updates save successfully

---

## C7: Agent Public Profile (5 min)

### Test Steps:

#### View Public Profile:
1. Open new tab/window
2. Go to /agents
3. Find Sarah Jenkins in agent list
4. Click on her card
5. Verify agent profile page loads

#### Check Profile Displays:
6. Verify all information shows:
   - [ ] Profile photo
   - [ ] Name: "Sarah Jenkins"
   - [ ] Brokerage: "KW Austin Southwest"
   - [ ] Phone: "(512) 555-0198" (or updated number)
   - [ ] Email: "sarah.j@kw.com"
   - [ ] License: "DRE# 01234567"
   - [ ] Rating: 4.9 stars
   - [ ] Reviews: 124
   - [ ] Languages: English
   - [ ] Luxury badge (if applicable)

7. Check listings section:
   - [ ] Shows Sarah's 3 properties
   - [ ] Property cards display correctly
   - [ ] Click on property goes to details

8. **Test Contact Form**:
   - [ ] Fill out contact form
   - [ ] Submit inquiry
   - [ ] Verify success message

9. **Verify Lead Created**:
   - [ ] Go back to agent dashboard
   - [ ] Click "Leads"
   - [ ] Check if new lead appears
   - [ ] Verify lead count increased

**Expected Result**: Public profile accurate, contact form creates lead

---

## C8: End-to-End Agent Workflow (10 min)

### Complete Workflow Test:

#### Scenario: New Lead to Closed Deal

1. **Receive Lead** (as public user):
   - [ ] Logout from agent account
   - [ ] Go to a property
   - [ ] Submit contact form as "Test Buyer 2"
   - [ ] Email: "buyer2@test.com"
   - [ ] Message: "Ready to make an offer"

2. **Process Lead** (as agent):
   - [ ] Login as sarah.j@kw.com
   - [ ] Go to dashboard
   - [ ] Verify new lead shows in "New Leads" KPI
   - [ ] Click "Leads" in navigation
   - [ ] Find "Test Buyer 2" lead
   - [ ] Verify status is "New"

3. **Contact Lead**:
   - [ ] Change status to "Contacted"
   - [ ] Verify success message
   - [ ] Go to Inbox
   - [ ] Find "Test Buyer 2"
   - [ ] Read message
   - [ ] Click email/phone link

4. **Qualify Lead**:
   - [ ] Go back to Leads page
   - [ ] Change "Test Buyer 2" status to "Qualified"
   - [ ] Verify dashboard "Sales Pipeline" count increases

5. **Move Through Pipeline**:
   - [ ] Go to Opportunities page
   - [ ] Verify deal appears in appropriate column
   - [ ] (If drag-drop works) Move deal to next stage

6. **Close Deal**:
   - [ ] Go to Leads page
   - [ ] Change "Test Buyer 2" status to "Closed"
   - [ ] Verify success message
   - [ ] Go to Opportunities
   - [ ] Verify deal in "Closed" column

7. **Update Property**:
   - [ ] Go to Listings
   - [ ] Find the property from the lead
   - [ ] Click Edit
   - [ ] Change status to "Sold"
   - [ ] Save changes
   - [ ] Verify property status updated

**Expected Result**: Complete workflow from lead to closed deal works seamlessly

---

## ✅ PHASE C COMPLETION CHECKLIST

### Dashboard:
- [ ] All 4 KPIs display correctly
- [ ] KPI calculations accurate
- [ ] Recent activity table shows leads
- [ ] Active listings sidebar shows properties
- [ ] Navigation works

### Lead Management:
- [ ] All leads display in table
- [ ] Status updates work (all 5 statuses)
- [ ] Email/phone links work
- [ ] Search filters leads
- [ ] Pagination works (if applicable)

### Inbox:
- [ ] Lead list displays in sidebar
- [ ] Lead selection works
- [ ] Full message displays
- [ ] Property references show
- [ ] Actions work (star, delete)

### Listings:
- [ ] All listings display
- [ ] Create new listing works
- [ ] Edit listing works
- [ ] Delete listing works (with confirmation)
- [ ] New listings appear publicly
- [ ] Search filters listings

### Opportunities:
- [ ] All 5 pipeline stages display
- [ ] Deal cards show in correct columns
- [ ] Volume calculations correct
- [ ] Toggle between views works
- [ ] Create opportunity button shows

### Settings:
- [ ] Profile information displays
- [ ] Form pre-filled with agent data
- [ ] Updates save successfully
- [ ] Changes persist after refresh

### Public Profile:
- [ ] Agent profile accessible publicly
- [ ] All information displays correctly
- [ ] Listings show on profile
- [ ] Contact form creates lead

### End-to-End:
- [ ] Complete workflow tested
- [ ] Lead → Contact → Qualify → Close works
- [ ] Property status updates work
- [ ] Dashboard reflects all changes

### No Critical Errors:
- [ ] No console errors in any section
- [ ] No crashes or freezes
- [ ] All forms submit successfully
- [ ] All data persists correctly

**Sign-off**: _________________ Date: _________

---

## 🎉 ALL PHASES COMPLETE!

If all three phases pass:
- ✅ Public features work
- ✅ User authentication works
- ✅ Agent dashboard fully functional
- ✅ Ready for deployment

**Final Step**: Document any issues found and create bug list for fixes before production deployment.
