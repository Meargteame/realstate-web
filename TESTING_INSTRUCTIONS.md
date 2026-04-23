# Testing Instructions - Verify All Fixes

## Prerequisites

1. Backend is running on port 5000
2. Frontend is running on port 3000
3. Database has seed data

Check status:
```bash
./diagnose.sh
```

Should show:
```
✓ Backend is running on port 5000
✓ Frontend is running on port 3000
✓ Database connection successful
```

---

## Quick Test (5 minutes)

### 1. Login as Agent
```
URL: http://localhost:3000/login
Email: sarah.j@kw.com
Password: password123
```

### 2. Test Agent Settings (1 min)
1. Go to: http://localhost:3000/command/settings
2. Change "Professional Biography" field
3. Click "Save Changes"
4. Refresh the page (F5)
5. ✅ Verify your changes are still there

### 3. Test Property Edit (1 min)
1. Go to: http://localhost:3000/command/listings
2. Click the edit icon (pencil) on any property
3. Change the price
4. Click "Update Listing"
5. ✅ Verify the price updated in the table

### 4. Test Opportunities (2 min)
1. Go to: http://localhost:3000/command/opportunities
2. Click "Create Opportunity"
3. Fill in:
   - Client Name: "Test Client"
   - Deal Type: "Luxury Home"
   - Price: 1500000
4. Click "Create"
5. ✅ Verify opportunity appears in "Cultivate" column
6. Click the edit icon on your opportunity
7. Change status to "Appointment"
8. Click "Update"
9. ✅ Verify opportunity moved to "Appointment" column

### 5. Test Lead Export (1 min)
1. Go to: http://localhost:3000/command/leads
2. Click "Export CSV" button
3. ✅ Verify a CSV file downloads
4. Open the CSV file
5. ✅ Verify it contains lead data

---

## Complete Test (15 minutes)

### Test 1: Agent Settings ✅

**Steps:**
1. Go to http://localhost:3000/command/settings
2. Update these fields:
   - Full Name: "Sarah Jenkins Updated"
   - Phone Number: "(512) 555-9999"
   - Service Area: "Austin Metro Area"
   - Professional Biography: "Test bio update"
3. Click "Save Changes"
4. Wait for success message
5. Refresh the page (Ctrl+R or F5)

**Expected:**
- ✅ Success message appears
- ✅ After refresh, all changes are still there
- ✅ No errors in browser console

---

### Test 2: Property Edit ✅

**Steps:**
1. Go to http://localhost:3000/command/listings
2. Find any property in the table
3. Click the edit icon (pencil)
4. Modal opens with property data
5. Change:
   - Price: Add $10,000 to current price
   - Status: Change to "Pending"
6. Click "Update Listing"
7. Wait for success message

**Expected:**
- ✅ Modal opens with current property data
- ✅ Success message appears
- ✅ Property updates in table immediately
- ✅ New price and status show correctly
- ✅ Refresh page - changes persist

---

### Test 3: Property Delete ✅

**Steps:**
1. Go to http://localhost:3000/command/listings
2. Click "Create New" button
3. Create a test property:
   - Address: "123 Test Delete St"
   - City: "Austin"
   - State: "TX"
   - ZIP: "78701"
   - Price: 500000
4. Click "Publish Listing"
5. Find your new property in the table
6. Click the delete icon (trash)
7. Click "Yes, Delete" in confirmation

**Expected:**
- ✅ Property appears in table after creation
- ✅ Confirmation modal appears
- ✅ Property disappears from table
- ✅ Success message shows
- ✅ Refresh page - property is gone

---

### Test 4: Lead Filters ✅

**Steps:**
1. Go to http://localhost:3000/command/leads
2. Note the total number of leads
3. Click "Filters" button
4. Select "New" from status dropdown
5. Close the drawer

**Expected:**
- ✅ Drawer opens with filter options
- ✅ Table updates to show only "New" leads
- ✅ Lead count updates
- ✅ All visible leads have "NEW" tag

---

### Test 5: Lead Export CSV ✅

**Steps:**
1. Go to http://localhost:3000/command/leads
2. Click "Export CSV" button
3. Check your Downloads folder
4. Open the CSV file

**Expected:**
- ✅ File downloads automatically
- ✅ Filename is "leads-YYYY-MM-DD.csv"
- ✅ CSV contains columns: Name, Email, Phone, Status, Message, Property, Date, Favorite
- ✅ All leads are in the file
- ✅ Data is properly formatted

---

### Test 6: Inbox Search ✅

**Steps:**
1. Go to http://localhost:3000/command/inbox
2. Note the number of leads in sidebar
3. Type "john" in the search box
4. Clear the search box

**Expected:**
- ✅ Leads filter as you type
- ✅ Only matching leads show
- ✅ Clearing search shows all leads again
- ✅ Search works on name, email, and message

---

### Test 7: Inbox Star/Favorite ✅

**Steps:**
1. Go to http://localhost:3000/command/inbox
2. Click on any lead in the sidebar
3. Click the star icon (outline)
4. Star should fill in (solid)
5. Click star again
6. Star should become outline again

**Expected:**
- ✅ Star icon toggles between outline and filled
- ✅ Color changes to gold when favorited
- ✅ No page reload needed
- ✅ Refresh page - favorite status persists

---

### Test 8: Inbox Delete ✅

**Steps:**
1. Go to http://localhost:3000/command/inbox
2. Note the total number of leads
3. Click on any lead
4. Click the delete icon (trash, red)
5. Click "OK" in confirmation modal

**Expected:**
- ✅ Confirmation modal appears
- ✅ Lead disappears from sidebar
- ✅ Next lead is automatically selected
- ✅ Lead count decreases by 1
- ✅ Success message appears

