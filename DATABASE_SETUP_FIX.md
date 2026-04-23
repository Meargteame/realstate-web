# 🔧 Database Setup Fix - Phase 1

## Problem
The error `User was denied access on the database '(not available)'` means Prisma cannot connect to or access the PostgreSQL database.

## Solution Steps

### Step 1: Verify PostgreSQL is Running

```bash
# Check if PostgreSQL is running
pg_isready

# If not running, start it:
# macOS with Homebrew:
brew services start postgresql@14

# Linux:
sudo systemctl start postgresql

# Check status:
brew services list  # macOS
sudo systemctl status postgresql  # Linux
```

### Step 2: Create Database with Correct Permissions

```bash
# Option A: Using createdb (recommended)
createdb kw_realestate

# Option B: Using psql
psql postgres
CREATE DATABASE kw_realestate;
\q

# Verify database was created:
psql -l | grep kw_realestate
```

### Step 3: Test Database Connection

```bash
# Try to connect to the database
psql kw_realestate

# If successful, you should see:
# psql (14.x)
# Type "help" for help.
# kw_realestate=#

# Type \q to exit
```

### Step 4: Update .env File (if needed)

Check `backend/.env` file:

```bash
cd backend
cat .env
```

Should contain:
```
DATABASE_URL="postgresql://meareg@127.0.0.1:5432/kw_realestate?schema=public"
```

If your PostgreSQL user is different, update it:
```
DATABASE_URL="postgresql://YOUR_USERNAME@127.0.0.1:5432/kw_realestate?schema=public"
```

To find your PostgreSQL username:
```bash
whoami  # Usually this is your PostgreSQL username
```

### Step 5: Generate Prisma Client

```bash
cd backend
npx prisma generate
```

Expected output:
```
✔ Generated Prisma Client
```

### Step 6: Push Schema to Database

```bash
npx prisma db push
```

Expected output:
```
🚀  Your database is now in sync with your Prisma schema.
```

### Step 7: Verify Tables Were Created

```bash
psql kw_realestate -c "\dt"
```

You should see:
```
         List of relations
 Schema |   Name   | Type  |  Owner  
--------+----------+-------+---------
 public | Agent    | table | meareg
 public | Lead     | table | meareg
 public | Property | table | meareg
 public | User     | table | meareg
```

### Step 8: Seed the Database

```bash
node prisma/seed.js
```

Expected output:
```
🌱 Starting database seed...
📍 Seeding agents...
✅ Seeded 12 agents
🏠 Seeding properties...
✅ Seeded 30 properties
📧 Seeding leads...
✅ Seeded 25 leads
👤 Seeding users...
✅ Seeded 5 users
🎉 Database seeding completed successfully!
```

### Step 9: Start the Backend Server

```bash
npm run dev
```

Expected output:
```
Server is running on port 5000
```

### Step 10: Test the API

Open a new terminal and test:

```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{"status":"ok","message":"KW Real Estate Backend is active."}
```

---

## Common Issues & Solutions

### Issue 1: "psql: command not found"

**Solution**: PostgreSQL is not installed or not in PATH

```bash
# macOS:
brew install postgresql@14
brew services start postgresql@14

# Add to PATH (add to ~/.zshrc or ~/.bashrc):
export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"

# Linux (Ubuntu/Debian):
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Issue 2: "createdb: error: connection to server failed"

**Solution**: PostgreSQL is not running

```bash
# macOS:
brew services start postgresql@14

# Linux:
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Start on boot
```

### Issue 3: "permission denied to create database"

**Solution**: User doesn't have permission

```bash
# Connect as superuser and grant permissions:
psql postgres

# In psql:
CREATE USER meareg WITH SUPERUSER;
ALTER USER meareg WITH PASSWORD 'your_password';
\q

# Or use existing superuser:
psql postgres -U postgres
CREATE DATABASE kw_realestate OWNER meareg;
\q
```

### Issue 4: "database kw_realestate already exists"

**Solution**: Drop and recreate

```bash
dropdb kw_realestate
createdb kw_realestate
```

### Issue 5: Prisma can't connect

**Solution**: Check connection string format

The DATABASE_URL must be exactly:
```
postgresql://USERNAME@HOST:PORT/DATABASE?schema=SCHEMA
```

Example:
```
postgresql://meareg@127.0.0.1:5432/kw_realestate?schema=public
```

Test connection:
```bash
psql "postgresql://meareg@127.0.0.1:5432/kw_realestate"
```

---

## Quick Reset (Start Fresh)

If you want to start completely fresh:

```bash
# 1. Stop backend server (Ctrl+C)

# 2. Drop database
dropdb kw_realestate

# 3. Create database
createdb kw_realestate

# 4. Push schema
cd backend
npx prisma db push

# 5. Seed data
node prisma/seed.js

# 6. Start server
npm run dev
```

---

## Verification Checklist

- [ ] PostgreSQL is running (`pg_isready` returns success)
- [ ] Database exists (`psql -l | grep kw_realestate`)
- [ ] Can connect to database (`psql kw_realestate`)
- [ ] Prisma client generated (`ls node_modules/.prisma/client`)
- [ ] Tables created (`psql kw_realestate -c "\dt"`)
- [ ] Data seeded (check counts: `psql kw_realestate -c "SELECT COUNT(*) FROM \"Agent\";"`)
- [ ] Backend starts without errors
- [ ] API responds (`curl http://localhost:5000/api/health`)

---

## Alternative: Use Docker PostgreSQL

If you're having persistent issues, use Docker:

```bash
# 1. Install Docker Desktop

# 2. Run PostgreSQL in Docker
docker run --name kw-postgres \
  -e POSTGRES_USER=meareg \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=kw_realestate \
  -p 5432:5432 \
  -d postgres:14

# 3. Update backend/.env
DATABASE_URL="postgresql://meareg:password@localhost:5432/kw_realestate?schema=public"

# 4. Continue with Step 5 above (Generate Prisma Client)
```

---

## Need Help?

1. Check PostgreSQL logs:
   ```bash
   # macOS:
   tail -f /opt/homebrew/var/log/postgres.log
   
   # Linux:
   sudo journalctl -u postgresql -f
   ```

2. Check if port 5432 is in use:
   ```bash
   lsof -i :5432
   ```

3. Verify PostgreSQL version:
   ```bash
   psql --version
   # Should be 12+ (14 recommended)
   ```

---

## Success Indicators

When everything is working, you should be able to:

1. ✅ Connect to database: `psql kw_realestate`
2. ✅ See 4 tables: `\dt` shows Agent, Lead, Property, User
3. ✅ See seeded data: `SELECT COUNT(*) FROM "Agent";` returns 12
4. ✅ Backend starts: `npm run dev` in backend folder
5. ✅ API responds: `curl http://localhost:5000/api/health`
6. ✅ Login works: Visit http://localhost:3000 and login with sarah.j@kw.com / password123

---

## Next Steps After Database is Working

Once the database is set up and seeded:

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev` (in new terminal)
3. Visit: http://localhost:3000
4. Login: sarah.j@kw.com / password123
5. Test all features from TESTING_CHECKLIST.md

---

**Last Updated**: Phase 1 Fix
**Status**: Ready for manual setup
