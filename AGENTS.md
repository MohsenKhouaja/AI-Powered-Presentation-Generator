# P2M Agent Guidelines

## Project Structure

```
p2m/                          # Workspaces monorepo (root package.json)
├── frontend/                  # React SPA (port 3000)
├── backend/                  # Express API (port 3001)
└── packages/contracts/       # Shared types & Zod validators
```

## Commands

```bash
# Frontend
cd frontend && npm run dev          # Dev server
cd frontend && npm run build       # Build (auto-runs contracts build first)
cd frontend && npm run lint       # ESLint

# Backend
cd backend && npm run dev         # Dev server (tsx app.ts)
cd backend && npm run test:db      # Test DB connection
cd backend && npm run db:generate # Drizzle: generate migrations
cd backend && npm run db:migrate # Drizzle: run migrations
cd backend && npm run db:studio   # Drizzle Studio UI
```

**Setup**
- Create `backend/.env` with DB credentials before running
- Uploads directory (`uploads/`) must exist (multer won't create it)

**Build order matters**: Frontend `prebuild` runs `@p2m/contracts` build first. Shared types must build before frontend/backend.

## Architecture

- **Frontend**: React 19, Tailwind CSS 4, Vite
- **Backend**: Express 5 (ESM), Drizzle ORM + MySQL, JWT auth
- **Contracts**: `@p2m/contracts` exports Zod validators + shared types via `packages/contracts/`

### Key Paths
- `@/*` → `./frontend/src/*`
- `backend/api/` → Router + Service pattern

## Database
- Drizzle ORM + MySQL (schema: `backend/database/drizzle/schema.ts`)
- After schema changes: `npm run db:generate` then `npm run db:migrate`

## Known Issues
- Duplicated auth in `presentations/router.ts` and `presentations_access/router.ts`
- Inconsistent route naming (singular vs plural)
- No global error handler
- `presentations_access/router.ts` lacks Zod validation

## References
- `.github/copilot-instructions.md` - Learning-focused Copilot instructions