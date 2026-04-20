#!/bin/bash

# MediLingo Vercel Deployment Checklist Script
# This script helps verify your deployment setup

echo "🚀 MediLingo Vercel Deployment Checklist"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
echo "📋 Checking local environment setup..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file found"
    
    # Check critical variables
    if grep -q "MONGODB_URI=" .env; then
        echo -e "${GREEN}✓${NC} MONGODB_URI is set"
    else
        echo -e "${RED}✗${NC} MONGODB_URI is missing"
    fi
    
    if grep -q "SESSION_SECRET=" .env; then
        echo -e "${GREEN}✓${NC} SESSION_SECRET is set"
    else
        echo -e "${RED}✗${NC} SESSION_SECRET is missing"
    fi
    
    if grep -q "GEMINI_API_KEY=" .env; then
        echo -e "${GREEN}✓${NC} GEMINI_API_KEY is set"
    else
        echo -e "${YELLOW}⚠${NC} GEMINI_API_KEY is missing (chatbot won't work)"
    fi
else
    echo -e "${RED}✗${NC} .env file not found"
    echo "  Copy .env.example to .env and fill in values"
fi

echo ""
echo "📦 Checking project structure..."

# Check critical files
files=("package.json" "vercel.json" "api/index.ts" "server/src/vercel.ts")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${RED}✗${NC} $file is missing"
    fi
done

echo ""
echo "🔧 Vercel Configuration Checklist:"
echo "=================================="
echo ""
echo "1. Environment Variables (CRITICAL):"
echo "   Go to: https://vercel.com/rudrasheth2201-8352s-projects/medi-lingoooooo/settings/environment-variables"
echo ""
echo "   Required variables:"
echo "   ☐ MONGODB_URI"
echo "   ☐ SESSION_SECRET"
echo "   ☐ NODE_ENV (set to 'production')"
echo "   ☐ FRONTEND_URL (your Vercel URL)"
echo ""
echo "   Recommended variables:"
echo "   ☐ GEMINI_API_KEY"
echo "   ☐ EMAIL_USER"
echo "   ☐ EMAIL_PASS"
echo ""

echo "2. MongoDB Atlas Setup:"
echo "   ☐ Database created"
echo "   ☐ User created with password"
echo "   ☐ Network access: 0.0.0.0/0 (allow all)"
echo "   ☐ Connection string copied"
echo ""

echo "3. Deployment:"
echo "   ☐ All environment variables added"
echo "   ☐ Code pushed to Git"
echo "   ☐ Vercel deployment triggered"
echo "   ☐ Deployment successful (no errors)"
echo ""

echo "4. Testing:"
echo "   ☐ Visit deployment URL"
echo "   ☐ Try signup/login"
echo "   ☐ Check browser console (no errors)"
echo "   ☐ Test chatbot"
echo ""

echo "📚 Documentation:"
echo "   - Full setup guide: VERCEL_ENV_SETUP.md"
echo "   - Deployment fixes: DEPLOYMENT_FIX.md"
echo ""

# Generate SESSION_SECRET if needed
echo "🔐 Generate SESSION_SECRET:"
echo "   Run this command and copy the output:"
echo "   node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
echo ""

# Test API endpoint if URL provided
if [ ! -z "$1" ]; then
    echo "🧪 Testing API endpoint: $1"
    response=$(curl -s -o /dev/null -w "%{http_code}" "$1/api/auth/login")
    if [ "$response" = "200" ] || [ "$response" = "400" ] || [ "$response" = "401" ]; then
        echo -e "${GREEN}✓${NC} API is responding (HTTP $response)"
    else
        echo -e "${RED}✗${NC} API error (HTTP $response)"
    fi
fi

echo ""
echo "✨ Next Steps:"
echo "1. Set all environment variables in Vercel"
echo "2. Redeploy from Vercel dashboard"
echo "3. Test the deployment"
echo ""
echo "Need help? Check VERCEL_ENV_SETUP.md for detailed instructions"
