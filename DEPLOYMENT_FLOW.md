# Deployment Flow - Visual Guide

## 🎯 Deployment Process Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     LOCAL MACHINE                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1. Run ./deploy.sh
                              ▼
                    ┌──────────────────┐
                    │  Build Frontend  │
                    │  Package Backend │
                    └──────────────────┘
                              │
                              │ Creates deployment.tar.gz
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     UPLOAD TO SERVER                             │
│  scp deployment.tar.gz root@server:/root/                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     HOSTINGER SERVER                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 2. Extract files
                              ▼
                    ┌──────────────────┐
                    │ Run server-setup │
                    │      .sh         │
                    └──────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │ Node.js  │  │PostgreSQL│  │  Nginx   │
         │   PM2    │  │          │  │ Certbot  │
         └──────────┘  └──────────┘  └──────────┘
                │             │             │
                └─────────────┼─────────────┘
                              │
                              │ 3. Configure
                              ▼
                    ┌──────────────────┐
                    │  Create .env     │
                    │  Setup Database  │
                    └──────────────────┘
                              │
                              │ 4. Deploy
                              ▼
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │ Backend  │  │ Frontend │  │   SSL    │
         │  (PM2)   │  │ (Nginx)  │  │(Certbot) │
         └──────────┘  └──────────┘  └──────────┘
                │             │             │
                └─────────────┼─────────────┘
                              │
                              │ 5. Test
                              ▼
                    ┌──────────────────┐
                    │  Verify Website  │
                    │   Test Features  │
                    └──────────────────┘
                              │
                              │ ✅ Success!
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  LIVE WEBSITE                                    │
│              https://yourdomain.com                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS                                    │
│                    (Web Browsers)                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         NGINX                                    │
│                    (Web Server)                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SSL Termination                                          │  │
│  │  Static File Serving (Frontend)                           │  │
│  │  Reverse Proxy (/api → Backend)                           │  │
│  │  Gzip Compression                                          │  │
│  │  Caching                                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │ Frontend │  │   API    │  │  Static  │
         │  (SPA)   │  │ Requests │  │  Assets  │
         └──────────┘  └──────────┘  └──────────┘
                              │
                              │ HTTP
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          PM2                                     │
│                   (Process Manager)                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Auto-restart                                             │  │
│  │  Load Balancing (Cluster Mode)                            │  │
│  │  Logging                                                   │  │
│  │  Monitoring                                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                             │
│                      Express Server                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Authentication (JWT)                                     │  │
│  │  API Routes                                                │  │
│  │  Controllers                                               │  │
│  │  Middleware                                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Prisma ORM
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL                                  │
│                       (Database)                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Users                                                     │  │
│  │  Agents                                                    │  │
│  │  Properties                                                │  │
│  │  Leads                                                     │  │
│  │  Opportunities                                             │  │
│  │  Favorites                                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow

### Frontend Request (Static Files)

```
User Browser
    │
    │ GET /
    ▼
  Nginx
    │
    │ Serve index.html
    ▼
User Browser
    │
    │ Parse HTML, request assets
    ▼
  Nginx
    │
    │ Serve JS, CSS, images
    ▼
User Browser (App Loaded)
```

### API Request (Dynamic Data)

```
User Browser
    │
    │ GET /api/properties
    ▼
  Nginx
    │
    │ Proxy to localhost:5000
    ▼
   PM2
    │
    │ Route to available instance
    ▼
Backend (Node.js)
    │
    │ Authenticate (if needed)
    │ Process request
    ▼
Prisma ORM
    │
    │ Query database
    ▼
PostgreSQL
    │
    │ Return data
    ▼
Backend
    │
    │ Format response
    ▼
   PM2
    │
    ▼
  Nginx
    │
    │ Return to client
    ▼
User Browser (Display data)
```

---

