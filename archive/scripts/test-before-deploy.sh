#!/bin/bash

# Test Before Deploy Script
# Run this before deploying to catch issues early

echo "🧪 Testing KW Real Estate Platform Before Deployment"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: Run this script from the project root directory${NC}"
    exit 1
fi

echo "📋 Pre-Deployment Checklist"
echo ""

# 1. Check Node.js version
echo -n "1. Checking Node.js version... "
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 16 ]; then
    echo -e "${GREEN}✓ Node.js $(node -v)${NC}"
else
    echo -e "${RED}✗ Node.js version too old. Need v16+${NC}"
    exit 1
fi

# 2. Check if backend dependencies are installed
echo -n "2. Checking backend dependencies... "
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${YELLOW}⚠ Not installed. Installing...${NC}"
    cd backend && npm install && cd ..
fi

# 3. Check if frontend dependencies are installed
echo -n "3. Checking frontend dependencies... "
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${YELLOW}⚠ Not installed. Installing...${NC}"
    cd frontend && npm install && cd ..
fi

# 4. Check backend .env file
echo -n "4. Checking backend .env file... "
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓ Exists${NC}"
    
    # Check for required variables
    if grep -q "DATABASE_URL" backend/.env && grep -q "JWT_SECRET" backend/.env; then
        echo -e "   ${GREEN}✓ Required variables present${NC}"
    else
        echo -e "   ${YELLOW}⚠ Missing required variables${NC}"
    fi
else
    echo -e "${RED}✗ Missing${NC}"
    echo -e "   ${YELLOW}Copy backend/.env.example to backend/.env${NC}"
fi

# 5. Check frontend .env file
echo -n "5. Checking frontend .env file... "
if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✓ Exists${NC}"
    
    # Check for Mapbox token
    if grep -q "VITE_MAPBOX_ACCESS_TOKEN=pk\." frontend/.env; then
        echo -e "   ${GREEN}✓ Mapbox token looks valid${NC}"
    else
        echo -e "   ${YELLOW}⚠ Mapbox token might be invalid or demo${NC}"
        echo -e "   ${YELLOW}Get a real token at: https://account.mapbox.com/${NC}"
    fi
else
    echo -e "${RED}✗ Missing${NC}"
    echo -e "   ${YELLOW}Copy frontend/.env.example to frontend/.env${NC}"
fi

# 6. Check database connection
echo -n "6. Testing database connection... "
cd backend
if node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => { console.log('OK'); process.exit(0); }).catch(() => { console.log('FAIL'); process.exit(1); });" 2>/dev/null | grep -q "OK"; then
    echo -e "${GREEN}✓ Connected${NC}"
else
    echo -e "${RED}✗ Cannot connect${NC}"
    echo -e "   ${YELLOW}Check DATABASE_URL in backend/.env${NC}"
fi
cd ..

# 7. Check if database is migrated
echo -n "7. Checking database migrations... "
cd backend
MIGRATION_STATUS=$(npx prisma migrate status 2>&1)
if echo "$MIGRATION_STATUS" | grep -q "Database schema is up to date"; then
    echo -e "${GREEN}✓ Up to date${NC}"
elif echo "$MIGRATION_STATUS" | grep -q "pending migrations"; then
    echo -e "${YELLOW}⚠ Pending migrations${NC}"
    echo -e "   ${YELLOW}Run: cd backend && npx prisma migrate deploy${NC}"
else
    echo -e "${YELLOW}⚠ Unknown status${NC}"
fi
cd ..

# 8. Try building frontend
echo -n "8. Testing frontend build... "
cd frontend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Build successful${NC}"
    rm -rf dist  # Clean up
else
    echo -e "${RED}✗ Build failed${NC}"
    echo -e "   ${YELLOW}Run: cd frontend && npm run build${NC}"
fi
cd ..

# 9. Check for common issues
echo ""
echo "🔍 Checking for Common Issues"
echo ""

# Check for hardcoded localhost URLs
echo -n "9. Checking for hardcoded localhost URLs... "
HARDCODED=$(grep -r "localhost:5000" frontend/src --exclude-dir=node_modules 2>/dev/null | wc -l)
if [ "$HARDCODED" -gt 0 ]; then
    echo -e "${YELLOW}⚠ Found $HARDCODED instances${NC}"
    echo -e "   ${YELLOW}Make sure to use VITE_API_BASE_URL in production${NC}"
else
    echo -e "${GREEN}✓ None found${NC}"
fi

# Check for console.logs
echo -n "10. Checking for console.log statements... "
CONSOLE_LOGS=$(grep -r "console.log" frontend/src backend --exclude-dir=node_modules 2>/dev/null | wc -l)
if [ "$CONSOLE_LOGS" -gt 50 ]; then
    echo -e "${YELLOW}⚠ Found $CONSOLE_LOGS instances${NC}"
    echo -e "   ${YELLOW}Consider removing debug logs for production${NC}"
else
    echo -e "${GREEN}✓ Acceptable amount ($CONSOLE_LOGS)${NC}"
fi

# Summary
echo ""
echo "=================================================="
echo "📊 Test Summary"
echo "=================================================="
echo ""
echo -e "${GREEN}✓ = Passed${NC}"
echo -e "${YELLOW}⚠ = Warning (review needed)${NC}"
echo -e "${RED}✗ = Failed (must fix)${NC}"
echo ""
echo "Next Steps:"
echo "1. Fix any ${RED}✗ Failed${NC} items above"
echo "2. Review ${YELLOW}⚠ Warnings${NC}"
echo "3. Get Mapbox token if using demo token"
echo "4. Follow QUICK_DEPLOY_GUIDE.md to deploy"
echo ""
echo "🚀 Ready to deploy? Run: ./deploy.sh"
echo ""
