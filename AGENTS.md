# AGENTS.md

## Running the app

```bash
docker compose -f docker-compose.base44.yml up -d --build
docker compose -f docker-compose.base44.yml ps
```

The web entry point is host port 3000 (Vite dev server on container port 5173). `curl http://localhost:3000/` and `curl http://localhost:3000/api/health` should both answer; the health endpoint returns `{"ok":true,"db":"ok"}`.

First boot takes ~20s because each app service runs `npm install` into its named `node_modules` volume before starting the dev server.

## Things that are easy to get wrong

- The sandbox host has no Node runtime. Run anything Node-related inside a container, e.g. `docker compose -f docker-compose.base44.yml exec -T api node -e "..."`.
- There is no lockfile in the repo yet; the compose commands use `npm install`. If you add a lockfile, switch the commands to `npm ci`.
- Only port 3000 is published. The browser talks to the API through Vite's `/api` proxy (`frontend/vite.config.js`), so single-origin auth/cookies work without CORS configuration.
- `BASE44_PREVIEW_MODE=1` is passed into the web service and only switches Vite HMR to `clientPort: 443` (the preview proxy terminates TLS on the public host). With the flag unset, HMR uses the dev-server's own port.
- `CHOKIDAR_USEPOLLING=true` is set on both app services because file watching over bind mounts is unreliable in some environments.
- The `notes` table is created by the API at startup (`api/src/db.js`); no separate migration step exists.

## Verification

1. `curl -sS http://localhost:3000/api/health` → `{"ok":true,"db":"ok"}`
2. `POST /api/notes` with `{"title":"..."}` → 201, then `GET /api/notes` includes it, then `DELETE /api/notes/<id>` → 204.
3. Load http://localhost:3000 — the status line reads "API and database connected".
