# Deployment Checklist - KW Real Estate Platform

Use this checklist to ensure a smooth deployment to Hostinger.

---

## Pre-Deployment (Local)

### Code Preparation
- [ ] All features tested locally
- [ ] All tests passing (`node test-complete-fixes.js`)
- [ ] No console errors in browser
- [ ] No errors in backend logs
- [ ] Database migrations tested
- [ ] All environment variables documented

### Build & Package
- [ ] Run `./deploy.sh` to create deployment package
- [ ] Verify `kw-realestate-deployment.tar.gz` created
- [ ] Check file size is reasonable (< 100MB)

### Documentation Review
- [ ] Read `HOSTINGER_DEPLOYMENT_GUIDE.md`
- [ ] Understand server requirements
- [ ] Have domain name ready
- [ ] Have Hostinger credentials ready

---

## Server Setup (Hostinger)

### Initial Server Configuration
- [ ] SSH access working
- [ ] Server updated (`apt update && apt upgrade`)
- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed and running
- [ ] PM2 installed globally
- [ ] Nginx installed and running
- [ ] Firewall configured (ports 22, 80, 443)

### Database Setup
- [ ] PostgreSQL database created (`kw_realestate`)
- [ ] Database user created with proper permissions
- [ ] Database accessible from localhost
- [ ] Connection tested with psql

---

## Application Deployment

### File Upload
- [ ] Deployment archive uploaded to server
- [ ] Archive extracted to `/var/www/kw-realestate`
- [ ] File permissions set correctly
- [ ] Directory structure verified

### Backend Configuration
- [ ] `.env` file created from `.env.production.example`
- [ ] `DATABASE_URL` updated with production credentials
- [ ] `JWT_SECRET` generated (32+ characters)
- [ ] `ALLOWED_ORIGINS` set to your domain
- [ ] `PORT` set to 5000
- [ ] `NODE_ENV` set to production

### Backend Deployment
- [ ] Dependencies installed (`npm install --production`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Database schema pushed (`npx prisma db push`)
- [ ] Database seeded (optional: `node prisma/seed.js`)
- [ ] Backend started with PM2 (`pm2 start ecosystem.config.js`)
- [ ] PM2 saved (`pm2 save`)
- [ ] PM2 startup configured (`pm2 startup`)
- [ ] Backend accessible at `http://localhost:5000/api/health`

### Frontend Deployment
- [ ] Frontend files in `/var/www/kw-realestate/frontend`
- [ ] `index.html` exists
- [ ] Static assets present (js, css, images)
- [ ] File permissions correct (readable by nginx)

### Nginx Configuration
- [ ] Nginx config file created (`/etc/nginx/sites-available/kw-realestate`)
- [ ] Domain name updated in config
- [ ] Root path points to frontend directory
- [ ] API proxy configured to port 5000
- [ ] Symlink created (`/etc/nginx/sites-enabled/kw-realestate`)
- [ ] Nginx config tested (`nginx -t`)
- [ ] Nginx restarted (`systemctl restart nginx`)

---

## SSL Certificate (HTTPS)

### Certbot Installation
- [ ] Certbot installed
- [ ] Python3-certbot-nginx installed

### Certificate Generation
- [ ] DNS pointing to server IP
- [ ] Certificate obtained (`certbot --nginx -d yourdomain.com`)
- [ ] Certificate auto-renewal tested (`certbot renew --dry-run`)
- [ ] HTTPS working (https://yourdomain.com)
- [ ] HTTP redirects to HTTPS

---

## Testing

### Backend Tests
- [ ] Health check: `curl https://yourdomain.com/api/health`
- [ ] Properties endpoint: `curl https://yourdomain.com/api/properties`
- [ ] Agents endpoint: `curl https://yourdomain.com/api/agents`
- [ ] Lead creation: Test form submission
- [ ] Database queries working

### Frontend Tests
- [ ] Homepage loads: https://yourdomain.com
- [ ] All pages accessible
- [ ] Navigation working
- [ ] Forms submit successfully
- [ ] Images loading
- [ ] No console errors
- [ ] Mobile responsive

### Integration Tests
- [ ] Property search working
- [ ] Agent profiles loading
- [ ] Lead forms saving to database
- [ ] Property details showing
- [ ] Mortgage calculator working
- [ ] All buttons functional
- [ ] All links working

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Images optimized
- [ ] Gzip compression working
- [ ] Caching headers set

---

## Security

### Server Security
- [ ] Firewall enabled and configured
- [ ] SSH key authentication (password disabled)
- [ ] Root login disabled
- [ ] Fail2ban installed (optional)
- [ ] Regular security updates scheduled

### Application Security
- [ ] Strong JWT_SECRET (32+ characters)
- [ ] Database credentials secure
- [ ] CORS properly configured
- [ ] HTTPS enforced
- [ ] Security headers set in Nginx
- [ ] No sensitive data in logs
- [ ] No .env file in public directory

---

## Monitoring & Maintenance

### Logging
- [ ] PM2 logs accessible (`pm2 logs`)
- [ ] Nginx logs accessible (`/var/log/nginx/`)
- [ ] Log rotation configured
- [ ] Error monitoring set up

### Backups
- [ ] Database backup script created
- [ ] Backup cron job scheduled (daily)
- [ ] Backup location configured
- [ ] Backup restoration tested

### Monitoring
- [ ] PM2 monitoring working (`pm2 monit`)
- [ ] Server resources monitored (htop)
- [ ] Uptime monitoring (optional: UptimeRobot)
- [ ] Error alerting configured (optional)

---

## Post-Deployment

### Verification
- [ ] All checklist items completed
- [ ] Application fully functional
- [ ] No errors in logs
- [ ] Performance acceptable
- [ ] Security measures in place

### Documentation
- [ ] Server credentials documented (securely)
- [ ] Deployment process documented
- [ ] Troubleshooting guide available
- [ ] Team trained on maintenance

### Communication
- [ ] Stakeholders notified of launch
- [ ] Support team briefed
- [ ] Users informed of new features
- [ ] Feedback mechanism in place

---

## Rollback Plan

### If Deployment Fails
- [ ] Keep old version backup
- [ ] Document rollback procedure
- [ ] Test rollback process
- [ ] Have emergency contacts ready

### Rollback Steps
1. Stop PM2: `pm2 stop kw-backend`
2. Restore database backup
3. Restore previous code version
4. Restart services
5. Verify functionality

---

## Maintenance Schedule

### Daily
- [ ] Check PM2 status
- [ ] Review error logs
- [ ] Monitor server resources

### Weekly
- [ ] Review application logs
- [ ] Check backup success
- [ ] Monitor performance metrics
- [ ] Review security logs

### Monthly
- [ ] Update dependencies
- [ ] Security audit
- [ ] Performance optimization
- [ ] Backup restoration test

---

## Emergency Contacts

- **Hosting Support**: Hostinger support
- **Domain Registrar**: Your domain provider
- **Database Admin**: Your DBA contact
- **Development Team**: Your dev team
- **SSL Provider**: Let's Encrypt / Certbot

---

## Success Criteria

✅ Application accessible at https://yourdomain.com
✅ All pages load without errors
✅ All forms submit successfully
✅ Database operations working
✅ SSL certificate valid
✅ Performance acceptable (< 3s load time)
✅ No security vulnerabilities
✅ Monitoring in place
✅ Backups configured
✅ Team trained

---

## Notes

Use this space to document any deployment-specific notes:

- Server IP: _______________
- Database name: _______________
- Domain: _______________
- SSL expiry: _______________
- Last deployment: _______________
- Deployed by: _______________

---

**Once all items are checked, your deployment is complete! 🎉**
