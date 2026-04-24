# 🚀 Hostinger Deployment Walkthrough

## Let's Deploy Your Platform Together!

This is your step-by-step guide. We'll go through each step together.

---

## ✅ Step 1: Preparation (COMPLETED)

**What we just did:**
- ✅ Cleaned old deployment files
- ✅ Created fresh deployment package
- ✅ Excluded pgdata folder (no local database files)
- ✅ Excluded node_modules (will install on server)
- ✅ Created `kw-realestate-deployment.tar.gz`

**Files ready:**
- `kw-realestate-deployment.tar.gz` - Your deployment package
- `deployment/` folder - Contains everything needed

---

## 📋 What You Need Before Starting

### 1. Hostinger Account Information
- [ ] Server IP address
- [ ] SSH username (usually `root` or your username)
- [ ] SSH password or key
- [ ] Domain name (e.g., yourdomain.com)

### 2. Domain Setup
- [ ] Domain registered
- [ ] DNS A record pointing to server IP
- [ ] Wait 5-30 minutes for DNS propagation

### 3. Local Tools
- [ ] Terminal/Command Prompt
- [ ] SSH client (built-in on Mac/Linux, use PuTTY on Windows)
- [ ] SCP/FTP client (optional: FileZilla for GUI upload)

---

## 🎯 Step 2: Upload to Server

### Option A: Using SCP (Command Line)

```bash
# Replace with your actual server IP
scp kw-realestate-deployment.tar.gz root@YOUR_SERVER_IP:/root/
```

**Example:**
```bash
scp kw-realestate-deployment.tar.gz root@123.45.67.89:/root/
```

### Option B: Using FileZilla (GUI)

1. Open FileZilla
2. Connect to your server:
   - Host: `sftp://YOUR_SERVER_IP`
   - Username: `root`
   - Password: Your SSH password
   - Port: `22`
3. Navigate to `/root/` on the server
4. Drag and drop `kw-realestate-deployment.tar.gz`

**Upload time:** ~2-5 minutes depending on your internet speed

---

## 🔌 Step 3: Connect to Server

```bash
ssh root@YOUR_SERVER_IP
```

**Example:**
```bash
ssh root@123.45.67.89
```

You'll be asked for your password. Type it (it won't show on screen) and press Enter.

**You should see:** Server welcome message and command prompt

---

## 📦 Step 4: Extract Deployment Package

```bash
# Navigate to root directory
cd /root

# Verify file was uploaded
ls -lh kw-realestate-deployment.tar.gz

# Extract the package
tar -xzf kw-realestate-deployment.tar.gz

# Verify extraction
ls -la deployment/
```

**You should see:**
- `deployment/backend/` folder
- `deployment/frontend/` folder
- Documentation files
- Configuration files

---

## 🛠️ Step 5: Run Server Setup Script

This installs all required software: Node.js, PostgreSQL, PM2, Nginx, Certbot

```bash
cd deployment

# Make script executable
chmod +x server-setup.sh

# Run the setup
./server-setup.sh
```

**This will:**
1. Update system packages
2. Install Node.js 18
3. Install PostgreSQL 14
4. Install PM2 (process manager)
5. Install Nginx (web server)
6. Install Certbot (SSL certificates)
7. Configure firewall

**Time:** ~10-15 minutes

**Watch for:** Any error messages (red text)

---

## 🗄️ Step 6: Setup Database

### Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt, run these commands:
CREATE DATABASE kw_realestate;
CREATE USER kwuser WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE kw_realestate TO kwuser;
\q
```

**Replace** `your_secure_password_here` with a strong password!

**Example password:** `Kw2024!SecureDB#Pass`

**Save this password!** You'll need it in the next step.

---

## 📁 Step 7: Move Application Files

```bash
# Create application directory
mkdir -p /var/www/kw-realestate

# Move backend
mv /root/deployment/backend /var/www/kw-realestate/

# Move frontend
mv /root/deployment/frontend /var/www/kw-realestate/

# Verify
ls -la /var/www/kw-realestate/
```

**You should see:**
- `/var/www/kw-realestate/backend/`
- `/var/www/kw-realestate/frontend/`

---

## ⚙️ Step 8: Configure Environment Variables

