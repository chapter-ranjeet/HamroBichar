# HamroBichar

Complete MERN-style Nepal news website with:

- `backend`: Node.js, Express, MongoDB (Mongoose), JWT auth, article CRUD
- `frontend`: Next.js (App Router), Tailwind CSS, Axios

## Project Structure

- `backend/`
- `frontend/`

## Backend Setup

1. Copy `backend/.env.example` to `backend/.env`
2. Update MongoDB URI and JWT values.
3. Install and run:

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

### Backend API

- `POST /api/auth/login`
- `POST /api/auth/register-admin` (admin JWT required)
- `GET /api/auth/users` (admin JWT required)
- `PATCH /api/auth/users/:id/role` (admin JWT required)
- `GET /api/articles`
- `GET /api/articles/:slug`
- `POST /api/articles` (admin JWT required)
- `PUT /api/articles/:id` (admin JWT required)
- `DELETE /api/articles/:id` (admin JWT required)
- `POST /api/upload/image` (admin JWT required, multipart/form-data)

### Admin Seed

If these env vars are present, backend seeds one admin on startup if missing:

- `ADMIN_SEED_EMAIL`
- `ADMIN_SEED_USERNAME`
- `ADMIN_SEED_PASSWORD`

## Frontend Setup

1. Copy `frontend/.env.example` to `frontend/.env.local`
2. Install and run:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Login Flow

1. Start backend and frontend.
2. Open `/master` on frontend.
3. Sign in with seed admin credentials from backend `.env`.
4. Manage articles at `/master/dashboard`.

## Notes

- Slug is auto-generated from title and kept unique.
- Homepage shows categories and latest news cards.
- Article page uses dynamic slug route.
- UI includes loading and API error states.
- Admin dashboard includes a rich-text editor toolbar for content.
- Admin dashboard supports direct image upload (stored under backend `/uploads`).
- Admin dashboard includes user role management (admin/user toggle).

## Smoke Test

Run one command to validate health, admin login, image upload, user list, and full article CRUD:

```bash
npm run smoke:test
```

Optional environment overrides for the smoke script:

- `BACKEND_URL` (default: `http://localhost:5000/api`)
- `ADMIN_EMAIL` (default: seed admin email)
- `ADMIN_PASSWORD` (default: seed admin password)

## Deployment (Vercel + Render)

This project is split deployment:

- Frontend (Next.js) -> Vercel
- Backend (Express API) -> Render

### 1. Deploy Backend to Render

Option A: Use the included `render.yaml` at repository root.

- File: `render.yaml`
- Service root dir: `backend`
- Build command: `npm install; npm run build`
- Start command: `npm run start`
- Health check: `/api/health`

Set these required Render environment variables:

- `MONGODB_URI` = your MongoDB Atlas URI
- `JWT_SECRET` = long random secret
- `CORS_ORIGIN` = `https://<your-vercel-domain>.vercel.app`

Optional backend env vars:

- `JWT_EXPIRES_IN` (default `1d`)
- `ADMIN_SEED_EMAIL`
- `ADMIN_SEED_USERNAME`
- `ADMIN_SEED_PASSWORD`

After deploy, copy your backend URL, e.g.:

- `https://hamrobichar-backend.onrender.com`

### 2. Deploy Frontend to Vercel

Create a Vercel project using:

- Framework: Next.js
- Root directory: `frontend`

Set required Vercel environment variable:

- `NEXT_PUBLIC_API_BASE_URL` = `https://<your-render-domain>/api`

Redeploy after setting env vars.

### 3. Final CORS setup

Update Render backend env var `CORS_ORIGIN` with all allowed frontend domains (comma-separated), for example:

- `https://hamro-bichar.vercel.app,https://hamro-bichar-git-main.vercel.app`

### 4. Verify Production

- Backend health: `https://<render-domain>/api/health`
- Frontend home: `https://<vercel-domain>/`
- Admin login: `https://<vercel-domain>/master`

### Notes

- Backend image uploads currently use local `/uploads` storage. On Render free instances this storage is ephemeral (can reset on restart).
- For durable image storage in production, move uploads to Cloudinary, S3, or another persistent object storage.
