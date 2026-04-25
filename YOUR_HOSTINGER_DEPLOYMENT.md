# 🚀 Your Hostinger VPS Deployment Guide

## Based on Your Dashboard

**Your VPS Details:**
- Plan: KVM1 (4 GB RAM, 50 GB Disk)
- OS: Ubuntu 22.04 LTS ✅
- Location: United States - Dayton 3
- IP: 134.233.106.xxx (visible in your dashboard)

---

## 🎯 Step-by-Step Deployment

### STEP 1: Get Your Server IP and SSH Password (2 minutes)

**In your Hostinger dashboard:**

1. Look at the "VPS details" section (bottom left of your screenshot)
2. Find and copy:
   - **IPv4**: 134.233.xxx.xxx (full IP address)
   - **SSH username**: root (already visible)
   
3. **Get SSH password**:
   - In the left sidebar, click on **"Overview"** (you're already there)
   - Look for **"Root password"** or **"SSH password"**
   - If you don't see it, click on **"Settings"** in the left sidebar
   - Look for "Change root password" or "SSH access"
   - Copy or reset your root password

**Write down here:**
- IP Address: _______________
- SSH Username: root
- SSH Password: _______________

---

### STEP 2: Upload Deployment Package (5 minutes)

You have two options:

#### Option A: Using SCP (Command Line) - Recommended

Open your terminal and run:

```bash
scp kw-realestate-deployment.tar.gz root@YOUR_IP_ADDRESS:/root/
```

Replace `YOUR_IP_ADDRESS` with your actual IP (134.233.xxx.xxx)

**Example:**
```bash
scp kw-realestate-deployment.tar.gz root@134.233.106.xxx:/root/
```

When prompted:
- Type "yes" to accept the fingerprint
- Enter your root password

#### Option B: Using Hostinger File Manager

1. In your Hostinger dashboard, click **"File Manager"** in the left sidebar
2. Navigate to `/root/` directory
3. Click "Upload" button
4. Select `kw-realestate-deployment.tar.gz`
5. Wait for upload to complete

**I recommend Option A (SCP) as it's faster for large files.**

---

### STEP 3: Connect to Your Server via SSH (1 minute)

**Open your terminal and run:**

```bash
ssh root@YOUR_IP_ADDRESS
```

Replace with your actual IP:
```bash
ssh root@134.233.106.xxx
```

**When prompted:**
- Type "yes" to accept the fingerprint
- Enter your root password
- Press Enter

**You should see:**
```
Welcome to Ubuntu 22.04 LTS
root@ubuntu:~#
```

✅ You're now connected to your server!

---

### STEP 4: Verify Upload and Extract (2 minutes)

**In your SSH session, run:**

```bash
# Check if file was uploaded
ls -lh /root/kw-realestate-deployment.tar.gz

# Extract the package
cd /root
tar -xzf kw-realestate-deployment.tar.gz

# Verify extraction
ls -la deployment/
```

**You should see:**
- `deployment/backend/`
- `deployment/frontend/`
- Configuration files

---

### STEP 5: Run Server Setup Script (10 minutes)

**This script will install everything automatically:**

```bash
cd /root/deployment

# Make script executable
chmod +x server-setup.sh

# Run the setup
./server-setup.sh
```

**What this installs:**
- Node.js 18
- PostgreSQL 14
- PM2 (process manager)
- Nginx (web server)
- Certbot (SSL certificates)

**Watch for:**
- Green checkmarks ✅
- "Installation complete" messages
- Any red error messages (let me know if you see any)

**This takes ~10 minutes. Wait for it to complete.**

---

### STEP 6: Setup PostgreSQL Database (5 minutes)

**After server setup completes, run:**

```bash
# Switch to postgres user
sudo -u postgres psql
```

**You'll see:** `postgres=#`

**Now run these commands one by one:**

```sql
CREATE DATABASE kw_realestate;
```

**You should see:** `CREATE DATABASE`

```sql
CREATE USER kwuser WITH PASSWORD 'KwSecure2024!Pass';
```

**Replace** `KwSecure2024!Pass` with your own strong password!

**You should see:** `CREATE ROLE`

```sql
GRANT ALL PRIVILEGES ON DATABASE kw_realestate TO kwuser;
```

**You should see:** `GRANT`

```sql
\q
```

**This exits PostgreSQL.**

**Write down your database password:** _______________

---

### STEP 7: Move Application Files (2 minutes)

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
- `backend/`
- `frontend/`

---

### STEP 8: Configure Environment Variables (5 minutes)

```bash
cd /var/www/kw-realestate/backend

# Create .env file
nano .env
```

**Copy and paste this, then update the values:**

```env
# Database Configuration
DATABASE_URL="postgresql://kwuser:YOUR_DB_PASSWORD@localhost:5432/kw_realestate"

# JWT Secret (generate random 32+ character string)
JWT_SECRET="change-this-to-a-random-32-character-string-now"

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration (replace with your domain)
ALLOWED_ORIGINS="http://134.233.106.xxx,https://yourdomain.com"
```

**Important - Update these:**
1. Replace `YOUR_DB_PASSWORD` with the password from Step 6
2. Replace `change-this-to-a-random-32-character-string-now` with a random string
3. Replace `134.233.106.xxx` with your actual IP
4. If you have a domain, add it to ALLOWED_ORIGINS

**To generate a secure JWT secret, open another terminal and run:**
```bash
openssl rand -base64 32
```
Copy the output and use it as JWT_SECRET.

**Save the file:**
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

---

### STEP 9: Install Dependencies and Setup Database (5 minutes)

```bash
cd /var/www/kw-realestate/backend

# Install dependencies
npm install --production

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database with sample data
node prisma/seed.js
```

**Watch for:**
- ✅ "Dependencies installed"
- ✅ "Prisma schema loaded"
- ✅ "Database schema created"
- ✅ "Seeding complete"

---

### STEP 10: Start Backend with PM2 (3 minutes)

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

✅ Backend is working!

---

### STEP 11: Configure Nginx (5 minutes)

```bash
# Copy nginx configuration
cp /root/deployment/nginx.conf /etc/nginx/sites-available/kw-realestate

# Edit configuration
nano /etc/nginx/sites-available/kw-realestate
```

**Update these lines:**

Find `server_name yourdomain.com www.yourdomain.com;`

**Replace with your IP:**
```nginx
server_name 134.233.106.xxx;
```

Replace `134.233.106.xxx` with your actual IP.

**If you have a domain, use:**
```nginx
server_name yourdomain.com www.yourdomain.com;
```

**Save the file** (Ctrl+X, Y, Enter)

**Enable the site:**
```bash
# Create symlink
ln -s /etc/nginx/sites-available/kw-realestate /etc/nginx/sites-enabled/

# Remove default site
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

**Status should show:** `active (running)` in green

---

### STEP 12: Test Your Website (2 minutes)

**Open your browser and visit:**

```
http://134.233.106.xxx
```

Replace with your actual IP address.

**You should see your homepage!** 🎉

**Test the API:**
```
http://134.233.106.xxx/api/health
```

**You should see:**
```json
{"status":"ok","message":"KW Real Estate Backend is active."}
```

---

### STEP 13: Setup Domain (Optional - If You Have One)

**If you have a domain name:**

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add DNS A record:
   - Type: A
   - Name: @ (or leave blank)
   - Value: 134.233.106.xxx (your IP)
   - TTL: 3600
3. Add another A record for www:
   - Type: A
   - Name: www
   - Value: 134.233.106.xxx (your IP)
   - TTL: 3600
4. Save changes
5. Wait 5-30 minutes for DNS propagation

**Check DNS:**
```bash
ping yourdomain.com
```

Should show your server IP.

---

### STEP 14: Get SSL Certificate (5 minutes)

**If using domain (skip if using IP only):**

```bash
# Make sure DNS is pointing to your server first!
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Follow the prompts:**
1. Enter your email address
2. Agree to terms (Y)
3. Share email? (N or Y, your choice)
4. Redirect HTTP to HTTPS? Choose option 2 (Redirect)

**Test auto-renewal:**
```bash
certbot renew --dry-run
```

**Now visit:**
```
https://yourdomain.com
```

You should see the green padlock! 🔒

---

## ✅ Verification Checklist

- [ ] Backend API responding: `curl http://YOUR_IP/api/health`
- [ ] Frontend loading: Open `http://YOUR_IP` in browser
- [ ] Homepage displays correctly
- [ ] Navigation works
- [ ] Forms are visible
- [ ] PM2 shows backend online: `pm2 status`
- [ ] Nginx is running: `systemctl status nginx`
- [ ] PostgreSQL is running: `systemctl status postgresql`

---

## 🔧 Troubleshooting

### Backend Not Starting

```bash
# Check PM2 logs
pm2 logs kw-backend

# Restart backend
pm2 restart kw-backend
```

### Frontend Shows 404

```bash
# Check Nginx error log
tail -f /var/log/nginx/error.log

# Verify frontend files exist
ls -la /var/www/kw-realestate/frontend/

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

---

## 📊 Monitoring Commands

```bash
# Check application status
pm2 status
pm2 monit

# View logs
pm2 logs kw-backend

# Check server resources
htop

# Check disk space
df -h

# Check memory
free -h
```

---

## 🎉 Success!

Your KW Real Estate Platform is now live!

**Access your platform:**
- Frontend: http://YOUR_IP (or https://yourdomain.com)
- Backend API: http://YOUR_IP/api (or https://yourdomain.com/api)

**What's working:**
- ✅ Property search and filtering
- ✅ Agent profiles
- ✅ Lead capture forms (5 types)
- ✅ Mortgage calculator
- ✅ Home value estimator
- ✅ All 45+ features functional

---

## 📞 Need Help?

If you encounter any issues during deployment:
1. Read the error message carefully
2. Check the troubleshooting section above
3. Check logs: `pm2 logs kw-backend`
4. Let me know the error and I'll help!

---

**Let's start with Step 1! Get your IP address and SSH password from your Hostinger dashboard.**
