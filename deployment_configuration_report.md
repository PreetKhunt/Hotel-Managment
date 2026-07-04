# Production Deployment Configuration Report

Based on a deep inspection of the `backend` and `frontend` source code (including Zod validation, `config.ts`, `env.ts`, and raw `process.env` references), here is the exact deployment configuration required.

## 1. Environment Variables Map

| Variable Name | Required? | Description | Where to Obtain / Source | Example Format |
| :--- | :---: | :--- | :--- | :--- |
| **`DATABASE_URL`** | **Yes** | Connection string to the PostgreSQL database for raw SQL queries & migrations. | Supabase (Settings > Database > Connection String) | `postgresql://postgres:password@db.supabase.co:5432/postgres` |
| **`SUPABASE_URL`** | **Yes** | The REST API endpoint for Supabase services. | Supabase (Settings > API > Project URL) | `https://xyz.supabase.co` |
| **`SUPABASE_ANON_KEY`** | **Yes** | Public anonymous key for Supabase client interactions. | Supabase (Settings > API > Project API Keys) | `eyJhbGci...` |
| **`SUPABASE_SERVICE_ROLE_KEY`** | **Yes** | Secret service role key for bypassing RLS during admin operations. | Supabase (Settings > API > Project API Keys) | `eyJhbGci...` |
| **`RAZORPAY_KEY_ID`** | **Yes** | Public identifier for Razorpay API. | Razorpay Dashboard (API Keys > Live Mode) | `rzp_live_abc123` |
| **`RAZORPAY_KEY_SECRET`** | **Yes** | Secret key for Razorpay API authentication and Webhook signature validation. | Razorpay Dashboard (API Keys > Live Mode) | `secret_xyz987` |
| **`PORT`** | No | Port for the backend Express server (defaults to 5000). | Railway (Automatically assigned) | `5000` |
| **`NODE_ENV`** | No | Environment mode (defaults to development). | Manually input | `production` |
| **`CORS_ORIGIN`** | No | The frontend URL allowed to make API requests (defaults to localhost:3001). | Vercel (Production deployment URL) | `https://hotel-management.vercel.app` |
| **`SUPABASE_JWT_SECRET`** | No | Secret used to verify Supabase JWT signatures (defaults to fallback string). | Supabase (Settings > API > JWT Secret) | `super-secret-jwt...` |
| **`NEXT_PUBLIC_API_URL`** | No | Frontend variable pointing to the Backend REST API (defaults to localhost:5000). | Railway (Production deployment URL) | `https://hotel-backend.up.railway.app/api/v1` |
| **`NEXT_PUBLIC_RAZORPAY_KEY_ID`** | No | Frontend variable for loading the Razorpay checkout script. | Razorpay Dashboard | `rzp_live_abc123` |

---

## 2. Documentation Discrepancies & Dead Variables

During the code audit, several discrepancies were found between the `README.md` / deployment guides and the actual codebase:

> [!WARNING]
> **Mismatched Variable: `FRONTEND_URL`**
> The README and your deployment instructions specify a `FRONTEND_URL` variable for the backend. **This variable is completely unused in the code.** The backend Zod validator (`src/config/env.ts`) explicitly expects `CORS_ORIGIN` to configure CORS policies.

> [!WARNING]
> **Mismatched Variable: `JWT_SECRET`**
> The README specifies `JWT_SECRET`. **This is completely unused.** The code in `src/config/auth.ts` specifically looks for `process.env.SUPABASE_JWT_SECRET`.

> [!TIP]
> **Ghost Variables in Frontend**
> The README tells the user to configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel. Because the frontend relies entirely on your Express backend for DB/Auth operations, **the frontend never calls Supabase directly.** These two variables are completely unused in the `frontend` folder and can be safely omitted from Vercel.

---

## 3. Platform Configuration Checklists

### Railway (Backend) Checklist
Configure these exactly as written in your Railway project settings:

- [ ] `DATABASE_URL`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `RAZORPAY_KEY_ID`
- [ ] `RAZORPAY_KEY_SECRET`
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN` *(Must be the Vercel URL, not FRONTEND_URL)*
- [ ] `SUPABASE_JWT_SECRET` *(Optional, but highly recommended for production security)*

### Vercel (Frontend) Checklist
Configure these exactly as written in your Vercel project settings:

- [ ] `NEXT_PUBLIC_API_URL` *(Must be the Railway URL + `/api/v1`)*
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID`