---

### Test 9: Inbox Reply ✅

**Steps:**
1. Go to http://localhost:3000/command/inbox
2. Click on any lead
3. Click "Reply to Lead" button

**Expected:**
- ✅ Email client opens (Gmail, Outlook, etc.)
- ✅ "To" field has lead's email
- ✅ Subject line is pre-filled
- ✅ Body has greeting with lead's name

---

### Test 10: Opportunities Create ✅

**Steps:**
1. Go to http://localhost:3000/command/opportunities
2. Click "Create Opportunity" button
3. Fill in form:
   - Client Name: "John Smith"
   - Deal Type: "Investment Property"
   - Price: 850000
   - Status: "Cultivate"
   - Probability: 25
4. Click "Create"

**Expected:**
- ✅ Modal opens with empty form
- ✅ Success message appears
- ✅ Modal closes
- ✅ Opportunity appears in "Cultivate" column
- ✅ Shows correct name, price, probability

---

### Test 11: Opportunities Edit ✅

**Steps:**
1. Go to http://localhost:3000/command/opportunities
2. Find any opportunity card
3. Click the edit icon (pencil)
4. Change:
   - Price: Add $50,000
   - Probability: Increase by 10%
5. Click "Update"

**Expected:**
- ✅ Modal opens with current data
- ✅ Success message appears
- ✅ Card updates immediately
- ✅ New price and probability show

---

### Test 12: Opportunities Status Change ✅

**Steps:**
1. Go to http://localhost:3000/command/opportunities
2. Find any opportunity in "Cultivate" column
3. Click the status dropdown on the card
4. Select "Appointment"

**Expected:**
- ✅ Opportunity moves to "Appointment" column
- ✅ No page reload needed
- ✅ Column counts update
- ✅ Volume totals update

---

### Test 13: Opportunities Delete ✅

**Steps:**
1. Go to http://localhost:3000/command/opportunities
2. Find any opportunity card
3. Click the delete icon (trash)
4. Click "OK" in confirmation

**Expected:**
- ✅ Confirmation modal appears
- ✅ Opportunity disappears
- ✅ Success message shows
- ✅ Column count decreases
- ✅ Volume total updates

---

### Test 14: Opportunities Toggle Type ✅

**Steps:**
1. Go to http://localhost:3000/command/opportunities
2. Note the opportunities shown
3. Click "Buyers" button
4. Click "Listings" button

**Expected:**
- ✅ Button highlights when selected
- ✅ Different opportunities show for each type
- ✅ Columns update with new data
- ✅ Counts and volumes update

---

## Automated Test

Run the automated test script:

```bash
node test-all-fixes.js
```

**Expected Output:**
```
=== Testing All Fixed Endpoints ===

1. Testing PATCH /api/agents/:id (Agent Settings Save)
   ✓ Status: 200
   Agent updated: Sarah Jenkins

2. Testing PATCH /api/properties/:id (Property Edit)
   ✓ Status: 200
   Property updated: 123 Main St

3. Testing DELETE /api/properties/:id (Property Delete)
   ✓ Status: 200
   Property deleted successfully

4. Testing PATCH /api/leads/:id/favorite (Star Lead)
   ✓ Status: 200
   Lead favorite: true

5. Testing DELETE /api/leads/:id (Delete Lead)
   ✓ Status: 200
   Lead deleted successfully

6. Testing GET /api/leads/export (Export CSV)
   ✓ Status: 200
   CSV data length: 1234 characters

7. Testing POST /api/opportunities (Create Opportunity)
   ✓ Status: 201
   Opportunity created: Test Client

8. Testing PATCH /api/opportunities/:id (Update Opportunity)
   ✓ Status: 200
   Opportunity updated: Appointment (50%)

9. Testing GET /api/opportunities (Get Opportunities)
   ✓ Status: 200
   Opportunities count: 1

10. Testing DELETE /api/opportunities/:id (Delete Opportunity)
   ✓ Status: 200
   Opportunity deleted successfully

=== ✓ All Tests Passed! ===
```

---

## Troubleshooting

### Issue: Changes don't persist after refresh

**Solution:**
1. Check backend is running: `./diagnose.sh`
2. Check browser console for errors (F12)
3. Check Network tab - API calls should return 200
4. Verify database: `npx prisma studio` (in backend folder)

### Issue: "Failed to update" error

**Solution:**
1. Check backend logs: `backend/out.log`
2. Verify backend is running on port 5000
3. Check browser console for CORS errors
4. Try hard refresh: Ctrl+Shift+R

### Issue: CSV doesn't download

**Solution:**
1. Check browser's download settings
2. Check browser console for errors
3. Try different browser
4. Check backend logs for export errors

### Issue: Opportunities don't show

**Solution:**
1. Create a new opportunity first
2. Check you're logged in as an agent
3. Verify backend is running
4. Check browser console for errors
5. Try refreshing the page

---

## Success Criteria

All tests should pass with:
- ✅ No errors in browser console
- ✅ No errors in backend logs
- ✅ All changes persist after page refresh
- ✅ All buttons/links work as expected
- ✅ Success messages appear
- ✅ Data updates in real-time

---

## Report Issues

If any test fails:
1. Note which test failed
2. Copy error message from browser console
3. Copy error from backend logs
4. Note steps to reproduce
5. Check COMPLETE_FIX_SUMMARY.md for details

---

## Next Steps After Testing

Once all tests pass:
1. ✅ Mark all items as complete
2. ✅ Deploy to production
3. ✅ Run tests again in production
4. ✅ Train users on new features
5. ✅ Monitor for any issues

**The platform is now fully functional and ready for production!**
