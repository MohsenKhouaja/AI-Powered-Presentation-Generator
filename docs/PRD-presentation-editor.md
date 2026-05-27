````markdown
# Feature: Presentation Editor/View + Presentation-Scoped Themes

## Overview

Build a two-mode presentation experience:

- **View mode** (`/presentations/:id`): keyboard-driven viewing of a deck.
- **Edit mode** (`/presentations/:id/edit`): slide CRUD with a Markdown editor, draggable ordering, and saving via the dedicated slide endpoints.

Fix theming to match these constraints:

- The **whole app** uses a fixed "ElevenLabs" light theme (type-first, eggshell surfaces).
- Theme switching must apply **only to individual slide content** (the rendered slide canvas/viewer area), not to the dashboard, app shell, editor chrome, or any surrounding UI.
- Reuse existing shadcn/ui components already in the repo.

### ElevenLabs Design System (Fixed App Theme)

The entire app shell — dashboard, navigation, editor chrome, settings — is locked to the ElevenLabs visual language described below. This is not configurable.

#### Colors

| Name        | Value     | Token                 | Role                                                        |
| ----------- | --------- | --------------------- | ----------------------------------------------------------- |
| Eggshell    | `#fdfcfc` | `--color-eggshell`    | Page background and primary surface                         |
| Powder      | `#f5f3f1` | `--color-powder`      | Secondary surface, hover states, subtle section backgrounds |
| Chalk       | `#e5e5e5` | `--color-chalk`       | All borders, dividers, card outlines                        |
| Fog         | `#b1b0b0` | `--color-fog`         | Disabled states, placeholder elements                       |
| Gravel      | `#777169` | `--color-gravel`      | Secondary body text, captions — warm stone undertone        |
| Slate       | `#a59f97` | `--color-slate`       | Tertiary text, icon strokes, deemphasized labels            |
| Obsidian    | `#000000` | `--color-obsidian`    | Primary text, filled CTA buttons, logo mark                 |
| Signal Blue | `#0447ff` | `--color-signal-blue` | Small avatar/dot indicators only — never in text or buttons |
| Ember       | `#ff4704` | `--color-ember`       | Small avatar/dot indicators only                            |

#### Typography

- **Waldenburg 300** — All display/section headlines at 32px+, `-0.02em` tracking. Substitute: Cormorant Garamond 300.
- **WaldenburgFH 700** — Navigation product labels and icon badges, 14px, `0.05em` tracking. Substitute: Inter 700 with `letter-spacing: 0.7px`.
- **Inter 400/500** — All body copy, UI labels, navigation, buttons, captions.
- **Geist Mono 400** — Code snippets, technical annotations, 13px.

#### Type Scale

| Role       | Size | Line Height | Letter Spacing |
| ---------- | ---- | ----------- | -------------- |
| caption    | 10px | 1.2         | —              |
| body       | 14px | 1.43        | —              |
| body-lg    | 16px | 1.5         | —              |
| subheading | 18px | 1.44        | —              |
| heading-sm | 20px | 1.4         | —              |
| heading    | 32px | 1.17        | -0.64px        |
| heading-lg | 36px | 1.13        | -0.72px        |
| display    | 48px | 1.08        | -0.96px        |

#### Spacing (4px base unit)

`4 / 8 / 12 / 16 / 20 / 24 / 28 / 32 / 36 / 40 / 48 / 56 / 64 / 72 / 96 / 160px`

#### Border Radius

| Element        | Value                                  |
| -------------- | -------------------------------------- |
| buttons / tags | 9999px                                 |
| cards / panels | 16–20px                                |
| badges         | 12px                                   |
| inputs         | 4px (or 0px for bare editorial inputs) |
| modals         | 24px                                   |

#### Shadows

Only hairline elevation is used. Cards and surfaces float by 1px shadow, never by depth layering:

- `--shadow-subtle`: `rgba(0,0,0,0.075) 0px 0px 0px 0.5px inset`
- `--shadow-subtle-2`: `rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px`
- `--shadow-subtle-4`: `rgba(0,0,0,0.4) 0px 0px 1px 0px, rgba(0,0,0,0.04) 0px 4px 4px`
- `--shadow-subtle-7`: `rgba(0,0,0,0.4) 0px 0px 1px 0px, rgba(0,0,0,0.04) 0px 2px 4px`

#### Key Components

