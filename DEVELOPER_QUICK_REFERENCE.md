# 🚀 Developer Quick Reference Guide

**Quick access to all important commands, files, and procedures**

---

## ⚡ Quick Start

### Development Environment
```bash
# Install dependencies
npm install

# Start backend
cd backend && npm run dev

# Start frontend (new terminal)
cd frontend && npm run dev

# Access application
Frontend: http://localhost:3000
Backend: http://localhost:5000
API: http://localhost:5000/api
```

### Database
```bash
# Setup database
npx prisma db push

# Seed database
npm run db:seed

# View database
npx prisma studio
```

---

## 📁 Important Files

### Backend
- `backend/server.js` - Main server file
- `backend/prisma/schema.prisma` - Database schema
- `backend/.env` - Environment variables
- `backend/ecosystem.config.js` - PM2 configuration

### Frontend
- `frontend/src/App.tsx` - Main app component
- `frontend/src/pages/` - Page components
- `frontend/src/components/` - Reusable components
- `frontend/.env` - Frontend environment variables

### Configuration
- `.env.example` - Environment template
- `nginx.conf` - Web server configuration
- `deploy.sh` - Deployment script
- `server-setup.sh` - Server setup script

---

## 🔑 Key Endpoints

### Properties
```
GET    /api/properties              - List properties
GET    /api/properties/:id          - Get property details
POST   /api/properties              - Create property (agent)
PATCH  /api/properties/:id          - Update property (agent)
DELETE /api/properties/:id          - Delete property (agent)
```

### Agents
```
GET    /api/agents                  - List agents
GET    /api/agents/:id              - Get agent details
POST   /api/agents                  - Create agent
PATCH  /api/agents/:id              - Update agent
```

### Open Houses
```
GET    /api/open-houses             - List open houses
POST   /api/open-houses             - Create open house (agent)
POST   /api/open-houses/:id/rsvp    - RSVP to open house
GET    /api/open-houses/:id/rsvps   - Get RSVPs (agent)
```

### Reviews
```
GET    /api/reviews/agent/:id       - Get agent reviews
POST   /api/reviews/agent/:id       - Submit review
PATCH  /api/reviews/:id/respond     - Agent response
```

### Virtual Tours
```
GET    /api/virtual-tours/property/:id  - Get tours
POST   /api/virtual-tours/property/:id  - Add tour (agent)
PATCH  /api/virtual-tours/:id           - Update tour (agent)
DELETE /api/virtual-tours/:id           - Delete tour (agent)
```

### Market Data
```
GET    /api/market-data/zip/:zip    - Get zip code data
GET    /api/market-data/city/:city/:state - Get city trends
POST   /api/market-data/compare     - Compare properties
GET    /api/market-data/neighborhood/:zip - Get neighborhood stats
```

### Saved Searches
```
GET    /api/saved-searches          - Get saved searches
POST   /api/saved-searches          - Create saved search
PATCH  /api/saved-searches/:id      - Update saved search
DELETE /api/saved-searches/:id      - Delete saved search
```

### Map
```
GET    /api/map/properties          - Get properties with coordinates
POST   /api/map/search-area         - Search polygon area
GET    /api/map/bounds              - Get map bounds
```

---

## 🧪 Testing Commands

### Run Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# All tests
npm run test:all
```

### Test Specific Features
```bash
# Test open houses
node backend/test-open-houses.js

# Test reviews
node backend/test-reviews.js

# Test virtual tours
node backend/test-virtual-tours.js

# Test market data
node backend/test-market-data.js

# Test all 100% features
node backend/test-100-percent-features.js
```

---

## 🔧 Common Tasks

### Add New Feature
```bash
# 1. Create database model in schema.prisma
# 2. Run migration
npx prisma db push

# 3. Create controller
touch backend/controllers/featureController.js

# 4. Create routes
touch backend/routes/featureRoutes.js

# 5. Add routes to server.js
# 6. Create frontend component
# 7. Add route to App.tsx
# 8. Test feature
```

### Fix Bug
```bash
# 1. Identify issue
# 2. Create fix branch
git checkout -b fix/issue-name

# 3. Make changes
# 4. Test fix
npm run test

# 5. Commit changes
git add .
git commit -m "Fix: description"

# 6. Push to main
git push origin fix/issue-name
```

### Deploy Changes
```bash
# 1. Build frontend
cd frontend && npm run build

# 2. Commit changes
git add .
git commit -m "Deploy: description"

# 3. Push to server
git push origin main

# 4. SSH into server
ssh root@your_server_ip

