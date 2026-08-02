# Production Deployment Guide

Follow this step-by-step guide to deploy your completed Hotel Management System to production using Netlify (Frontend) and Render (Backend).

## Phase 1: Deploy Backend to Render

1. Go to [Render.com](https://render.com/) and log in with your GitHub account.
2. Click **New** > **Web Service**.
3. Select `PreetKhunt/Hotel-Managment`.
4. Set **Root Directory** to `backend`. Set **Build Command** to `npm install; npm run build` and **Start Command** to `npm start`.
5. Click **Add Environment Variables** and input the following required environment variables:
   ```env
   PORT=10000
   NODE_ENV=production
   DATABASE_URL=your_supabase_connection_string
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_JWT_SECRET=your_jwt_secret
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   CORS_ORIGIN=https://vermillion-pothos-b232ea.netlify.app
   ```
6. Render will automatically build and deploy the backend.
7. Under the settings, note your assigned domain: `https://hotel-management-backend-s0s0.onrender.com`.
8. **Verify:** Open `https://hotel-management-backend-s0s0.onrender.com/api/v1/health` in your browser to verify it returns a 200 OK. Save this URL!

---

## Phase 2: Deploy Frontend to Netlify

1. Go to [Netlify.com](https://www.netlify.com/) and log in with GitHub.
2. Click **Add new site** > **Import an existing project** and pick `PreetKhunt/Hotel-Managment`.
3. Netlify will detect `netlify.toml` automatically.
4. Set the **Base directory** to `frontend` or rely on root `netlify.toml`.
5. Under **Environment Variables**, add:
   ```env
   BACKEND_API_URL=https://hotel-management-backend-s0s0.onrender.com/api/v1
   NEXT_PUBLIC_API_URL=https://hotel-management-backend-s0s0.onrender.com/api/v1
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
   ```
6. Click **Deploy Site**. Netlify will build and assign you a production URL.

---

## Phase 3: Cross Configuration

Now that you have both URLs, verify that the backend knows where the frontend lives to prevent CORS errors.

1. Go back to your **Render** project dashboard.
2. Under **Environment**, confirm or add:
   ```env
   CORS_ORIGIN=https://vermillion-pothos-b232ea.netlify.app
   ```
3. Render will automatically trigger a redeployment when environment variables change. Wait for it to complete.

---

## Phase 4: Supabase Configuration

Your authentication system needs to know about your new Netlify URL to allow secure logins.

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **Authentication** > **URL Configuration**.
3. Under **Site URL**, paste your Netlify URL (`https://vermillion-pothos-b232ea.netlify.app`).
4. Under **Redirect URLs**, click **Add URL** and add your Netlify callback URL: `https://vermillion-pothos-b232ea.netlify.app/api/v1/auth/google/callback`.
5. Ensure your Google OAuth Client ID and Secret in Supabase are configured properly.

---

## Phase 5: Razorpay Configuration

Your payment gateway needs to send webhooks to your new Render backend URL.

1. Go to your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Navigate to **Account & Settings** > **Webhooks**.
3. Add a new webhook URL: `https://hotel-management-backend-s0s0.onrender.com/api/v1/payments/webhook`
4. Make sure your production Key ID and Secret match the ones you provided to Render.

---

## Phase 6: Production Verification

Once the above is done, visit your Vercel URL and verify the following modules:
- [ ] Home Page & Room listings load correctly.
- [ ] You can register and log in via Email or Google.
- [ ] You can complete a room booking through Razorpay.
- [ ] The dashboard loads your booking history.
- [ ] No console or networking errors occur.
