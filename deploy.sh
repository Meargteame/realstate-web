#!/bin/bash

# KW Real Estate Platform - Deployment Script
# This script helps automate the deployment process

set -e  # Exit on error

echo "🚀 KW Real Estate Platform - Deployment Helper"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo "Step 1: Checking Prerequisites"
echo "================================"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm installed: $NPM_VERSION"
else
    print_error "npm not found"
    exit 1
fi

# Check Git
if command_exists git; then
    print_success "Git installed"
else
    print_error "Git not found. Please install Git"
    exit 1
fi

# Check Heroku CLI
if command_exists heroku; then
    print_success "Heroku CLI installed"
else
    print_warning "Heroku CLI not found. Install from: https://devcenter.heroku.com/articles/heroku-cli"
fi

# Check Vercel CLI
if command_exists vercel; then
    print_success "Vercel CLI installed"
else
    print_warning "Vercel CLI not found. Install with: npm install -g vercel"
fi

echo ""
echo "Step 2: Environment Configuration"
echo "=================================="

# Check if .env files exist
if [ -f "backend/.env" ]; then
    print_success "Backend .env found"
else
    print_warning "Backend .env not found. Creating from example..."
    cp backend/.env.example backend/.env
    print_info "Please edit backend/.env with your configuration"
fi

if [ -f "frontend/.env" ]; then
    print_success "Frontend .env found"
else
    print_warning "Frontend .env not found. Creating from example..."
    cp frontend/.env.example frontend/.env
    print_info "Please edit frontend/.env with your Mapbox token"
fi

echo ""
echo "Step 3: What would you like to do?"
echo "===================================="
echo "1) Setup Mapbox token"
echo "2) Deploy Backend to Heroku"
echo "3) Deploy Frontend to Vercel"
echo "4) Run full deployment"
echo "5) Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "📍 Mapbox Token Setup"
        echo "====================="
        echo ""
        echo "1. Go to: https://account.mapbox.com/auth/signup/"
        echo "2. Sign up for a free account"
        echo "3. Copy your access token (starts with pk.)"
        echo ""
        read -p "Enter your Mapbox token: " MAPBOX_TOKEN
        
        if [ ! -z "$MAPBOX_TOKEN" ]; then
            # Update frontend .env
            if grep -q "VITE_MAPBOX_ACCESS_TOKEN" frontend/.env; then
                sed -i.bak "s|VITE_MAPBOX_ACCESS_TOKEN=.*|VITE_MAPBOX_ACCESS_TOKEN=$MAPBOX_TOKEN|" frontend/.env
            else
                echo "VITE_MAPBOX_ACCESS_TOKEN=$MAPBOX_TOKEN" >> frontend/.env
            fi
            print_success "Mapbox token saved to frontend/.env"
        else
            print_error "No token provided"
        fi
        ;;
        
    2)
        echo ""
        echo "🚀 Backend Deployment to Heroku"
        echo "================================"
        
        if ! command_exists heroku; then
            print_error "Heroku CLI not installed"
            exit 1
        fi
        
        echo ""
        read -p "Enter your Heroku app name (e.g., kw-realestate-api): " HEROKU_APP
        
        if [ -z "$HEROKU_APP" ]; then
            print_error "App name required"
            exit 1
        fi
        
        cd backend
        
        # Check if Heroku remote exists
        if git remote | grep -q heroku; then
            print_info "Heroku remote already exists"
        else
            print_info "Creating Heroku app..."
            heroku create $HEROKU_APP
        fi
        
        # Create Procfile if not exists
        if [ ! -f "Procfile" ]; then
            echo "web: node server.js" > Procfile
            print_success "Procfile created"
        fi
        
        print_info "Setting environment variables..."
        heroku config:set NODE_ENV=production
        heroku config:set JWT_SECRET=$(openssl rand -base64 32)
        
        print_info "Adding PostgreSQL..."
        heroku addons:create heroku-postgresql:essential-0 || print_warning "PostgreSQL addon may already exist"
        
        print_info "Deploying to Heroku..."
        git add .
        git commit -m "Deploy to Heroku" || true
        git push heroku main || git push heroku master
        
        print_info "Running database migrations..."
        heroku run npx prisma db push
        
        print_success "Backend deployed to: https://$HEROKU_APP.herokuapp.com"
        
        cd ..
        ;;
        
    3)
        echo ""
        echo "🚀 Frontend Deployment to Vercel"
        echo "================================="
        
        if ! command_exists vercel; then
            print_error "Vercel CLI not installed. Install with: npm install -g vercel"
            exit 1
        fi
        
        cd frontend
        
        print_info "Building frontend..."
        npm run build
        
        print_info "Deploying to Vercel..."
        vercel --prod
        
        print_success "Frontend deployed!"
        print_info "Don't forget to set environment variables in Vercel dashboard"
        
        cd ..
        ;;
        
    4)
        echo ""
        echo "🚀 Full Deployment"
        echo "=================="
        print_warning "This will deploy both backend and frontend"
        read -p "Continue? (y/n): " confirm
        
        if [ "$confirm" != "y" ]; then
            echo "Deployment cancelled"
            exit 0
        fi
        
        # Deploy backend
        echo ""
        echo "Deploying backend..."
        read -p "Enter Heroku app name: " HEROKU_APP
        
        cd backend
        heroku create $HEROKU_APP || true
        echo "web: node server.js" > Procfile
        heroku config:set NODE_ENV=production
        heroku config:set JWT_SECRET=$(openssl rand -base64 32)
        heroku addons:create heroku-postgresql:essential-0 || true
        git add .
        git commit -m "Deploy" || true
        git push heroku main || git push heroku master
        heroku run npx prisma db push
        cd ..
        
        # Deploy frontend
        echo ""
        echo "Deploying frontend..."
        cd frontend
        npm run build
        vercel --prod
        cd ..
        
        print_success "Full deployment complete!"
        ;;
        
    5)
        echo "Goodbye!"
        exit 0
        ;;
        
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Done!"
echo ""
echo "Next steps:"
echo "1. Get Mapbox token: https://account.mapbox.com/"
echo "2. Setup SendGrid: https://signup.sendgrid.com/"
echo "3. Configure environment variables"
echo "4. Test your deployment"
echo ""
echo "📚 Full guide: See DEPLOYMENT_GUIDE.md"
