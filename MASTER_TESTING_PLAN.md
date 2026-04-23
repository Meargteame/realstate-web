# 🎯 MASTER PRE-DEPLOYMENT TESTING PLAN

## Overview

This is your complete manual testing plan before deployment. Follow all 3 phases in order.

**Total Time**: 2-3 hours
**Required**: Backend + Frontend running, Database seeded

---

## 📋 Testing Phases

### PHASE A: Public User Testing (30-45 min)
**File**: `PHASE_A_PUBLIC_TESTING.md`

**What to Test**:
- Homepage & Navigation
- Property Search & Filtering (price, beds, baths, type, sorting)
- Property Details Pages
- Agent Search & Profiles
- Lead Capture Tools (Mortgage Calculator, Home Value)
- City Landing Pages
- Error Handling (404, validation)

**Critical Items**:
- ✅ All 30 properties display
- ✅ All 12 agents display
- ✅ Filtering works correctly
- ✅ Contact forms submit (create leads)
- ✅ Calculators work
- ✅ No console errors

---

### PHASE B: Registered User Testing (20-30 min)
**File**: `PHASE_B_USER_TESTING.md`

**What to Test**:
- User Registration (sign up)
- User Login (authentication)
- Dashboard Access
- Profile & Settings
- Logout & Session Management
- Cross-Browser (optional)

**Critical Items**:
- ✅ Sign up creates account
- ✅ Login works with correct credentials
- ✅ Wrong credentials show errors
- ✅ Session persists
- ✅ Logout works
- ✅ Settings save

**Known Issue**: Regular users see agent dashboard (needs separate user dashboard)

---

### PHASE C: Agent Testing (45-60 min) - MOST CRITICAL
**File**: `PHASE_C_AGENT_TESTING.md`

**What to Test**:
- Agent Login & Dashboard KPIs
- Lead Management (view, update status, contact)
- Lead Inbox (messages, selection, details)
- Listings Management (create, edit, delete)
- Opportunities Pipeline (kanban board)
- Agent Settings (profile updates)
- Public Agent Profile
- End-to-End Workflow (lead → closed deal)

**Critical Items**:
- ✅ Dashboard shows correct KPIs
- ✅ Lead status updates work
- ✅ Can create new listings
- ✅ Can edit/delete listings
- ✅ Inbox displays messages
- ✅ Pipeline shows deals
- ✅ Settings save
- ✅ Complete workflow works

---

## 🚀 Quick Start

### 1. Setup (5 min)
```bash
# Terminal 1: Start backend
cd ~/kw-realstate-web/backend
npm run dev

# Terminal 2: Start frontend
cd ~/kw-realstate-web/frontend
npm run dev

# Verify both running:
# Backend: http://localhost:5000
# Frontend: http://localhost:3000
```

### 2. Verify Database (2 min)
```bash
cd ~/kw-realstate-web/backend
node -e "const prisma = require('./config/prisma'); prisma.agent.count().then(c => console.log('Agents:', c)); prisma.property.count().then(c => console.log('Properties:', c)); prisma.lead.count().then(c => console.log('Leads:', c));"
```

Expected output:
```
Agents: 12
Properties: 30
Leads: 25
```

### 3. Test Accounts

**Agent Account** (Phase C):
```
Email: sarah.j@kw.com
Password: password123
Has: 3 properties, 2 leads
```

**Regular User** (Phase B):
```
Email: test@example.com
Password: password123
Has: No properties or leads
```

**Create New User** (Phase B):
```
Use sign up form to create:
Email: your-test@email.com
Password: TestPass123!
```

---

## 📝 Testing Workflow

### Day 1: Phase A (Public Testing)
1. Open `PHASE_A_PUBLIC_TESTING.md`
2. Use incognito/private browser
3. Follow all test steps
4. Check off each item
5. Document any issues found
6. Sign off when complete

### Day 2: Phase B (User Testing)
1. Open `PHASE_B_USER_TESTING.md`
2. Use regular browser
3. Follow all test steps
4. Test sign up and login
5. Document any issues
6. Sign off when complete

