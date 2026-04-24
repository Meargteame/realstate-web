# Hostinger Deployment Guide - KW Real Estate Platform

## Overview

This guide will help you deploy your full-stack KW Real Estate Platform to Hostinger.

---

## Prerequisites

- Hostinger VPS or Business hosting plan
- SSH access to your server
- Domain name configured
- Node.js 18+ support

---

## Part 1: Prepare for Deployment

### Step 1: Build Frontend for Production

```bash
cd frontend
npm run build
```

This creates an optimized production build in `frontend/dist/`

### Step 2: Update Backend for Production

Create production environment file:

```bash
cd backend
cp .env .env.production
```

Edit `.env.production`:

```env
# Database - Use Hostinger's MySQL/PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/kw_realestate"

# JWT Secret - Generate a secure random string
JWT_SECRET="your-super-secure-random-string-change-this-in-production"

# Server
PORT=5000
NODE_ENV=production

# CORS - Your domain
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

### Step 3: Update CORS in Backend

Edit `backend/server.js` to use environment variable:

```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

---

## Part 2: Hostinger Setup

### Option A: VPS Hosting (Recommended)

#### 1. Connect to Your VPS

```bash
ssh root@your-server-ip
```

#### 2. Install Node.js

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
node --version
npm --version
```

#### 3. Install PostgreSQL

```bash
# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE kw_realestate;
CREATE USER kwuser WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE kw_realestate TO kwuser;
\q
```

#### 4. Install PM2 (Process Manager)

```bash
npm install -g pm2
```

#### 5. Install Nginx (Web Server)

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

---

### Option B: Shared Hosting with Node.js

If using Hostinger's shared hosting with Node.js support:

1. Use Hostinger's control panel to create Node.js application
2. Upload files via FTP or Git
3. Configure through Hostinger's interface
4. Use Hostinger's MySQL database

---

## Part 3: Deploy Application

### Step 1: Upload Files to Server

#### Option 1: Using Git (Recommended)

```bash
# On your server
cd /var/www
git clone https://github.com/yourusername/kw-realestate.git
cd kw-realestate
```

#### Option 2: Using SCP

```bash
# From your local machine
scp -r /path/to/project root@your-server-ip:/var/www/kw-realestate
```

#### Option 3: Using FTP

Use FileZilla or similar FTP client to upload files to `/var/www/kw-realestate`

### Step 2: Install Dependencies

```bash
cd /var/www/kw-realestate

# Backend dependencies
cd backend
npm install --production

# Frontend is already built, no need to install dependencies
```

### Step 3: Setup Database

```bash
cd /var/www/kw-realestate/backend

# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database (optional)
node prisma/seed.js
```

### Step 4: Start Backend with PM2

```bash
cd /var/www/kw-realestate/backend

# Start application
pm2 start server.js --name kw-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it gives you
```

### Step 5: Configure Nginx

Create Nginx configuration:

```bash
nano /etc/nginx/sites-available/kw-realestate
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend - Serve static files
    root /var/www/kw-realestate/frontend/dist;
    index index.html;

    # Frontend routing - SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
```

Enable the site:

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/kw-realestate /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

---

## Part 4: SSL Certificate (HTTPS)

### Install Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### Get SSL Certificate

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts. Certbot will automatically configure Nginx for HTTPS.

### Auto-renewal

```bash
# Test renewal
certbot renew --dry-run

# Certbot automatically sets up a cron job for renewal
```

---

## Part 5: Update Frontend API URLs

### Update Frontend to Use Production API

Edit `frontend/src/config.ts` (create if doesn't exist):

```typescript
export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://yourdomain.com/api' 
  : 'http://localhost:5000/api';
```

Update all fetch calls to use this:

```typescript
import { API_BASE_URL } from '@/config';

fetch(`${API_BASE_URL}/properties`)
```

Or use a simpler approach - since Nginx proxies `/api`, just use relative URLs:

```typescript
// This works because Nginx proxies /api to backend
fetch('/api/properties')
```

### Rebuild Frontend

```bash
cd frontend
npm run build
```

Upload the new `dist` folder to server.

---

## Part 6: Environment Variables

### Create .env file on server

```bash
cd /var/www/kw-realestate/backend
nano .env
```

Add:

```env
DATABASE_URL="postgresql://kwuser:your-secure-password@localhost:5432/kw_realestate"
JWT_SECRET="your-super-secure-random-string-minimum-32-characters"
PORT=5000
NODE_ENV=production
```

### Restart Backend

```bash
pm2 restart kw-backend
```

---

## Part 7: Firewall Configuration

```bash
# Allow SSH
ufw allow 22

