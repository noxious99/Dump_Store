# Tracero

Track expenses, hit goals, and settle IOUs — all in one place.

[![Live](https://img.shields.io/badge/Live-tracero.me-6366F1?style=for-the-badge)](https://tracero.me)

## About

Tracero is a Ai powered web app for managing your personal finances and goals, so you don't have to juggle a separate app for each one.

- **Expense Tracker** — Log income and expenses, set monthly budgets, allocate by category, automate recurring entries, and see where your money goes.
- **IOU Tracker** — Keep track of money you've lent or borrowed, record payments, and settle up.
- **Goal Tracker** — Set short or long term goals, break them into tasks, and track your progress.

## Features

### Expense Tracker
- Fast expense and income logging with a calculator-style entry pad
- One-tap quick add for the things you log often
- Monthly budgets with per-category allocations and daily pacing
- Recurring entries that log themselves — rent, bills, subscriptions
- Spending breakdowns by category and over time
- Records grouped by day and category, with full edit and delete

### IOU Tracker
- Track money lent and borrowed, in both directions
- Partial payments, settle, and cancel
- Overdue detection and a running net balance
- Active and settled views, with search and filters

### Goals
- Short or long term goals with target dates
- Break goals into tasks and track progress

### Across the app
- Smart insights to help you stay on top of your money
- Dashboard with quick add and an at-a-glance overview
- Multi-currency support
- User profiles with avatar upload
- Password reset via email
- Responsive, mobile-first design
- Dark mode

## Tech Stack

**Frontend** — React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui (Radix UI), Redux Toolkit, React Query, React Hook Form + Zod

**Backend** — Node.js, Express, MongoDB (Mongoose), JWT auth, Cloudinary, Nodemailer / Resend

## Getting Started

### Prerequisites

- Node.js v18+
- npm
- MongoDB (Atlas or local)

### Clone

```bash
git clone https://github.com/noxious99/Dump_Store.git
cd Dump_Store
```

### Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
SMTP_USERNAME=your_smtp_username
SMTP_PASSWORD=your_smtp_password
GEMINI_API_KEY=your_gemini_api_key   # optional — enables AI insights (falls back to rule-based without it)
```

```bash
npm run dev        # development (nodemon)
npm start          # production
```

Server runs on `http://localhost:8000`

### Frontend

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_BACKEND_URL=http://localhost:8000/api
VITE_JWT_SECRET=your_jwt_secret
```

```bash
npm run dev
```

App runs on `http://localhost:5173`

## License

Non commercial use.