**Primary Pill Button (Filled):** `background: #000000`, `color: #fdfcfc`, `border-radius: 9999px`, `padding: 0 16px`, `border: 1px solid #e5e5e5`, Inter 500 14px.

**Ghost Pill Button (Outline):** `background: #ffffff`, `color: #000000`, `border-radius: 9999px`, `padding: 0 12px`, `border: 1px solid #e5e5e5`. White fill over eggshell gives a subtle float effect.

**Navigation Bar:** Height 36px, `background: #fdfcfc`, `border-bottom: 1px solid #e5e5e5`. Logo left, nav links Inter 400 14px, product labels WaldenburgFH 700 14px 0.05em tracking, auth CTAs right.

**Cards:** `background: #ffffff`, `border-radius: 16px`, `box-shadow: rgba(0,0,0,0.4) 0px 0px 1.143px, rgba(0,0,0,0.04) 0px 2px 4px`.

**Inputs (Contained):** `background: #ffffff`, `border: 1px solid #e5e5e5`, `border-radius: 0px` (editorial style), `padding: 12px 20px`, Inter 400 14px.

**Inputs (Transparent/Underline):** `background: transparent`, `border-bottom: 1px solid #000000`, `border-radius: 0px`.

#### CSS Custom Properties

```css
:root {
  --color-eggshell: #fdfcfc;
  --color-powder: #f5f3f1;
  --color-chalk: #e5e5e5;
  --color-fog: #b1b0b0;
  --color-gravel: #777169;
  --color-slate: #a59f97;
  --color-obsidian: #000000;
  --color-signal-blue: #0447ff;
  --color-ember: #ff4704;

  --font-waldenburg: "Waldenburg", "Cormorant Garamond", ui-serif, serif;
  --font-waldenburgfh: "WaldenburgFH", ui-sans-serif, system-ui, sans-serif;
  --font-inter: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-geist-mono: "Geist Mono", ui-monospace, monospace;

  --radius-full: 9999px;
  --radius-cards: 16px;
  --radius-badges: 12px;
  --radius-inputs: 4px;
  --radius-modals: 24px;
  --radius-panels: 20px;
  --radius-buttons: 9999px;

  --shadow-subtle: rgba(0, 0, 0, 0.075) 0px 0px 0px 0.5px inset;
  --shadow-subtle-2:
    rgba(0, 0, 0, 0.06) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 1px 2px 0px,
    rgba(0, 0, 0, 0.04) 0px 2px 4px 0px;
  --shadow-subtle-4:
    rgba(0, 0, 0, 0.4) 0px 0px 1px 0px, rgba(0, 0, 0, 0.04) 0px 4px 4px 0px;
  --shadow-subtle-7:
    rgba(0, 0, 0, 0.4) 0px 0px 1px 0px, rgba(0, 0, 0, 0.04) 0px 2px 4px 0px;

  --surface-page-ground: #fdfcfc;
  --surface-powder: #f5f3f1;
  --surface-card: #ffffff;
  --surface-obsidian: #000000;
}
```

#### Tailwind v4 Theme Block

```css
@theme {
  --color-eggshell: #fdfcfc;
  --color-powder: #f5f3f1;
  --color-chalk: #e5e5e5;
  --color-fog: #b1b0b0;
  --color-gravel: #777169;
  --color-slate: #a59f97;
  --color-obsidian: #000000;
  --color-signal-blue: #0447ff;
  --color-ember: #ff4704;

  --font-waldenburg: "Waldenburg", "Cormorant Garamond", ui-serif, serif;
  --font-waldenburgfh: "WaldenburgFH", ui-sans-serif, system-ui, sans-serif;
  --font-inter: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-geist-mono: "Geist Mono", ui-monospace, monospace;

  --radius-full: 9999px;
  --radius-cards: 16px;
  --radius-badges: 12px;
  --radius-inputs: 4px;
  --radius-modals: 24px;
  --radius-panels: 20px;
  --radius-buttons: 9999px;

  --shadow-subtle: rgba(0, 0, 0, 0.075) 0px 0px 0px 0.5px inset;
  --shadow-subtle-2:
    rgba(0, 0, 0, 0.06) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 1px 2px 0px,
    rgba(0, 0, 0, 0.04) 0px 2px 4px 0px;
  --shadow-subtle-4:
    rgba(0, 0, 0, 0.4) 0px 0px 1px 0px, rgba(0, 0, 0, 0.04) 0px 4px 4px 0px;
  --shadow-subtle-7:
    rgba(0, 0, 0, 0.4) 0px 0px 1px 0px, rgba(0, 0, 0, 0.04) 0px 2px 4px 0px;

  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-28: 28px;
  --spacing-32: 32px;
  --spacing-36: 36px;
  --spacing-40: 40px;
  --spacing-48: 48px;
  --spacing-56: 56px;
  --spacing-64: 64px;
  --spacing-72: 72px;
  --spacing-96: 96px;
  --spacing-160: 160px;
}
```

