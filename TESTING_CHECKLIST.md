# ✅ Testing Checklist - KW Real Estate Platform

Use this checklist to verify all features are working correctly.

---

## 🔧 Setup Verification

- [ ] Node.js 18+ installed
- [ ] PostgreSQL running (`pg_isready`)
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] Database created (`createdb kw_realestate`)
- [ ] Database seeded (`cd backend && npm run db:seed`)
- [ ] Both servers running (`npm run dev` from root)
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend accessible at http://localhost:5000

---

## 🌐 Public Features (No Login Required)

### Homepage
- [ ] Page loads without errors
- [ ] Hero section displays
- [ ] Navigation menu works
- [ ] "Find Properties" button works
- [ ] "Find an Agent" button works
- [ ] Footer displays

### Properties Page
- [ ] All properties display
- [ ] Search by query works
- [ ] Price range filter works
- [ ] Bedroom filter works (Any, 1+, 2+, 3+, 4+, 5+)
- [ ] Bathroom filter works (Any, 1+, 2+, 3+, 4+)
- [ ] Property type filter works
- [ ] Sort by newest works
- [ ] Sort by price (low to high) works
- [ ] Sort by price (high to low) works
- [ ] Sort by bedrooms works
- [ ] Sort by sqft works
- [ ] Filter count badge shows active filters
- [ ] Clear filters button works
- [ ] Map toggle works
- [ ] Property cards display correctly
- [ ] Click on property goes to detail page

### Property Details
- [ ] Property information displays
- [ ] Agent information displays
- [ ] Contact form displays
- [ ] Contact form submits successfully
- [ ] Success notification appears
- [ ] Similar properties section works

### Agent Search
- [ ] All agents display
- [ ] Search by name works
- [ ] Language filter works
- [ ] Luxury filter works
- [ ] Agent cards display correctly
- [ ] Click on agent goes to profile page

### Agent Profile
- [ ] Agent information displays
- [ ] Agent's properties display
- [ ] Contact form works
- [ ] Reviews display (if any)

### City Pages
- [ ] Visit /homes/austin
- [ ] Market stats display
- [ ] Featured listings display
- [ ] Home valuation form works
- [ ] Neighborhood links work

### Mortgage Calculator
- [ ] Page loads
- [ ] Home price slider works
- [ ] Down payment slider works
- [ ] Interest rate slider works
- [ ] Loan term slider works
- [ ] Monthly payment calculates correctly
- [ ] Total interest displays
- [ ] Loan amount displays
- [ ] Lead capture form works
- [ ] Success notification appears

### Home Value Estimator
- [ ] Page loads
- [ ] Step 1: Address input works
- [ ] Continue button enables when address entered
- [ ] Step 2: Contact form displays
- [ ] Back button works
- [ ] Submit button works
- [ ] Success page displays
- [ ] Browse listings button works
- [ ] Find agent button works

### Authentication
- [ ] Sign up page loads
- [ ] Sign up form validation works
- [ ] Create account successfully
- [ ] Redirect to dashboard after signup
- [ ] Login page loads
- [ ] Login form validation works
- [ ] Login with test credentials works
- [ ] Redirect to dashboard after login
- [ ] Logout works

### Error Handling
- [ ] Visit /invalid-route shows 404 page
- [ ] 404 page has "Go Home" button
- [ ] 404 page has "Browse Properties" button
- [ ] Network errors show notifications
- [ ] Form validation shows error messages

---

## 🔐 Agent Dashboard (Login Required)

**Login with**: sarah.j@kw.com / password123

### Dashboard
- [ ] Dashboard loads after login
- [ ] Active listings count displays
- [ ] Total volume displays
- [ ] New leads count displays
- [ ] Sales pipeline count displays
- [ ] Recent lead activity table displays
- [ ] Active listings sidebar displays
- [ ] Click on lead opens details
- [ ] Click on listing opens property page
- [ ] "View All" button works

### Leads Page
- [ ] Leads table displays
- [ ] All leads show correct information
- [ ] Status dropdown works
- [ ] Change status updates lead
- [ ] Success message appears
- [ ] Property interest link works
- [ ] Email link works (opens email client)
- [ ] Phone link works (opens phone app)
- [ ] Search leads works
- [ ] Pagination works
- [ ] Export CSV button displays

### Lead Inbox
- [ ] Inbox sidebar displays leads
- [ ] Click on lead shows details
- [ ] Selected lead highlights
- [ ] Lead message displays
- [ ] Property reference shows (if applicable)
- [ ] Contact information displays
- [ ] Reply button displays
- [ ] Star button works
- [ ] Delete button works
- [ ] Search leads works

### My Listings
- [ ] Listings table displays
- [ ] All listings show correct information
- [ ] View button opens property page
- [ ] Edit button displays
- [ ] Delete button shows confirmation
- [ ] Delete removes listing
- [ ] "Create New" button opens modal
- [ ] Create listing form displays
- [ ] All form fields work
- [ ] Submit creates new listing
- [ ] Success message appears
- [ ] New listing appears in table
- [ ] Search listings works
- [ ] Pagination works

### Opportunities
- [ ] Pipeline columns display (5 stages)
- [ ] Deal cards display in correct columns
- [ ] Deal information shows correctly
- [ ] Probability progress bars display
- [ ] Volume totals calculate correctly
- [ ] "Create Opportunity" button displays
- [ ] Toggle between Listings/Buyers works