# 5. Pull changes
cd /var/www/kw-realestate && git pull

# 6. Restart backend
pm2 restart kw-backend
```

---

## 📊 Database Models

### Core Models
- `User` - User accounts
- `Agent` - Agent profiles
- `Property` - Property listings
- `Lead` - Lead management
- `Opportunity` - Sales pipeline

### Feature Models
- `OpenHouse` - Open house events
- `RSVP` - Open house RSVPs
- `Review` - Agent reviews
- `VirtualTour` - Property tours
- `MarketData` - Market analytics
- `SavedSearch` - Saved searches
- `SearchAlert` - Search alerts
- `Favorite` - Favorite properties

---

## 🔐 Authentication

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Using Token
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/protected-endpoint
```

---

## 📝 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/kw_realestate
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:3000
SENDGRID_API_KEY=your_sendgrid_key
MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

---

## 🚀 Deployment Commands

### Build for Production
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

### Deploy to Server
```bash
# Using deploy script
./deploy.sh

# Manual deployment
scp -r . root@your_server_ip:/var/www/kw-realestate
ssh root@your_server_ip
cd /var/www/kw-realestate
npm install
npx prisma db push
npm run build
pm2 restart kw-backend
```

### Monitor Deployment
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs kw-backend

# Monitor resources
pm2 monit

# Check Nginx
systemctl status nginx

# Check database
psql -U kw_user -d kw_realestate -c "SELECT COUNT(*) FROM \"Property\";"
```

---

## 🐛 Debugging

### Backend Debugging
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check logs
pm2 logs kw-backend

# Database query debugging
npx prisma studio
```

### Frontend Debugging
```bash
# Browser DevTools
F12 or Cmd+Option+I

# React DevTools
Install React DevTools extension

# Network tab
Check API calls and responses
```

---

## 📚 Documentation Files

### User Docs
- `README.md` - Setup and installation
- `USER_GUIDE.md` - Platform usage
- `FAQ.md` - Frequently asked questions

### Developer Docs
- `API_DOCUMENTATION.md` - Complete API reference
- `ARCHITECTURE.md` - System architecture
- `DATABASE_SCHEMA.md` - Database design

### Deployment Docs
- `DEPLOYMENT_GUIDE.md` - Deployment steps
- `LAUNCH_GUIDE.md` - Launch procedures
- `FINAL_DEPLOYMENT_CHECKLIST.md` - Pre-launch checklist

### Project Docs
- `100_PERCENT_COMPLETION_SUMMARY.md` - Feature overview
- `COMPLETE_PROJECT_SUMMARY.md` - Project summary
- `DEVELOPER_QUICK_REFERENCE.md` - This file

---

## 🎯 Common Issues & Solutions

### Database Connection Error
```bash
# Check PostgreSQL is running
systemctl status postgresql

# Check connection string in .env
# Verify database exists
psql -U kw_user -d kw_realestate -c "SELECT 1;"
```

### Port Already in Use
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

### Build Errors
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### API Not Responding
```bash
# Check backend is running
pm2 status

# Check logs
pm2 logs kw-backend

# Restart backend
pm2 restart kw-backend
```

---

## 📞 Quick Help

### Get Help
1. Check documentation files
2. Review API documentation
3. Check test files for examples
4. Review code comments
5. Check GitHub issues

### Report Issues
1. Describe the problem
2. Provide error message
3. Include steps to reproduce
4. Attach relevant logs
5. Suggest solution if possible

---

## 🎓 Learning Resources

### Frontend
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org
- Tailwind CSS: https://tailwindcss.com

### Backend
- Node.js: https://nodejs.org
- Express: https://expressjs.com
- Prisma: https://www.prisma.io

### Database
- PostgreSQL: https://www.postgresql.org
- SQL: https://www.w3schools.com/sql

### Deployment
- Nginx: https://nginx.org
- PM2: https://pm2.keymetrics.io
- Docker: https://www.docker.com

---

## ✅ Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Build successful
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Documentation updated
- [ ] Backup created
- [ ] Monitoring configured

---

## 🚀 Quick Deploy

```bash
# 1. Build
npm run build

# 2. Test
npm run test

# 3. Commit
git add . && git commit -m "Deploy"

# 4. Push
git push origin main

# 5. SSH to server
ssh root@your_server_ip

# 6. Pull and restart
cd /var/www/kw-realestate
git pull
pm2 restart kw-backend
```

---

**Last Updated**: May 5, 2026  
**Version**: 1.0.0  
**Status**: Production Ready