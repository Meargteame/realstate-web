#!/bin/bash

# KW Real Estate - Database Setup Script
# This script sets up the PostgreSQL database for the application

set -e  # Exit on error

echo "🔧 KW Real Estate - Database Setup"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if PostgreSQL is running
echo "1️⃣  Checking PostgreSQL..."
if pg_isready -q; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
else
    echo -e "${RED}❌ PostgreSQL is not running${NC}"
    echo "Please start PostgreSQL first:"
    echo "  macOS: brew services start postgresql@14"
    echo "  Linux: sudo systemctl start postgresql"
    exit 1
fi
echo ""

# Step 2: Create database
echo "2️⃣  Creating database..."
if createdb kw_realestate 2>/dev/null; then
    echo -e "${GREEN}✅ Database 'kw_realestate' created${NC}"
else
    echo -e "${YELLOW}⚠️  Database 'kw_realestate' already exists (this is OK)${NC}"
fi
echo ""

# Step 3: Test connection
echo "3️⃣  Testing database connection..."
if psql kw_realestate -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Cannot connect to database${NC}"
    echo "Please check your PostgreSQL setup"
    exit 1
fi
echo ""

# Step 4: Generate Prisma Client
echo "4️⃣  Generating Prisma Client..."
cd backend
if npx prisma generate > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Prisma Client generated${NC}"
else
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    exit 1
fi
echo ""

# Step 5: Push schema to database
echo "5️⃣  Pushing schema to database..."
if npx prisma db push --accept-data-loss > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Schema pushed to database${NC}"
else
    echo -e "${RED}❌ Failed to push schema${NC}"
    exit 1
fi
echo ""

# Step 6: Verify tables
echo "6️⃣  Verifying tables..."
TABLE_COUNT=$(psql kw_realestate -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
if [ "$TABLE_COUNT" -eq "4" ]; then
    echo -e "${GREEN}✅ All 4 tables created (User, Agent, Property, Lead)${NC}"
else
    echo -e "${YELLOW}⚠️  Found $TABLE_COUNT tables (expected 4)${NC}"
fi
echo ""

# Step 7: Seed database
echo "7️⃣  Seeding database with test data..."
if node prisma/seed.js; then
    echo -e "${GREEN}✅ Database seeded successfully${NC}"
else
    echo -e "${RED}❌ Failed to seed database${NC}"
    exit 1
fi
echo ""

# Step 8: Verify data
echo "8️⃣  Verifying seeded data..."
AGENT_COUNT=$(psql kw_realestate -t -c 'SELECT COUNT(*) FROM "Agent";' 2>/dev/null | tr -d ' ')
PROPERTY_COUNT=$(psql kw_realestate -t -c 'SELECT COUNT(*) FROM "Property";' 2>/dev/null | tr -d ' ')
LEAD_COUNT=$(psql kw_realestate -t -c 'SELECT COUNT(*) FROM "Lead";' 2>/dev/null | tr -d ' ')
USER_COUNT=$(psql kw_realestate -t -c 'SELECT COUNT(*) FROM "User";' 2>/dev/null | tr -d ' ')

echo "   📊 Data Summary:"
echo "      - Agents: $AGENT_COUNT"
echo "      - Properties: $PROPERTY_COUNT"
echo "      - Leads: $LEAD_COUNT"
echo "      - Users: $USER_COUNT"
echo ""

# Success message
echo "=================================="
echo -e "${GREEN}🎉 Database setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Start backend:  cd backend && npm run dev"
echo "  2. Start frontend: cd frontend && npm run dev"
echo "  3. Visit: http://localhost:3000"
echo "  4. Login: sarah.j@kw.com / password123"
echo ""
echo "For troubleshooting, see: DATABASE_SETUP_FIX.md"
echo "=================================="
