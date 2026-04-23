# 🌐 PHASE A: PUBLIC USER TESTING (No Login Required)

**Goal**: Test all features available to visitors without an account

**Time Estimate**: 30-45 minutes

**Prerequisites**:
- Backend running on http://localhost:5000
- Frontend running on http://localhost:3000
- Database seeded with test data
- Use incognito/private browser window (to ensure no cached login)

---

## A1: Homepage & Navigation (5 min)

### Test Steps:
1. Open http://localhost:3000
2. Verify homepage loads without errors
3. Check header navigation:
   - [ ] "Properties" link works
   - [ ] "Find an Agent" link works
   - [ ] "Login" button visible
   - [ ] "Sign Up" button visible
4. Check hero section displays
5. Scroll down and verify all sections load:
   - [ ] Expert section
   - [ ] Entrepreneurs section
   - [ ] Informed section
6. Check footer displays with links
7. Click logo - should return to homepage

**Expected Result**: All navigation works, no console errors, images load

---

## A2: Property Search & Filtering (15 min)

### Test Steps:

#### Basic Search:
1. Click "Properties" in navigation
2. Verify properties page loads
3. Count properties displayed (should see 30 properties)
4. Check property cards show:
   - [ ] Property image
   - [ ] Price
   - [ ] Address
   - [ ] Beds/baths/sqft
   - [ ] Agent name

#### Advanced Filtering:
5. Click "More Filters" button
6. **Test Price Filter**:
   - [ ] Move price slider to $400K - $800K
   - [ ] Verify only properties in that range show
   - [ ] Check property count updates
   
7. **Test Bedroom Filter**:
   - [ ] Click "3+" bedrooms
   - [ ] Verify only 3+ bedroom properties show
   - [ ] Check filter badge shows "1 FILTER ACTIVE"

8. **Test Bathroom Filter**:
   - [ ] Click "2+" bathrooms
   - [ ] Verify only 2+ bathroom properties show
   - [ ] Check filter badge shows "2 FILTERS ACTIVE"

9. **Test Property Type**:
   - [ ] Select "Single Family" from dropdown
   - [ ] Verify only single family homes show
   - [ ] Check filter badge shows "3 FILTERS ACTIVE"

10. **Test Clear Filters**:
    - [ ] Click "Clear All" button
    - [ ] Verify all properties show again
    - [ ] Check filter count returns to 0

#### Sorting:
11. **Test Sort Options**:
    - [ ] Sort by "Price: Low to High" - verify order
    - [ ] Sort by "Price: High to Low" - verify order
    - [ ] Sort by "Most Bedrooms" - verify order
    - [ ] Sort by "Largest Sq Ft" - verify order
    - [ ] Sort by "Newest" - return to default

#### Map View:
12. **Test Map Toggle**:
    - [ ] Click "SHOW MAP" button
    - [ ] Verify map appears on right side
    - [ ] Check property pins show on map
    - [ ] Click "HIDE MAP" button
    - [ ] Verify map disappears, grid expands

#### Search by Query:
13. Go to search bar in header
14. Type "Austin" and press Enter
15. Verify only Austin properties show
16. Try searching "Round Rock"
17. Verify only Round Rock properties show

**Expected Result**: All filters work correctly, property count updates, no errors

---

## A3: Property Details Page (10 min)

### Test Steps:
1. From properties page, click on any property card
2. Verify property detail page loads
3. Check all information displays:
   - [ ] Large property image
   - [ ] Price prominently displayed
   - [ ] Full address
   - [ ] Beds, baths, sqft
   - [ ] Property type
   - [ ] Status (Active/Pending)
   - [ ] Property description (if any)

4. **Agent Information Section**:
   - [ ] Agent photo displays
   - [ ] Agent name
   - [ ] Brokerage name
   - [ ] Phone number
   - [ ] Email address
   - [ ] "Contact Agent" button visible

5. **Contact Form**:
   - [ ] Fill out form with test data:
     - Name: "Test Buyer"
     - Email: "testbuyer@example.com"
     - Phone: "(555) 123-4567"
     - Message: "Interested in viewing this property"
   - [ ] Click "Send Message" button
   - [ ] Verify success notification appears
   - [ ] Check form clears after submission

6. **Similar Properties** (if implemented):
   - [ ] Scroll down to see similar properties
   - [ ] Verify 3-4 similar properties show

7. **Navigation**:
   - [ ] Click agent name - should go to agent profile
   - [ ] Use back button to return
   - [ ] Click breadcrumb to return to properties

**Expected Result**: All property details display, contact form submits successfully

---

## A4: Agent Search & Profiles (10 min)

### Test Steps:

#### Agent Directory:
1. Click "Find an Agent" in navigation
2. Verify agents page loads
3. Count agents displayed (should see 12 agents)
4. Check agent cards show:
   - [ ] Agent photo
   - [ ] Name
   - [ ] Brokerage
   - [ ] Rating (stars)
   - [ ] Number of reviews
   - [ ] Languages
   - [ ] "Luxury" badge (if applicable)

#### Search Agents:
5. Use search bar to search "Sarah"
6. Verify only Sarah Jenkins shows
7. Clear search
8. Try searching "Chen"
9. Verify only Michael Chen shows

#### Filter Agents:
10. **Test Language Filter**:
    - [ ] Select "Spanish" from language dropdown
    - [ ] Verify only Spanish-speaking agents show

11. **Test Luxury Filter**:
    - [ ] Click "Luxury Expert" button
    - [ ] Verify only luxury specialists show

