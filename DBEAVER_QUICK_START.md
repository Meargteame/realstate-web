# DBeaver Quick Start - Visual Guide

## 🎯 Quick Connection Setup

### Your Connection Info (Copy These):
```
Host:     localhost
Port:     5432
Database: kw_realestate
Username: meareg
Password: (leave empty)
```

---

## 📋 Step-by-Step (5 Minutes)

### Step 1: Open DBeaver
- Launch DBeaver application

### Step 2: New Connection
- Click the **plug icon with +** (top-left toolbar)
- Or: Menu → Database → New Database Connection
- Or: Press `Ctrl+Shift+N`

### Step 3: Select Database Type
```
┌─────────────────────────────────┐
│  Select your database           │
├─────────────────────────────────┤
│  [🐘 PostgreSQL]  ← Click this  │
│   MySQL                         │
│   SQLite                        │
│   ...                           │
└─────────────────────────────────┘
```
- Click **PostgreSQL**
- Click **Next**

### Step 4: Fill Connection Details
```
┌──────────────────────────────────────┐
│  Connection Settings                 │
├──────────────────────────────────────┤
│  Host:     localhost                 │
│  Port:     5432                      │
│  Database: kw_realestate             │
│  Username: meareg                    │
│  Password: [leave empty]             │
│                                      │
│  [✓] Show all databases (optional)  │
└──────────────────────────────────────┘
```

### Step 5: Test Connection
- Click **Test Connection** button (bottom-left)
- First time? It will download PostgreSQL driver (click Download)
- Should show: ✅ "Connected"

### Step 6: Save & Connect
- Click **Finish**
- Connection appears in left sidebar

---

## 🗂️ Your Database Structure

After connecting, you'll see:

```
📁 kw_realestate
  └─ 📁 Schemas
      └─ 📁 public
          ├─ 📁 Tables
          │   ├─ 📄 Agent          (Real estate agents)
          │   ├─ 📄 Property       (Property listings)
          │   ├─ 📄 Lead           (Customer leads)
          │   ├─ 📄 Opportunity    (Sales opportunities)
          │   ├─ 📄 User           (System users)
          │   ├─ 📄 SavedSearch    (Saved property searches)
          │   ├─ 📄 SearchAlert    (Search notifications)
          │   ├─ 📄 Favorite       (Favorited properties)
          │   ├─ 📄 OpenHouse      (Open house events)
          │   ├─ 📄 Review         (Agent reviews)
          │   ├─ 📄 VirtualTour    (Virtual property tours)
          │   └─ 📄 MarketData     (Market statistics)
          └─ 📁 Views, Sequences, etc.
```

---

## 🚀 Quick Actions

### View Table Data
1. Expand: kw_realestate → Schemas → public → Tables
2. **Right-click** on any table (e.g., "Property")
3. Select **"View Data"**
4. Data appears in a grid

### Run a Query
1. Click **SQL Editor** icon (or press `Ctrl+]`)
2. Type your SQL:
   ```sql
   SELECT * FROM "Property" LIMIT 10;
   ```
3. Press `Ctrl+Enter` to run
4. Results appear below

### See Table Structure
1. **Double-click** any table
2. Tabs appear:
   - **Properties**: Column definitions
   - **Data**: Table contents
   - **ER Diagram**: Visual relationships

---

## 🎨 Useful Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New SQL Editor | `Ctrl+]` |
| Execute Query | `Ctrl+Enter` |
| Format SQL | `Ctrl+Shift+F` |
| New Connection | `Ctrl+Shift+N` |
| Refresh | `F5` |
| Commit Changes | `Ctrl+Enter` (in data editor) |

---

## 🔍 Try These Queries

### 1. Count All Properties
```sql
SELECT COUNT(*) as total_properties FROM "Property";
```

### 2. View Active Listings
```sql
SELECT title, price, city, beds, baths 
FROM "Property" 
WHERE status = 'Active'
ORDER BY price DESC
LIMIT 10;
```

### 3. List All Agents
```sql
SELECT name, email, phone, specialty 
FROM "Agent"
ORDER BY name;
```

### 4. Recent Saved Searches
```sql
SELECT 
  ss.name as search_name,
  ss.frequency,
  u.email as user_email,
  ss."createdAt"
FROM "SavedSearch" ss
JOIN "User" u ON ss."userId" = u.id
ORDER BY ss."createdAt" DESC;
```

### 5. Properties by City
```sql
SELECT 
  city,
  COUNT(*) as property_count,
  AVG(price) as avg_price
FROM "Property"
GROUP BY city
ORDER BY property_count DESC;
```

---

## ⚠️ Common Issues & Fixes

### Issue: "Connection Refused"
**Fix:** Start PostgreSQL
```bash
sudo systemctl start postgresql
```

### Issue: "Database does not exist"
**Fix:** Run database setup
```bash
cd backend
npm run setup
```

### Issue: "Driver not found"
**Fix:** Click "Download" when testing connection

### Issue: "Authentication failed"
**Fix:** Make sure password field is empty (no password set)

---

## 💡 Pro Tips

1. **ER Diagram**: Right-click schema → "View Diagram" to see table relationships
2. **Export Data**: Right-click table → "Export Data" → Choose CSV/JSON
3. **SQL History**: View all your past queries in SQL History panel
4. **Dark Theme**: Preferences → Appearance → Theme → Dark
5. **Auto-complete**: Start typing table names, press `Ctrl+Space`

---

## 📊 Database Stats

To see your database size and stats:

```sql
-- Database size
SELECT pg_size_pretty(pg_database_size('kw_realestate'));

-- Table sizes
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Row counts
SELECT 
  'Property' as table_name, COUNT(*) as rows FROM "Property"
UNION ALL
SELECT 'Agent', COUNT(*) FROM "Agent"
UNION ALL
SELECT 'Lead', COUNT(*) FROM "Lead"
UNION ALL
SELECT 'User', COUNT(*) FROM "User";
```

---

## ✅ You're Ready!

Your database is accessible at:
- **Host**: localhost:5432
- **Database**: kw_realestate
- **User**: meareg

Open DBeaver and start exploring! 🎉
