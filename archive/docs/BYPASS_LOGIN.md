# BYPASS LOGIN - Direct Access

## Open Browser Console (F12) and paste this:

```javascript
localStorage.clear();
localStorage.setItem('kw_user', JSON.stringify({
  "id": "9df84c21-1402-4026-8b05-c23956ad6a05",
  "name": "Meareg  Teame",
  "email": "hello.meareg@gmail.com",
  "role": "agent",
  "agentId": "f2d2c702-3702-4717-9f44-7e5a860f81bf"
}));
window.location.href = '/command';
```

This will:
1. Clear bad localStorage
2. Set correct user data
3. Redirect to dashboard

**Just paste this in the browser console and press Enter. You'll be logged in immediately.**
