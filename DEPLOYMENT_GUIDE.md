# 🚀 Production Deployment Guide

Complete guide to deploy your KW Real Estate Platform to production.

---

## 📋 Prerequisites Checklist

Before starting, you'll need:
- [ ] GitHub account (for code hosting)
- [ ] Credit card (for paid services - most have free tiers)
- [ ] Domain name (optional but recommended)
- [ ] 2-3 hours for complete setup

---

## 1️⃣ Get Mapbox Access Token (FREE)

### Why We Need It
The map on property pages uses Mapbox to show property locations.

### Steps to Get Token

1. **Create Mapbox Account**
   - Go to https://account.mapbox.com/auth/signup/
   - Sign up with email (FREE forever for up to 50,000 map loads/month)

2. **Get Your Access Token**
   - After signup, you'll see your **Default public token**
   - Or go to https://account.mapbox.com/access-tokens/
   - Copy the token (starts with `pk.`)

3. **Add to Your Project**
   ```bash
   # Update frontend/.env
   VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsYWJjZGVmIn0.xyz123
   ```

4. **Verify It Works**
   - Restart frontend: `cd frontend && npm run dev`
   - Go to any property page
   - Map should now load correctly

### Cost
- ✅ **FREE** - Up to 50,000 map loads/month
- After that: $5 per 1,000 additional loads

---

## 2️⃣ Setup SendGrid Email Service (FREE)

### Why We Need It
Send emails for:
- Lead notifications to agents
- Password resets
- Welcome emails
- Message notifications

### Steps to Setup SendGrid

1. **Create SendGrid Account**
   - Go to https://signup.sendgrid.com/
   - Sign up (FREE - 100 emails/day forever)

2. **Verify Your Email**
   - Check your email for verification link
   - Click to verify

3. **Create API Key**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name: "KW Real Estate Production"
   - Permissions: "Full Access"
   - Click "Create & View"
   - **COPY THE KEY NOW** (you can't see it again!)

4. **Verify Sender Identity**
   - Go to Settings → Sender Authentication
   - Click "Verify a Single Sender"
   - Fill in your details:
     - From Name: "KW Real Estate"
     - From Email: your-email@yourdomain.com
     - Reply To: same or different email
   - Check your email and verify

5. **Add to Backend**
   ```bash
   # Update backend/.env
   SENDGRID_API_KEY=SG.xyz123abc456...
   SENDGRID_FROM_EMAIL=your-email@yourdomain.com
   SENDGRID_FROM_NAME=KW Real Estate
   ```

6. **Update Email Service**
   ```javascript
   // backend/services/emailService.js
   const sgMail = require('@sendgrid/mail');
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);

   exports.sendLeadNotification = async (agent, lead) => {
     const msg = {
       to: agent.email,
       from: {
         email: process.env.SENDGRID_FROM_EMAIL,
         name: process.env.SENDGRID_FROM_NAME
       },
       subject: `New Lead: ${lead.name}`,
       html: `
         <h2>New Lead Received</h2>
         <p><strong>Name:</strong> ${lead.name}</p>
         <p><strong>Email:</strong> ${lead.email}</p>
         <p><strong>Phone:</strong> ${lead.phone}</p>
         <p><strong>Message:</strong> ${lead.message}</p>
       `
     };
     
     await sgMail.send(msg);
   };
   ```

7. **Install SendGrid Package**
   ```bash
   cd backend
   npm install @sendgrid/mail
   ```

### Cost
- ✅ **FREE** - 100 emails/day forever
- Paid: $19.95/month for 50,000 emails

---

## 3️⃣ Deploy Backend to Heroku (FREE)

### Why Heroku
- Easy deployment
- Free tier available
- PostgreSQL included
- Automatic SSL

### Steps to Deploy Backend

1. **Create Heroku Account**
   - Go to https://signup.heroku.com/
   - Sign up (FREE tier available)

2. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku

   # Ubuntu/Debian
   curl https://cli-assets.heroku.com/install.sh | sh

   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

3. **Login to Heroku**
   ```bash
   heroku login
   # Opens browser for authentication
   ```

4. **Create Heroku App**
   ```bash
   cd backend
   heroku create kw-realestate-api
   # Note: Name must be unique, try kw-realestate-api-yourname
   ```

5. **Add PostgreSQL Database**
   ```bash
   heroku addons:create heroku-postgresql:essential-0
   # FREE tier - 10,000 rows limit
   # Or use mini ($5/month) for 10M rows
   ```

6. **Add Redis (Optional)**
   ```bash
   heroku addons:create heroku-redis:mini
   # $3/month - or skip if not using caching
   ```

7. **Set Environment Variables**
   ```bash
   # Database (automatically set by Heroku)
   # heroku config:set DATABASE_URL=... (already done)

   # JWT Secret
   heroku config:set JWT_SECRET=$(openssl rand -base64 32)

   # SendGrid
   heroku config:set SENDGRID_API_KEY=SG.xyz123...
   heroku config:set SENDGRID_FROM_EMAIL=your-email@domain.com
   heroku config:set SENDGRID_FROM_NAME="KW Real Estate"

   # CORS Origins (will update after frontend deployment)
   heroku config:set ALLOWED_ORIGINS=https://your-frontend.vercel.app

   # Node Environment
   heroku config:set NODE_ENV=production

   # Port (Heroku sets this automatically)
   # heroku config:set PORT=5000
   ```

8. **Create Procfile**
   ```bash
   # backend/Procfile
   echo "web: node server.js" > Procfile
   ```

9. **Update package.json**
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "build": "npx prisma generate && npx prisma db push"
     },
     "engines": {
       "node": "18.x",
       "npm": "9.x"
     }
   }
   ```

10. **Deploy to Heroku**
    ```bash
    # Initialize git if not already
    git init
    git add .
    git commit -m "Initial deployment"

    # Deploy
    git push heroku main
    # Or if your branch is master:
    # git push heroku master
    ```

11. **Run Database Migrations**
    ```bash
    heroku run npx prisma db push
    heroku run npx prisma db seed
    ```

12. **Check Logs**
    ```bash
    heroku logs --tail
    ```

13. **Open Your API**
    ```bash
    heroku open
    # Should show your API at https://kw-realestate-api.herokuapp.com
    ```

### Your Backend URL
```
https://kw-realestate-api.herokuapp.com
```

### Cost
- ✅ **FREE** - Eco dynos (sleeps after 30 min inactivity)
- Basic: $7/month (never sleeps)
- Standard: $25/month (better performance)

---

## 4️⃣ Deploy Frontend to Vercel (FREE)

### Why Vercel
- Built for React/Next.js
- Automatic deployments
- Free SSL
- CDN included
- Zero configuration

### Steps to Deploy Frontend

1. **Create Vercel Account**
   - Go to https://vercel.com/signup
   - Sign up with GitHub (recommended)

2. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

3. **Login to Vercel**
   ```bash
   vercel login
   ```

4. **Update Frontend Environment**
   ```bash
   # frontend/.env.production
   VITE_API_URL=https://kw-realestate-api.herokuapp.com
   VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIi...
   ```

5. **Update API Calls**
   ```typescript
   // frontend/src/config.ts
   export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
   
   // Then in all fetch calls:
   fetch(`${API_URL}/api/properties`)
   ```

6. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   # Creates dist/ folder
   ```

