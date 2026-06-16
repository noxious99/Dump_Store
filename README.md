# Tracero

Track expenses, hit goals, settle IOUs — all in one place.

[![Live](https://img.shields.io/badge/Live-tracero.me-6366F1?style=for-the-badge)](https://tracero.me)

---

## About

Tracero is a full-stack web app for managing personal finances and goals. Instead of switching between multiple apps, everything lives under one roof.

- **Expense Tracker** — Log income and expenses, set monthly budgets with per-category allocations, automate recurring entries, and break down your spending with charts and insights.
- **IOU Tracker** — Track money you've lent or borrowed, record partial payments, settle up, and see at a glance who owes who.
- **Goal Tracker** — Set short or long term goals, break them into tasks, and track progress over time.
- **Smart Insights** — AI-generated takeaways across your finances, with a rule-based fallback when AI is unavailable.

---

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui (Radix UI)
- Redux Toolkit + React Query
- React Hook Form + Zod

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (image storage)
- Nodemailer / Resend (transactional emails)

---

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


---

## Features

### Expense Tracker
- Fast expense and income logging with a calculator-style amount pad
- Categories with one-tap quick-add for entries you make often
- Monthly budgets with per-category allocation and spending-pace tracking
- Recurring rules — rent, subscriptions and bills log themselves automatically
- Analytics: category breakdowns, spending trends, and time-range comparisons
- Records grouped by day and category, with full edit/delete

### IOU Tracker
- Track money lent and borrowed in both directions
- Partial payments, settle, and cancel
- Overdue detection and a running net-balance summary
- Filter by lent or borrowed

### Goal Tracker
- Short or long term goals with target dates
- Break goals into tasks and track progress over time

### Insights
- AI-generated insights across your expenses, goals, and IOUs (rule-based fallback when AI is off)

### Account & app
- User profiles with avatar upload
- Multi-currency support
- Password reset via email
- Dashboard with quick-add and a summary overview
- Responsive, mobile-first design
- Dark mode

---

## License

Personal use.