#### Do's and Don'ts

**Do:**

- Use Waldenburg 300 with `-0.02em` letter-spacing for all headings at 32px and above.
- Apply 9999px border-radius to every button and pill tag; 16–20px for cards/panels; 0px for bare editorial inputs.
- Keep the full palette at near-zero saturation: `#000000` text, `#fdfcfc` background, `#e5e5e5` borders, `#777169` secondary text.
- Use the inset shadow `rgba(0,0,0,0.075) 0px 0px 0px 0.5px inset` on white surfaces over eggshell instead of border-color.
- Use Geist Mono 400 13px only for code snippets and technical inline annotations.

**Don't:**

- Never use a weight above 300 for Waldenburg display headlines.
- Never introduce saturated color for text, backgrounds, or buttons — Signal Blue and Ember are reserved for 8–16px avatar/dot indicators only.
- Never apply box-shadow elevation larger than `rgba(0,0,0,0.4) 0px 0px 1.143px` — cards float by 1px, not by depth.
- Never use pure `#ffffff` for page backgrounds — use `#fdfcfc` (Eggshell) for all base surfaces.
- Never apply border-radius to editorial input fields.
- Never use more than two button variants in the same cluster (one filled black pill + one ghost pill maximum).

---

Backend contracts are taken from inline `// frontendAgent` notes and route definitions:

- `backend/api/presentations/router.ts`
- `backend/api/contexts/router.ts`
- `backend/api/slides/router.ts`
- `backend/api/presentations_access/router.ts`

## Success Criteria

- [ ] All tasks complete
- [ ] Frontend build succeeds: `cd frontend && npm run build`
- [ ] Backend build succeeds: `cd backend && npm run build`
- [ ] App theme is fixed to ElevenLabs and cannot be changed globally
- [ ] Theme switching applies **only to the slide canvas element** (the rendered slide content area) — the editor chrome, sidebar, toolbar, navigation, and dashboard are always ElevenLabs light
- [ ] Edit mode uses slide endpoints for CRUD + reorder (not `PUT /api/presentation/:id`)
- [ ] Slide ordering is draggable and persists on drop
- [ ] Markdown editing works for the selected slide, with Ctrl+S saving
- [ ] No blockers

## Endpoint Contract (Source of Truth)

### Presentations

- `GET /api/presentations` (home/dashboard lists)
- `GET /api/presentation/:id` (title + linked context details; do not rely on this for slide editing)
- `POST /api/presentation` `{ title }`
- `PUT /api/presentation/:id` `{ title }` (backend updates title only)
- `DELETE /api/presentation/:id`

### Contexts

- `GET /api/contexts/:id`
- `POST /api/contexts` multipart: `prompt`, `files[]`
- `PUT /api/contexts/:id` multipart: `prompt`, `files[]`, plus deleted file identifiers

### Slides

- `GET /api/presentations/:presentationId/slides`
- `POST /api/presentations/:presentationId/slides` `{ content, slideOrder? }`
- `PUT /api/presentations/:presentationId/slides/:slideId` `{ content }`
- `DELETE /api/presentations/:presentationId/slides/:slideId`
- `PUT /api/presentations/:presentationId/slides/order` `{ first, second }`
  - Each is an array shaped like: `[{ id, order }]`.
- `POST /api/presentations/:presentationId/slides/generate` `{ contextId, numSlides? }`

### Presentation Access (Share)

Backend currently exposes only:

- `POST /api/presentations/:id/access` `{ email, expiresAt? }`

Frontend must not call share endpoints that are not implemented (e.g. access list / remove access / share link generation).

## Tasks

### Task-001: React Query Hook Alignment (Presentations + Slides + Share)

**Priority**: High
**Estimated Iterations**: 2-3

