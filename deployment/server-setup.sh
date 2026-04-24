#!/bin/bash

# KW Real Estate Platform - Server Setup Script
# Run this on your Hostinger VPS to set up the environment

set -e

echo "🚀 KW Real Estate Platform - Server Setup"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 18.x
echo "📦 Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify Node.js installation
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql
echo "✅ PostgreSQL installed and started"

# Install PM2
echo "📦 Installing PM2..."
npm install -g pm2
echo "✅ PM2 installed: $(pm2 --version)"

# Install Nginx
echo "📦 Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx
echo "✅ Nginx installed and started"

# Install Certbot for SSL
echo "📦 Installing Certbot..."
apt install -y certbot python3-certbot-nginx
echo "✅ Certbot installed"

# Configure firewall
echo "🔒 Configuring firewall..."
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw --force enable
echo "✅ Firewall configured"

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /var/www/kw-realestate
echo "✅ Directory created: /var/www/kw-realestate"

# Create database and user
echo "🗄️  Setting up database..."
echo "Please enter database password for user 'kwuser':"
read -s DB_PASSWORD

sudo -u postgres psql << EOF
CREATE DATABASE kw_realestate;
CREATE USER kwuser WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE kw_realestate TO kwuser;
ALTER DATABASE kw_realestate OWNER TO kwuser;
\q
EOF

echo "✅ Database 'kw_realestate' created"
echo "✅ User 'kwuser' created"

# Create logs directory
mkdir -p /var/www/kw-realestate/backend/logs
chmod 755 /var/www/kw-realestate/backend/logs

echo ""
echo "=========================================="
echo "✅ Server setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Upload your application files to /var/www/kw-realestate"
echo "2. Create .env file with database credentials"
echo "3. Install dependencies: cd /var/www/kw-realestate/backend && npm install"
echo "4. Generate Prisma client: npx prisma generate"
echo "5. Push database schema: npx prisma db push"
echo "6. Start application: pm2 start ecosystem.config.js"
echo "7. Configure Nginx (see nginx.conf)"
echo "8. Get SSL certificate: certbot --nginx -d yourdomain.com"
echo ""
echo "Database credentials:"
echo "  Database: kw_realestate"
echo "  User: kwuser"
echo "  Password: [the one you entered]"
echo "  Connection: postgresql://kwuser:password@localhost:5432/kw_realestate"
echo ""
