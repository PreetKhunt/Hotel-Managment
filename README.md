# Hotel Management System (Hospitality Hub)

A premium, full-stack commercial hotel booking and management system. Designed for luxury properties, this software handles real-time room availability, dynamic pricing, guest authentication, payment processing (Razorpay), and a comprehensive back-office dashboard for hotel staff.

## Features

- **Guest Portal**: Beautiful, responsive, and animated frontend for guests to browse rooms, view services, and read verified reviews.
- **Booking Engine**: Advanced booking flow with real-time availability checks, double-booking prevention via Supabase transactions, and auto-expiring pending holds.
- **Secure Payments**: Integrated Razorpay checkout with webhook verification and graceful failure handling.
- **Admin Dashboard**: Comprehensive back-office suite to manage bookings, track revenue analytics, and monitor hotel operations.
- **Authentication**: JWT-based secure authentication for guests and administrative staff.
- **Modern UI**: Polished interface with Framer Motion animations, luxurious styling, and a fully functional rich-text editor (Tiptap) for dynamic content.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, React Query, Axios.
- **Backend**: Node.js, Express, TypeScript, Supabase (PostgreSQL), Razorpay SDK.
- **Database**: PostgreSQL (via Supabase) with Row Level Security and robust SQL migrations.

## Screenshots

*(Add screenshots of the Home Page, Room Booking Flow, and Admin Dashboard here)*

## Installation & Running Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Supabase Project (PostgreSQL)
- Razorpay API Keys

### 1. Clone the repository
```bash
git clone https://github.com/your-username/Hotel-Management.git
cd Hotel-Management
```

### 2. Install dependencies
```bash
# Install root, frontend, and backend dependencies concurrently
npm install
```

### 3. Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
DATABASE_URL="your-supabase-postgres-connection-string"
JWT_SECRET="your-secure-jwt-secret"
RAZORPAY_KEY_ID="your-razorpay-key"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
FRONTEND_URL="http://localhost:3001"
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
NEXT_PUBLIC_RAZORPAY_KEY_ID="your-razorpay-key"
```

### 4. Database Setup
Run the SQL migration scripts located in `backend/supabase/migrations/` in chronological order against your Supabase database to construct the schema and seed the initial luxury room data and reviews.

### 5. Start the Development Servers
```bash
npm run dev
```
- Frontend runs on `http://localhost:3001`
- Backend runs on `http://localhost:5000`

## Docker Setup

To run the application via Docker Compose:

```bash
docker-compose up --build -d
```
*Note: Ensure your `.env` variables are correctly passed to the containers in your production environment.*

## Folder Structure

```
Hotel-Management/
├── frontend/             # Next.js 16 application
│   ├── app/              # App router pages
│   ├── components/       # Reusable React components
│   ├── hooks/            # Custom React Query hooks
│   └── lib/              # Utilities and API clients
├── backend/              # Node.js/Express application
│   ├── src/              # Source code (Controllers, Routes, Services)
│   └── supabase/         # SQL Migrations & Database schema
├── docker-compose.yml    # Docker orchestration
├── .gitignore            # Git ignore rules
└── package.json          # Root workspace configuration
```

## API Documentation

The backend exposes a RESTful API under `/api/v1`. Key endpoints include:
- `POST /auth/register` - Guest registration
- `POST /auth/login` - User login
- `GET /rooms` - Fetch available rooms (supports filtering)
- `POST /bookings` - Create a pending hold booking
- `POST /bookings/verify-payment` - Confirm a booking post-payment

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

Developed for Hospitality Hub.
