# Vercel Deployment Guide for MediLingo

## Prerequisites
1. Install Vercel CLI: `npm install -g vercel`
2. Login to Vercel: `vercel login`

## Deployment Steps

### 1. Deploy Frontend
```bash
cd c:\Users\HP\Downloads\MediLingo
vercel --prod
```

### 2. Deploy Backend API
```bash
cd c:\Users\HP\Downloads\MediLingo\server
vercel --prod
```

## Environment Variables to Set in Vercel Dashboard

### Frontend Environment Variables
Go to Vercel Dashboard → Your Frontend Project → Settings → Environment Variables

Add these:
```
VITE_GEMINI_API_KEY=AIzaSyCzypah6cThJviM4bt57h6703shfvWo5IM
VITE_RAZORPAY_KEY_ID=rzp_test_RtYUA2drSIhQYW
```

### Backend Environment Variables
Go to Vercel Dashboard → Your Backend Project → Settings → Environment Variables

Add these:
```
MONGODB_URI=your_mongodb_connection_string_here
GEMINI_API_KEY=your_gemini_api_key_here
SESSION_SECRET=your_session_secret_here
EMAIL_USER=stockmaster577@gmail.com
EMAIL_PASS=obuauvyjlerywxke
JWT_SECRET=17d567eb437e8912c223c9da505e50d743e3c19e570e51e51ba113e7d955369f
JWT_REFRESH_SECRET=d2d379b3580820a378b9a5c0b3d1ac4e629b3fd0c314165357473e4598eb85dd
PORT=5001
NODE_ENV=production
RAZORPAY_KEY_ID=rzp_test_RtYUA2drSIhQYW
RAZORPAY_KEY_SECRET=6gPTyajJwqeukDfpK6wpbYfW
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 3. Update Frontend URL After Deployment
After deploying the frontend, copy its URL (e.g., `https://medilingo-xyz.vercel.app`)
Then update the backend's `FRONTEND_URL` environment variable with this URL.

### 4. Update Backend URL in Frontend
After deploying the backend, update all fetch calls in the frontend from:
```
http://localhost:5001
```
to:
```
https://your-backend-domain.vercel.app
```

## Quick Commands
```bash
# Deploy frontend
cd c:\Users\HP\Downloads\MediLingo
vercel --prod

# Deploy backend
cd c:\Users\HP\Downloads\MediLingo\server
vercel --prod
```

## Post-Deployment
1. Test all API endpoints
2. Verify Razorpay payments work
3. Check MongoDB connection
4. Test language switching
5. Verify authentication flows
