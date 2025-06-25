#!/bin/bash

echo "🚀 PlugNear Quick Deployment Helper"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ] || [ ! -f "backend/app.py" ]; then
    echo "❌ Error: Please run this script from the root directory of your PlugNear project"
    exit 1
fi

echo ""
echo "📋 Deployment Checklist:"
echo ""

# Check for environment variables
echo "1. Environment Variables:"
if [ -z "$BACKEND_URL" ]; then
    echo "   ⚠️  BACKEND_URL not set"
    echo "   → Set this to your Render backend URL (e.g., https://ev-spots-backend.onrender.com)"
else
    echo "   ✅ BACKEND_URL is set: $BACKEND_URL"
fi

if [ -z "$NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN" ]; then
    echo "   ⚠️  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN not set"
    echo "   → Get a free token from https://account.mapbox.com/access-tokens/"
else
    echo "   ✅ NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is set"
fi

echo ""
echo "2. Backend Status:"
if [ ! -z "$BACKEND_URL" ]; then
    echo "   Testing backend connection..."
    if curl -s "$BACKEND_URL/api/test" > /dev/null 2>&1; then
        echo "   ✅ Backend is responding"
    else
        echo "   ❌ Backend is not responding"
        echo "   → Make sure your backend is deployed to Render"
    fi
else
    echo "   ⚠️  Cannot test backend without BACKEND_URL"
fi

echo ""
echo "3. Frontend Build Test:"
cd frontend
if npm run build > /dev/null 2>&1; then
    echo "   ✅ Frontend builds successfully"
else
    echo "   ❌ Frontend build failed"
    echo "   → Check for missing dependencies or build errors"
fi
cd ..

echo ""
echo "🔧 Quick Fix Commands:"
echo ""
echo "1. Get Mapbox Token:"
echo "   → Visit: https://account.mapbox.com/access-tokens/"
echo "   → Sign up and copy your default public token"
echo ""
echo "2. Set Environment Variables in Vercel:"
echo "   → Go to your Vercel project dashboard"
echo "   → Settings → Environment Variables"
echo "   → Add:"
echo "     BACKEND_URL = https://your-backend-url.onrender.com"
echo "     NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = pk.your-token-here"
echo ""
echo "3. Test Backend:"
echo "   curl $BACKEND_URL/api/test"
echo ""
echo "4. Redeploy Frontend:"
echo "   → Push changes to GitHub or trigger redeploy in Vercel"
echo ""
echo "📖 For detailed troubleshooting, see: DEPLOYMENT_TROUBLESHOOTING.md"
echo ""
echo "🎯 Most Common Issues:"
echo "   • Missing Mapbox token → Get free token from Mapbox"
echo "   • Backend not deployed → Deploy to Render first"
echo "   • Wrong BACKEND_URL → Use the exact URL from Render"
echo "   • Environment variables not set → Add them in Vercel dashboard" 