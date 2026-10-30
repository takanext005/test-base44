# test-base44

A small full-stack starter app: React + Vite frontend, Express API, and Postgres. The UI lets you add and delete notes stored in the database, and shows whether the API and database are reachable.

## Layout

- `frontend/` — React + Vite single page (dev server on container port 5173)
- `api/` — Express API on container port 4000 (`/api/health`, `/api/notes`)
- `docker-compose.base44.yml` — development stack (Vite dev server, `node --watch` API, Postgres)

## Running locally

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

Open http://localhost:3000. The Vite dev server proxies `/api` to the API service, so everything is served from a single origin.

## Development

Source directories are bind-mounted, so edits reload automatically (Vite HMR for the frontend, `node --watch` for the API). Dependencies live in named Docker volumes and are installed on container start.

Postgres data persists in the `db_data` volume. The `notes` table is created by the API on startup if it does not exist.
