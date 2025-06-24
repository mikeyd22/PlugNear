#!/bin/bash

# EV-Spots Deployment Script
# This script helps prepare and deploy the EV-Spots application

echo "🚀 EV-Spots Deployment Script"
echo "=============================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git repository not found. Please initialize git first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "backend/app.py" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the root directory (spots/)"
    exit 1
fi

echo "✅ Project structure verified"

# Check for environment variables
echo ""
echo "📋 Environment Variables Check:"
echo "================================"

# Check for Mapbox token
if [ -z "$NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN" ]; then
    echo "⚠️  Warning: NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN not set"
    echo "   You'll need to set this in Vercel dashboard"
else
    echo "✅ NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is set"
fi

# Check for backend URL
if [ -z "$BACKEND_URL" ]; then
    echo "⚠️  Warning: BACKEND_URL not set"
    echo "   You'll need to set this in Vercel dashboard after deploying backend"
else
    echo "✅ BACKEND_URL is set: $BACKEND_URL"
fi

echo ""
echo "🔧 Pre-deployment Checks:"
echo "========================="

# Check if backend dependencies are up to date
echo "📦 Checking backend dependencies..."
cd backend
if [ -f "requirements.txt" ]; then
    echo "✅ requirements.txt found"
else
    echo "❌ requirements.txt not found"
    exit 1
fi
cd ..

# Check if frontend dependencies are up to date
echo "📦 Checking frontend dependencies..."
cd frontend
if [ -f "package.json" ]; then
    echo "✅ package.json found"
    echo "📋 Available scripts:"
    npm run --silent
else
    echo "❌ package.json not found"
    exit 1
fi
cd ..

echo ""
echo "🚀 Deployment Instructions:"
echo "==========================="
echo ""
echo "1. Backend Deployment (Render):"
echo "   - Go to https://dashboard.render.com/"
echo "   - Create new Web Service"
echo "   - Connect your GitHub repository"
echo "   - Set Root Directory to: backend"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: python app.py"
echo "   - Note the generated URL"
echo ""
echo "2. Frontend Deployment (Vercel):"
echo "   - Go to https://vercel.com/dashboard"
echo "   - Create new project"
echo "   - Import your GitHub repository"
echo "   - Set Root Directory to: frontend"
echo "   - Add environment variables:"
echo "     * BACKEND_URL: [your-render-backend-url]"
echo "     * NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: [your-mapbox-token]"
echo ""
echo "3. Test the deployment:"
echo "   - Test backend: curl [your-backend-url]/api/test"
echo "   - Test frontend: Visit your Vercel URL"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "✅ Deployment script completed!" 