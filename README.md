<div align="center">
  <h1>Hotel Management System</h1>
  <p>A premium full-stack hotel management platform built with Next.js, Express.js, Supabase, PostgreSQL, Razorpay and TypeScript.</p>
</div>

---

## Features

- Luxury Hotel Landing Page
- Room Management
- Dynamic Room Inventory
- Secure Authentication
- Google Sign-In (Supabase Auth)
- Booking Engine
- Razorpay Payment Integration
- Booking History
- Invoice Generation
- Restaurant Reservations
- Spa & Wellness Booking
- Fitness Centre Booking
- Admin Dashboard
- Role-Based Access Control
- Hotel Configuration
- Responsive UI
- Docker Support

---

## Tech Stack

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS
- React Query
- Framer Motion

**Backend**
- Express.js
- Node.js
- TypeScript

**Database**
- PostgreSQL
- Supabase

**Authentication**
- Supabase Auth
- Google OAuth

**Payments**
- Razorpay

**Deployment**
- Docker
- Docker Compose

---

## Folder Structure

```
Hotel-Management/
├── frontend/             # Next.js 16 Application
│   ├── app/              # Next.js App Router Pages
│   ├── components/       # Reusable React UI Components
│   ├── hooks/            # Custom React Query Hooks
│   ├── lib/              # API Clients & Utilities
│   ├── providers/        # Context Providers
│   ├── public/           # Static Assets
│   └── types/            # TypeScript Interfaces
├── backend/              # Express.js Application
│   ├── src/              # Backend Source Code
│   │   ├── controllers/  # Route Controllers
│   │   ├── middleware/   # Express Middleware
│   │   ├── routes/       # API Routes
│   │   ├── services/     # Business Logic layer
│   │   └── utils/        # Helper Functions
│   └── supabase/         # Database Schema & Migrations
├── docker-compose.yml    # Docker Setup
├── .gitignore            # Git Ignored Files
├── LICENSE               # MIT License
└── README.md             # Project Documentation
```

---

## Installation

```bash
# Clone the repository
git clone https://github.com/PreetKhunt/Hotel-Managment.git
cd Hotel-Managment

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

---

## Environment Variables

Create `.env` files in both frontend and backend directories based on these requirements:

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

**Backend (`backend/.env`):**
```env
PORT=
NODE_ENV=
DATABASE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
FRONTEND_URL=
```

---

## Running Locally

To run the application in a local development environment:

**1. Start the Backend Server**
```bash
cd backend
npm run dev
```

**2. Start the Frontend Development Server**
```bash
cd frontend
npm run dev
```

The application will be accessible at:
- Frontend: `http://localhost:3001` (or your configured Next.js port)
- Backend API: `http://localhost:5000`

---

## Docker Deployment

To deploy the full application using Docker Compose, run the following from the root directory:

```bash
docker-compose up --build -d
```

This will spin up both the frontend and backend containers in detached mode.

---

## API Documentation

The backend API is documented via Swagger. Once the backend server is running, you can access the interactive API documentation at:

```
http://localhost:5000/api-docs
```

---

## Screenshots

### Home Page
*(Placeholder for Home Page screenshot)*

### Rooms
*(Placeholder for Rooms overview screenshot)*

### Booking Engine
*(Placeholder for Booking checkout screenshot)*

### Guest Dashboard
*(Placeholder for Guest Dashboard screenshot)*

### Admin Panel
*(Placeholder for Admin interface screenshot)*

---

## Future Improvements

- Multi Hotel SaaS
- AI Recommendation
- Analytics
- Email Notifications

---

## License

MIT

---

## Author

**Preet Khunt**

GitHub: [https://github.com/PreetKhunt](https://github.com/PreetKhunt)

Email: 2403051051049@paruluniversity.ac.in
