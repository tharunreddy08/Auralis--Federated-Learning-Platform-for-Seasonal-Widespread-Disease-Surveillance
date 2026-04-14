# Frontend

React + Vite frontend for Auralis.

## Start

```bash
cd frontend
npm install
npm run dev
```

Default dev URL: http://localhost:5173

## Environment

Create or update `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Structure

- `src/App.jsx` app routes
- `src/main.jsx` app entry
- `src/pages/` role-based pages
- `src/components/` shared and dashboard components
- `src/api/` API client and entity services
- `src/lib/` app utilities and providers
