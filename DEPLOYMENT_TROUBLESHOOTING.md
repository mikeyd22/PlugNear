# Deployment Troubleshooting Guide

## Quick Fix Checklist

### 1. Environment Variables (CRITICAL)
Make sure these are set in your Vercel project settings:

**Frontend (Vercel) Environment Variables:**
- `BACKEND_URL`: Your Render backend URL (e.g., `https://ev-spots-backend.onrender.com`)
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`: Your Mapbox access token

### 2. Get a Mapbox Token (FREE)
1. Go to [Mapbox](https://account.mapbox.com/access-tokens/)
2. Sign up for a free account
3. Copy your default public token
4. Add it to Vercel as `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

### 3. Deploy Backend First
1. Deploy your backend to Render
2. Test it: `curl https://your-backend-url.onrender.com/api/test`
3. Copy the URL and set it as `BACKEND_URL` in Vercel

## Common Error Messages & Solutions

### "Map Not Available" / "Mapbox token is not defined"
**Solution:** Set `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` in Vercel environment variables

### "Failed to fetch data" / Backend connection errors
**Solution:** 
1. Make sure your backend is deployed and running
2. Set `BACKEND_URL` correctly in Vercel
3. Test your backend URL directly

### White screen / Nothing loads
**Solution:**
1. Check browser console for errors
2. Verify all environment variables are set
3. Check Vercel deployment logs

### Build failures
**Solution:**
1. Check Vercel build logs
2. Make sure all dependencies are in `package.json`
3. Verify Node.js version compatibility

## Step-by-Step Fix

### Step 1: Set Environment Variables in Vercel
1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add these variables:
   ```
   BACKEND_URL = https://your-backend-url.onrender.com
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = pk.your-mapbox-token-here
   ```
4. Redeploy your project

### Step 2: Verify Backend is Working
```bash
curl https://your-backend-url.onrender.com/api/test
```
Should return: `{"message": "Test route is working!"}`

### Step 3: Test Frontend
1. Visit your Vercel URL
2. Open browser developer tools (F12)
3. Check Console tab for errors
4. Check Network tab for failed requests

## Debugging Commands

### Check if backend is accessible:
```bash
curl -I https://your-backend-url.onrender.com/api/test
```

### Check environment variables in Vercel:
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Verify all variables are set correctly

### Check deployment logs:
- Vercel Dashboard → Your Project → Deployments → Latest Deployment → View Build Logs

## Emergency Fallback

If you can't get the backend working immediately, the app will now show sample data instead of crashing. This allows users to see the interface while you fix the backend connection.

## Still Having Issues?

1. **Check Vercel logs** for build/deployment errors
2. **Check browser console** for runtime errors  
3. **Verify all URLs** are correct and accessible
4. **Test locally** first: `npm run dev` in the frontend directory

## Quick Test Commands

```bash
# Test backend
curl https://your-backend-url.onrender.com/api/test

# Test frontend API route (if deployed)
curl https://your-frontend-url.vercel.app/api/charging-stations

# Check if environment variables are working
curl https://your-frontend-url.vercel.app/api/charging-stations | jq .
``` 