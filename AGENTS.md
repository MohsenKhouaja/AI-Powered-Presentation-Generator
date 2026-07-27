# P2M Agent Guidelines

## Project

npm workspaces monorepo: `backend` (Express 5, ESM) + `frontend` (React 19, Vite, Tailwind 4, Radix UI).

No test framework installed. Husky pre-commit is a stub (`echo "npm test"`).
do not add test unless i demand it

## Commands

```bash
# Frontend (port 3000)
npm run dev          # Vite dev server
npm run build        # tsc -b && vite build
npm run lint         # ESLint

# Backend (port 3001, ESM, in backend/ directory)
npm run dev          # tsx app.ts (predev starts observability services via Docker)
npm run db:generate  # Drizzle migration generation
npm run db:migrate   # Run pending migrations
npm run db:studio    # Drizzle Studio
npm run seed         # Seed dev data in MySQL
npm run seed:reset   # Reset + reseed
npm run test:db      # Quick DB connectivity check
```

Root scripts: `docker:up`, `docker:down`, `docker:logs`, `docker:rebuild`.

## Setup

- **`.env`** in `backend/` needs: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_ACCESS_TOKEN_SECRET_KEY`, `JWT_REFRESH_TOKEN_SECRET_KEY`, `ALLOWED_ORIGINS` (comma-separated)
- Docker Compose provides local **Loki** (port 3100) and local **Grafana**
  (port 3002). MySQL must run separately.
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

- **MySQL** via Drizzle ORM (`backend/database/drizzle/schema.ts`: 6 tables: `users`, `presentations`, `contexts`, `slides`, `files`, `edit_access`). Slide metadata and Markdown content are stored together in `slides`. All PKs are `UUID()` defaults.
- After schema changes: `db:generate` → `db:migrate`.
- `DBContext` type (`typeof db | Transaction`) passed as first param to service methods for transactional safety.

## Paths

- Frontend: `@/*` → `./frontend/src/*`
- Backend: `backend/api/<entity>/` has `router.ts` + `<entity>-service.ts`. Entities with routers: `presentations`, `slides`, `contexts`, `presentations_access`. Service-only (no router): `users`, `files`.
- No `packages/` workspace — shared types inline in backend/frontend.

## Files

- `.github/copilot-instructions.md` — learning-focused Copilot persona (not operational guidance)
- `.github/agents/*.agent.md` — Ralph loop agent definitions

## Frontend

- Design for reuse when the same domain concept, behavior, or presentation appears in more than one place, or when an existing shared seam already owns it. Search before creating and extend the narrowest suitable shared component, hook, helper, validator, or type.
- Reuse must preserve meaning. Do not merge merely similar components or types when their domain rules, ownership, or expected evolution differ, and do not introduce a generic abstraction for a single trivial use.
- Keep files focused. A component file should normally export one primary component; do not accumulate multiple substantial components in a page or feature file. Small private render helpers are acceptable only when they are inseparable from the primary component.
- Put reusable and feature components in the matching category under `apps/admin/src/components`: dialogs in `components/dialogs`, forms in `components/forms`, tables in `components/data-tables`, side panels in `components/side-panels`, cards in `components/cards`, and so on. Preserve or add domain subfolders within those categories when needed.
- Pages and route modules compose components; they must not become storage for embedded dialog, form, table, or side-panel implementations. Extract each substantial UI responsibility to its own appropriately named file.
- Keep dialog shells and forms in separate files: the dialog owns visibility, impact/loading state, mutation orchestration, and actions; the form owns fields, validation, and form-specific presentation.
- Reuse canonical types instead of redeclaring equivalent object shapes. Prefer types inferred or derived from validators, API-client contracts, query outputs, shared registries, and component props.
- Place a type in the closest module that owns its meaning. Types reused across frontend features belong in an appropriate shared frontend or package type module; types crossing package boundaries belong in the package that owns the contract. Keep truly implementation-local types beside their implementation.
