# Environment Variables for Vercel

## Frontend Project (medilingooooo)
Go to: https://vercel.com/rudrasheth2201-8352s-projects/medilingooooo/settings/environment-variables

Add these:
```
VITE_GEMINI_API_KEY=AIzaSyCzypah6cThJviM4bt57h6703shfvWo5IM
VITE_RAZORPAY_KEY_ID=rzp_test_RtYUA2drSIhQYW
VITE_API_URL=https://server-kappa-blush.vercel.app
```

## Backend Project (server)
Go to: https://vercel.com/rudrasheth2201-8352s-projects/server/settings/environment-variables

Add ALL these:
```
MONGODB_URI=your_mongodb_connection_string_here
GEMINI_API_KEY=your_gemini_api_key_here
SESSION_SECRET=your_session_secret_here
EMAIL_USER=stockmaster577@gmail.com
EMAIL_PASS=obuauvyjlerywxke
JWT_SECRET=17d567eb437e8912c223c9da505e50d743e3c19e570e51e51ba113e7d955369f
JWT_REFRESH_SECRET=d2d379b3580820a378b9a5c0b3d1ac4e629b3fd0c314165357473e4598eb85dd
NODE_ENV=production
RAZORPAY_KEY_ID=rzp_test_RtYUA2drSIhQYW
RAZORPAY_KEY_SECRET=6gPTyajJwqeukDfpK6wpbYfW
FRONTEND_URL=https://medilingooooo.vercel.app
PORT=5001
```

After adding environment variables, redeploy both projects:
- Frontend: `cd c:\Users\HP\Downloads\MediLingo ; vercel --prod`
- Backend: `cd c:\Users\HP\Downloads\MediLingo\server ; vercel --prod`