```bash
cd /var/www/kw-realestate/backend

# Create .env file
nano .env
```

**Copy and paste this, then update the values:**

```env
# Database Configuration
DATABASE_URL="postgresql://kwuser:YOUR_PASSWORD_HERE@localhost:5432/kw_realestate"

# JWT Secret (generate a random 32+ character string)
JWT_SECRET="your-super-secret-jwt-key-change-this-to-random-string"

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration (replace with your actual domain)
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

**Important:**
1. Replace `YOUR_PASSWORD_HERE` with the database password from Step 6
2. Replace `your-super-secret-jwt-key-change-this-to-random-string` with a random string
3. Replace `yourdomain.com` with your actual domain

**To generate a secure JWT secret:**
```bash
# Run this in another terminal
openssl rand -base64 32
```

**Save the file:**
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

---

## 📦 Step 9: Install Backend Dependencies

```bash
cd /var/www/kw-realestate/backend

# Install dependencies
npm install --production

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database with sample data (optional)
node prisma/seed.js
```

**Time:** ~5 minutes

**Watch for:** 
- ✅ "Dependencies installed successfully"
- ✅ "Prisma schema loaded"
- ✅ "Database schema created"

---

## 🚀 Step 10: Start Backend with PM2

```bash
cd /var/www/kw-realestate/backend

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

**The last command will give you another command to run. Copy and run it!**

Example:
```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

**Verify backend is running:**
```bash
pm2 status
```

**You should see:**
```
┌─────┬──────────────┬─────────┬─────────┐
│ id  │ name         │ status  │ restart │
├─────┼──────────────┼─────────┼─────────┤
│ 0   │ kw-backend   │ online  │ 0       │
└─────┴──────────────┴─────────┴─────────┘
```

**Test backend:**
```bash
curl http://localhost:5000/api/health
```

**Expected response:**
```json
{"status":"ok","message":"KW Real Estate Backend is active."}
```

---

## 🌐 Step 11: Configure Nginx

```bash
# Copy nginx configuration
cp /root/deployment/nginx.conf /etc/nginx/sites-available/kw-realestate

# Edit configuration
nano /etc/nginx/sites-available/kw-realestate
```

**Update these lines:**
1. Replace `yourdomain.com` with your actual domain (appears 3 times)
2. Verify paths are correct:
   - `root /var/www/kw-realestate/frontend;`
   - `proxy_pass http://localhost:5000;`

**Save the file** (Ctrl+X, Y, Enter)

**Enable the site:**
```bash
# Create symlink
ln -s /etc/nginx/sites-available/kw-realestate /etc/nginx/sites-enabled/

# Remove default site (optional)
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t
```

**You should see:**
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**Restart Nginx:**
```bash
systemctl restart nginx
systemctl status nginx
```

**Status should show:** `active (running)`

---

## 🔒 Step 12: Get SSL Certificate (HTTPS)

**IMPORTANT:** Make sure your domain DNS is pointing to your server IP first!

```bash
# Get certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Replace** `yourdomain.com` with your actual domain

**Follow the prompts:**
1. Enter your email address
2. Agree to terms (Y)
3. Share email? (N or Y, your choice)
4. Redirect HTTP to HTTPS? Choose option 2 (Redirect)

**Time:** ~2 minutes

**Test auto-renewal:**
```bash
certbot renew --dry-run
```

---

## ✅ Step 13: Verify Deployment

### Test Backend API

```bash
curl https://yourdomain.com/api/health
```

**Expected:**
```json
{"status":"ok","message":"KW Real Estate Backend is active."}
```

### Test Frontend

Open your browser and visit:
- `https://yourdomain.com`

**You should see:** Your homepage!

### Test Forms

1. Go to `https://yourdomain.com/become-agent`
2. Fill out the form
3. Submit
4. Check database:

```bash
cd /var/www/kw-realestate/backend
npx prisma studio
```

This opens a web interface at `http://localhost:5555`

**To access from your local machine:**
```bash
# On your local machine, create SSH tunnel
ssh -L 5555:localhost:5555 root@YOUR_SERVER_IP
```

Then open `http://localhost:5555` in your browser.

---

## 🎉 Success Checklist

