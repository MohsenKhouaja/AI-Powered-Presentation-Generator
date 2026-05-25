# Feature: Dev Seeder Script

## Overview

Add a repeatable seeding script to quickly populate a development database with realistic data so the app can be tested end-to-end (auth → presentations → slides). The app stores relational data in **MySQL (Drizzle)** and slide Markdown content in **MongoDB** (`slides_content` collection), so the seeder must populate both.

Dataset target (per current decision):

- 3 users with fixed, known credentials
- 3 presentations (owned by seeded users)
- Each presentation has a context row
- Each presentation has multiple slides in MySQL + matching slide content documents in MongoDB
- “Reset dev data” mode that deletes only seed-owned data (safe-ish) before reseeding

## Success Criteria

- [ ] All tasks complete
- [ ] Seeder can run locally with `tsx` via an npm script
- [ ] Seeder populates **both** MySQL tables and MongoDB `slides_content`
- [ ] Seeder supports a safe-ish reset mode (deletes only seed data)
- [ ] Running the seeder does **not** require Groq/LLM API keys (no external calls)
- [ ] Build succeeds
- [ ] No blockers

## Proposed File Structure (Plan)

Selected structure: **Modular** (small folder + thin entrypoint).

```
backend/
  scripts/
    seed/
      index.ts             # main CLI entry (seed + optional reset)
      dataset.ts           # explicit seed dataset definition
      reset.ts             # safe-ish cleanup logic constrained to seed-owned data
      mysql.ts             # mysql/drizzle inserts + deletes (or calls services)
      mongo.ts             # mongodb inserts + deletes for slides_content
      output.ts            # console summary formatting
    seed.ts                # thin entrypoint that calls seed/index.ts
  package.json             # adds npm scripts: seed, seed:reset (or seed -- --reset)
  README.md                # seeder usage + env var docs
```

## Tasks

### Task-001: Define Seed Dataset Contract

**Priority**: High
**Estimated Iterations**: 1

**Acceptance Criteria**:

- [ ] Seed accounts are explicitly defined (emails, usernames, password)
- [ ] Seed presentations are explicitly defined (titles, owner mapping)
- [ ] Slide counts per presentation are explicitly defined
- [ ] Seed data is easily identifiable (e.g., `Seed:` prefix in titles and/or `seed-` in emails)

**Files (created/edited)**:

- create `backend/scripts/seed/dataset.ts`
- edit `backend/scripts/seed/index.ts` to import and use the dataset

**Verification**:

```bash
# No code execution required; confirm dataset definition exists in seeder source
ls -la backend/scripts
```

### Task-002: Implement Seeder Script (MySQL + Mongo)

**Priority**: High
**Estimated Iterations**: 2-3

**Acceptance Criteria**:

- [ ] New script exists at `backend/scripts/seed.ts` (or similar clearly named location)
- [ ] Script loads env vars (expects `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `MONGO_URI`)
- [ ] Script creates:
  - [ ] Users in MySQL (password stored using the app’s hashing rules)
  - [ ] Presentations in MySQL
  - [ ] Contexts in MySQL (no uploaded files by default)
  - [ ] Slides in MySQL
  - [ ] Slide Markdown documents in MongoDB collection `slides_content` with `_id` matching the MySQL slide `id`
- [ ] Script prints a short summary:
  - [ ] Seeded user credentials (email + password)
  - [ ] Seeded presentation IDs (so UI routes can be tested)
- [ ] Script exits cleanly (no hanging process)
- [ ] Script does not invoke slide generation via Groq (avoid `generateFromContext`)

**Files (created/edited)**:

- create `backend/scripts/seed/index.ts`
- create `backend/scripts/seed/mysql.ts`
- create `backend/scripts/seed/mongo.ts`
- create `backend/scripts/seed/output.ts` (for printing a short summary)
- create `backend/scripts/seed.ts` (thin entrypoint)

**Implementation Notes (non-binding)**:

- Prefer calling existing services for correctness:
  - `usersService.signup` for password hashing
  - `presentationsService.create`
  - `contextService.create`
  - `slidesService.create` (inserts both MySQL row + Mongo doc)
- If service calls are awkward for reset/cleanup, it’s acceptable to use direct Drizzle deletes constrained to “seed-owned” rows.

**Verification**:

```bash
cd backend && npm run build

# After implementation, expected to exist:
# npm run seed
# npm run seed:reset (or a seed flag like --reset)
```

### Task-003: Add Reset Mode (Safe-ish Cleanup)

**Priority**: High
**Estimated Iterations**: 1-2

**Acceptance Criteria**:

- [ ] Seeder supports a reset mode (either `--reset` flag or separate npm script)
- [ ] Reset mode deletes ONLY seed data, by using deterministic identifiers:
  - [ ] Users by seed emails
  - [ ] Presentations by seed title prefix and/or owner user IDs
  - [ ] Slides in Mongo by slide IDs belonging to seed presentations (avoid deleting non-seed Mongo docs)
- [ ] Reset mode is idempotent (can run even if nothing exists yet)

**Files (created/edited)**:

- create/extend `backend/scripts/seed/reset.ts`
- edit `backend/scripts/seed/index.ts` to wire reset behavior (flag or separate command)

**Verification**:

```bash
# 1) Seed
cd backend && npm run seed

# 2) Reset+seed again (should succeed without manual cleanup)
cd backend && npm run seed:reset
```

### Task-004: Wire NPM Scripts + Minimal Docs

**Priority**: Medium
**Estimated Iterations**: 1

**Acceptance Criteria**:

- [ ] `backend/package.json` includes a `seed` command (and `seed:reset` if applicable)
- [ ] Docs mention required env vars and a typical dev flow

**Files (created/edited)**:

- edit `backend/package.json` to add `seed` and `seed:reset` scripts (or document `--reset` usage)
- edit `backend/README.md` with required env vars + typical usage

**Verification**:

```bash
cd backend && npm run seed
```

## Technical Constraints

- Language: TypeScript (Node, ESM)
- Backend runner: `tsx`
- Database (relational): MySQL via Drizzle ORM
- Database (documents): MongoDB via official `mongodb` driver
- Testing: smoke verification via CLI commands (no existing Jest/Vitest requirement assumed)
- Style: match existing backend code style (ESM imports, minimal abstractions)

## Architecture Notes

- **Relational ownership**: `presentations.userId` is the owner.
- **Context**: `contexts` has a uniqueness constraint per presentation.
- **Slide content boundary**: slide Markdown is stored in MongoDB collection `slides_content` keyed by slide `_id` (same value as MySQL `slides.id`).
- **No external calls**: Seeder should create slides with hardcoded markdown and must not require `GROQ_API_KEY`.

## Out of Scope

- Seeding real uploaded binary files (unless later requested)
- Performance/load-test scale (1000s of records)
- Production-safe migrations or “seed in prod” workflows
