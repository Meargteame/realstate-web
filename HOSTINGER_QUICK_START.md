# Hostinger Deployment - Quick Start Guide

## 🚀 Deploy in 10 Steps

### Step 1: Prepare Locally (5 minutes)

```bash
# Run deployment script
./deploy.sh
```

This creates `kw-realestate-deployment.tar.gz`

---

### Step 2: Upload to Server (5 minutes)

```bash
# From your local machine
scp kw-realestate-deployment.tar.gz root@your-server-ip:/root/
```

Or use FTP client (FileZilla) to upload the file.

---

### Step 3: Connect to Server (1 minute)

```bash
ssh root@your-server-ip
```

---

### Step 4: Run Server Setup (10 minutes)

```bash
# Extract deployment package
cd /root
tar -xzf kw-realestate-deployment.tar.gz
cd deployment

# Run server setup script
chmod +x server-setup.sh
./server-setup.sh
```

This installs: Node.js, PostgreSQL, PM2, Nginx, Certbot

---

### Step 5: Move Files (2 minutes)

```bash
# Move application files
mv backend /var/www/kw-realestate/
mv frontend /var/www/kw-realestate/
```

---

### Step 6: Configure Environment (5 minutes)

```bash
cd /var/www/kw-realestate/backend

# Create .env file
nano .env
```

Add:

```env
DATABASE_URL="postgresql://kwuser:your-password@localhost:5432/kw_realestate"
JWT_SECRET="generate-a-secure-32-character-random-string"
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

Save and exit (Ctrl+X, Y, Enter)

---

### Step 7: Setup Database (5 minutes)

```bash
cd /var/www/kw-realestate/backend

# Install dependencies
npm install --production

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database (optional)
node prisma/seed.js
```

---

### Step 8: Start Backend (2 minutes)

```bash
cd /var/www/kw-realestate/backend

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command it gives you
```

Test: `curl http://localhost:5000/api/health`

---

### Step 9: Configure Nginx (5 minutes)

```bash
# Copy nginx configuration
cp /root/deployment/nginx.conf /etc/nginx/sites-available/kw-realestate

# Edit configuration
nano /etc/nginx/sites-available/kw-realestate
```

Update:
- Replace `yourdomain.com` with your actual domain
- Replace `/var/www/kw-realestate/frontend` with correct path

```bash
# Create symlink
ln -s /etc/nginx/sites-available/kw-realestate /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

---

### Step 10: Get SSL Certificate (5 minutes)

```bash
# Make sure DNS is pointing to your server first!
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts. Certbot will automatically configure HTTPS.

---

## ✅ Verification

### Test Backend

```bash
curl https://yourdomain.com/api/health
```

Expected: `{"status":"ok","message":"KW Real Estate Backend is active."}`

### Test Frontend

Visit: `https://yourdomain.com`

Should see your homepage.

### Test Forms

1. Go to https://yourdomain.com/become-agent
2. Fill out the form
3. Submit
4. Check database:

```bash
cd /var/www/kw-realestate/backend
npx prisma studio
```

Should see new lead in database.

---

## 🔧 Troubleshooting

### Backend not responding

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs kw-backend

# Restart
pm2 restart kw-backend
```

### Frontend shows 404

```bash
# Check Nginx configuration
nginx -t

# Check file permissions
ls -la /var/www/kw-realestate/frontend

# Restart Nginx
systemctl restart nginx
```

### Database connection failed

```bash
# Check PostgreSQL is running
systemctl status postgresql

# Test connection
psql -U kwuser -d kw_realestate

# Check .env file
cat /var/www/kw-realestate/backend/.env
```

---

## 📊 Monitoring

### View Application Status

```bash
pm2 status
pm2 monit
```

### View Logs

```bash
# Backend logs
pm2 logs kw-backend

# Nginx logs
tail -f /var/log/nginx/kw-realestate-access.log
tail -f /var/log/nginx/kw-realestate-error.log
```

### Check Resources

```bash
htop
df -h
free -h
```

---

## 🔄 Updates

### Update Application

```bash
# Stop backend
pm2 stop kw-backend

# Pull new code (if using git)
cd /var/www/kw-realestate
git pull

# Update backend
cd backend
npm install --production
npx prisma generate
npx prisma db push

# Restart
pm2 restart kw-backend
```

---

## 📞 Support

For detailed instructions, see:
- `HOSTINGER_DEPLOYMENT_GUIDE.md` - Complete guide
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- `COMPLETE_FIX_OVERVIEW.md` - Platform overview

---

## 🎉 Success!

Your KW Real Estate Platform is now live at:
- **Frontend**: https://yourdomain.com
- **Backend API**: https://yourdomain.com/api
- **Admin Panel**: https://yourdomain.com/command (login required)

**Total deployment time: ~45 minutes**

---

## 📋 Quick Commands Reference

```bash
# PM2
pm2 status                    # Check status
pm2 logs kw-backend          # View logs
pm2 restart kw-backend       # Restart app
pm2 stop kw-backend          # Stop app
pm2 monit                    # Monitor resources

# Nginx
nginx -t                     # Test configuration
systemctl restart nginx      # Restart Nginx
systemctl status nginx       # Check status

# PostgreSQL
systemctl status postgresql  # Check status
psql -U kwuser -d kw_realestate  # Connect to database

# SSL
certbot renew --dry-run     # Test renewal
certbot certificates        # List certificates

# System
htop                        # Monitor resources
df -h                       # Disk usage
free -h                     # Memory usage
```

---

**Need help? Check the troubleshooting section or contact support!**