**Acceptance Criteria**:

- [ ] `usePresentations` is corrected so `PUT /api/presentation/:id` only sends `{ title }`.
- [ ] New slide hooks are added under `frontend/src/hooks/queries/`:
  - [ ] List slides query (`GET /presentations/:id/slides`)
  - [ ] Create slide mutation
  - [ ] Update slide content mutation
  - [ ] Delete slide mutation
  - [ ] Reorder mutation
  - [ ] Generate-from-context mutation
- [ ] `queryKeys` includes stable keys for slides.
- [ ] Share hooks match backend reality:
  - [ ] Keep only grant-access mutation (`POST /presentations/:id/access`).
  - [ ] Remove/disable hooks that call unimplemented share endpoints.

**Verification**:

```bash
cd frontend && npm run lint
cd frontend && npm run build
```

### Task-002: Fix Global Theme (ElevenLabs) + Add Slide-Canvas–Scoped Theme Boundary

**Priority**: High
**Estimated Iterations**: 2-4

**Acceptance Criteria**:

- [ ] App shell uses the fixed ElevenLabs light token set defined above:
  - [ ] Page background Eggshell (`#fdfcfc`)
  - [ ] Primary text Obsidian (`#000000`)
  - [ ] Borders Chalk (`#e5e5e5`)
  - [ ] Secondary text Gravel (`#777169`)
  - [ ] Typography: Waldenburg 300 for headlines, Inter 400/500 for body/UI, Geist Mono for code
- [ ] Global theme switching is removed/disabled:
  - [ ] The existing `ThemeProvider` must not write `data-theme` / tone classes to `document.documentElement`.
- [ ] **Slide canvas** has its own scoped theme container:
  - [ ] Changing the theme in the viewer/editor affects **only the rendered slide content element** — the `<SlideCanvas>` or equivalent wrapper component that displays the slide's visual output.
  - [ ] The editor chrome (sidebar, toolbar, slide list panel, Markdown editor pane, top navigation) remains ElevenLabs light at all times.
  - [ ] The dashboard is completely unaffected by any slide-level theme selection.
  - [ ] Implementation applies `data-theme="..."` directly to the slide canvas wrapper element, using the existing theme CSS strategy (`[data-theme="..."]` selectors scoped to that element).
- [ ] Reuse existing shadcn components already present.

**Verification**:

- Manual: change slide theme in editor/viewer → the slide canvas renders in that theme → editor sidebar, toolbar, and top nav remain ElevenLabs light → navigate back to dashboard → dashboard styling is unchanged.

### Task-003: Edit Mode (Selected-Slide Markdown Editor + Save)

**Priority**: High
**Estimated Iterations**: 3-5

**UI/Behavior Requirements**:

