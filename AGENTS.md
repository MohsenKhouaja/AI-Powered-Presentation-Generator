# P2M Agent Guidelines

## Project

npm workspaces monorepo: `backend` (Express 5, ESM) + `frontend` (React 19, Vite, Tailwind 4).

No test framework installed. Husky pre-commit is a stub (`echo "npm test"`).

## Commands

```bash
# Frontend (port 3000)
cd frontend && npm run dev        # Vite dev server
cd frontend && npm run build      # tsc -b && vite build
cd frontend && npm run lint       # ESLint

# Backend (port 3001, ESM)
cd backend && npm run dev         # tsx app.ts
cd backend && npm run db:generate # Drizzle migration generation
cd backend && npm run db:migrate  # Run pending migrations
cd backend && npm run db:studio   # Drizzle Studio
cd backend && npm run test:db     # Quick DB connectivity check
```

## Setup

- **`.env`** in `backend/` needs: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `MONGO_URI`, `JWT_ACCESS_TOKEN_SECRET_KEY`, `JWT_REFRESH_TOKEN_SECRET_KEY`, `ALLOWED_ORIGINS` (comma-separated)
- Docker Compose provides **MongoDB only** (port 27017). MySQL must run separately.
- Upload dir (`uploads/`) is auto-created by `app.ts:18` — no manual step needed.

## Architecture

- **Backend is ESM** — all relative imports must include `.js` extension (e.g. `from "./foo.js"`)
- Auth: JWT access + refresh tokens. Routes under `/api/auth/*` are public; all other `/api/*` require `Authorization: Bearer <token>` header.
- Single global error handler at `app.ts:54`. No per-route error catching — throw errors to let it handle them.
- **Route inconsistency**: `GET /presentations` (plural list), but `POST/PUT/DELETE /presentation` (singular CRUD) — match existing patterns.
- `getAuthenticatedUserId()` is duplicated across routers — auth is also enforced by `middleware/auth.ts`.

## Database

- **MySQL** via Drizzle ORM (schema: `backend/database/drizzle/schema.ts`), **MongoDB** via native driver (collection: `slides_content`)
- After schema changes: `db:generate` → `db:migrate`
- `ALLOWED_ORIGINS` env var controls CORS — frontend dev server origin must be listed.

## Paths

- Frontend: `@/*` → `./frontend/src/*`
- Backend: `backend/api/<entity>/` has `router.ts` + `<entity>-service.ts`
- No `packages/` workspace exists — shared types live inline in backend/frontend.

## Files

- `.github/copilot-instructions.md` — learning-focused Copilot persona (not operational guidance)
- `.github/agents/*.agent.md` — Ralph loop agent definitions (coordinator/executor/reviewer)
- `PRD.md` — active feature spec with task breakdown
- `PROGRESS.md` — Ralph loop progress tracker
