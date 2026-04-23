# 🚀 Quick Start Guide - KW Real Estate Platform

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ PostgreSQL 14+ installed and running (`pg_isready`)
- ✅ npm installed (`npm --version`)

## 5-Minute Setup

### 1. Install Dependencies (2 minutes)

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Setup Database (1 minute)

```bash
# Create database (if not exists)
createdb kw_realestate

# Seed with test data
cd backend
npm run db:seed
```

Expected output:
```
🌱 Starting database seed...
📍 Seeding agents...
✅ Seeded 12 agents
🏠 Seeding properties...
✅ Seeded 30 properties
📧 Seeding leads...
✅ Seeded 25 leads
👤 Seeding users...
✅ Seeded 5 users
🎉 Database seeding completed successfully!
```

### 3. Start Development Servers (30 seconds)

```bash
# From project root
npm run dev
```

This starts:
- 🔧 Backend API: http://localhost:5000
- 🎨 Frontend: http://localhost:3000

### 4. Login & Test (1 minute)

Open http://localhost:3000 and login with:

**Agent Account:**
- Email: `sarah.j@kw.com`
- Password: `password123`

## 🎯 What to Test

### Public Features (No Login Required)
1. Browse properties at `/properties`
2. Search agents at `/agents`
3. Try mortgage calculator at `/mortgage-calculator`
4. Try home value estimator at `/home-value`
5. Visit city page at `/homes/austin`

### Agent Dashboard (Login Required)
1. View dashboard with KPIs at `/command`
2. Check leads at `/command/leads`
3. View inbox at `/command/inbox`
4. Manage listings at `/command/listings`
5. See opportunities at `/command/opportunities`
6. Update settings at `/command/settings`

### Test Lead Capture
1. Go to any property detail page
2. Fill out contact form
3. Login as agent
4. Verify lead appears in dashboard

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
pg_isready -h 127.0.0.1 -p 5432

# If not running, start it
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Prisma Client Error
```bash
cd backend
npx prisma generate
npm run db:push
```

### Database Already Seeded
The seed script uses `upsert`, so it's safe to run multiple times. It will update existing records instead of creating duplicates.

## 📊 Test Data Summary

### Agents (12 total)
- Sarah Jenkins (Luxury, Austin Southwest)
- Michael Chen (Downtown)
- Jennifer Martinez (Luxury Homes)
- David Thompson (North Austin)
- Emily Rodriguez (South Austin)
- James Wilson (Westlake)
- Lisa Anderson (East Austin)
- Robert Kim (Downtown)
- Amanda Foster (Luxury Estates)
- Christopher Lee (Round Rock)
- Maria Garcia (Cedar Park)
- Daniel Brown (Pflugerville)

### Properties (30 total)
- **Austin**: 20 properties ($355K - $2.75M)
- **Round Rock**: 3 properties ($385K - $495K)
- **Cedar Park**: 3 properties ($395K - $525K)
- **Pflugerville**: 3 properties ($375K - $485K)

### Leads (25 total)
- **New**: 10 leads (need attention)
- **Contacted**: 9 leads (in progress)
- **Qualified**: 5 leads (hot prospects)
- **Closed**: 1 lead (won deal)

### Test Users (5 total)
1. `sarah.j@kw.com` - Agent (has 3 properties, 2 leads)
2. `m.chen@kw.com` - Agent (has 3 properties, 2 leads)
3. `j.martinez@kw.com` - Agent (has 2 properties, 2 leads)
4. `test@example.com` - Regular user
5. `admin@kw.com` - Admin user

All passwords: `password123`

## 🔍 API Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Get All Properties
```bash
curl http://localhost:5000/api/properties
```

### Search Properties
```bash
curl http://localhost:5000/api/properties?q=austin
```

### Get All Agents
```bash
curl http://localhost:5000/api/agents
```

### Create Lead
```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "(512) 555-0000",
    "message": "Interested in viewing properties"
  }'
```

## 📱 Features Checklist

### ✅ Completed Features
- [x] User authentication (login/signup)
- [x] Property search and filtering
- [x] Advanced filters (price, beds, baths, type)
- [x] Agent directory
- [x] Property detail pages
- [x] Agent profile pages
- [x] City landing pages
- [x] Mortgage calculator
- [x] Home value estimator
- [x] Agent dashboard with KPIs
- [x] Lead management
- [x] Lead inbox
- [x] Listing management
- [x] Opportunities pipeline
- [x] Agent settings
- [x] 404 error page
- [x] Lead capture forms
- [x] Success notifications

### 🎨 UI Components
- [x] PropertyCard
- [x] AgentCard
- [x] Header with navigation
- [x] Footer
- [x] Hero sections
- [x] Search bars
- [x] Filter panels
- [x] Data tables
- [x] Forms with validation
- [x] Modal dialogs
- [x] Notifications

## 🎓 Next Steps

1. **Explore the codebase**
   - Backend: `backend/controllers/` and `backend/routes/`
   - Frontend: `frontend/src/pages/` and `frontend/src/components/`

2. **Customize the data**
   - Edit `backend/prisma/seed.js`
   - Run `npm run db:seed` to update

3. **Add new features**
   - Check `PROJECT_COMPLETION_PHASES.md` for ideas
   - Phase 5 has polish and enhancement suggestions

4. **Deploy**
   - See `README.md` deployment section
   - Consider Vercel (frontend) + Railway (backend)

## 📚 Documentation

- **Full README**: `README.md`
- **Project Phases**: `PROJECT_COMPLETION_PHASES.md`
- **Database Schema**: `backend/prisma/schema.prisma`
- **API Routes**: Check `backend/routes/` folder

## 💡 Tips

- Use Chrome DevTools to inspect API calls
- Check browser console for errors
- Check terminal for backend logs
- Use Prisma Studio to view database: `npx prisma studio`
- All forms have validation - try submitting empty forms
- Test responsive design by resizing browser

## 🎉 You're Ready!

The platform is fully functional and ready for testing. Enjoy exploring!

For questions or issues, check the troubleshooting section above or review the full README.md.
