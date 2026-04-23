# 👤 PHASE B: REGISTERED USER TESTING (Login Required)

**Goal**: Test authentication and user account features

**Time Estimate**: 20-30 minutes

**Prerequisites**:
- Phase A completed successfully
- Backend and frontend running
- Database seeded
- Use regular browser window (not incognito)

---

## B1: User Registration (10 min)

### Test Steps:

#### Sign Up Process:
1. Click "Sign Up" button in header
2. Verify signup page loads
3. Check page displays:
   - [ ] Branding sidebar with KW logo
   - [ ] Sign up form
   - [ ] "Already have an account? Log In" link
   - [ ] Social login buttons (Google, Apple, Facebook)

4. **Test Form Validation**:
   - [ ] Try submitting empty form
   - [ ] Verify all fields show "required" errors
   - [ ] Enter first name only - verify other fields still required
   - [ ] Enter invalid email format (e.g., "test@")
   - [ ] Verify email validation error shows

5. **Create New Account**:
   - [ ] Fill out complete form:
     - First Name: "John"
     - Last Name: "Doe"
     - Email: "john.doe@test.com"
     - Password: "TestPass123!"
   - [ ] Click "Create Account" button
   - [ ] Verify loading state shows ("Creating Account...")
   - [ ] Verify redirect to dashboard (/command)
   - [ ] Check user name appears in header

6. **Test Duplicate Email**:
   - [ ] Logout (if logged in)
   - [ ] Try to sign up again with same email
   - [ ] Verify error message: "Account with this email already exists"

**Expected Result**: Account created successfully, redirected to dashboard

---

## B2: User Login (10 min)

### Test Steps:

#### Login Process:
1. If logged in, logout first
2. Click "Login" button in header
3. Verify login page loads
4. Check page displays:
   - [ ] Branding sidebar
   - [ ] Login form
   - [ ] "Don't have an account? Sign Up" link
   - [ ] "Forgot password?" link
   - [ ] Social login buttons

5. **Test Form Validation**:
   - [ ] Try submitting empty form
   - [ ] Verify validation errors show
   - [ ] Enter email only - verify password required
   - [ ] Enter invalid email format
   - [ ] Verify email validation

6. **Test Wrong Credentials**:
   - [ ] Enter email: "wrong@email.com"
   - [ ] Enter password: "wrongpassword"
   - [ ] Click "Log In"
   - [ ] Verify error message shows
   - [ ] Check error is user-friendly

7. **Test Wrong Password**:
   - [ ] Enter email: "test@example.com"
   - [ ] Enter wrong password: "wrongpass"
   - [ ] Click "Log In"
   - [ ] Verify "Incorrect password" error shows

8. **Successful Login - Regular User**:
   - [ ] Enter email: "test@example.com"
   - [ ] Enter password: "password123"
   - [ ] Click "Log In"
   - [ ] Verify loading state shows
   - [ ] Verify redirect to dashboard
   - [ ] Check user name in header

9. **Test Session Persistence**:
   - [ ] Refresh the page
   - [ ] Verify still logged in
   - [ ] Check user name still in header
   - [ ] Navigate to different pages
   - [ ] Verify login persists

**Expected Result**: Login works, session persists, errors handled gracefully

---

## B3: User Dashboard Access (5 min)

### Test Steps:

#### Current Behavior (Known Issue):
1. After login as regular user (test@example.com)
2. Verify redirected to /command
3. **Note**: Regular users currently see agent dashboard
4. This is a known limitation - should have separate user dashboard

#### Test What Shows:
- [ ] Dashboard loads without crashing
- [ ] Check if any data shows (should be empty for regular user)
- [ ] Verify no properties show (user has no listings)
- [ ] Verify no leads show (user is not an agent)
- [ ] Check navigation menu shows:
  - Dashboard
  - Leads
  - Inbox
  - Listings
  - Opportunities
  - Settings

