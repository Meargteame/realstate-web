# KW Real Estate Platform - Test Version

A full-stack real estate marketplace platform built with Node.js/Express backend and React/TypeScript frontend, featuring property listings, agent discovery, and lead management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd kw-realstate-web
```

2. **Install dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Set up the database**
```bash
# Create PostgreSQL database
createdb kw_realestate

# Or using psql
psql -U postgres
CREATE DATABASE kw_realestate;
\q
```

4. **Configure environment variables**
```bash
# Backend .env (already configured)
cd backend
# Verify DATABASE_URL in .env file:
# DATABASE_URL="postgresql://meareg@127.0.0.1:5432/kw_realestate?schema=public"
```

5. **Initialize database and seed data**
```bash
cd backend
npm run db:seed
```

This will:
- Push the Prisma schema to your database
- Seed 12 agents, 30 properties, 25 leads, and 5 test users

6. **Start the development servers**
```bash
# From project root
npm run dev
```

This starts:
- Backend API on `http://localhost:5000`
- Frontend on `http://localhost:3000`

## 🔐 Test Credentials

### Agent Account
- **Email**: `sarah.j@kw.com`
- **Password**: `password123`
- **Access**: Full agent dashboard with listings and leads

### Regular User
- **Email**: `test@example.com`
- **Password**: `password123`
- **Access**: Public features only

### Admin Account
- **Email**: `admin@kw.com`
- **Password**: `password123`
- **Access**: All features

## 📁 Project Structure

```
kw-realstate-web/
├── backend/
│   ├── config/           # Database configuration
│   ├── controllers/      # API route handlers
│   ├── routes/           # Express routes
│   ├── prisma/           # Database schema & seed
│   ├── server.js         # Express app entry
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route pages
│   │   ├── App.tsx       # Main app with routing
│   │   └── types.ts      # TypeScript types
│   ├── vite.config.ts    # Vite configuration
│   └── package.json
└── README.md
```

## 🎯 Features

### Public Features
- ✅ Property search and filtering
- ✅ Agent directory with search
- ✅ Property detail pages
- ✅ Agent profile pages
- ✅ City landing pages (SEO)
- ✅ Mortgage calculator
- ✅ Home value estimator
- ✅ User authentication (login/signup)

### Agent Dashboard (Protected)
- ✅ Dashboard with KPIs
- ✅ Lead management with status tracking
- ✅ Lead inbox with messaging
- ✅ Active listings management
- ✅ Opportunities pipeline
- ✅ Agent settings

## 🗄️ Database Schema

### Models
- **User**: Authentication and user accounts
- **Agent**: Real estate agent profiles
- **Property**: Property listings
- **Lead**: Customer inquiries and leads

### Relationships
- Agent → Properties (one-to-many)
- Agent → Leads (one-to-many)
- Property → Leads (one-to-many, optional)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with email/password

### Properties
- `GET /api/properties` - List all properties (with search)
- `GET /api/properties/:id` - Get property by ID
- `GET /api/properties/city/:city` - Get properties by city
- `POST /api/properties` - Create new property (agent only)

### Agents
- `GET /api/agents` - List all agents (with search)
- `GET /api/agents/:id` - Get agent by ID (includes properties & leads)

### Leads
- `POST /api/leads` - Create new lead
- `GET /api/leads` - List all leads (with pagination)
- `GET /api/agents/:agentId/leads` - Get leads for specific agent
- `PATCH /api/leads/:id/status` - Update lead status

### Health
- `GET /api/health` - API health check

## 🛠️ Development

### Backend Commands
```bash
cd backend

# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Database commands
npm run db:push      # Push schema changes
npm run seed         # Run seed script
npm run db:seed      # Push schema + seed data
```

### Frontend Commands
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run lint
```

## 🧪 Testing the Application

### 1. Test Public Features
1. Visit `http://localhost:3000`
2. Browse properties without logging in
3. Search for agents
4. Try the mortgage calculator at `/mortgage-calculator`
5. Try the home value estimator at `/home-value`

### 2. Test User Registration
1. Click "Sign Up" in the header
2. Create a new account
3. Verify redirect to dashboard

### 3. Test Agent Dashboard
1. Login with `sarah.j@kw.com` / `password123`
2. View dashboard with KPIs
3. Check "Leads" page - should see 2 leads
4. Check "My Listings" - should see 3 properties
5. Try creating a new listing
6. Check "Inbox" for lead messages
7. View "Opportunities" pipeline

### 4. Test Lead Capture
1. Logout (or use incognito)
2. Go to any property detail page
3. Fill out the contact form
4. Login as agent and verify lead appears

### 5. Test Search & Filtering
1. Search properties by city (e.g., "Austin")
2. Search agents by name
3. Visit city page: `/homes/austin`

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_isready -h 127.0.0.1 -p 5432

# Verify database exists
psql -U meareg -l | grep kw_realestate

# Reset database (WARNING: deletes all data)
dropdb kw_realestate
createdb kw_realestate
cd backend && npm run db:seed
```

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Prisma Client Issues
```bash
cd backend
npx prisma generate
npm run db:push
```

## 📝 Seed Data Summary

The seed script creates:
- **12 Agents** across different brokerages and specialties
- **30 Properties** in Austin, Round Rock, Cedar Park, and Pflugerville
- **25 Leads** with various statuses (New, Contacted, Qualified, Closed)
- **5 Users** including agents, regular users, and admin

### Property Distribution
- Austin: 20 properties ($355K - $2.75M)
- Round Rock: 3 properties ($385K - $495K)
- Cedar Park: 3 properties ($395K - $525K)
- Pflugerville: 3 properties ($375K - $485K)

### Lead Status Distribution
- New: 10 leads
- Contacted: 9 leads
- Qualified: 5 leads
- Closed: 1 lead

## 🚀 Deployment

### Backend Deployment
1. Set environment variables on your hosting platform
2. Run `npm run db:push` to sync schema
3. Run `npm run seed` to populate data
4. Start with `npm start`

### Frontend Deployment
1. Update API URL in `vite.config.ts` proxy settings
2. Run `npm run build`
3. Deploy `dist/` folder to static hosting (Vercel, Netlify, etc.)

## 📚 Tech Stack

### Backend
- Node.js + Express 5.2.1
- Prisma 7.7.0 (ORM)
- PostgreSQL (Database)
- bcryptjs (Password hashing)
- CORS enabled

### Frontend
- React 19.0.0
- TypeScript 5.8.2
- Vite 6.2.0 (Build tool)
- React Router 7.14.0
- Ant Design 6.3.5 (UI components)
- Tailwind CSS 4.1.14
- Lucide React (Icons)

## 📄 License

ISC

## 👥 Support

For issues or questions, please check:
1. This README
2. `PROJECT_COMPLETION_PHASES.md` for development status
3. API endpoint documentation above
4. Console logs in browser/terminal for errors