7. **Deploy to Vercel**
   ```bash
   vercel
   # Follow prompts:
   # - Set up and deploy? Yes
   # - Which scope? Your account
   # - Link to existing project? No
   # - Project name? kw-realestate
   # - Directory? ./
   # - Override settings? No
   ```

8. **Set Environment Variables in Vercel**
   - Go to https://vercel.com/dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add:
     - `VITE_API_URL` = `https://kw-realestate-api.herokuapp.com`
     - `VITE_MAPBOX_ACCESS_TOKEN` = `pk.your-token`

9. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

10. **Update Backend CORS**
    ```bash
    # Update Heroku backend to allow your Vercel domain
    heroku config:set ALLOWED_ORIGINS=https://kw-realestate.vercel.app
    
    # Restart backend
    heroku restart
    ```

### Your Frontend URL
```
https://kw-realestate.vercel.app
```

### Cost
- ✅ **FREE** - Unlimited deployments, 100GB bandwidth
- Pro: $20/month (more bandwidth, better support)

---

## 5️⃣ Get Custom Domain (OPTIONAL)

### Why Custom Domain
- Professional appearance
- Better branding
- SEO benefits
- Example: `kwrealestate.com` instead of `kw-realestate.vercel.app`

### Where to Buy Domain

**Recommended Registrars:**
1. **Namecheap** - https://www.namecheap.com (~$10/year)
2. **Google Domains** - https://domains.google (~$12/year)
3. **GoDaddy** - https://www.godaddy.com (~$15/year)

### Steps to Setup Custom Domain

1. **Buy Domain**
   - Search for available domain
   - Purchase (usually $10-15/year)

2. **Add Domain to Vercel (Frontend)**
   - Go to Vercel Dashboard → Your Project
   - Settings → Domains
   - Add Domain: `kwrealestate.com`
   - Add Domain: `www.kwrealestate.com`
   - Vercel will show DNS records to add

3. **Update DNS Records**
   - Go to your domain registrar
   - Find DNS settings
   - Add records shown by Vercel:
     ```
     Type: A
     Name: @
     Value: 76.76.21.21
     
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```

4. **Add Domain to Heroku (Backend)**
   ```bash
   heroku domains:add api.kwrealestate.com
   # Heroku will show DNS target
   ```

5. **Add Backend DNS Record**
   ```
   Type: CNAME
   Name: api
   Value: [shown by Heroku]
   ```

6. **Wait for DNS Propagation**
   - Usually 5-30 minutes
   - Can take up to 48 hours

7. **Enable SSL (Automatic)**
   - Vercel: Automatic
   - Heroku: Automatic

