# Backend Deployment Guide

## Step 1: Deploy to Render

1. Go to [Render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `mikeyd22/PlugNear`
4. Configure:
   - **Name**: `ev-spots-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Plan**: Free
5. Click "Create Web Service"

## Step 2: Get Your Backend URL

After deployment, Render will give you a URL like:
`https://ev-spots-backend-xxxxx.onrender.com`

## Step 3: Test Your Backend

Test the backend with:
```bash
curl https://your-backend-url.onrender.com/api/test
```

You should see: `{"message": "Test route is working!"}`

## Step 4: Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add:
   - **Key**: `BACKEND_URL`
   - **Value**: `https://your-backend-url.onrender.com`
   - **Environment**: Production, Preview, Development

## Step 5: Get Mapbox Token

1. Go to [Mapbox](https://account.mapbox.com/access-tokens/)
2. Sign up for a free account
3. Copy your default public token
4. Add to Vercel as `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

## Step 6: Redeploy Frontend

Push any changes to GitHub or trigger a redeploy in Vercel. 