- [ ] Backend API responding at `/api/health`
- [ ] Frontend loading at your domain
- [ ] HTTPS working (green padlock)
- [ ] Forms submitting successfully
- [ ] Data saving to database
- [ ] All pages accessible
- [ ] No console errors
- [ ] PM2 showing backend online

---

## 🔧 Troubleshooting

### Backend Not Starting

```bash
# Check PM2 logs
pm2 logs kw-backend

# Check for errors
pm2 describe kw-backend

# Restart
pm2 restart kw-backend
```

### Frontend Shows 404

```bash
# Check Nginx error log
tail -f /var/log/nginx/error.log

# Verify frontend files exist
ls -la /var/www/kw-realestate/frontend/

# Check Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### Database Connection Error

```bash
# Check PostgreSQL is running
systemctl status postgresql

# Test database connection
psql -U kwuser -d kw_realestate

# Check .env file
cat /var/www/kw-realestate/backend/.env
```

### SSL Certificate Issues

```bash
# Check certificate status
certbot certificates

# Renew certificate
certbot renew

# Check Nginx configuration
nginx -t
```

---

## 📊 Monitoring Commands

### Check Application Status

```bash
# PM2 status
pm2 status

# PM2 monitoring
pm2 monit

# View logs
pm2 logs kw-backend
```

### Check Server Resources

```bash
# CPU and memory
htop

# Disk space
df -h

# Memory usage
free -h
```

### Check Nginx

```bash
# Status
systemctl status nginx

# Access log
tail -f /var/log/nginx/kw-realestate-access.log

# Error log
tail -f /var/log/nginx/kw-realestate-error.log
```

---

## 🔄 Making Updates

### Update Application Code

```bash
# Stop backend
pm2 stop kw-backend

# Navigate to backend
cd /var/www/kw-realestate/backend

# Pull new code (if using git)
git pull

# Install dependencies
npm install --production

# Update database schema
npx prisma generate
npx prisma db push

# Restart
pm2 restart kw-backend
```

---

## 📞 Need Help?

### Check These First:
1. PM2 logs: `pm2 logs kw-backend`
2. Nginx error log: `tail -f /var/log/nginx/error.log`
3. PostgreSQL status: `systemctl status postgresql`

### Common Issues:
- **Port already in use**: Another service using port 5000
- **Database connection failed**: Check DATABASE_URL in .env
- **Permission denied**: Check file ownership and permissions
- **SSL certificate error**: Check DNS is pointing to server

---

## 🎯 Next Steps After Deployment

### Immediate (Day 1)
- [ ] Test all features thoroughly
- [ ] Monitor logs for errors
- [ ] Verify SSL certificate
- [ ] Check performance

### Short-term (Week 1)
- [ ] Setup automated backups
- [ ] Configure monitoring alerts
- [ ] Review analytics
- [ ] Gather user feedback

### Long-term (Month 1+)
- [ ] Regular security updates
- [ ] Performance optimization
- [ ] Feature enhancements
- [ ] Scale as needed

---

## 🎉 Congratulations!

Your KW Real Estate Platform is now live!

**Your platform includes:**
- ✅ Full property search and filtering
- ✅ Agent profiles and search
- ✅ Lead capture forms (5 types)
- ✅ Mortgage calculator
- ✅ Home value estimator
- ✅ Favorites system
- ✅ Responsive design
- ✅ HTTPS security
- ✅ Production-ready backend

**Access your platform:**
- Frontend: https://yourdomain.com
- Backend API: https://yourdomain.com/api
- Admin: https://yourdomain.com/command

---

## 📋 Quick Reference

```bash
# PM2 Commands
pm2 status                    # Check status
pm2 logs kw-backend          # View logs
pm2 restart kw-backend       # Restart
pm2 stop kw-backend          # Stop
pm2 monit                    # Monitor

# Nginx Commands
systemctl status nginx       # Check status
systemctl restart nginx      # Restart
nginx -t                     # Test config

# Database Commands
systemctl status postgresql  # Check status
psql -U kwuser -d kw_realestate  # Connect
npx prisma studio           # Open GUI

# SSL Commands
certbot certificates        # List certificates
certbot renew              # Renew certificates
```

---

**You did it! Your platform is live! 🚀**
