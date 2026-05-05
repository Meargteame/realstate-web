# Manual Testing Checklist

## Overview
This checklist covers all frontend functionality that requires manual testing in a browser.

---

## 🔐 Authentication & Authorization

### Login Page
- [ ] Navigate to `/login`
- [ ] Enter valid credentials
- [ ] Click "Login" button
- [ ] Verify redirect to appropriate dashboard
- [ ] Verify role is displayed correctly

### Registration
- [ ] Navigate to `/register`
- [ ] Fill registration form
- [ ] Submit form
- [ ] Verify account created
- [ ] Verify email validation works

### Logout
- [ ] Click logout button
- [ ] Verify redirect to login page
- [ ] Verify session cleared
- [ ] Try accessing protected route (should redirect to login)

---

## 🏠 Public Pages

### Home Page
- [ ] Navigate to `/`
- [ ] Verify hero section loads
- [ ] Verify featured properties display
- [ ] Click "Search Properties" button
- [ ] Verify navigation works

### Properties Search
- [ ] Navigate to `/properties`
- [ ] Verify property grid loads
- [ ] Test search by city
- [ ] Test price range filter
- [ ] Test beds/baths filter
- [ ] Test property type filter
- [ ] Click on a property card
- [ ] Verify property details page loads

### Property Details
- [ ] View property images
- [ ] Verify all property information displays
- [ ] Click "Contact Agent" button
- [ ] Fill and submit contact form
- [ ] Verify form submission works
- [ ] Test "Add to Favorites" button (requires login)

### Agents Page
- [ ] Navigate to `/agents`
- [ ] Verify agent grid loads
- [ ] Test search by name
- [ ] Test filter by specialty
- [ ] Click on agent card
- [ ] Verify agent profile loads
- [ ] View agent's listings
- [ ] Click "Contact Agent"

---

## 👤 User Dashboard

### Dashboard Home
- [ ] Login as regular user
- [ ] Verify dashboard loads
- [ ] Verify user name displays
- [ ] Verify role displays correctly

### Favorites
- [ ] Navigate to Favorites page
- [ ] Verify saved properties display
- [ ] Click "Remove from Favorites"
- [ ] Verify property removed
- [ ] Add new favorite from property page
- [ ] Verify it appears in favorites

### Saved Searches
- [ ] Navigate to Saved Searches
- [ ] Click "Create New Search"
- [ ] Fill search criteria
- [ ] Set email alert frequency
- [ ] Save search
- [ ] Verify search appears in list
- [ ] Edit saved search
- [ ] Delete saved search
- [ ] Test "Run Search Now" button

### Profile Settings
- [ ] Navigate to Settings
- [ ] Update profile information
- [ ] Save changes
- [ ] Verify changes persist
- [ ] Change password
- [ ] Verify password updated

---

## 🏢 Agent Dashboard

### Agent Dashboard Home
- [ ] Login as agent
- [ ] Verify "AGENT ACCOUNT" badge displays
- [ ] Verify dashboard metrics load
- [ ] Check total listings count
- [ ] Check active leads count
- [ ] Check opportunities value
- [ ] Verify charts render

### Listings Management
- [ ] Navigate to Listings page
- [ ] Click "Add New Listing"
- [ ] Fill all required fields
- [ ] Upload property images (multiple)
- [ ] Submit form
- [ ] Verify listing created
- [ ] Verify images uploaded
- [ ] Edit existing listing
- [ ] Update property details
- [ ] Upload additional images
- [ ] Save changes
- [ ] Delete a listing
- [ ] Confirm deletion

### Leads Management
- [ ] Navigate to Leads page
- [ ] Verify leads table loads
- [ ] Test search functionality
- [ ] Test filter by status
- [ ] Click status dropdown
- [ ] Change lead status
- [ ] Verify status updated
- [ ] Click star icon (favorite)
- [ ] Verify favorite toggled
- [ ] Click "Call" button (should open phone app)
- [ ] Click "Email" button (should open email app)
- [ ] Click "Export CSV"
- [ ] Verify CSV downloads
- [ ] Add notes to a lead
- [ ] Save notes
- [ ] Delete a lead