## 🛡️ Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: Firewall (UFW)                                         │
│  ✓ Only ports 22, 80, 443 open                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 2: SSL/TLS (Let's Encrypt)                               │
│  ✓ HTTPS encryption                                              │
│  ✓ Certificate auto-renewal                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 3: Nginx                                                  │
│  ✓ Security headers                                              │
│  ✓ Rate limiting                                                 │
│  ✓ Request filtering                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 4: Backend                                                │
│  ✓ JWT authentication                                            │
│  ✓ CORS configuration                                            │
│  ✓ Input validation                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 5: Database                                               │
│  ✓ Prisma ORM (SQL injection protection)                        │
│  ✓ User permissions                                              │
│  ✓ Encrypted passwords                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📈 Scaling Strategy

### Current Setup (Single Server)

```
┌──────────────────────────────────────┐
│         Single VPS Server            │
│  ┌────────────────────────────────┐  │
│  │  Nginx (Web Server)            │  │
│  ├────────────────────────────────┤  │
│  │  PM2 (Process Manager)         │  │
│  │  ├─ Backend Instance 1         │  │
│  │  ├─ Backend Instance 2         │  │
│  │  └─ Backend Instance N         │  │
│  ├────────────────────────────────┤  │
│  │  PostgreSQL (Database)         │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### Future Scaling (If Needed)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Load Balancer│────▶│  Web Server  │────▶│  Web Server  │
└──────────────┘     │   (Nginx)    │     │   (Nginx)    │
                     └──────────────┘     └──────────────┘
                            │                     │
                            └──────────┬──────────┘
                                       │
                            ┌──────────▼──────────┐
                            │  App Servers (PM2)  │
                            │  ├─ Backend 1       │
                            │  ├─ Backend 2       │
                            │  └─ Backend N       │
                            └──────────┬──────────┘
                                       │
                            ┌──────────▼──────────┐
                            │  Database Cluster   │
                            │  ├─ Primary         │
                            │  └─ Replicas        │
                            └─────────────────────┘
```

---

## 🔄 Deployment Timeline

```
Time    Activity                          Status
────────────────────────────────────────────────────────
0:00    Start deployment                  ⏳
0:05    Upload files to server            ⏳
0:10    Run server setup script           ⏳
0:20    Configure environment             ⏳
0:25    Setup database                    ⏳
0:30    Start backend with PM2            ⏳
0:35    Configure Nginx                   ⏳
0:40    Get SSL certificate               ⏳
0:45    Test and verify                   ⏳
0:50    Deployment complete!              ✅
```

---

## 📊 Monitoring Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                    PM2 MONITORING                                │
├─────────────────────────────────────────────────────────────────┤
│  App Name    │ Status │ CPU │ Memory │ Restarts │ Uptime        │
│  kw-backend  │ online │ 5%  │ 150MB  │    0     │ 2d 5h         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   SYSTEM RESOURCES                               │
├─────────────────────────────────────────────────────────────────┤
│  CPU Usage:     ████░░░░░░ 40%                                  │
│  Memory:        ██████░░░░ 60% (1.2GB / 2GB)                    │
│  Disk:          ███░░░░░░░ 30% (3GB / 10GB)                     │
│  Network In:    ↓ 5 MB/s                                        │
│  Network Out:   ↑ 2 MB/s                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE STATUS                                │
├─────────────────────────────────────────────────────────────────┤
│  Nginx:         ● active (running)                              │
│  PostgreSQL:    ● active (running)                              │
│  PM2:           ● active (running)                              │
│  Firewall:      ● active                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Success Metrics

```
┌─────────────────────────────────────────────────────────────────┐
│                   DEPLOYMENT METRICS                             │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Uptime:              99.9%                                   │
│  ✅ Response Time:       < 500ms                                 │
│  ✅ Page Load:           < 3 seconds                             │
│  ✅ SSL Grade:           A+                                      │
│  ✅ Security Score:      95/100                                  │
│  ✅ Performance Score:   90/100                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

**This visual guide helps you understand the deployment process and architecture!**
