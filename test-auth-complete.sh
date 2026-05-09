#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "🧪 KW Real Estate - Authentication Tests"
echo "=========================================="
echo ""

# Check if backend is running
echo "📡 Checking if backend is running..."
if ! curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend is not running on port 5000${NC}"
    echo "Please start the backend first: cd backend && npm start"
    exit 1
fi
echo -e "${GREEN}✅ Backend is running${NC}"
echo ""

# Test 1: Health Check
echo "=========================================="
echo "Test 1: Health Check Endpoint"
echo "=========================================="
HEALTH_RESPONSE=$(curl -s http://localhost:5000/api/health)
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "$HEALTH_RESPONSE" | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "$HEALTH_RESPONSE"
fi
echo ""

# Test 2: User Signup
echo "=========================================="
echo "Test 2: User Account Signup"
echo "=========================================="
USER_EMAIL="testuser_$(date +%s)@example.com"
echo "Creating user account: $USER_EMAIL"

USER_SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"email\": \"$USER_EMAIL\",
    \"password\": \"password123\",
    \"role\": \"user\"
  }")

if echo "$USER_SIGNUP_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ User signup successful${NC}"
    USER_TOKEN=$(echo "$USER_SIGNUP_RESPONSE" | jq -r '.token' 2>/dev/null)
    USER_ID=$(echo "$USER_SIGNUP_RESPONSE" | jq -r '.id' 2>/dev/null)
    echo "User ID: $USER_ID"
    echo "Token: ${USER_TOKEN:0:20}..."
else
    echo -e "${RED}❌ User signup failed${NC}"
    echo "$USER_SIGNUP_RESPONSE"
fi
echo ""

# Test 3: Agent Signup
echo "=========================================="
echo "Test 3: Agent Account Signup"
echo "=========================================="
AGENT_EMAIL="testagent_$(date +%s)@example.com"
echo "Creating agent account: $AGENT_EMAIL"

AGENT_SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Test\",
    \"lastName\": \"Agent\",
    \"email\": \"$AGENT_EMAIL\",
    \"password\": \"password123\",
    \"role\": \"agent\"
  }")

if echo "$AGENT_SIGNUP_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ Agent signup successful${NC}"
    AGENT_TOKEN=$(echo "$AGENT_SIGNUP_RESPONSE" | jq -r '.token' 2>/dev/null)
    AGENT_ID=$(echo "$AGENT_SIGNUP_RESPONSE" | jq -r '.id' 2>/dev/null)
    AGENT_PROFILE_ID=$(echo "$AGENT_SIGNUP_RESPONSE" | jq -r '.agentId' 2>/dev/null)
    echo "User ID: $AGENT_ID"
    echo "Agent Profile ID: $AGENT_PROFILE_ID"
    echo "Token: ${AGENT_TOKEN:0:20}..."
else
    echo -e "${RED}❌ Agent signup failed${NC}"
    echo "$AGENT_SIGNUP_RESPONSE"
fi
echo ""

# Test 4: User Login
echo "=========================================="
echo "Test 4: User Login"
echo "=========================================="
echo "Logging in as: $USER_EMAIL"

USER_LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"password123\"
  }")

if echo "$USER_LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ User login successful${NC}"
    echo "Role: $(echo "$USER_LOGIN_RESPONSE" | jq -r '.role' 2>/dev/null)"
else
    echo -e "${RED}❌ User login failed${NC}"
    echo "$USER_LOGIN_RESPONSE"
fi
echo ""

# Test 5: Agent Login
echo "=========================================="
echo "Test 5: Agent Login"
echo "=========================================="
echo "Logging in as: $AGENT_EMAIL"

AGENT_LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$AGENT_EMAIL\",
    \"password\": \"password123\"
  }")

if echo "$AGENT_LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ Agent login successful${NC}"
    echo "Role: $(echo "$AGENT_LOGIN_RESPONSE" | jq -r '.role' 2>/dev/null)"
    echo "Agent Profile ID: $(echo "$AGENT_LOGIN_RESPONSE" | jq -r '.agentId' 2>/dev/null)"
else
    echo -e "${RED}❌ Agent login failed${NC}"
    echo "$AGENT_LOGIN_RESPONSE"
fi
echo ""

# Test 6: Protected Route (Get Current User)
echo "=========================================="
echo "Test 6: Protected Route - Get Current User"
echo "=========================================="

if [ -n "$USER_TOKEN" ]; then
    CURRENT_USER_RESPONSE=$(curl -s http://localhost:5000/api/auth/me \
      -H "Authorization: Bearer $USER_TOKEN")
    
    if echo "$CURRENT_USER_RESPONSE" | grep -q "email"; then
        echo -e "${GREEN}✅ Protected route works with token${NC}"
        echo "$CURRENT_USER_RESPONSE" | jq '.' 2>/dev/null || echo "$CURRENT_USER_RESPONSE"
    else
        echo -e "${RED}❌ Protected route failed${NC}"
        echo "$CURRENT_USER_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️  Skipped - no user token available${NC}"
fi
echo ""

# Test 7: Invalid Login
echo "=========================================="
echo "Test 7: Invalid Login (Wrong Password)"
echo "=========================================="

INVALID_LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"wrongpassword\"
  }")

if echo "$INVALID_LOGIN_RESPONSE" | grep -q "error"; then
    echo -e "${GREEN}✅ Invalid login correctly rejected${NC}"
else
    echo -e "${RED}❌ Invalid login should have been rejected${NC}"
    echo "$INVALID_LOGIN_RESPONSE"
fi
echo ""

# Test 8: Admin Login
echo "=========================================="
echo "Test 8: Admin Login"
echo "=========================================="

ADMIN_LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"admin@kw.com\",
    \"password\": \"password123\"
  }")

if echo "$ADMIN_LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ Admin login successful${NC}"
    ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESPONSE" | jq -r '.token' 2>/dev/null)
    echo "Role: $(echo "$ADMIN_LOGIN_RESPONSE" | jq -r '.role' 2>/dev/null)"
else
    echo -e "${YELLOW}⚠️  Admin account not found (this is OK if not seeded)${NC}"
    echo "$ADMIN_LOGIN_RESPONSE"
fi
echo ""

# Summary
echo "=========================================="
echo "📊 Test Summary"
echo "=========================================="
echo ""
echo "✅ Tests Completed"
echo ""
echo "Next Steps:"
echo "1. Test signup in browser: http://localhost:3001/signup"
echo "2. Check browser console for token in localStorage"
echo "3. Test login in browser: http://localhost:3001/login"
echo "4. Verify protected pages work after login"
echo ""
echo "=========================================="
