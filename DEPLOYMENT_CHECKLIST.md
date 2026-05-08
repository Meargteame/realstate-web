# 🚀 Deployment Checklist

## Pre-Deployment Tasks

### 1. Environment Variables Setup

#### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://username:password@host:5432/database"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-super-secret-jwt-key-here"

# Server
PORT=5000
NODE_ENV=production

# CORS (add your frontend domain)
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# Redis (optional - for caching)
REDIS_URL="redis://localhost:6379"

# Email (optional - for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# SMS (optional - Twilio)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Mapbox (for geocoding)
MAPBOX_ACCESS_TOKEN="your-mapbox-token"

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR="./uploads"

# Monitoring (optional)
METRICS_API_KEY="your-metrics-key"
```

#### Frontend (.env)
```bash
# API Configuration
VITE_API_BASE_URL=https://api.yourdomain.com/api

# Mapbox (get free token at https://account.mapbox.com/)
VITE_MAPBOX_ACCESS_TOKEN=pk.your-actual-mapbox-token-here

# Environment
VITE_NODE_ENV=production
```

### 2. Get Mapbox Token (FREE)
1. Go to https://account.mapbox.com/
2. Sign up for free account
3. Go to "Access tokens"
4. Create new token or copy default public token
5. Add to both backend and frontend .env files

### 3. Database Setup
```bash
# Run migrations
cd backend
npx prisma migrate deploy

# Seed database (optional)
npm run seed
```

### 4. Build Frontend
```bash
cd frontend
npm install
npm run build
# Output will be in frontend/dist/
```

### 5. Build Backend
```bash
cd backend
npm install
npm run build  # if you have a build script
```

## Deployment Options

### Option 1: Simple VPS (DigitalOcean, Linode, etc.)

**Cost:** $5-20/month

**Steps:**
1. Create Ubuntu 22.04 droplet
2. Install Node.js, PostgreSQL, Nginx
3. Clone repository
4. Setup environment variables
5. Run migrations
6. Start backend with PM2
7. Serve frontend with Nginx

**Commands:**
```bash
# Install dependencies
sudo apt update
sudo apt install nodejs npm postgresql nginx

# Install PM2
sudo npm install -g pm2

# Setup PostgreSQL
sudo -u postgres createdb kw_realestate
sudo -u postgres createuser -P meareg

# Clone and setup
git clone your-repo
cd backend
npm install
npx prisma migrate deploy

# Start backend
pm2 start server.js --name kw-backend
pm2 save
pm2 startup

# Setup Nginx for frontend
sudo cp frontend/dist/* /var/www/html/
```

### Option 2: Heroku (Easy, Managed)

**Cost:** $7-25/month

**Backend:**
```bash
cd backend
heroku create kw-backend
heroku addons:create heroku-postgresql:mini
heroku config:set JWT_SECRET="your-secret"
heroku config:set MAPBOX_ACCESS_TOKEN="your-token"
git push heroku main
heroku run npx prisma migrate deploy
```

**Frontend:**
```bash
cd frontend
# Update VITE_API_BASE_URL to Heroku backend URL
npm run build
# Deploy to Vercel/Netlify (see below)
```

### Option 3: Vercel + Railway (Recommended)

**Cost:** $0-5/month (free tier available)

**Backend (Railway):**
1. Go to railway.app
2. Create new project
3. Add PostgreSQL database
4. Deploy from GitHub
5. Add environment variables
6. Deploy!

**Frontend (Vercel):**
1. Go to vercel.com
2. Import GitHub repository
3. Select frontend folder
4. Add environment variables
5. Deploy!

### Option 4: AWS (Production-Grade)

**Cost:** $50-200/month

**Services:**
- EC2 for backend
- RDS for PostgreSQL
- S3 + CloudFront for frontend
- Route 53 for DNS
- ElastiCache for Redis (optional)

## Post-Deployment

### 1. Test Everything
- [ ] Homepage loads
- [ ] Property search works
- [ ] Map displays correctly
- [ ] User registration/login
- [ ] Agent dashboard accessible
- [ ] Messaging system works
- [ ] Image uploads work
- [ ] Calendar functions
- [ ] Video calls connect

### 2. Setup Monitoring
- [ ] Setup error tracking (Sentry)
- [ ] Setup uptime monitoring (UptimeRobot)
- [ ] Setup analytics (Google Analytics)
- [ ] Setup logging (Papertrail)

### 3. Security Checklist
- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] File upload limits set
- [ ] SQL injection protection (Prisma handles this)
- [ ] XSS protection enabled

### 4. Performance Optimization
- [ ] Enable gzip compression
- [ ] Setup CDN for static assets
- [ ] Enable Redis caching
- [ ] Optimize images
- [ ] Enable browser caching
- [ ] Minify CSS/JS (done by build)

### 5. DNS & Domain
- [ ] Purchase domain name
- [ ] Point A record to backend IP
- [ ] Point CNAME to frontend (Vercel/Netlify)
- [ ] Setup SSL certificate (Let's Encrypt)
- [ ] Configure www redirect

## Quick Deploy Script

I've created `deploy.sh` for you. To use:

```bash
chmod +x deploy.sh
./deploy.sh
```

## Troubleshooting

### Map not showing?
- Check Mapbox token is valid
- Check browser console for errors
- Verify CORS allows your domain

### Database connection failed?
- Check DATABASE_URL format
- Verify database exists
- Check firewall allows connection

### Images not uploading?
- Check UPLOAD_DIR exists
- Verify file permissions
- Check MAX_FILE_SIZE setting

### CORS errors?
- Add frontend domain to ALLOWED_ORIGINS
- Check protocol (http vs https)
- Verify credentials: true in CORS config

## Support

For issues:
1. Check logs: `pm2 logs kw-backend`
2. Check database: `psql -U meareg -d kw_realestate`
3. Test API: `curl https://api.yourdomain.com/api/health`

## Estimated Costs

### Minimal Setup (Development/Testing)
- VPS: $5/month (DigitalOcean)
- Domain: $12/year
- **Total: ~$6/month**

### Recommended Setup (Small Business)
- Vercel (Frontend): Free
- Railway (Backend + DB): $5/month
- Domain: $12/year
- Mapbox: Free (50k requests/month)
- **Total: ~$6/month**

### Production Setup (Growing Business)
- AWS EC2: $20/month
- AWS RDS: $30/month
- AWS S3 + CloudFront: $10/month
- Domain: $12/year
- Monitoring: $10/month
- **Total: ~$71/month**

## Next Steps

1. ✅ Get Mapbox token
2. ✅ Setup environment variables
3. ✅ Choose deployment platform
4. ✅ Deploy backend
5. ✅ Deploy frontend
6. ✅ Test everything
7. ✅ Setup monitoring
8. ✅ Go live!

---

**Your platform is ready to deploy! 🎉**
