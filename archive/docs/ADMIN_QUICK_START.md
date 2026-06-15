# Admin Dashboard - Quick Start Guide

## 🚀 Getting Started (30 seconds)

### 1. Login
```
URL: http://localhost:3001/login
Email: admin@kw.com
Password: password123
```

### 2. You're In!
After login, you'll be automatically redirected to the admin dashboard at `/admin`

## 📊 What You Can Do

### Dashboard (`/admin`)
- View platform statistics (users, agents, properties, revenue)
- See monthly growth metrics
- Monitor recent activity
- Check top performing agents

### Users Management (`/admin/users`)
- **View**: All users with pagination
- **Search**: Find users by name or email
- **Create**: Add new users with role assignment
- **Edit**: Update user details and roles
- **Delete**: Remove users (with confirmation)

### Agents Management (`/admin/agents`)
- **View**: All agents with performance stats
- **Search**: Find agents by name or email
- **Status**: Change agent status (active/inactive/pending)
- **Stats**: See listings, leads, opportunities per agent
- **Delete**: Remove agents (with confirmation)

### Properties Management (`/admin/properties`)
- **View**: All properties with details
- **Search**: Find properties by address or city
- **Filter**: Filter by status (Active/Pending/Sold/Inactive)
- **Status**: Change property status via dropdown
- **Delete**: Remove properties (with confirmation)

## 🔑 Key Features

### Real-Time Data
All data is fetched from the database in real-time. No mock data.

### Pagination
- Default: 10 items per page
- Configurable page size
- Shows total count and pages

### Search
- Case-insensitive
- Searches multiple fields
- Updates as you type

### Security
- JWT token authentication
- Admin-only access
- 7-day token expiration
- Secure password hashing

## 🛠️ Common Tasks

### Create a New User
1. Go to Users Management
2. Click "Add User" button
3. Fill in: Name, Email, Password, Role
4. Click "Create"

### Change Agent Status
1. Go to Agents Management
2. Find the agent
3. Click the status dropdown
4. Select new status (Active/Inactive/Pending)
5. Status updates automatically

### Update Property Status
1. Go to Properties Management
2. Find the property
3. Click the status dropdown
4. Select new status (Active/Pending/Sold/Inactive)
5. Status updates automatically

### Delete a User/Agent/Property
1. Find the item in the table
2. Click "Delete" button
3. Confirm in the dialog
4. Item is removed

## 📱 Navigation

### Sidebar Menu
- **Dashboard** - Platform overview
- **Users Management** - Manage all users
- **Agents Management** - Manage agents
- **Properties Management** - Manage properties
- **Platform Analytics** - Coming soon
- **Settings** - Admin settings
- **Logout** - Sign out

### Quick Actions
- Click on stats cards to navigate to management pages
- Click "View" to see detailed profiles
- Use search bars for quick filtering

## 🎯 Tips

1. **Use Search**: Faster than scrolling through pages
2. **Check Stats**: Dashboard shows key metrics at a glance
3. **Recent Activity**: Monitor what's happening on the platform
4. **Top Agents**: See who's performing best
5. **Pagination**: Use page size dropdown for more items per page

## ⚠️ Important Notes

- **Logout & Login**: After first setup, logout and login again to get JWT token
- **Confirmations**: All delete operations require confirmation
- **Real-Time**: All data is live from the database
- **Role-Based**: Only admin users can access this dashboard
- **Token Expiry**: Tokens expire after 7 days (auto-logout)

## 🔧 Troubleshooting

### Can't Login?
- Check credentials: admin@kw.com / password123
- Ensure backend is running on port 5000
- Check browser console for errors

### 403 Forbidden Errors?
- Logout and login again to get new JWT token
- Check if user role is 'admin'
- Verify token is stored in localStorage

### No Data Showing?
- Check if backend is running
- Verify database connection
- Check browser console for API errors

### Page Not Loading?
- Ensure frontend is running on port 3001
- Check if routes are configured correctly
- Clear browser cache and reload

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Check backend logs
3. Run verification: `node backend/verify-admin-setup.js`
4. Check API endpoints are responding

## 🎉 You're Ready!

The admin dashboard is fully functional and ready to use. All features are integrated with the backend and working with real data.

**Happy Managing! 🚀**
