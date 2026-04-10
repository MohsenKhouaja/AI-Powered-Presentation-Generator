# P2M - Project Context

## Overview

SaaS web application that transforms Markdown files into beautifully rendered presentation slides, similar to Canva but using plain text. Users write markdown content and the platform renders it as polished slides with customizable themes.

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, Radix UI
**Backend:** Express.js (ESM), MySQL, JWT authentication
**AI:** Google Gemini integration for slide generation

## Design Aesthetic

Modern minimalist black & white. 90% of UI uses black (#000), white (#FFF), and grays with Accent color reserved only for interactive elements (buttons, links, focus rings). High contrast, generous whitespace, subtle borders instead of shadows. Dark mode supported.

## Pages & Routes

| Route | Page | Auth |
|-------|------|------|
| `/` | Landing page with hero + auth form (login/register) | No |
| `/dashboard` | User's presentations in card grid with sidebar | Yes |
| `/presentations/:id` | Fullscreen slide viewer with keyboard navigation | Yes |
| `/presentations/:id/edit` | Split-pane editor (markdown left, preview right) + slide navigator | Yes |
| `/settings/themes` | Theme customizer with preview | Yes |
| `/shared` | Presentations shared with the user | Yes |

## Key Features

**Authentication:** JWT-based login/register with tabs. **Presentations:** CRUD with card grid, thumbnails, share dialog. **Editor:** Split-pane markdown editor with live preview, slide navigator (add/delete/reorder), auto-save. **AI Generation:** Upload files/context, trigger Gemini to generate slides with progress modal. **Theming:** 25 themes affecting only accent colors. **Sharing:** Public links, collaborator access (view/edit), expiry dates. **Responsive:** Mobile bottom nav, tablet collapsible sidebar, desktop full sidebar.

## Data Model

- **users:** id, username, email, password
- **presentations:** id, title, user_id, created_at
- **slides:** id, presentation_id, content (markdown), slide_order
- **contexts:** id, presentation_id, prompt
- **files:** id, context_id, storage_key, mime_type, size_bytes
- **presentations_access:** id, user_id, presentation_id, access_type, expires_at

## Component Inventory

Core components: `AuthForm` (login/register tabs), `MarkdownRenderer` (MD→React with custom element mappings), `PresentationCard` (grid items), `SlideNavigator` (thumbnail strip), `ThemeSelector` (searchable dropdown), `FileUploadZone` (drag-drop), `ShareDialog`, `AIGenerationModal`, `EmptyState` and more. Full Shadcn/UI library available. 