- Editor layout follows ElevenLabs design language throughout: eggshell background, chalk borders, obsidian text, Inter 400/500 body, Waldenburg 300 for any headings.
- Slide list panel: left sidebar, hairline `1px solid #e5e5e5` separator, each slide row ~40px height with 12px horizontal padding. Selected row uses Powder (`#f5f3f1`) highlight with 4px radius, matching the ElevenLabs Voice List Item pattern.
- Markdown editor pane: white card surface (`#ffffff`) with `box-shadow: var(--shadow-subtle-7)`, `border-radius: 16px`, Inter 400 14px editor text. Toolbar actions (add slide, delete slide, save) are ghost pill buttons or compact action buttons per the ElevenLabs component spec.
- Slide canvas preview (the rendered output of the selected slide's Markdown): this is the **only** element that receives a `data-theme` attribute for per-slide theme switching. Everything surrounding it stays ElevenLabs light.
- Ctrl+S save indicator: a transient Inter 400 13px Gravel (`#777169`) label ("Saved") appearing near the toolbar, no toast library required.

**Acceptance Criteria**:

- [ ] Slide list loads from `GET /presentations/:id/slides`.
- [ ] Selecting a slide shows its Markdown in the editor and renders the canvas preview.
- [ ] Ctrl+S triggers save for the selected slide via `PUT /presentations/:pid/slides/:sid`.
- [ ] Debounced auto-save per slide is implemented (to reduce accidental data loss), but must not spam requests.
- [ ] Add slide calls `POST /presentations/:id/slides` and selects the created slide.
- [ ] Delete slide calls `DELETE /presentations/:pid/slides/:sid` and selection updates to a valid slide.
- [ ] Editor chrome (sidebar, toolbar, pane borders, top nav) always uses ElevenLabs tokens regardless of slide canvas theme.

**Verification**:

- Manual: edit slide markdown → Ctrl+S → refresh → content persists.

### Task-004: Drag-and-Drop Slide Order (Persist On Drop)

**Priority**: High
**Estimated Iterations**: 2-3

**UI/Behavior Requirements**:

- Drag handles in the slide list sidebar use the Compact Action Button style: `background: transparent`, `border: 1px solid #e5e5e5`, `border-radius: 12px`, `padding: 0 8px`. Drag handle icon stroke color: Gravel (`#777169`).
- Dragging state: the dragged row gets `background: #f5f3f1` (Powder) and `box-shadow: var(--shadow-subtle-7)` to indicate lift without deep elevation.

**Acceptance Criteria**:

- [ ] Slide order is draggable in edit mode.
- [ ] On drop, call `PUT /presentations/:pid/slides/order` with `{ first, second }` shaped exactly as backend expects.
- [ ] UI updates to the new order without requiring page refresh.
- [ ] Avoid adding new dependencies unless native HTML5 DnD is insufficient.

**Verification**:

- Manual: drag slide 1 to position 3 → refresh → order persists.

### Task-005: Context → Generate Slides Flow

**Priority**: Medium
**Estimated Iterations**: 2-3

**UI/Behavior Requirements**:

- "Generate slides" button follows the Primary Pill Button spec: `background: #000000`, `color: #fdfcfc`, `border-radius: 9999px`, `padding: 0 16px`, Inter 500 14px. Disabled state uses Fog (`#b1b0b0`) background.
- Loading state after click: a centered Inter 400 14px Gravel (`#777169`) label ("Generating slides…") inside the editor's slide list panel. No spinner library required — a simple CSS opacity pulse on the label is sufficient.

**Acceptance Criteria**:

- [ ] Context page includes a "Generate slides" button.
- [ ] Button is disabled until context is saved (context id exists).
- [ ] Clicking calls `POST /presentations/:pid/slides/generate` with `{ contextId, numSlides? }`.
- [ ] After click: route to presentation edit page and show loading until slides are ready.

**Verification**:

- Manual: create context → click Generate → land in editor with generated slides.

### Task-006: Dashboard Grouping (Owned vs Editable)

**Priority**: Medium
**Estimated Iterations**: 1-2

**UI/Behavior Requirements**:

- Section headings ("Your Presentations", "Shared With You") use Waldenburg 300 at 32px, `letter-spacing: -0.64px`, `color: #000000`.
- Section eyebrow labels above headings use Inter 400 14px Gravel (`#777169`), matching the ElevenLabs Section Divider Label pattern.
- Presentation cards use the Product Demo Card spec: `background: #ffffff`, `border-radius: 16px`, `box-shadow: var(--shadow-subtle-7)`.

**Acceptance Criteria**:

- [ ] Dashboard separates presentations by access type (owned vs edit-access) as returned by `GET /presentations`.

**Verification**:

- Manual: user with both types sees two sections.

## Technical Constraints

- Frontend: React 19 + Vite + Tailwind v4
- UI: shadcn/ui components already present in `frontend/src/components/ui/`
- Server state: TanStack React Query hooks are the single source of truth
- Theme scoping must not rely on mutating `document.documentElement` — apply `data-theme` only to the slide canvas element itself

## Architecture Notes

- Keep a clear boundary:
  - Presentation metadata comes from `GET /api/presentation/:id`.
  - Slide CRUD and ordering comes from `/api/presentations/:id/slides*` endpoints.
- The theme system has two layers:
  - **App-level**: fixed ElevenLabs light tokens on `<html>` or the root layout — immutable.
  - **Slide-canvas–level**: `data-theme` attribute applied to the individual `<SlideCanvas>` wrapper component only. This element renders the Markdown-to-HTML output of a single slide. Changing the theme writes `data-theme` to this element and nowhere else. The editor sidebar, toolbar, slide list, top navigation, and all other UI surfaces are never touched by slide theme changes.

## Out of Scope

- Implementing share link generation or access list management (backend endpoints are not implemented)
- Adding new pages beyond the existing edit/view routes
- Adding a new drag-and-drop library unless native DnD cannot satisfy requirements
````
