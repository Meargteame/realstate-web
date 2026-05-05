#!/bin/bash

# =====================================================
# KW Real Estate Platform - Enterprise Setup Script
# =====================================================

echo ""
echo "🚀 ============================================"
echo "🚀 KW Real Estate - Enterprise Setup"
echo "🚀 ============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running in backend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the backend directory${NC}"
    exit 1
fi

# Step 1: Install Node dependencies
echo -e "${YELLOW}📦 Step 1: Installing Node.js dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# Step 2: Check Redis installation
echo -e "${YELLOW}🔍 Step 2: Checking Redis installation...${NC}"
if command -v redis-cli &> /dev/null; then
    echo -e "${GREEN}✅ Redis is installed${NC}"
    
    # Check if Redis is running
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✅ Redis is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Redis is installed but not running${NC}"
        echo -e "${YELLOW}   Starting Redis...${NC}"
        
        # Try to start Redis
        if command -v systemctl &> /dev/null; then
            sudo systemctl start redis
        elif command -v brew &> /dev/null; then
            brew services start redis
        else
            echo -e "${YELLOW}   Please start Redis manually: redis-server${NC}"
        fi
    fi
else
    echo -e "${RED}❌ Redis is not installed${NC}"
    echo ""
    echo "Please install Redis:"
    echo "  Ubuntu/Debian: sudo apt install redis-server"
    echo "  macOS: brew install redis"
    echo "  Docker: docker run -d -p 6379:6379 redis:alpine"
    echo ""
    echo -e "${YELLOW}⚠️  You can continue without Redis, but caching will be disabled${NC}"
fi
echo ""

# Step 3: Setup environment file
echo -e "${YELLOW}⚙️  Step 3: Setting up environment configuration...${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file from .env.example${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env and configure your settings${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
    fi
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi
echo ""

# Step 4: Check database connection
echo -e "${YELLOW}🗄️  Step 4: Checking database configuration...${NC}"
if [ -f ".env" ]; then
    # Source the .env file
    export $(cat .env | grep -v '^#' | xargs)
    
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}❌ DATABASE_URL not set in .env${NC}"
        echo -e "${YELLOW}   Please configure DATABASE_URL in .env${NC}"
    else
        echo -e "${GREEN}✅ DATABASE_URL is configured${NC}"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
fi
echo ""

# Step 5: Generate Prisma client
echo -e "${YELLOW}🔧 Step 5: Generating Prisma client...${NC}"
npx prisma generate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prisma client generated${NC}"
else
    echo -e "${RED}❌ Failed to generate Prisma client${NC}"
fi
echo ""

# Step 6: Apply database indexes
echo -e "${YELLOW}📊 Step 6: Database indexes...${NC}"
echo -e "${YELLOW}   To apply performance indexes, run:${NC}"
echo -e "${YELLOW}   psql -U your_user -d kw_realestate -f prisma/migrations/add_performance_indexes.sql${NC}"
echo ""

# Step 7: Summary
echo ""
echo "🎉 ============================================"
echo "🎉 Setup Complete!"
echo "🎉 ============================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure .env file with your settings:"
echo "   - DATABASE_URL"
echo "   - JWT_SECRET"
echo "   - REDIS_URL (if using Redis)"
echo "   - FRONTEND_URL"
echo ""
echo "2. Apply database indexes:"
echo "   psql -U your_user -d kw_realestate -f prisma/migrations/add_performance_indexes.sql"
echo ""
echo "3. Push database schema:"
echo "   npm run db:push"
echo ""
echo "4. Seed database (optional):"
echo "   npm run seed"
echo ""
echo "5. Start the server:"
echo "   npm run dev (development)"
echo "   npm run production (production)"
echo ""
echo "📚 Documentation:"
echo "   - ENTERPRISE_IMPLEMENTATION_GUIDE.md"
echo "   - SENIOR_ENGINEER_ANALYSIS.md"
echo "   - API_DOCUMENTATION.md"
echo ""
echo "🔍 Health check:"
echo "   curl http://localhost:5000/api/health"
echo ""
echo "============================================"
echo ""
