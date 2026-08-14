# StudyGo

StudyGo is a student assignment management application designed to help students organize coursework, track deadlines, prioritize tasks, and stay on top of academic workloads.

## Overview

- Modern, student-friendly dashboard
- Authentication with JWT and HTTP-only cookies
- Assignment creation, editing, deletion, and status updates
- Search, filtering, sorting, and overdue tracking
- Real PostgreSQL persistence via Prisma
- Separate Next.js frontend and Express backend

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- bcryptjs
- Zod

## Architecture

Frontend -> REST API -> Express Backend -> Prisma -> PostgreSQL

## Project Structure

```text
StudyGo/
├── Backend/
│   ├── prisma/
│   ├── src/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
├── Frontend/
│   ├── app/
│   ├── lib/
│   ├── .env.example
│   ├── .gitignore
│   ├── next.config.ts
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── README.md
└── .gitignore
```

## Environment Variables

### Backend
```env
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Local Development

### Backend
```bash
cd Backend
npm install
npm run prisma generate
npm run dev
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

## Production Build

```bash
cd Backend
npm run build

cd ../Frontend
npm run build
```

## Authentication

The backend uses JWT-based auth with HTTP-only cookies. Passwords are hashed using bcryptjs. Authorization middleware verifies the JWT before allowing access to protected routes.

## Database

This project is designed for Neon PostgreSQL and uses Prisma for schema definition and queries.

## Notes

- User passwords are never returned in API responses.
- The frontend never stores JWTs in localStorage or sessionStorage.
- The backend verifies ownership before reading or mutating assignment data.
