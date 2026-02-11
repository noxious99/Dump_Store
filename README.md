# Tracero

**Your Life Management Companion** — Track expenses, achieve goals, and manage IOUs all in one place.

[![Live](https://img.shields.io/badge/Live-tracero.me-6366F1?style=for-the-badge)](https://tracero.me)

---

## About

Tracero is a full-stack personal finance and goal management application. It brings together three core tools into a single platform:

- **Goal Tracker** — Create short-term and long-term goals with milestones, tasks, and target dates.
- **Expense Tracker** — Log expenses, track income, set monthly budgets, allocate by category, and view spending summaries.
- **IOU Tracker** — Keep track of money you owe and money owed to you.

---

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui (Radix UI)
- Redux Toolkit + React Query
- React Router DOM
- React Hook Form + Zod

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (image uploads)
- Nodemailer / Resend (emails)

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm**
- **MongoDB** (Atlas or local instance)

### 1. Clone the repository

```bash
git clone https://github.com/noxious99/Dump_Store.git
cd Dump_Store
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside `/server` with the following variables:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
SMTP_USERNAME=your_smtp_username
SMTP_PASSWORD=your_smtp_password
```

Start the backend:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server runs on `http://localhost:8000`.

### 3. Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file inside `/client`:

```env
VITE_BACKEND_URL=http://localhost:8000/api
VITE_JWT_SECRET=your_jwt_secret
```

Start the frontend:

```bash
npm run dev
```

The app runs on `http://localhost:5173`.

---

## Features

- Expense logging with categories and monthly summaries
- Monthly budget allocation with alert thresholds
- Income tracking with source details
- Goal creation with milestones and completion tracking
- IOU management for debts and loans
- User profiles with avatar uploads
- Password reset via email
- Dashboard with summary cards
- Mobile responsive design
- Dark mode support

---

## License

This project is for personal use.