### Agent Settings
- [ ] Settings page loads
- [ ] Profile photo displays
- [ ] "Change Photo" button displays
- [ ] Name field pre-filled
- [ ] Email field pre-filled
- [ ] Phone field pre-filled
- [ ] All form fields editable
- [ ] Save button works
- [ ] Success message appears

### Navigation
- [ ] Dashboard link works
- [ ] Leads link works
- [ ] Inbox link works
- [ ] Listings link works
- [ ] Opportunities link works
- [ ] Settings link works
- [ ] Logout works
- [ ] User name displays in header

---

## 🔌 API Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```
- [ ] Returns `{"status":"ok"}`

### Properties
```bash
# Get all properties
curl http://localhost:5000/api/properties

# Search properties
curl http://localhost:5000/api/properties?q=austin

# Get property by ID
curl http://localhost:5000/api/properties/p1
```
- [ ] Returns array of properties
- [ ] Search filters correctly
- [ ] Single property returns correctly

### Agents
```bash
# Get all agents
curl http://localhost:5000/api/agents

# Get agent by ID
curl http://localhost:5000/api/agents/a1
```
- [ ] Returns array of agents
- [ ] Single agent includes properties and leads

### Leads
```bash
# Create lead
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "(512) 555-0000",
    "message": "Test message"
  }'

# Get all leads
curl http://localhost:5000/api/leads
```
- [ ] Lead created successfully
- [ ] Returns array of leads

### Authentication
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "newuser@test.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah.j@kw.com",
    "password": "password123"
  }'
```
- [ ] Registration creates user
- [ ] Login returns user data

---

## 📱 Responsive Design

### Desktop (1920x1080)
- [ ] All pages display correctly
- [ ] Navigation menu full width
- [ ] Property grid shows 4 columns
- [ ] Agent grid shows 4 columns
- [ ] Dashboard cards in row
- [ ] Tables display all columns

### Tablet (768x1024)
- [ ] All pages display correctly
- [ ] Navigation menu responsive
- [ ] Property grid shows 2 columns
- [ ] Agent grid shows 2 columns
- [ ] Dashboard cards stack
- [ ] Tables scroll horizontally

### Mobile (375x667)
- [ ] All pages display correctly
- [ ] Navigation menu hamburger
- [ ] Property grid shows 1 column
- [ ] Agent grid shows 1 column
- [ ] Dashboard cards stack
- [ ] Tables scroll horizontally
- [ ] Forms full width
- [ ] Buttons full width

---

## 🎨 UI/UX Testing

### Visual Design
- [ ] Colors consistent (KW red #b40101, dark #111827)
- [ ] Fonts load correctly
- [ ] Icons display properly
- [ ] Images load
- [ ] Spacing consistent
- [ ] Borders and shadows correct

### Interactions
- [ ] Buttons have hover states
- [ ] Links have hover states
- [ ] Forms have focus states
- [ ] Inputs have validation states
- [ ] Modals open/close smoothly
- [ ] Drawers slide in/out
- [ ] Notifications appear/disappear
- [ ] Loading states show

### Accessibility
- [ ] Tab navigation works
- [ ] Form labels present
- [ ] Alt text on images
- [ ] Color contrast sufficient
- [ ] Error messages clear
- [ ] Success messages clear

---

## 🐛 Error Scenarios

### Network Errors
- [ ] Stop backend server
- [ ] Try to load properties
- [ ] Error notification appears
- [ ] Page doesn't crash

### Invalid Data
- [ ] Submit empty forms
- [ ] Validation errors show
- [ ] Submit invalid email
- [ ] Email validation works
- [ ] Submit invalid phone
- [ ] Phone validation works

### Missing Resources
- [ ] Visit /properties/invalid-id
- [ ] 404 or error message shows
- [ ] Visit /agents/invalid-id
- [ ] 404 or error message shows

### Authentication
- [ ] Try to access /command without login
- [ ] Redirects to login
- [ ] Login with wrong password
- [ ] Error message shows
- [ ] Login with non-existent email
- [ ] Error message shows

---

## 📊 Data Verification

### Database
```bash
# Connect to database
psql kw_realestate

# Check counts
SELECT COUNT(*) FROM "Agent";    -- Should be 12
SELECT COUNT(*) FROM "Property"; -- Should be 30
SELECT COUNT(*) FROM "Lead";     -- Should be 25
SELECT COUNT(*) FROM "User";     -- Should be 5
```
- [ ] Agent count correct
- [ ] Property count correct
- [ ] Lead count correct
- [ ] User count correct

### Seed Data
- [ ] Agents have diverse profiles
- [ ] Properties in multiple cities
- [ ] Leads have various statuses
- [ ] Users have correct roles
- [ ] Relationships correct (agent → properties, agent → leads)

---

## ✅ Final Verification

- [ ] All public features work
- [ ] All agent dashboard features work
- [ ] All API endpoints work
- [ ] Responsive design works
- [ ] Error handling works
- [ ] Data integrity maintained
- [ ] No console errors
- [ ] No terminal errors
- [ ] Performance acceptable
- [ ] Ready for demo/presentation

---

## 📝 Notes

Use this space to note any issues found:

```
Issue 1: 
Issue 2: 
Issue 3: 
```

---

## 🎉 Completion

When all items are checked:
- ✅ Platform is fully tested
- ✅ Ready for user testing
- ✅ Ready for demo
- ✅ Ready for deployment (with Phase 6)

**Date Tested**: _______________
**Tested By**: _______________
**Result**: ☐ Pass  ☐ Fail (see notes)
