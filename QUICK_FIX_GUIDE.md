# 🚨 QUICK FIX GUIDE - Vercel Deployment

## Your Current Issue
- ❌ 500 Server Error on login
- ❌ "SyntaxError: Unexpected token 'A'" - receiving HTML instead of JSON
- ❌ API endpoints not working

## Root Cause
Missing environment variables in Vercel deployment.

## 🎯 IMMEDIATE FIX (5 minutes)

### Step 1: Set Environment Variables in Vercel

**Go to:** https://vercel.com/rudrasheth2201-8352s-projects/medi-lingoooooo/settings/environment-variables

**Add these 4 CRITICAL variables:**

1. **MONGODB_URI**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/medilingo
   ```
   - Get from MongoDB Atlas: https://cloud.mongodb.com/
   - Click "Connect" → "Connect your application"
   - Copy connection string and replace `<password>`

2. **SESSION_SECRET**
   ```bash
   # Run this locally to generate:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   - Copy the output (64 character string)
   - Paste as SESSION_SECRET value

3. **NODE_ENV**
   ```
   production
   ```

4. **FRONTEND_URL**
   ```
   https://medi-lingoooooo.vercel.app
   ```
   - Use your actual Vercel deployment URL

### Step 2: Redeploy

1. Go to: https://vercel.com/rudrasheth2201-8352s-projects/medi-lingoooooo
2. Click "Deployments" tab
3. Click "..." on latest deployment
4. Click "Redeploy"
5. Wait 2-3 minutes

### Step 3: Test

Visit: https://medi-lingoooooo.vercel.app/api/health

Should see:
```json
{
  "status": "ok",
  "environment": {
    "hasMongoUri": true,
    "hasSessionSecret": true,
    ...
  }
}
```

## 🔍 Verify Each Variable

After setting variables, check the health endpoint to verify:

```bash
curl https://medi-lingoooooo.vercel.app/api/health
```

Look for:
- `"hasMongoUri": true` ✅
- `"hasSessionSecret": true` ✅
- `"nodeEnv": "production"` ✅

## 📋 MongoDB Atlas Quick Setup

If you don't have MongoDB:

1. **Create Account**: https://cloud.mongodb.com/
2. **Create Cluster**: Free tier (M0)
3. **Create User**:
   - Database Access → Add New User
   - Username: `medilingo`
   - Password: (generate strong password - save it!)
4. **Network Access**:
   - Network Access → Add IP Address
   - Enter: `0.0.0.0/0` (allow all)
5. **Get Connection String**:
   - Clusters → Connect → Connect your application
   - Copy: `mongodb+srv://medilingo:<password>@cluster.mongodb.net/medilingo`
   - Replace `<password>` with your actual password

## ✅ Success Checklist

After redeployment:
- [ ] Health endpoint returns `"status": "ok"`
- [ ] All environment checks show `true`
- [ ] Login page loads without errors
- [ ] Can create new account
- [ ] Can login successfully
- [ ] No CORS errors in browser console

## 🆘 Still Not Working?

### Check Vercel Logs
1. Go to Vercel Dashboard
2. Click "Deployments"
3. Click latest deployment
4. Click "Functions" tab
5. Look for error messages

### Common Issues

**"Database connection failed"**
- Check MongoDB Atlas network access (0.0.0.0/0)
- Verify connection string is correct
- Check MongoDB user password

**"CORS error"**
- Set FRONTEND_URL to exact Vercel URL
- No trailing slash
- Redeploy after changing

**"Session not working"**
- Verify SESSION_SECRET is set
- Check it's at least 32 characters
- Redeploy

## 📞 Need More Help?

Check these files:
- `VERCEL_ENV_SETUP.md` - Detailed environment setup
- `DEPLOYMENT_FIX.md` - Complete deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist

## 🎉 After It Works

Add these for full functionality:

5. **GEMINI_API_KEY** - For AI chatbot
   - Get from: https://makersuite.google.com/app/apikey

6. **EMAIL_USER** - For password reset
   - Your Gmail address

7. **EMAIL_PASS** - Gmail app password
   - Generate at: https://myaccount.google.com/apppasswords

Then redeploy again!
