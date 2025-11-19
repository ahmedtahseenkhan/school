# School Management System

Monorepo containing backend (Express + PostgreSQL) and frontend (React + Vite + Tailwind).

## Quickstart

1. Copy envs
- cp backend/.env.example backend/.env
- cp frontend/.env.example frontend/.env

2. Install deps
- In backend: npm install
- In frontend: npm install

3. Run DB migrations and seed
- In backend: npm run migrate && npm run seed

4. Start servers
- Backend: npm run dev (default 5000)
- Frontend: npm run dev (default 5173)

Login flow creates no default admin automatically. Create first user via POST /api/users (no auth required for first user). Then login.