### Opportunities Pipeline
- [ ] Navigate to Opportunities page
- [ ] Verify pipeline view loads
- [ ] Toggle between "Listings" and "Buyers"
- [ ] Click "Create Opportunity"
- [ ] Fill opportunity form
- [ ] Submit form
- [ ] Verify opportunity appears in correct stage
- [ ] Verify volume calculations correct
- [ ] Edit opportunity
- [ ] Update price and probability
- [ ] Save changes
- [ ] Change status via dropdown
- [ ] Verify opportunity moves to new stage
- [ ] Delete opportunity
- [ ] Confirm deletion

### Agent Settings
- [ ] Navigate to Settings
- [ ] Update profile information
- [ ] Upload profile picture
- [ ] Verify image preview shows
- [ ] Save changes
- [ ] Verify profile picture updated
- [ ] Update bio and specialties
- [ ] Save changes
- [ ] Verify changes persist

### Open Houses
- [ ] Navigate to Open Houses
- [ ] Click "Schedule Open House"
- [ ] Select property
- [ ] Set date and time
- [ ] Add description
- [ ] Submit form
- [ ] Verify open house created
- [ ] Edit open house
- [ ] Cancel open house
- [ ] View RSVPs (if any)

---

## 👨‍💼 Admin Dashboard

### Admin Dashboard Home
- [ ] Login as admin
- [ ] Verify admin dashboard loads
- [ ] View system metrics
- [ ] Check user counts
- [ ] Check property counts
- [ ] Check agent counts

### User Management
- [ ] Navigate to Users page
- [ ] View all users
- [ ] Search for user
- [ ] Edit user role
- [ ] Deactivate user
- [ ] Reactivate user
- [ ] Delete user

### Agent Management
- [ ] Navigate to Agents page
- [ ] View all agents
- [ ] Approve pending agent
- [ ] Edit agent details
- [ ] Deactivate agent
- [ ] View agent performance metrics

### Property Management
- [ ] Navigate to Properties page
- [ ] View all properties
- [ ] Filter by status
- [ ] Edit property
- [ ] Change property status
- [ ] Delete property
- [ ] Bulk actions (if available)

---

## 🗺️ Map Features

### Property Map
- [ ] Navigate to Properties page
- [ ] Toggle to Map view
- [ ] Verify map loads
- [ ] Verify property markers display
- [ ] Click on a marker
- [ ] Verify property popup shows
- [ ] Click "View Details" in popup
- [ ] Zoom in/out on map
- [ ] Pan around map
- [ ] Verify markers update based on filters

### Saved Search Map Area
- [ ] Create saved search
- [ ] Draw area on map
- [ ] Save search with map bounds
- [ ] Verify search saves map area
- [ ] Run search
- [ ] Verify only properties in area show

---

## 📱 Responsive Design

### Mobile Testing (< 768px)
- [ ] Test on mobile device or resize browser
- [ ] Verify navigation menu collapses
- [ ] Test hamburger menu
- [ ] Verify all pages are readable
- [ ] Test forms on mobile
- [ ] Test image uploads on mobile
- [ ] Verify buttons are tappable
- [ ] Test scrolling and gestures

### Tablet Testing (768px - 1024px)
- [ ] Test on tablet or resize browser
- [ ] Verify layout adapts
- [ ] Test navigation
- [ ] Test all interactive elements
- [ ] Verify images scale properly

---

## 🔍 Search & Filter

### Property Search
- [ ] Test search by address
- [ ] Test search by city
- [ ] Test search by zip code
- [ ] Test price range slider
- [ ] Test beds filter
- [ ] Test baths filter
- [ ] Test property type dropdown
- [ ] Test multiple filters combined
- [ ] Test "Clear Filters" button

### Agent Search
- [ ] Test search by name
- [ ] Test filter by specialty
- [ ] Test filter by rating
- [ ] Test sort by name
- [ ] Test sort by rating
- [ ] Test sort by listings count

---

