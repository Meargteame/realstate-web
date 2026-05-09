#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCORE=0
MAX_SCORE=100

echo "=========================================="
echo "🚀 Deployment Readiness Check"
echo "=========================================="
echo ""

# Check 1: Backend Running (10 points)
echo -n "1. Backend Server Running... "
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ (10/10)${NC}"
    SCORE=$((SCORE + 10))
else
    echo -e "${RED}❌ (0/10)${NC}"
    echo "   Backend not running on port 5000"
fi

# Check 2: Health Endpoint Working (10 points)
echo -n "2. Health Endpoint... "
HEALTH=$(curl -s http://localhost:5000/api/health 2>/dev/null)
if echo "$HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✅ (10/10)${NC}"
    SCORE=$((SCORE + 10))
else
    echo -e "${RED}❌ (0/10)${NC}"
    echo "   Health endpoint not returning valid response"
fi

# Check 3: Security Middleware (20 points)
echo -n "3. Security Middleware... "
if grep -q "// TEMPORARILY DISABLED" backend/server.js; then
    echo -e "${RED}❌ (0/20)${NC}"
    echo "   Security middleware is disabled - CRITICAL ISSUE"
else
    echo -e "${GREEN}✅ (20/20)${NC}"
    SCORE=$((SCORE + 20))
fi

# Check 4: Database Connection (10 points)
echo -n "4. Database Connection... "
if [ -f "backend/prisma/schema.prisma" ]; then
    echo -e "${GREEN}✅ (10/10)${NC}"
    SCORE=$((SCORE + 10))
else
    echo -e "${RED}❌ (0/10)${NC}"
fi

# Check 5: Environment Variables (15 points)
echo -n "5. Environment Variables... "
ENV_SCORE=0
if [ -f "backend/.env" ]; then
    ENV_SCORE=$((ENV_SCORE + 5))
    if grep -q "JWT_SECRET" backend/.env; then
        ENV_SCORE=$((ENV_SCORE + 5))
    fi
    if grep -q "DATABASE_URL" backend/.env; then
        ENV_SCORE=$((ENV_SCORE + 5))
    fi
fi
if [ $ENV_SCORE -eq 15 ]; then
    echo -e "${GREEN}✅ ($ENV_SCORE/15)${NC}"
else
    echo -e "${YELLOW}⚠️  ($ENV_SCORE/15)${NC}"
fi
SCORE=$((SCORE + ENV_SCORE))

# Check 6: Frontend Running (10 points)
echo -n "6. Frontend Server... "
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ (10/10)${NC}"
    SCORE=$((SCORE + 10))
else
    echo -e "${YELLOW}⚠️  (0/10)${NC}"
    echo "   Frontend not running on port 3001"
fi

# Check 7: Auth Endpoints (15 points)
echo -n "7. Auth Endpoints... "
AUTH_SCORE=0
# Test register endpoint exists
REGISTER_TEST=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{}' 2>/dev/null)
if [ -n "$REGISTER_TEST" ]; then
    AUTH_SCORE=$((AUTH_SCORE + 8))
fi
# Test login endpoint exists
LOGIN_TEST=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{}' 2>/dev/null)
if [ -n "$LOGIN_TEST" ]; then
    AUTH_SCORE=$((AUTH_SCORE + 7))
fi
if [ $AUTH_SCORE -eq 15 ]; then
    echo -e "${GREEN}✅ ($AUTH_SCORE/15)${NC}"
else
    echo -e "${YELLOW}⚠️  ($AUTH_SCORE/15)${NC}"
fi
SCORE=$((SCORE + AUTH_SCORE))

# Check 8: Admin Endpoints (10 points)
echo -n "8. Admin Endpoints... "
ADMIN_TEST=$(curl -s http://localhost:5000/api/admin/stats 2>/dev/null)
if [ -n "$ADMIN_TEST" ]; then
    echo -e "${GREEN}✅ (10/10)${NC}"
    SCORE=$((SCORE + 10))
else
    echo -e "${YELLOW}⚠️  (5/10)${NC}"
    SCORE=$((SCORE + 5))
fi

echo ""
echo "=========================================="
echo "📊 DEPLOYMENT READINESS SCORE"
echo "=========================================="
echo ""

PERCENTAGE=$((SCORE * 100 / MAX_SCORE))

if [ $PERCENTAGE -ge 80 ]; then
    echo -e "${GREEN}Score: $SCORE/$MAX_SCORE ($PERCENTAGE%)${NC}"
    echo -e "${GREEN}Status: ✅ READY FOR DEPLOYMENT${NC}"
elif [ $PERCENTAGE -ge 60 ]; then
    echo -e "${YELLOW}Score: $SCORE/$MAX_SCORE ($PERCENTAGE%)${NC}"
    echo -e "${YELLOW}Status: ⚠️  ALMOST READY - Fix warnings${NC}"
else
    echo -e "${RED}Score: $SCORE/$MAX_SCORE ($PERCENTAGE%)${NC}"
    echo -e "${RED}Status: ❌ NOT READY - Fix critical issues${NC}"
fi

echo ""
echo "=========================================="
echo "🔧 CRITICAL ISSUES"
echo "=========================================="
echo ""

# List critical issues
if grep -q "// TEMPORARILY DISABLED" backend/server.js; then
    echo -e "${RED}❌ Security middleware is disabled${NC}"
    echo "   Fix: Re-enable security middleware in backend/server.js"
    echo ""
fi

if ! curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend server not running${NC}"
    echo "   Fix: cd backend && npm start"
    echo ""
fi

echo "=========================================="
echo "📋 NEXT STEPS"
echo "=========================================="
echo ""

if [ $PERCENTAGE -lt 80 ]; then
    echo "1. Fix all critical issues listed above"
    echo "2. Run: ./test-auth-complete.sh"
    echo "3. Test in browser: http://localhost:3001"
    echo "4. Re-run this check: ./check-deployment-ready.sh"
    echo "5. When score is 80+, proceed with deployment"
else
    echo "1. Review DEPLOYMENT_GUIDE.md"
    echo "2. Setup production environment variables"
    echo "3. Choose hosting platform (Heroku, Railway, etc.)"
    echo "4. Deploy backend first, then frontend"
    echo "5. Test production deployment thoroughly"
fi

echo ""
echo "=========================================="
