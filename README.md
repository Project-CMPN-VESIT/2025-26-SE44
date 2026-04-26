# SevaConnect – Volunteer Management Platform

SevaConnect is a full-stack web platform built for NGOs to manage their volunteer workforce. Volunteers can sign up, view their assigned tasks, and track their contributions — while admins get a powerful dashboard to assign tasks, monitor progress, and manage all volunteer records.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT + bcrypt (custom) |

---

## Features

- **Volunteer Portal** — Sign up, view assigned volunteering tasks, track your contributions
- **Admin Dashboard** — Assign tasks to volunteers, monitor progress, manage all records
- **Secure Authentication** — Custom JWT-based auth with bcrypt password hashing
- **Role-based Access** — Separate portals for volunteers and admins

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/seva-connect.git
cd seva-connect
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory and add:

```env
DATABASE_URL=postgresql://your-db-url-here
JWT_SECRET=your-jwt-secret-here
```

### 4. Run database migrations
```bash
npx prisma migrate dev
```

### 5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

---

## Project Structure

```
seva-connect/
├── app/
│   ├── page.tsx          # Landing page
│   ├── login/            # Volunteer login
│   ├── signup/           # Volunteer signup
│   └── admin/            # Admin dashboard
├── prisma/
│   └── schema.prisma     # Database schema
└── public/               # Static assets
```

---

## Team

Niharika Pawar,
Swara Kadam,
Vaishali Sahajwani,
Ananya Nair

---

