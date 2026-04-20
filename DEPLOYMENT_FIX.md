# Vercel Deployment Fix Guide

## Issues Identified

1. **500 Server Error on `/api/auth/login`**: The API endpoint is failing with a server error
2. **JSON Parsing Error**: Frontend receiving HTML error page instead of JSON response
3. **Missing Environment Variables**: Critical env vars not configured on Vercel
4. **Incorrect Vercel Configuration**: The `vercel.json` needs updates for proper API routing

## Root Causes

1. **Database Connection**: MongoDB URI likely not set in Vercel environment
2. **Session Secret**: Missing SESSION_SECRET causing authentication issues
3. **API Routing**: Vercel serverless function not properly configured
4. **CORS Issues**: Frontend URL not properly configured for production

## Fixes Applied

### 1. Updated `vercel.json` Configuration
- Fixed API routing to use proper serverless function structure
- Added environment variable configuration
- Corrected build output directory

### 2. Enhanced Error Handling in API
- Added better error messages for debugging
- Improved JSON error responses
- Added fallback for missing environment variables

### 3. Environment Variables Required on Vercel

You MUST set these in Vercel Dashboard (Settings → Environment Variables):

**Critical (Required):**
- `MONGODB_URI`: Your MongoDB connection string
- `SESSION_SECRET`: Random 32+ character string for sessions
- `NODE_ENV`: Set to "production"

**For Full Functionality:**
- `GEMINI_API_KEY`: Your Google Gemini API key
- `EMAIL_USER`: Gmail address for sending OTPs
- `EMAIL_PASS`: Gmail app password (16 characters)
- `FRONTEND_URL`: Your Vercel deployment URL (e.g., https://your-app.vercel.app)

**Optional:**
- `RAZORPAY_KEY_ID`: For payment processing
- `RAZORPAY_KEY_SECRET`: For payment processing
- `GOOGLE_PRESCRIPTION_KEY`: Separate key for prescription OCR

## Deployment Steps

1. **Set Environment Variables in Vercel:**
   - Go to: https://vercel.com/rudrasheth2201-8352s-projects/medi-lingoooooo/settings/environment-variables
   - Add all required variables listed above

2. **Redeploy:**
   - After setting env vars, trigger a new deployment
   - Or run: `vercel --prod`

3. **Test the Deployment:**
   - Visit your deployment URL
   - Try logging in with test credentials
   - Check browser console for errors

## Quick Test Commands

```bash
# Test API health
curl https://your-app.vercel.app/api/auth/login

# Test with credentials
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Common Issues & Solutions

### Issue: "Database connection failed"
**Solution**: Set `MONGODB_URI` in Vercel environment variables

### Issue: "Session secret not set"
**Solution**: Generate and set `SESSION_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Issue: CORS errors
**Solution**: Set `FRONTEND_URL` to your Vercel deployment URL

### Issue: Email OTP not working
**Solution**: 
1. Enable 2FA on Gmail
2. Generate App Password at: https://myaccount.google.com/apppasswords
3. Set `EMAIL_USER` and `EMAIL_PASS` in Vercel

## Verification Checklist

- [ ] All environment variables set in Vercel
- [ ] MongoDB connection string is correct
- [ ] Frontend can reach API endpoints
- [ ] Login/signup works
- [ ] No CORS errors in browser console
- [ ] Session cookies are being set
