# Auralis

Auralis uses a split project structure:

- `frontend/` - React + Vite web app (all UI source is here)
- `backend/` - Node.js + Express + MongoDB API
- `data/` - sample CSV and data fixtures

## Why there was an extra `src` at root

That root `src/` was a leftover duplicate Vite scaffold from an earlier merge. It was not the intended location for your current app and has been removed.

## Run

Frontend:

```bash
npm run dev
```

Backend:

```bash
npm run dev:backend
```

## Frontend environment

Set API URL in `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```
