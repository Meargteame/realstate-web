# ✅ Deployment Quick Checklist

Print this and check off each step as you complete it!

---

## Before You Start

- [ ] Server IP: _______________
- [ ] Domain name: _______________
- [ ] SSH username: _______________
- [ ] SSH password: _______________
- [ ] DNS pointing to server (wait 30 min after setting)

---

## Step-by-Step Deployment

### 1. Upload Package (5 min)
```bash
scp kw-realestate-deployment.tar.gz root@YOUR_IP:/root/
```
- [ ] File uploaded successfully

### 2. Connect to Server (1 min)
```bash
ssh root@YOUR_IP
```
- [ ] Connected to server

### 3. Extract Package (2 min)
```bash
cd /root
tar -xzf kw-realestate-deployment.tar.gz
cd deployment
```
- [ ] Package extracted

### 4. Run Server Setup (10 min)
```bash
chmod +x server-setup.sh
./server-setup.sh
```
- [ ] Node.js installed
- [ ] PostgreSQL installed
- [ ] PM2 installed
- [ ] Nginx installed
- [ ] Certbot installed

### 5. Setup Database (5 min)
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE kw_realestate;
CREATE USER kwuser WITH PASSWORD 'YOUR_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE kw_realestate TO kwuser;
\q
```
- [ ] Database created
- [ ] User created
- [ ] Password saved: _______________

### 6. Move Files (2 min)
```bash
mkdir -p /var/www/kw-realestate
mv /root/deployment/backend /var/www/kw-realestate/
mv /root/deployment/frontend /var/www/kw-realestate/
```
- [ ] Files moved

### 7. Configure Environment (5 min)
```bash
cd /var/www/kw-realestate/backend
nano .env
```
Update:
- [ ] DATABASE_URL with your password
- [ ] JWT_SECRET (random 32+ chars)
- [ ] ALLOWED_ORIGINS with your domain
- [ ] File saved

### 8. Install Dependencies (5 min)
```bash
cd /var/www/kw-realestate/backend
npm install --production
npx prisma generate
npx prisma db push
node prisma/seed.js
```
- [ ] Dependencies installed
- [ ] Prisma generated
- [ ] Schema pushed
- [ ] Database seeded

### 9. Start Backend (3 min)
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```
- [ ] Backend started
- [ ] PM2 saved
- [ ] Startup configured
- [ ] Test: `curl http://localhost:5000/api/health`

### 10. Configure Nginx (5 min)
```bash
cp /root/deployment/nginx.conf /etc/nginx/sites-available/kw-realestate
nano /etc/nginx/sites-available/kw-realestate
```
Update domain name, then:
```bash
ln -s /etc/nginx/sites-available/kw-realestate /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```
- [ ] Config copied
- [ ] Domain updated
- [ ] Symlink created
- [ ] Config tested
- [ ] Nginx restarted

### 11. Get SSL Certificate (5 min)
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
- [ ] Certificate obtained
- [ ] HTTPS working
- [ ] Auto-renewal tested

### 12. Verify Everything (5 min)
- [ ] Backend: `curl https://yourdomain.com/api/health`
- [ ] Frontend: Open https://yourdomain.com in browser
- [ ] Forms: Test become-agent form
- [ ] Database: Check data saved
- [ ] SSL: Green padlock in browser
- [ ] PM2: `pm2 status` shows online

---

## Post-Deployment

- [ ] All pages load correctly
- [ ] All forms work
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance good (< 3s load)

---

## Save These Commands

### Monitor
```bash
pm2 status              # Check backend
pm2 logs kw-backend     # View logs
pm2 monit              # Monitor resources
```

### Troubleshoot
```bash
pm2 restart kw-backend              # Restart backend
systemctl restart nginx             # Restart nginx
tail -f /var/log/nginx/error.log   # Check errors
```

### Database
```bash
psql -U kwuser -d kw_realestate    # Connect to DB
npx prisma studio                  # Open DB GUI
```

---

## Important Info to Save

- Server IP: _______________
- Domain: _______________
- Database Password: _______________
- JWT Secret: _______________
- SSL Expiry: _______________
- Deployment Date: _______________

---

## 🎉 Success!

Your platform is live at: https://_______________

**Total Time: ~50 minutes**

---

## Need Help?

1. Check logs: `pm2 logs kw-backend`
2. Check Nginx: `tail -f /var/log/nginx/error.log`
3. Check database: `systemctl status postgresql`
4. Restart: `pm2 restart kw-backend`

---

**Keep this checklist for future reference!**
