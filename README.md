# Tracero

Track expenses, hit goals, settle IOUs — all in one place.

[![Live](https://img.shields.io/badge/Live-tracero.me-6366F1?style=for-the-badge)](https://tracero.me)

---

## About

Tracero is a full-stack web app for managing personal finances and goals. Instead of switching between multiple apps, everything lives under one roof.

- **Goal Tracker** — Set short or long term goals, break them into milestones, and track progress over time.
- **Expense Tracker** — Log expenses and income, set monthly budgets, allocate by category, and view breakdowns.
- **IOU Tracker** — Keep track of who owes who.

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

- Expense logging with categories and monthly summaries
- Monthly budget allocation across categories
- Income tracking by source
- Goal creation with milestones and deadlines
- IOU management — track debts both ways
- User profiles with avatar upload
- Password reset via email
- Dashboard with summary overview
- Responsive (mobile friendly)
- Dark mode

---

## License

Personal use.