## 📧 Email & Notifications

### Contact Forms
- [ ] Submit property inquiry
- [ ] Verify email sent (check logs)
- [ ] Submit agent contact form
- [ ] Verify email sent

### Email Alerts
- [ ] Create saved search with email alerts
- [ ] Verify alert frequency saved
- [ ] Check notification service logs
- [ ] Verify emails would be sent (test mode)

---

## 🖼️ Image Upload

### Profile Picture
- [ ] Navigate to Settings
- [ ] Click "Upload" button
- [ ] Select image file
- [ ] Verify preview shows
- [ ] Click "Save"
- [ ] Verify upload progress shows
- [ ] Verify image uploaded
- [ ] Verify image displays in header
- [ ] Test with large file (should show error)
- [ ] Test with non-image file (should show error)

### Property Images
- [ ] Create/edit listing
- [ ] Click "Upload Images"
- [ ] Select multiple images
- [ ] Verify previews show
- [ ] Remove an image before upload
- [ ] Upload images
- [ ] Verify progress shows
- [ ] Verify images uploaded
- [ ] Verify images display on property page
- [ ] Test uploading 10+ images (should limit to 10)

---

## ⚠️ Error Handling

### Network Errors
- [ ] Disconnect internet
- [ ] Try to submit a form
- [ ] Verify error message shows
- [ ] Reconnect internet
- [ ] Retry submission
- [ ] Verify success

### Validation Errors
- [ ] Submit form with missing required fields
- [ ] Verify validation messages show
- [ ] Submit form with invalid email
- [ ] Verify email validation works
- [ ] Submit form with invalid phone
- [ ] Verify phone validation works

### 404 Errors
- [ ] Navigate to non-existent route
- [ ] Verify 404 page shows
- [ ] Click "Go Home" button
- [ ] Verify redirect works

---

## 🚀 Performance

### Page Load Times
- [ ] Measure home page load time
- [ ] Measure properties page load time
- [ ] Measure dashboard load time
- [ ] Verify all pages load in < 3 seconds

### Image Loading
- [ ] Verify images lazy load
- [ ] Verify loading placeholders show
- [ ] Verify images don't block page render

### API Response Times
- [ ] Check network tab for API calls
- [ ] Verify API responses < 1 second
- [ ] Check for unnecessary API calls

---

## ♿ Accessibility

### Keyboard Navigation
- [ ] Navigate site using only Tab key
- [ ] Verify focus indicators visible
- [ ] Test form submission with Enter key
- [ ] Test modal close with Escape key

### Screen Reader
- [ ] Test with screen reader (if available)
- [ ] Verify alt text on images
- [ ] Verify form labels readable
- [ ] Verify buttons have descriptive text

### Color Contrast
- [ ] Verify text readable on all backgrounds
- [ ] Check contrast ratios meet WCAG AA
- [ ] Test in high contrast mode

---

## 🔒 Security

### Authentication
- [ ] Try accessing protected routes without login
- [ ] Verify redirect to login page
- [ ] Try accessing admin routes as regular user
- [ ] Verify access denied
- [ ] Try accessing agent routes as regular user
- [ ] Verify access denied

### Data Protection
- [ ] Verify passwords not visible in forms
- [ ] Check network tab for sensitive data
- [ ] Verify API tokens not exposed
- [ ] Test SQL injection in search fields
- [ ] Test XSS in text inputs

---

## 📊 Test Results

### Summary
- **Total Tests**: ___
- **Passed**: ___
- **Failed**: ___
- **Blocked**: ___

### Critical Issues Found
1. 
2. 
3. 

### Minor Issues Found
1. 
2. 
3. 

### Notes
- 
- 
- 

---

## ✅ Sign-off

- [ ] All critical functionality tested
- [ ] All critical issues resolved
- [ ] All pages load correctly
- [ ] All forms work correctly
- [ ] All images upload correctly
- [ ] Mobile responsive design verified
- [ ] Ready for production

**Tested By**: _______________  
**Date**: _______________  
**Browser**: _______________  
**Device**: _______________