8. **Update Environment Variables**
   ```bash
   # Update backend CORS
   heroku config:set ALLOWED_ORIGINS=https://kwrealestate.com,https://www.kwrealestate.com
   ```

### Your Custom URLs
```
Frontend: https://kwrealestate.com
Backend:  https://api.kwrealestate.com
```

### Cost
- Domain: $10-15/year
- SSL: FREE (included)

---

## 6️⃣ SSL Certificates (AUTOMATIC)

### Good News!
Both Vercel and Heroku provide **FREE automatic SSL certificates**.

### What You Get
- ✅ HTTPS enabled automatically
- ✅ Auto-renewal
- ✅ A+ SSL rating
- ✅ Modern TLS 1.3

### Verify SSL
```bash
# Check your frontend
curl -I https://kw-realestate.vercel.app

# Check your backend
curl -I https://kw-realestate-api.herokuapp.com
```

### No Action Required!
SSL is automatically configured and maintained.

---

## 📊 Cost Summary

### Free Tier (Recommended for Testing)
| Service | Cost | Limits |
|---------|------|--------|
| Mapbox | FREE | 50,000 map loads/month |
| SendGrid | FREE | 100 emails/day |
| Heroku (Backend) | FREE | Sleeps after 30min inactivity |
| Heroku PostgreSQL | FREE | 10,000 rows |
| Vercel (Frontend) | FREE | Unlimited deployments |
| SSL Certificates | FREE | Automatic |
| **TOTAL** | **$0/month** | Good for testing |

### Production Tier (Recommended for Launch)
| Service | Cost | Benefits |
|---------|------|----------|
| Mapbox | FREE | 50,000 map loads/month |
| SendGrid | $19.95/mo | 50,000 emails/month |
| Heroku Basic | $7/mo | Never sleeps |
| Heroku PostgreSQL | $9/mo | 10M rows |
| Heroku Redis | $3/mo | Caching |
| Vercel | FREE | Unlimited |
| Domain | $10/year | Custom domain |
| SSL | FREE | Automatic |
| **TOTAL** | **~$40/month** | Production ready |

---

## 🔧 Post-Deployment Configuration

### 1. Update Frontend API URL
```typescript
// frontend/src/config.ts
export const API_URL = 'https://kw-realestate-api.herokuapp.com';
```

### 2. Update All Fetch Calls
```typescript
// Before
fetch('/api/properties')

// After
fetch(`${API_URL}/api/properties`)
```

### 3. Test All Features
- [ ] Property search works
- [ ] Agent directory loads
- [ ] Login/signup works
- [ ] Messaging system works
- [ ] Lead forms submit
- [ ] Images upload
- [ ] Maps display
- [ ] Email notifications send

### 4. Monitor Performance
```bash
# Heroku logs
heroku logs --tail

# Vercel logs
vercel logs
```

---

## 🚨 Troubleshooting

### Map Not Loading
```bash
# Check Mapbox token
echo $VITE_MAPBOX_ACCESS_TOKEN

# Verify in browser console
# Should see: pk.eyJ1...
```

### CORS Errors
```bash
# Update backend CORS
heroku config:set ALLOWED_ORIGINS=https://your-frontend.vercel.app

# Restart
heroku restart
```

### Database Connection Failed
```bash
# Check DATABASE_URL
heroku config:get DATABASE_URL

# Run migrations
heroku run npx prisma db push
```

### Emails Not Sending
```bash
# Check SendGrid key
heroku config:get SENDGRID_API_KEY

# Test email
heroku run node -e "require('./services/emailService').sendTestEmail()"
```

---

## ✅ Deployment Checklist

### Before Deployment
- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Database schema finalized
- [ ] API endpoints tested
- [ ] Frontend builds successfully

### During Deployment
- [ ] Mapbox token obtained
- [ ] SendGrid account created
- [ ] Backend deployed to Heroku
- [ ] Database migrated
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set
- [ ] CORS configured

### After Deployment
- [ ] All pages load correctly
- [ ] Forms submit successfully
- [ ] Authentication works
- [ ] Messaging system works
- [ ] Emails send correctly
- [ ] Maps display properly
- [ ] Images upload successfully
- [ ] Mobile responsive

---

## 📚 Additional Resources

### Documentation
- Mapbox: https://docs.mapbox.com/
- SendGrid: https://docs.sendgrid.com/
- Heroku: https://devcenter.heroku.com/
- Vercel: https://vercel.com/docs
- Prisma: https://www.prisma.io/docs/

### Support
- Mapbox Support: https://support.mapbox.com/
- SendGrid Support: https://support.sendgrid.com/
- Heroku Support: https://help.heroku.com/
- Vercel Support: https://vercel.com/support

---

## 🎉 Success!

Once completed, you'll have:
- ✅ Production-ready real estate platform
- ✅ Custom domain (optional)
- ✅ Automatic SSL
- ✅ Email notifications
- ✅ Interactive maps
- ✅ Scalable infrastructure

**Your platform is now live and ready for users!** 🚀
