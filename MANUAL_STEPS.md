# 🔧 Fix Login Error - Manual Steps

## The Problem
The login is failing because the password hashes in the database are invalid.

## The Fix

Run these commands in your terminal:

### Step 1: Stop the backend server
Press `Ctrl+C` in the terminal where the backend is running

### Step 2: Re-seed the database with correct password hashes
```bash
cd ~/kw-realstate-web/backend
node prisma/seed.js
```

You should see:
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

### Step 3: Restart the backend server
```bash
npm run dev
```

### Step 4: Try logging in again
Go back to http://localhost:3000 and login with:
- Email: `sarah.j@kw.com`
- Password: `password123`

## ✅ It Should Work Now!

The password hashes are now properly generated using bcrypt.

---

## If You Still Get Errors

Check the backend terminal for error messages. The most common issues are:

1. **Backend not running**: Make sure you see "Server is running on port 5000"
2. **Wrong port**: Backend should be on 5000, frontend on 3000
3. **Database connection**: Check that PostgreSQL is running

Let me know if you see any errors!