#### Agent Profile:
12. Click on any agent card
13. Verify agent profile page loads
14. Check profile displays:
    - [ ] Large agent photo
    - [ ] Full name
    - [ ] Contact information (phone, email)
    - [ ] Brokerage
    - [ ] License number
    - [ ] Languages
    - [ ] Rating and reviews
    - [ ] Specialties

15. **Agent's Listings**:
    - [ ] Scroll down to see agent's properties
    - [ ] Verify 2-3 properties display
    - [ ] Click on a property - should go to property details

16. **Contact Agent Form**:
    - [ ] Fill out contact form:
      - Name: "Test Client"
      - Email: "testclient@example.com"
      - Phone: "(555) 987-6543"
      - Message: "Looking for a home in Austin"
    - [ ] Submit form
    - [ ] Verify success notification

**Expected Result**: Agent search works, profiles display correctly, contact forms submit

---

## A5: Lead Capture Tools (15 min)

### Mortgage Calculator:
1. Click "Mortgage Calculator" in navigation (or visit /mortgage-calculator)
2. Verify calculator page loads
3. **Test Calculations**:
   - [ ] Move home price slider to $500,000
   - [ ] Verify monthly payment updates in real-time
   - [ ] Move down payment slider to 20%
   - [ ] Verify down payment amount shows $100,000
   - [ ] Move interest rate slider to 7.0%
   - [ ] Verify monthly payment recalculates
   - [ ] Move loan term slider to 30 years
   - [ ] Check total interest displays
   - [ ] Check loan amount displays

4. **Test Lead Capture**:
   - [ ] Fill out form:
     - Name: "Test Borrower"
     - Email: "borrower@example.com"
     - Phone: "(555) 111-2222"
   - [ ] Click "MATCH ME WITH A LOAN SPECIALIST"
   - [ ] Verify success notification appears

### Home Value Estimator:
5. Visit /home-value page
6. Verify home value page loads
7. **Step 1 - Address**:
   - [ ] Enter address: "123 Test Street, Austin, TX 78701"
   - [ ] Click "CONTINUE →" button
   - [ ] Verify Step 2 appears

8. **Step 2 - Contact Info**:
   - [ ] Fill out form:
     - Name: "Test Seller"
     - Email: "seller@example.com"
     - Phone: "(555) 333-4444"
     - Timeline: "Within 6 months"
   - [ ] Click "GET FREE VALUATION" button
   - [ ] Verify success page appears
   - [ ] Check success message displays address
   - [ ] Verify "Browse Listings" button works
   - [ ] Verify "Find an Agent" button works

**Expected Result**: Calculators work correctly, forms submit, leads created

---

## A6: City Landing Pages (5 min)

### Test Steps:
1. Visit /homes/austin
2. Verify city page loads
3. Check page displays:
   - [ ] City name in hero ("Homes for Sale in Austin")
   - [ ] Market statistics (4 stat boxes)
   - [ ] Featured listings (6 properties)
   - [ ] Home valuation form
   - [ ] Neighborhood links (6 neighborhoods)

4. **Test Market Stats**:
   - [ ] Verify median price shows
   - [ ] Verify days on market shows
   - [ ] Verify price change percentage shows
   - [ ] Verify active listings count shows

5. **Test Featured Listings**:
   - [ ] Click on a property card
   - [ ] Verify goes to property details

6. **Test Valuation Form**:
   - [ ] Fill out form in bottom section
   - [ ] Submit form
   - [ ] Verify success notification

7. **Test Neighborhoods**:
   - [ ] Click "Downtown" neighborhood
   - [ ] Verify searches for "austin downtown"

8. Try other cities:
   - [ ] Visit /homes/round-rock
   - [ ] Visit /homes/cedar-park
   - [ ] Verify each loads with correct city name

**Expected Result**: City pages load dynamically, all features work

---

## A7: Error Handling (5 min)

### Test Steps:
1. **Test 404 Page**:
   - [ ] Visit /invalid-page-url
   - [ ] Verify 404 page displays
   - [ ] Check "Go Home" button works
   - [ ] Check "Browse Properties" button works

2. **Test Invalid Property**:
   - [ ] Visit /properties/invalid-id
   - [ ] Verify error message or 404 shows

3. **Test Invalid Agent**:
   - [ ] Visit /agents/invalid-id
   - [ ] Verify error message or 404 shows

4. **Test Form Validation**:
   - [ ] Try submitting contact form with empty fields
   - [ ] Verify validation errors show
   - [ ] Try invalid email format
   - [ ] Verify email validation works

**Expected Result**: Errors handled gracefully, user-friendly messages

---

## ✅ PHASE A COMPLETION CHECKLIST

- [ ] All 30 properties display correctly
- [ ] All 12 agents display correctly
- [ ] Property filtering works (price, beds, baths, type)
- [ ] Property sorting works (5 sort options)
- [ ] Map view toggles correctly
- [ ] Property details pages load
- [ ] Agent profiles load
- [ ] Contact forms submit successfully (creates leads)
- [ ] Mortgage calculator calculates correctly
- [ ] Home value estimator works (2-step form)
- [ ] City pages load dynamically
- [ ] 404 page displays for invalid URLs
- [ ] Form validation works
- [ ] No console errors
- [ ] All images load (except Unsplash network issues)

**Sign-off**: _________________ Date: _________

---

**Next**: Proceed to PHASE B (Registered User Testing)