# Allow HTTP
ufw allow 80

# Allow HTTPS
ufw allow 443

# Enable firewall
ufw enable
```

---

## Part 8: Monitoring & Logs

### View Backend Logs

```bash
# Real-time logs
pm2 logs kw-backend

# Last 100 lines
pm2 logs kw-backend --lines 100
```

### View Nginx Logs

```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

### Monitor Application

```bash
# PM2 monitoring
pm2 monit

# System resources
htop
```

---

## Part 9: Database Backup

### Create Backup Script

```bash
nano /root/backup-db.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U kwuser kw_realestate > $BACKUP_DIR/kw_realestate_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

Make executable:

```bash
chmod +x /root/backup-db.sh
```

### Schedule Daily Backups

```bash
crontab -e
```

Add:

```
0 2 * * * /root/backup-db.sh
```

---

## Part 10: Performance Optimization

### Enable Nginx Caching

Add to Nginx config:

```nginx
# Cache static assets
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Enable PM2 Cluster Mode

```bash
pm2 delete kw-backend
pm2 start server.js --name kw-backend -i max
pm2 save
```

---

## Part 11: Testing Deployment

### Test Backend

```bash
curl https://yourdomain.com/api/health
```

Expected: `{"status":"ok","message":"KW Real Estate Backend is active."}`

### Test Frontend

Visit: `https://yourdomain.com`

Should see your homepage.

### Test Database

```bash
cd /var/www/kw-realestate/backend
npx prisma studio
```

Access at: `http://your-server-ip:5555`

---

## Part 12: Post-Deployment Checklist

- [ ] Frontend loads at https://yourdomain.com
- [ ] Backend API responds at https://yourdomain.com/api/health
- [ ] Database connection working
- [ ] All forms submit successfully
- [ ] SSL certificate installed and working
- [ ] PM2 running and auto-starts on reboot
- [ ] Nginx configured correctly
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] Logs accessible
- [ ] Domain DNS pointing to server

---

## Troubleshooting

### Issue: 502 Bad Gateway

**Solution:**
```bash
# Check if backend is running
pm2 status

# Restart backend
pm2 restart kw-backend

# Check logs
pm2 logs kw-backend
```

### Issue: Database Connection Failed

**Solution:**
```bash
# Check PostgreSQL is running
systemctl status postgresql

# Test connection
psql -U kwuser -d kw_realestate

# Check DATABASE_URL in .env
```

### Issue: Frontend Shows 404

**Solution:**
```bash
# Check Nginx configuration
nginx -t

# Check file permissions
ls -la /var/www/kw-realestate/frontend/dist

# Restart Nginx
systemctl restart nginx
```

### Issue: CORS Errors

**Solution:**
- Update ALLOWED_ORIGINS in backend .env
- Restart backend: `pm2 restart kw-backend`
- Clear browser cache

---

## Maintenance Commands

### Update Application

```bash
cd /var/www/kw-realestate
git pull
cd backend
npm install --production
npx prisma generate
npx prisma db push
pm2 restart kw-backend
```

### View Application Status

```bash
pm2 status
systemctl status nginx
systemctl status postgresql
```

### Restart Services

```bash
pm2 restart kw-backend
systemctl restart nginx
systemctl restart postgresql
```

---

## Security Best Practices

1. **Change default passwords**
2. **Keep system updated**: `apt update && apt upgrade`
3. **Use strong JWT_SECRET**
4. **Enable firewall**
5. **Regular backups**
6. **Monitor logs**
7. **Use HTTPS only**
8. **Limit SSH access**
9. **Use SSH keys instead of passwords**
10. **Keep Node.js and dependencies updated**

---

## Support

If you encounter issues:

1. Check logs: `pm2 logs kw-backend`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Test backend: `curl http://localhost:5000/api/health`
4. Check database: `psql -U kwuser -d kw_realestate`

---

## Summary

You've successfully deployed:
- ✅ Frontend (React + TypeScript)
- ✅ Backend (Node.js + Express)
- ✅ Database (PostgreSQL)
- ✅ SSL Certificate (HTTPS)
- ✅ Process Manager (PM2)
- ✅ Web Server (Nginx)
- ✅ Automated Backups
- ✅ Monitoring & Logs

**Your KW Real Estate Platform is now live on Hostinger! 🎉**

Visit: https://yourdomain.com
