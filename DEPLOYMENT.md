# Deployment Guide for EV-Spots

This guide will help you deploy the EV-Spots application to both Render (backend) and Vercel (frontend).

## Project Structure

- **Frontend**: Next.js application in `frontend/`
- **Backend**: Flask API in `backend/`

## Prerequisites

1. **Mapbox Access Token**: Get a free token from [Mapbox](https://account.mapbox.com/access-tokens/)
2. **GitHub Account**: For connecting to deployment platforms
3. **Render Account**: For backend deployment
4. **Vercel Account**: For frontend deployment

## Backend Deployment (Render)

### Step 1: Deploy Backend to Render

1. **Fork/Clone the Repository**
   ```bash
   git clone <your-repo-url>
   cd spots
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure the Service**
   - **Name**: `ev-spots-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Plan**: Free

4. **Environment Variables**
   - No additional environment variables needed for the backend

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your backend
   - Note the generated URL (e.g., `https://ev-spots-backend.onrender.com`)

### Step 2: Test Backend

Test your backend API:
```bash
curl https://your-backend-url.onrender.com/api/test
```

## Frontend Deployment (Vercel)

### Step 1: Deploy Frontend to Vercel

1. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure the Project**
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

3. **Environment Variables**
   Add these environment variables in Vercel:
   - `BACKEND_URL`: Your Render backend URL (e.g., `https://ev-spots-backend.onrender.com`)
   - `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`: Your Mapbox access token

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically deploy your frontend

### Step 2: Configure Custom Domain (Optional)

1. In your Vercel project settings, go to "Domains"
2. Add your custom domain
3. Configure DNS settings as instructed

## Environment Variables Summary

### Backend (Render)
No additional environment variables required.

### Frontend (Vercel)
- `BACKEND_URL`: URL of your deployed backend (e.g., `https://ev-spots-backend.onrender.com`)
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`: Your Mapbox access token

## Testing the Deployment

1. **Test Backend API**:
   ```bash
   curl https://your-backend-url.onrender.com/api/test
   ```

2. **Test Frontend**:
   - Visit your Vercel URL
   - Check if the map loads correctly
   - Test the charging station search functionality

## Troubleshooting

### Common Issues

1. **Backend Not Responding**
   - Check Render logs for errors
   - Ensure the Flask app is running on port 8080
   - Verify the health check endpoint `/api/test` is working

2. **Frontend Can't Connect to Backend**
   - Verify the `BACKEND_URL` environment variable is set correctly
   - Check CORS settings if needed
   - Test the backend URL directly

3. **Map Not Loading**
   - Verify `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is set correctly
   - Check browser console for Mapbox errors

4. **Build Failures**
   - Check the build logs in Vercel/Render
   - Ensure all dependencies are properly listed in `package.json`/`requirements.txt`

### Logs and Monitoring

- **Render**: Check logs in the Render dashboard under your service
- **Vercel**: Check deployment logs in the Vercel dashboard

## Updating the Application

1. **Make changes to your code**
2. **Commit and push to GitHub**
3. **Render and Vercel will automatically redeploy**

## Cost Considerations

- **Render Free Tier**: 750 hours/month, auto-sleeps after 15 minutes of inactivity
- **Vercel Free Tier**: 100GB bandwidth/month, unlimited deployments
- **Mapbox Free Tier**: 50,000 map loads/month

## Security Notes

- Keep your Mapbox token secure
- Consider using environment variables for any API keys
- Regularly update dependencies for security patches

## Support

- **Render Documentation**: https://render.com/docs
- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Flask Documentation**: https://flask.palletsprojects.com/ 