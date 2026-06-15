# 🚀 Quick Deploy Guide - Get Your Platform Live in 30 Minutes!

## 🎯 Goal
Deploy your KW Real Estate platform for client testing with minimal cost.

## 💰 Recommended Setup (FREE/Cheap)
- **Frontend:** Vercel (Free)
- **Backend:** Railway (Free tier or $5/month)
- **Database:** Railway PostgreSQL (Included)
- **Total Cost:** $0-5/month

---

## Step 1: ~~Get Mapbox Token~~ SKIP THIS! (Map is FREE!)

**Good news!** The map now uses OpenStreetMap (completely free, no signup needed).

**You can skip this step entirely!** The map works out of the box with zero configuration.

---

## Step 2: Deploy Backend to Railway (10 minutes)

### 2.1 Create Railway Account
1. Go to https://railway.app/
2. Sign up with GitHub (easiest)

### 2.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your GitHub account
4. Select your repository
5. Railway will auto-detect it's a Node.js app

### 2.3 Add PostgreSQL Database
1. In your project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will create and connect it automatically

### 2.4 Configure Backend
1. Click on your backend service
2. Go to "Variables" tab
3. Add these environment variables:

```bash
# Required
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Auto-filled by Railway
JWT_SECRET=your-super-secret-key-change-this-in-production
PORT=5000
NODE_ENV=production

# Your Mapbox token from Step 1
MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here

# CORS - will update after frontend deploy
ALLOWED_ORIGINS=http://localhost:3001

# Optional (can add later)
REDIS_URL=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

### 2.5 Set Root Directory
1. In "Settings" tab
2. Set "Root Directory" to `backend`
3. Set "Start Command" to `node server.js`

### 2.6 Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Copy your backend URL (e.g., `https://your-app.up.railway.app`)

### 2.7 Run Database Migrations
1. In Railway, go to your backend service
2. Click "..." → "Shell"
3. Run:
```bash
npx prisma migrate deploy
npx prisma db seed  # Optional: adds sample data
```

---

## Step 3: Deploy Frontend to Vercel (5 minutes)

### 3.1 Create Vercel Account
1. Go to https://vercel.com/
2. Sign up with GitHub

### 3.2 Import Project
1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Vercel will auto-detect it's a Vite app

### 3.3 Configure Build Settings
1. **Root Directory:** `frontend`
2. **Build Command:** `npm run build`
3. **Output Directory:** `dist`
4. **Install Command:** `npm install`

### 3.4 Add Environment Variables
Click "Environment Variables" and add:

```bash
# Your Railway backend URL from Step 2
VITE_API_BASE_URL=https://your-app.up.railway.app/api

# Environment
VITE_NODE_ENV=production
```

**Note:** No Mapbox token needed! Map uses free OpenStreetMap.

### 3.5 Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Copy your frontend URL (e.g., `https://your-app.vercel.app`)

---

## Step 4: Update CORS (2 minutes)

### 4.1 Update Backend CORS
1. Go back to Railway
2. Open your backend service
3. Go to "Variables"
4. Update `ALLOWED_ORIGINS`:
```bash
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-git-main.vercel.app
```
5. Save and redeploy

---

## Step 5: Test Your Deployment (5 minutes)

### 5.1 Open Your Site
Visit your Vercel URL: `https://your-app.vercel.app`

### 5.2 Test Checklist
- [ ] Homepage loads
- [ ] Properties page shows listings
- [ ] Map displays with markers (FREE OpenStreetMap!)
- [ ] Click on a property to see details
- [ ] Try to sign up/login
- [ ] Check agent dashboard (after login)

### 5.3 If Map Doesn't Show
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify properties have latitude/longitude
4. Clear browser cache and reload

---

## Step 6: Create Test Account (2 minutes)

### 6.1 Sign Up
1. Go to `/signup` on your site
2. Create an account with your email

### 6.2 Make Yourself an Agent
Since you're the admin, you need to manually make yourself an agent:

**Option A: Using Railway Shell**
1. Go to Railway → Backend service → Shell
2. Run:
```bash
node make-me-agent.js
```

**Option B: Using Database**
1. Go to Railway → PostgreSQL → Data
2. Find your user in `User` table
3. Copy your user ID
4. Create agent record in `agents` table

---

## 🎉 You're Live!

Your platform is now deployed and accessible at:
- **Frontend:** https://your-app.vercel.app
- **Backend:** https://your-app.up.railway.app

Share the frontend URL with your client for testing!

---

## 📊 What You Get (FREE Tier)

### Vercel (Frontend)
- ✅ Unlimited bandwidth
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments from Git
- ✅ Custom domain support

### Railway (Backend + Database)
- ✅ 500 hours/month (enough for testing)
- ✅ PostgreSQL database included
- ✅ Automatic HTTPS
- ✅ Easy scaling
- ⚠️ After free hours, $5/month

### OpenStreetMap (Maps)
- ✅ Unlimited map loads
- ✅ No signup required
- ✅ No API key needed
- ✅ All map features
- ✅ 100% FREE forever!

---

## 🔧 Common Issues & Fixes

### Issue: "Failed to fetch properties"
**Fix:** Check CORS settings in Railway backend

### Issue: Map shows but no markers
**Fix:** Run database seed to add sample properties

### Issue: Can't login
**Fix:** Check JWT_SECRET is set in Railway

### Issue: Images not uploading
**Fix:** Railway has ephemeral storage. Use Cloudinary or S3 for production

---

## 📈 Next Steps

### For Production (When Ready)
1. **Custom Domain**
   - Buy domain ($12/year)
   - Add to Vercel (free SSL included)
   - Update CORS in Railway

2. **Image Storage**
   - Setup Cloudinary (free tier: 25GB)
   - Or AWS S3 ($0.023/GB)

3. **Email Service**
   - Setup SendGrid (free tier: 100 emails/day)
   - Or AWS SES ($0.10/1000 emails)

4. **Monitoring**
   - Add Sentry for error tracking (free tier)
   - Add UptimeRobot for uptime monitoring (free)

5. **Upgrade Railway**
   - $5/month for unlimited hours
   - Add Redis for caching ($5/month)

---

## 💡 Pro Tips

1. **Auto-Deploy:** Both Vercel and Railway auto-deploy when you push to GitHub
2. **Environment Variables:** Never commit .env files to Git
3. **Database Backups:** Railway auto-backs up PostgreSQL
4. **Logs:** Check Railway logs if something breaks
5. **Performance:** Vercel edge network makes your site super fast

---

## 📞 Support

If you get stuck:
1. Check Railway logs: Railway Dashboard → Service → Logs
2. Check Vercel logs: Vercel Dashboard → Deployments → Logs
3. Check browser console: F12 → Console tab

---

## ✅ Deployment Checklist

- [ ] Mapbox token obtained
- [ ] Backend deployed to Railway
- [ ] Database created and migrated
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set
- [ ] CORS configured
- [ ] Test account created
- [ ] All features tested
- [ ] Client URL shared

**Estimated Time:** 30 minutes  
**Estimated Cost:** $0-5/month  
**Difficulty:** Easy 🟢

---

**You're ready to show your client! 🎊**
