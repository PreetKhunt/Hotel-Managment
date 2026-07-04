# Production Deployment Guide

Follow this step-by-step guide to deploy your completed Hotel Management System to production using Vercel (Frontend) and Railway (Backend).

## Phase 1: Deploy Backend to Railway

1. Go to [Railway.app](https://railway.app/) and log in with your GitHub account.
2. Click **New Project** > **Deploy from GitHub repo**.
3. Select `PreetKhunt/Hotel-Managment`.
4. Click **Add Variables** and input the following required environment variables:
   ```env
   PORT=5000
   NODE_ENV=production
   DATABASE_URL=your_supabase_connection_string
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```
   *(Note: Skip `FRONTEND_URL` for now; you will add it in Phase 3).*
5. Go to the **Settings** tab of the service, scroll down to **Root Directory**, and enter `/backend`.
6. Railway will automatically build and deploy the backend.
7. Under the **Settings** > **Networking** section, click **Generate Domain**.
8. **Verify:** Open `<RAILWAY_URL>/api/v1/health` in your browser to verify it returns a 200 OK. Save this URL!

---

## Phase 2: Deploy Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com/) and log in with GitHub.
2. Click **Add New** > **Project** and import `PreetKhunt/Hotel-Managment`.
3. In the **Framework Preset**, Next.js should automatically be detected.
4. Set the **Root Directory** to `frontend`.
5. Expand the **Environment Variables** section and add:
   ```env
   NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app/api/v1
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
   ```
6. Click **Deploy**. Vercel will build and assign you a production URL. Save this URL!

---

## Phase 3: Cross Configuration

Now that you have both URLs, you need to tell the backend where the frontend lives to prevent CORS errors.

1. Go back to your **Railway** project dashboard.
2. Under **Variables**, add:
   ```env
   FRONTEND_URL=https://your-vercel-frontend-url.vercel.app
   ```
3. Railway will automatically trigger a redeployment. Wait for it to complete.

---

## Phase 4: Supabase Configuration

Your authentication system needs to know about your new Vercel URL to allow secure logins.

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **Authentication** > **URL Configuration**.
3. Under **Site URL**, paste your Vercel URL (`https://your-vercel-url.vercel.app`).
4. Under **Redirect URLs**, click **Add URL** and add your Vercel URL. (You can keep `http://localhost:3001` for local development).
5. Ensure your Google OAuth Client ID and Secret in Supabase are configured with the new Vercel callback URL.

---

## Phase 5: Razorpay Configuration

Your payment gateway needs to send webhooks to your new backend URL.

1. Go to your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Navigate to **Account & Settings** > **Webhooks**.
3. Add a new webhook URL: `https://your-railway-url.up.railway.app/api/v1/payments/webhook`
4. Make sure your production Key ID and Secret match the ones you provided to Railway.

---

## Phase 6: Production Verification

Once the above is done, visit your Vercel URL and verify the following modules:
- [ ] Home Page & Room listings load correctly.
- [ ] You can register and log in via Email or Google.
- [ ] You can complete a room booking through Razorpay.
- [ ] The dashboard loads your booking history.
- [ ] No console or networking errors occur.