#### Test Navigation:
5. Click each menu item:
   - [ ] Leads - should show empty or error
   - [ ] Inbox - should show empty
   - [ ] Listings - should show empty
   - [ ] Opportunities - should show empty
   - [ ] Settings - should load settings page

**Expected Result**: Dashboard loads but shows empty data (user is not an agent)

**Known Issue**: Regular users should have different dashboard with:
- Saved properties
- Saved searches
- Viewing history
- Favorite agents

---

## B4: User Profile & Settings (5 min)

### Test Steps:

1. Click "Settings" in navigation
2. Verify settings page loads
3. Check page displays:
   - [ ] Profile photo placeholder
   - [ ] "Change Photo" button
   - [ ] Personal information form
   - [ ] All fields pre-filled with user data

4. **Test Profile Update**:
   - [ ] Change name to "John Updated Doe"
   - [ ] Change phone to "(555) 999-8888"
   - [ ] Add location: "Austin, TX"
   - [ ] Add specialties: "First-time buyer"
   - [ ] Add bio: "Looking for my first home"
   - [ ] Click "Save Changes"
   - [ ] Verify success message appears
   - [ ] Refresh page
   - [ ] Verify changes persisted

5. **Test Photo Upload UI**:
   - [ ] Click "Change Photo" button
   - [ ] Verify file picker opens (or shows UI)
   - [ ] Note: Actual upload not implemented

**Expected Result**: Settings page loads, profile updates save successfully

---

## B5: Logout & Re-login (5 min)

### Test Steps:

#### Logout:
1. Find logout button/link in header or menu
2. Click logout
3. Verify:
   - [ ] Redirected to homepage or login page
   - [ ] User name removed from header
   - [ ] "Login" and "Sign Up" buttons visible again
   - [ ] Cannot access /command without login

#### Test Protected Routes:
4. Try to visit /command directly
5. Verify:
   - [ ] Redirected to login page
   - [ ] Or shows "Please login" message

6. Try to visit /command/leads
7. Verify same redirect behavior

#### Re-login:
8. Click "Login" button
9. Login with test@example.com / password123
10. Verify:
    - [ ] Login successful
    - [ ] Redirected to dashboard
    - [ ] Session restored

**Expected Result**: Logout works, protected routes require login, re-login works

---

## B6: Cross-Browser Testing (Optional - 10 min)

### Test Steps:

If time permits, repeat B1-B5 in different browsers:

#### Chrome:
- [ ] Sign up works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Settings work
- [ ] Logout works

#### Firefox:
- [ ] Sign up works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Settings work
- [ ] Logout works

#### Safari (macOS):
- [ ] Sign up works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Settings work
- [ ] Logout works

#### Edge:
- [ ] Sign up works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Settings work
- [ ] Logout works

**Expected Result**: Works consistently across all browsers

---

## ✅ PHASE B COMPLETION CHECKLIST

### Authentication:
- [ ] Sign up creates new account
- [ ] Email validation works
- [ ] Duplicate email prevented
- [ ] Login with correct credentials works
- [ ] Wrong password shows error
- [ ] Wrong email shows error
- [ ] Session persists after refresh
- [ ] Logout works correctly

### User Features:
- [ ] Dashboard loads (even if empty)
- [ ] Settings page loads
- [ ] Profile updates save
- [ ] User name displays in header
- [ ] Protected routes require login

### Known Issues Documented:
- [ ] Regular users see agent dashboard (needs separate user dashboard)
- [ ] Photo upload UI only (no actual upload)
- [ ] Saved properties not implemented
- [ ] Saved searches not implemented

### No Critical Errors:
- [ ] No console errors during signup
- [ ] No console errors during login
- [ ] No crashes on dashboard
- [ ] Forms submit without errors

**Sign-off**: _________________ Date: _________

---

**Next**: Proceed to PHASE C (Agent Testing - Most Critical)
