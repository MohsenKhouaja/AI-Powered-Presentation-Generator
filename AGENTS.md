# P2M Agent Guidelines

## Project

npm workspaces monorepo: `backend` (Express 5, ESM) + `frontend` (React 19, Vite, Tailwind 4, Radix UI).

No test framework installed. Husky pre-commit is a stub (`echo "npm test"`).

## Commands

```bash
# Frontend (port 3000)
npm run dev          # Vite dev server
npm run build        # tsc -b && vite build
npm run lint         # ESLint

# Backend (port 3001, ESM, in backend/ directory)
npm run dev          # tsx app.ts (predev auto-starts MongoDB via Docker)
npm run db:generate  # Drizzle migration generation
npm run db:migrate   # Run pending migrations
npm run db:studio    # Drizzle Studio
npm run seed         # Seed dev data (MySQL + MongoDB)
npm run seed:reset   # Reset + reseed
npm run test:db      # Quick DB connectivity check
```

Root scripts: `docker:up`, `docker:down`, `docker:logs`, `docker:rebuild`.

## Setup

- **`.env`** in `backend/` needs: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `MONGO_URI`, `JWT_ACCESS_TOKEN_SECRET_KEY`, `JWT_REFRESH_TOKEN_SECRET_KEY`, `ALLOWED_ORIGINS` (comma-separated)
- Docker Compose provides **MongoDB only** (port 27017). MySQL must run separately.
- Upload dir (`uploads/`) auto-created by `app.ts:25` — no manual step.
- `ALLOWED_ORIGINS` controls CORS — frontend dev server origin must be listed.

## Architecture

- **Backend is ESM** — all relative imports must include `.js` extension (e.g. `from "./foo.js"`)
- `verbatimModuleSyntax: true` in `tsconfig.json` — use `import type` for type-only imports.
- Auth: JWT (access 15min, refresh 30d). Routes under `/api/auth/*` are public; all other `/api/*` require `Authorization: Bearer <token>` header.
- Single global error handler at `app.ts:61`. No per-route error catching — throw errors to let it handle them.
- **Route inconsistency**: `GET /presentations` (plural list), but `POST/PUT/DELETE /presentation` (singular CRUD) — match existing patterns.
- `getAuthenticatedUserId()` duplicated across routers (`presentations`, `slides`, `presentations_access`) despite `middleware/auth.ts` already setting `req.authenticatedUserId`.
- **Typo**: `routes/auth.ts:66` sends `accesToken` (missing `s`) alongside `accessToken`.
- OpenRouter AI used via `openai` npm package pointed at `https://openrouter.ai/api/v1`.

## Database

- **MySQL** via Drizzle ORM (`backend/database/drizzle/schema.ts`: 6 tables: `users`, `presentations`, `contexts`, `slides`, `files`, `edit_access`). All PKs are `UUID()` defaults.
- **MongoDB** via native driver, collection `slides_content` in `myDatabase` — stores slide body content; metadata lives in MySQL.
- After schema changes: `db:generate` → `db:migrate`.
- `DBContext` type (`typeof db | Transaction`) passed as first param to service methods for transactional safety.

## Paths

- Frontend: `@/*` → `./frontend/src/*`
- Backend: `backend/api/<entity>/` has `router.ts` + `<entity>-service.ts`. Entities with routers: `presentations`, `slides`, `contexts`, `presentations_access`. Service-only (no router): `users`, `files`.
- No `packages/` workspace — shared types inline in backend/frontend.

## Files

- `.github/copilot-instructions.md` — learning-focused Copilot persona (not operational guidance)
- `.github/agents/*.agent.md` — Ralph loop agent definitions
