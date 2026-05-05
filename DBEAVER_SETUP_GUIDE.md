# DBeaver Setup Guide for KW Real Estate Database

## Your Database Connection Details

Based on your `.env` file, here are your PostgreSQL connection details:

```
Host: 127.0.0.1 (localhost)
Port: 5432
Database: kw_realestate
Username: meareg
Password: (no password set)
Schema: public
```

## Step-by-Step DBeaver Setup

### 1. Open DBeaver
Launch DBeaver on your machine.

### 2. Create New Connection
- Click on **Database** → **New Database Connection** (or click the plug icon with a plus sign)
- Or use keyboard shortcut: `Ctrl+Shift+N` (Linux/Windows) or `Cmd+Shift+N` (Mac)

### 3. Select PostgreSQL
- In the connection wizard, select **PostgreSQL**
- Click **Next**

### 4. Enter Connection Details

Fill in the **Main** tab with these details:

```
Host: localhost (or 127.0.0.1)
Port: 5432
Database: kw_realestate
Username: meareg
Password: (leave empty if no password)
```

**Important Settings:**
- Check "Show all databases" if you want to see other databases
- Uncheck "Show all databases" to only see kw_realestate

### 5. Test Connection
- Click **Test Connection** button at the bottom
- If this is your first time connecting to PostgreSQL in DBeaver, it will ask to download the PostgreSQL driver
- Click **Download** and wait for it to complete
- The test should show "Connected" with connection details

### 6. Configure Additional Settings (Optional)

**PostgreSQL Tab:**
- Check "Show all databases" if needed
- Set "Show templates" to false (cleaner view)

**SSH Tab:**
- Leave empty (not needed for local connection)

**SSL Tab:**
- Leave as default (not needed for local development)

### 7. Finish Setup
- Click **Finish** to save the connection
- The connection will appear in the Database Navigator on the left

### 8. Explore Your Database

Once connected, expand the tree:
```
kw_realestate
  └── Schemas
      └── public
          ├── Tables (your data tables)
          │   ├── Agent
          │   ├── Lead
          │   ├── Opportunity
          │   ├── Property
          │   ├── SavedSearch
          │   ├── SearchAlert
          │   ├── User
          │   ├── Favorite
          │   ├── OpenHouse
          │   ├── Review
          │   ├── VirtualTour
          │   └── MarketData
          └── Views, Procedures, etc.
```

## Quick Actions in DBeaver

### View Table Data
- Right-click on any table → **View Data**
- Or double-click the table and select the **Data** tab

### Run SQL Queries
- Click **SQL Editor** → **New SQL Script** (or press `Ctrl+]`)
- Write your query and press `Ctrl+Enter` to execute

### Export Data
- Right-click on a table → **Export Data**
- Choose format (CSV, JSON, SQL, etc.)

### View Table Structure
- Double-click a table
- Click the **Properties** tab to see columns, indexes, constraints

## Sample Queries to Try

### 1. View All Properties
```sql
SELECT * FROM "Property" LIMIT 10;
```

### 2. View All Agents
```sql
SELECT * FROM "Agent";
```

### 3. Count Properties by Status
```sql
SELECT status, COUNT(*) as count 
FROM "Property" 
GROUP BY status;
```

### 4. View Saved Searches with User Info
```sql
SELECT 
  ss.id,
  ss.name,
  ss.frequency,
  u.email,
  ss."createdAt"
FROM "SavedSearch" ss
JOIN "User" u ON ss."userId" = u.id;
```

### 5. View Properties with Agent Details
```sql
SELECT 
  p.title,
  p.price,
  p.city,
  p.status,
  a.name as agent_name,
  a.email as agent_email
FROM "Property" p
LEFT JOIN "Agent" a ON p."agentId" = a.id
LIMIT 20;
```

## Troubleshooting

### Connection Failed
**Problem:** "Connection refused" or "Could not connect"

**Solutions:**
1. Make sure PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   # or
   pg_isready
   ```

2. Start PostgreSQL if it's not running:
   ```bash
   sudo systemctl start postgresql
   ```

### Authentication Failed
**Problem:** "password authentication failed for user meareg"

**Solutions:**
1. Check if password is required:
   ```bash
   psql -U meareg -d kw_realestate
   ```

2. If password is needed, update your `.env` file:
   ```
   DATABASE_URL="postgresql://meareg:YOUR_PASSWORD@127.0.0.1:5432/kw_realestate?schema=public"
   ```

### Database Does Not Exist
**Problem:** "database kw_realestate does not exist"

**Solution:**
Run the database setup:
```bash
cd backend
npm run setup
```

### Driver Not Found
**Problem:** DBeaver can't find PostgreSQL driver

**Solution:**
- When testing connection, click **Download** to get the driver
- Or go to **Database** → **Driver Manager** → **PostgreSQL** → **Download/Update**

## Useful DBeaver Features

### 1. ER Diagram
- Right-click on **public** schema → **View Diagram**
- See visual relationships between tables

### 2. Data Editor
- Edit data directly in the grid
- Press `Ctrl+Enter` to save changes

### 3. SQL Formatter
- Write messy SQL, then press `Ctrl+Shift+F` to format it

### 4. Query History
- View all your previous queries
- Click **SQL Editor** → **SQL History**

### 5. Bookmarks
- Bookmark frequently used queries
- Right-click in SQL editor → **Add Bookmark**

## Security Note

Your current setup has no password for the database user. This is fine for local development, but for production:

1. Set a strong password for the database user
2. Update the `DATABASE_URL` in `.env`
3. Never commit `.env` to version control (it's already in `.gitignore`)

## Need Help?

If you encounter any issues:
1. Check PostgreSQL is running: `sudo systemctl status postgresql`
2. Test connection from terminal: `psql -U meareg -d kw_realestate`
3. Check DBeaver logs: **Help** → **View Error Log**

---

**Your database is ready to explore! 🎉**
