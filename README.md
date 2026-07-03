# Hotel Management System

A premium full-stack Hotel Management System built with Next.js, Express.js, TypeScript, Supabase, PostgreSQL, Razorpay and Docker.

## Features

- Luxury Landing Page
- Dynamic Room Inventory
- Room Booking
- Availability Calendar
- Authentication
- Google Sign-In
- Booking History
- Razorpay Integration
- Invoice Generation
- Restaurant Reservation
- Spa Booking
- Fitness Centre
- Admin Dashboard
- RBAC
- Hotel Settings
- Docker Support
- Responsive Design

## Tech Stack

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS
- React Query
- Framer Motion

**Backend**
- Node.js
- Express.js
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

## Installation

Clone the repository and install dependencies for both the frontend and backend:

```bash
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

## Environment Variables

Create `.env` files in both `frontend` and `backend` directories.

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

## Running Locally

To run the application in a local development environment, start the servers from the root directory or start them individually:

**Frontend:**
```bash
cd frontend
npm run dev
```

**Backend:**
```bash
cd backend
npm run dev
```

The application will be accessible at:
- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:5000`

## Docker Deployment

To deploy the full application using Docker Compose, run the following from the root directory:

```bash
docker-compose up --build -d
```
This command builds the images and spins up both the frontend and backend containers in detached mode.

## API Documentation

The backend API is documented via Swagger. Once the backend server is running, you can access the interactive API documentation at:
`http://localhost:5000/api-docs`

## Screenshots

### Home
*(Placeholder for Home screenshot)*

### Rooms
*(Placeholder for Rooms screenshot)*

### Booking
*(Placeholder for Booking screenshot)*

### Dashboard
*(Placeholder for Dashboard screenshot)*

### Admin
*(Placeholder for Admin screenshot)*

## Future Improvements

- Multi Hotel SaaS
- AI Recommendations
- Analytics
- Email Notifications

## License

MIT

## Author

**Preet Khunt**

GitHub:
https://github.com/PreetKhunt

Email:
2403051051049@paruluniversity.ac.in

Additional Email:
khuntpreet12@gmail.com
