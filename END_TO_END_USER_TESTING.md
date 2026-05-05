# End-to-End User Testing Guide ✅

## Goal
Test the complete user journey: Public user browses properties → Contacts agent → Lead appears in agent dashboard

## Setup

### You Need:
1. **Agent Browser** - Your current browser (logged in as agent)
2. **Public User Browser** - Incognito/Private window OR different browser

### URLs:
- **Public Site**: `http://localhost:3001/` or `http://localhost:3001/properties`
- **Agent Dashboard**: `http://localhost:3001/command` (requires login)

## Test Flow

### Step 1: Agent Creates a Listing
**Browser**: Agent (your main browser)
**URL**: `http://localhost:3001/command/listings`

1. Click "Create New" button
2. Fill in property details:
   - Address: "123 Test Street"
   - City: "Austin"
   - State: "TX"
   - ZIP: "78701"
   - Price: $500,000
   - Bedrooms: 3
   - Bathrooms: 2
   - Sq Ft: 2000
3. Upload property images (optional)
4. Click "Publish Listing"
5. ✅ Property appears in your listings table

### Step 2: Public User Browses Properties
**Browser**: Incognito/Private window
**URL**: `http://localhost:3001/properties`

1. You should see a list of properties
2. ✅ Your "123 Test Street" property should appear
3. ✅ Properties are pulled from database (not mock data)
4. Click on your property to view details

### Step 3: Public User Views Property Details
**Browser**: Still in incognito
**URL**: `http://localhost:3001/properties/{property-id}`

1. Property detail page loads
2. ✅ Shows correct address, price, beds, baths
3. ✅ Shows agent information (your name)
4. ✅ "Contact Agent" form is visible on the right side

### Step 4: Public User Submits Contact Form
**Browser**: Still in incognito
**On the property detail page**

1. Fill out the contact form:
   - Full Name: "John Doe"
   - Email: "john@example.com"
   - Phone: "555-1234"
   - Message: "I'm interested in viewing this property"
2. Click "CONTACT AGENT" button
3. ✅ Success message appears: "Inquiry Sent"
4. ✅ Form shows "The agent will contact you shortly"

### Step 5: Agent Sees New Lead
**Browser**: Switch back to agent browser
**URL**: `http://localhost:3001/command/leads`

1. Refresh the page (or navigate to Leads)
2. ✅ New lead appears in the table:
   - Name: "John Doe"
   - Status: "New" (red badge)
   - Property Interest: "123 Test Street" (clickable link)
   - Contact Info: john@example.com, 555-1234
   - Message: "I'm interested in viewing this property"
3. ✅ Lead count badge updates in sidebar

### Step 6: Agent Manages Lead
**Browser**: Agent browser
**On Leads page**

1. Click status dropdown on the lead
2. Change status to "Contacted"
3. ✅ Status updates immediately
4. ✅ Badge color changes from red to blue
5. Click "Call" button
6. ✅ Opens phone dialer with 555-1234
7. Click "Message" button
8. ✅ Opens email client to john@example.com

## What's Dynamic (Real Data):

✅ **Properties List** - Fetches from `/api/properties`
✅ **Property Details** - Fetches from `/api/properties/:id`
✅ **Agent Info** - Fetches from database via property.agent
✅ **Contact Form** - Posts to `/api/leads` (creates real lead)
✅ **Leads Dashboard** - Fetches from `/api/agents/:id` (includes leads)
✅ **Status Updates** - Patches to `/api/leads/:id/status`

## What's Still Mock Data:

⚠️ **Property Photos** - Gallery images are hardcoded Unsplash URLs
⚠️ **Property Description** - Generic text, not from database
⚠️ **Key Features** - Hardcoded list (Hardwood Floors, etc.)
⚠️ **Virtual Tours** - Component exists but may use mock data
⚠️ **Market Reports** - Component exists but may use mock data
⚠️ **Agent Reviews** - Component exists but may use mock data

## Expected Results:

### ✅ WORKING:
- Property creation by agent
- Property listing on public site
- Property detail page
- Contact agent form submission
- Lead creation in database
- Lead appears in agent dashboard
- Lead status management
- Contact actions (call/email)

### ⚠️ NEEDS ENHANCEMENT:
- Property descriptions (currently generic)
- Property photos (only primary image is dynamic)
- Virtual tours integration
- Market data integration
- Review system integration

## Troubleshooting:

### Property doesn't appear on public site:
- Check if property status is "Active"
- Refresh the properties page
- Check browser console for API errors

### Contact form doesn't submit:
- Check browser console for errors
- Verify backend is running on port 5000
- Check network tab for `/api/leads` POST request

### Lead doesn't appear in dashboard:
- Refresh the leads page
- Check if lead was created for correct agent
- Verify agentId matches your logged-in agent

## Success Criteria:

✅ Public user can browse real properties from database
✅ Public user can view property details
✅ Public user can submit contact form
✅ Lead is created in database
✅ Agent sees lead in dashboard
✅ Agent can manage lead status
✅ Agent can contact lead via call/email

## Next Steps After Testing:

If everything works:
1. Add more property details to database schema
2. Make property descriptions dynamic
3. Add multiple photo upload support
4. Integrate virtual tour URLs
5. Add real market data API
6. Build review submission system

The core lead generation flow is **FULLY FUNCTIONAL** and ready to test!
