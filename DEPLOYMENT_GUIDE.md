# 🚀 Deployment Guide - KW Real Estate Platform

This guide covers deploying the full-stack application to production.

---

## 📋 Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Database seeded with production data
- [ ] Environment variables documented
- [ ] API endpoints tested
- [ ] Frontend builds successfully
- [ ] No console errors
- [ ] Performance optimized
- [ ] Security reviewed

---

## 🎯 Recommended Stack

### Option 1: Vercel + Railway (Easiest)
- **Frontend**: Vercel (free tier available)
- **Backend**: Railway (free tier available)
- **Database**: Railway PostgreSQL
- **Cost**: Free for testing, ~$5-20/month for production

### Option 2: Heroku (All-in-One)
- **Full Stack**: Heroku
- **Database**: Heroku PostgreSQL
- **Cost**: ~$7-25/month

### Option 3: AWS (Most Scalable)
- **Frontend**: S3 + CloudFront
- **Backend**: EC2 or ECS
- **Database**: RDS PostgreSQL
- **Cost**: ~$20-50/month

---

## 🔧 Option 1: Vercel + Railway (Recommended)

### Step 1: Deploy Database (Railway)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Provision PostgreSQL"
   - Wait for database to provision

3. **Get Database URL**
   - Click on PostgreSQL service
   - Go to "Connect" tab
   - Copy "Postgres Connection URL"
   - Format: `postgresql://user:pass@host:port/dbname`

4. **Initialize Database**
   ```bash
   # Update backend/.env with Railway database URL
   DATABASE_URL="postgresql://user:pass@host:port/dbname"
   
   # Push schema
   cd backend
   npx prisma db push
   
   # Seed data
   npm run seed
   ```

### Step 2: Deploy Backend (Railway)

1. **Create Backend Service**
   - In Railway project, click "New"
   - Select "GitHub Repo"
   - Connect your repository
   - Select `backend` folder as root

2. **Configure Environment**
   - Go to "Variables" tab
   - Add:
     ```
     DATABASE_URL=<your-railway-postgres-url>
     PORT=5000
     NODE_ENV=production
     ```

3. **Configure Build**
   - Railway auto-detects Node.js
   - Build command: `npm install`
   - Start command: `npm start`

4. **Deploy**
   - Railway automatically deploys
   - Get your backend URL (e.g., `https://your-app.railway.app`)

### Step 3: Deploy Frontend (Vercel)

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Select `frontend` as root directory

3. **Configure Build**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Environment Variables**
   - Add in Vercel dashboard:
     ```
     VITE_API_URL=https://your-backend.railway.app
     ```

5. **Update Vite Config**
   ```typescript
   // frontend/vite.config.ts
   export default defineConfig({
     server: {
       proxy: {
         '/api': {
           target: process.env.VITE_API_URL || 'http://localhost:5000',
           changeOrigin: true,
         }
       }
     }
   })
   ```

6. **Deploy**
   - Click "Deploy"
   - Get your frontend URL (e.g., `https://your-app.vercel.app`)

### Step 4: Configure CORS

Update `backend/server.js`:
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app'
  ],
  credentials: true
}));
```

Redeploy backend on Railway.

---

## 🔧 Option 2: Heroku Deployment

### Step 1: Prepare Application

1. **Create Procfile** (in root):
   ```
   web: cd backend && npm start
   ```

2. **Update package.json** (in root):
   ```json
   {
     "scripts": {
       "start": "cd backend && npm start",
       "build": "cd frontend && npm run build",
       "heroku-postbuild": "cd backend && npm install && cd ../frontend && npm install && npm run build"
     }
   }
   ```

3. **Update backend/server.js**:
   ```javascript
   const path = require('path');
   
   // Serve frontend in production
   if (process.env.NODE_ENV === 'production') {
     app.use(express.static(path.join(__dirname, '../frontend/dist')));
     app.get('*', (req, res) => {
       res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
     });
   }
   ```

### Step 2: Deploy to Heroku

```bash
# Install Heroku CLI
# macOS: brew install heroku/brew/heroku
# Windows: Download from heroku.com

# Login
heroku login

# Create app
heroku create kw-realestate

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Run migrations
heroku run npm run db:push --app kw-realestate

# Seed database
heroku run npm run seed --app kw-realestate

# Open app
heroku open
```

---

## 🔧 Option 3: AWS Deployment

### Frontend (S3 + CloudFront)

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Create S3 Bucket**
   - Go to AWS S3 Console
   - Create bucket (e.g., `kw-realestate-frontend`)
   - Enable static website hosting
   - Upload `dist/` contents

3. **Create CloudFront Distribution**
   - Origin: Your S3 bucket
   - Default root object: `index.html`
   - Error pages: Redirect 404 to `/index.html`

4. **Get CloudFront URL**
   - Use provided URL or add custom domain

### Backend (EC2)

1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04
   - Instance type: t2.micro (free tier)
   - Security group: Allow ports 22, 80, 443, 5000

2. **Connect and Setup**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PostgreSQL
   sudo apt-get install postgresql postgresql-contrib
   
   # Clone repository
   git clone your-repo-url
   cd kw-realestate-web/backend
   
   # Install dependencies
   npm install
   
   # Setup database
   sudo -u postgres createdb kw_realestate
   npm run db:push
   npm run seed
   
   # Install PM2
   sudo npm install -g pm2
   
   # Start application
   pm2 start server.js
   pm2 startup
   pm2 save
   ```

