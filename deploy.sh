#!/bin/bash

# KW Real Estate Platform - Deployment Script
# This script prepares your application for production deployment

set -e  # Exit on error

echo "🚀 Starting deployment preparation..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Build Frontend
echo -e "${YELLOW}📦 Step 1: Building Frontend...${NC}"
cd frontend
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi
cd ..
echo ""

# Step 2: Install Backend Dependencies
echo -e "${YELLOW}📦 Step 2: Installing Backend Dependencies...${NC}"
cd backend
npm install --production
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Backend dependency installation failed${NC}"
    exit 1
fi
echo ""

# Step 3: Generate Prisma Client
echo -e "${YELLOW}🔧 Step 3: Generating Prisma Client...${NC}"
npx prisma generate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prisma client generated${NC}"
else
    echo -e "${RED}❌ Prisma client generation failed${NC}"
    exit 1
fi
cd ..
echo ""

# Step 4: Create deployment package
echo -e "${YELLOW}📦 Step 4: Creating deployment package...${NC}"
mkdir -p deployment
cp -r backend deployment/
cp -r frontend/dist deployment/frontend
cp HOSTINGER_DEPLOYMENT_GUIDE.md deployment/
cp QUICK_REFERENCE.md deployment/
echo -e "${GREEN}✅ Deployment package created in ./deployment${NC}"
echo ""

# Step 5: Create archive
echo -e "${YELLOW}📦 Step 5: Creating deployment archive...${NC}"
tar -czf kw-realestate-deployment.tar.gz deployment/
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment archive created: kw-realestate-deployment.tar.gz${NC}"
else
    echo -e "${RED}❌ Archive creation failed${NC}"
    exit 1
fi
echo ""

# Summary
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📦 Deployment package: ./deployment/"
echo "📦 Deployment archive: ./kw-realestate-deployment.tar.gz"
echo ""
echo "Next steps:"
echo "1. Upload kw-realestate-deployment.tar.gz to your Hostinger server"
echo "2. Extract: tar -xzf kw-realestate-deployment.tar.gz"
echo "3. Follow HOSTINGER_DEPLOYMENT_GUIDE.md"
echo ""
echo -e "${YELLOW}⚠️  Don't forget to:${NC}"
echo "  - Update .env with production database credentials"
echo "  - Update ALLOWED_ORIGINS with your domain"
echo "  - Generate a secure JWT_SECRET"
echo ""