### Day 3: Phase C (Agent Testing)
1. Open `PHASE_C_AGENT_TESTING.md`
2. Login as sarah.j@kw.com
3. Follow all test steps
4. Test complete workflow
5. Document any issues
6. Sign off when complete

---

## ✅ Final Checklist

Before deployment, verify:

### Functionality:
- [ ] All 3 phases completed
- [ ] All critical items checked
- [ ] No blocking bugs found
- [ ] All test accounts work
- [ ] Database has correct data

### Performance:
- [ ] Pages load in < 3 seconds
- [ ] No memory leaks
- [ ] Images load properly
- [ ] Forms submit quickly

### Security:
- [ ] Passwords are hashed
- [ ] SQL injection prevented (Prisma handles this)
- [ ] XSS prevented (React handles this)
- [ ] CORS configured correctly

### Data Integrity:
- [ ] Lead creation works
- [ ] Property creation works
- [ ] Status updates persist
- [ ] Profile updates save
- [ ] No data loss on refresh

### User Experience:
- [ ] Error messages are clear
- [ ] Success notifications show
- [ ] Loading states display
- [ ] Forms validate properly
- [ ] Navigation is intuitive

---

## 🐛 Issue Tracking

### Critical Issues (Must Fix Before Deployment):
```
1. [Issue description]
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Priority: CRITICAL

2. [Issue description]
   ...
```

### Medium Issues (Should Fix):
```
1. [Issue description]
   - Priority: MEDIUM
```

### Low Issues (Nice to Have):
```
1. [Issue description]
   - Priority: LOW
```

---

## 📊 Test Results Summary

### Phase A: Public User Testing
- **Status**: ☐ Not Started / ☐ In Progress / ☐ Complete
- **Pass Rate**: ___/50 tests passed
- **Issues Found**: ___
- **Blocker Issues**: ___
- **Tested By**: _______________
- **Date**: _______________

### Phase B: Registered User Testing
- **Status**: ☐ Not Started / ☐ In Progress / ☐ Complete
- **Pass Rate**: ___/25 tests passed
- **Issues Found**: ___
- **Blocker Issues**: ___
- **Tested By**: _______________
- **Date**: _______________

### Phase C: Agent Testing
- **Status**: ☐ Not Started / ☐ In Progress / ☐ Complete
- **Pass Rate**: ___/60 tests passed
- **Issues Found**: ___
- **Blocker Issues**: ___
- **Tested By**: _______________
- **Date**: _______________

---

## 🎉 Deployment Approval

### Sign-Off Required:

**Developer**: _______________  Date: _______________
- [ ] All code complete
- [ ] All tests passing
- [ ] No console errors
- [ ] Database seeded

**QA/Tester**: _______________  Date: _______________
- [ ] All 3 phases complete
- [ ] No critical bugs
- [ ] User experience acceptable
- [ ] Ready for deployment

**Project Manager**: _______________  Date: _______________
- [ ] All requirements met
- [ ] Documentation complete
- [ ] Deployment plan ready
- [ ] Approved for production

---

## 📚 Related Documents

- `PHASE_A_PUBLIC_TESTING.md` - Detailed public user tests
- `PHASE_B_USER_TESTING.md` - Detailed registered user tests
- `PHASE_C_AGENT_TESTING.md` - Detailed agent dashboard tests
- `USER_ROLES_AND_WORKFLOWS.md` - Complete role documentation
- `DEPLOYMENT_GUIDE.md` - Production deployment steps
- `README.md` - Setup and installation guide

---

## 🆘 Need Help?

### Common Issues:

**Backend not starting**:
```bash
cd backend
npm install
npm run dev
```

**Frontend not starting**:
```bash
cd frontend
npm install
npm run dev
```

**Database errors**:
```bash
cd backend
npx prisma db push
node prisma/seed.js
```

**Login not working**:
- Verify database seeded: `node prisma/seed.js`
- Check backend running: http://localhost:5000/api/health
- Clear browser cache and try again

---

**Good luck with testing! 🚀**

Remember: Take your time, document everything, and don't skip any steps!