3. **Configure Nginx**
   ```bash
   sudo apt-get install nginx
   
   # Create config
   sudo nano /etc/nginx/sites-available/kw-realestate
   ```
   
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/kw-realestate /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Database (RDS)

1. **Create RDS Instance**
   - Engine: PostgreSQL
   - Instance class: db.t3.micro
   - Storage: 20 GB
   - Public access: Yes (for initial setup)

2. **Update Backend .env**
   ```
   DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/dbname
   ```

3. **Run Migrations**
   ```bash
   npm run db:push
   npm run seed
   ```

---

## 🔒 Security Checklist

### Environment Variables
- [ ] Never commit `.env` files
- [ ] Use environment-specific configs
- [ ] Rotate database passwords
- [ ] Use strong JWT secrets

### Database
- [ ] Enable SSL connections
- [ ] Restrict IP access
- [ ] Regular backups enabled
- [ ] Use read replicas for scaling

### API
- [ ] Enable rate limiting
- [ ] Add request validation
- [ ] Implement CSRF protection
- [ ] Use HTTPS only

### Frontend
- [ ] Enable HTTPS
- [ ] Add security headers
- [ ] Sanitize user inputs
- [ ] Implement CSP

---

## 📊 Monitoring & Logging

### Application Monitoring
- **Vercel**: Built-in analytics
- **Railway**: Built-in metrics
- **Heroku**: Heroku Metrics
- **AWS**: CloudWatch

### Error Tracking
- **Sentry**: https://sentry.io
- **LogRocket**: https://logrocket.com
- **Rollbar**: https://rollbar.com

### Uptime Monitoring
- **UptimeRobot**: https://uptimerobot.com
- **Pingdom**: https://pingdom.com
- **StatusCake**: https://statuscake.com

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          # Railway auto-deploys on push
          echo "Backend deployed"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          cd frontend
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 🧪 Post-Deployment Testing

### Smoke Tests
```bash
# Health check
curl https://your-backend.com/api/health

# Get properties
curl https://your-backend.com/api/properties

# Get agents
curl https://your-backend.com/api/agents
```

### Frontend Tests
- [ ] Homepage loads
- [ ] Properties page loads
- [ ] Agent search works
- [ ] Login works
- [ ] Dashboard loads (after login)
- [ ] All images load
- [ ] No console errors

### Performance Tests
- [ ] Lighthouse score > 90
- [ ] Page load time < 3s
- [ ] API response time < 500ms
- [ ] Database queries optimized

---

## 📈 Scaling Considerations

### Database
- Add read replicas for heavy read operations
- Enable connection pooling
- Add database indexes
- Consider caching layer (Redis)

### Backend
- Horizontal scaling with load balancer
- Add CDN for static assets
- Implement caching strategy
- Use message queue for async tasks

### Frontend
- Enable CDN caching
- Optimize images (WebP, lazy loading)
- Code splitting
- Service worker for offline support

---

## 💰 Cost Estimates

### Free Tier (Testing)
- Vercel: Free
- Railway: $5/month (with free trial)
- **Total**: ~$5/month

### Small Production
- Vercel Pro: $20/month
- Railway: $10-20/month
- **Total**: ~$30-40/month

### Medium Production
- AWS EC2 t3.small: $15/month
- AWS RDS t3.micro: $15/month
- AWS S3 + CloudFront: $5/month
- **Total**: ~$35/month

---

## 🆘 Troubleshooting

### Build Failures
- Check Node.js version matches local
- Verify all dependencies in package.json
- Check build logs for specific errors

### Database Connection Issues
- Verify DATABASE_URL format
- Check firewall rules
- Ensure database is running
- Test connection locally first

### CORS Errors
- Add frontend URL to CORS whitelist
- Check credentials setting
- Verify proxy configuration

### 404 Errors on Refresh
- Configure server to serve index.html for all routes
- Update Vercel/Netlify rewrites
- Check nginx configuration

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Heroku Documentation](https://devcenter.heroku.com)
- [AWS Documentation](https://docs.aws.amazon.com)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

## ✅ Deployment Complete!

Once deployed:
1. Update README with production URLs
2. Share with team/stakeholders
3. Monitor performance and errors
4. Collect user feedback
5. Plan next iteration

**Production URL**: _______________
**Deployed By**: _______________
**Date**: _______________
