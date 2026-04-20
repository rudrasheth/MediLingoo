# Vercel Environment Variables Setup Guide

## Quick Setup Link
🔗 **Go to:** https://vercel.com/rudrasheth2201-8352s-projects/medi-lingoooooo/settings/environment-variables

## Required Environment Variables

### 1. Database Configuration (CRITICAL)

**MONGODB_URI**
```
mongodb+srv://username:password@cluster.mongodb.net/medilingo?retryWrites=true&w=majority
```
- Get this from MongoDB Atlas
- Go to: https://cloud.mongodb.com/
- Click "Connect" → "Connect your application"
- Copy the connection string
- Replace `<password>` with your actual password

### 2. Session Security (CRITICAL)

**SESSION_SECRET**
```bash
# Generate a secure random string (run this locally):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
- Copy the output and paste as SESSION_SECRET value
- Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

### 3. Node Environment

**NODE_ENV**
```
production
```

### 4. Frontend URL (CRITICAL for CORS)

**FRONTEND_URL**
```
https://medi-lingoooooo.vercel.app
```
- Replace with your actual Vercel deployment URL
- No trailing slash

### 5. AI/Chatbot Configuration

**GEMINI_API_KEY**
```
your_gemini_api_key_here
```
- Get from: https://makersuite.google.com/app/apikey
- Required for chatbot functionality

**GEMINI_MODEL** (Optional)
```
gemini-2.5-flash
```
- Default is already set in code

### 6. Email Configuration (For Password Reset)

**EMAIL_USER**
```
your-email@gmail.com
```

**EMAIL_PASS**
```
your-16-char-app-password
```
- NOT your Gmail password!
- Generate App Password:
  1. Enable 2FA on Gmail
  2. Go to: https://myaccount.google.com/apppasswords
  3. Create new app password
  4. Copy the 16-character password

**EMAIL_HOST** (Optional)
```
smtp.gmail.com
```

**EMAIL_PORT** (Optional)
```
587
```

### 7. Payment Gateway (Optional)

**RAZORPAY_KEY_ID**
```
rzp_test_xxxxxxxxxxxxx
```

**RAZORPAY_KEY_SECRET**
```
your_razorpay_secret
```

### 8. Prescription OCR (Optional)

**GOOGLE_PRESCRIPTION_KEY**
```
your_separate_google_api_key
```
- Can be same as GEMINI_API_KEY or different

## Step-by-Step Setup

### Step 1: Access Vercel Dashboard
1. Go to: https://vercel.com/rudrasheth2201-8352s-projects/medi-lingoooooo
2. Click "Settings" tab
3. Click "Environment Variables" in sidebar

### Step 2: Add Each Variable
For each variable above:
1. Click "Add New"
2. Enter the variable name (e.g., `MONGODB_URI`)
3. Enter the value
4. Select environments: Production, Preview, Development (all three)
5. Click "Save"

### Step 3: Redeploy
After adding all variables:
1. Go to "Deployments" tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

## Verification

### Test API Health
```bash
curl https://medi-lingoooooo.vercel.app/api/auth/login
```

Should return JSON (not HTML error)

### Test Login
```bash
curl -X POST https://medi-lingoooooo.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Check Logs
1. Go to Vercel Dashboard
2. Click "Deployments"
3. Click on latest deployment
4. Click "Functions" tab
5. Look for any error messages

## Common Issues

### Issue: "MONGODB_URI not set"
- Make sure you added the variable in Vercel
- Check spelling (case-sensitive)
- Redeploy after adding

### Issue: "Database connection failed"
- Check MongoDB Atlas is accessible
- Verify connection string is correct
- Check MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)

### Issue: CORS errors
- Set FRONTEND_URL to your Vercel deployment URL
- Make sure it matches exactly (no trailing slash)

### Issue: Session not persisting
- Set SESSION_SECRET
- Make sure cookies are enabled in browser
- Check sameSite cookie settings

## MongoDB Atlas Setup

If you don't have MongoDB set up:

1. Go to: https://cloud.mongodb.com/
2. Create free account
3. Create new cluster (free tier)
4. Create database user:
   - Database Access → Add New User
   - Username: medilingo
   - Password: (generate strong password)
5. Allow network access:
   - Network Access → Add IP Address
   - Allow access from anywhere: 0.0.0.0/0
6. Get connection string:
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your password

## Priority Order

Set these FIRST (critical):
1. ✅ MONGODB_URI
2. ✅ SESSION_SECRET
3. ✅ NODE_ENV
4. ✅ FRONTEND_URL

Then add these for full functionality:
5. GEMINI_API_KEY
6. EMAIL_USER
7. EMAIL_PASS

Optional (add later):
8. RAZORPAY_KEY_ID
9. RAZORPAY_KEY_SECRET
10. GOOGLE_PRESCRIPTION_KEY
