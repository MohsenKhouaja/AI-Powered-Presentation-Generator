# Agent Guidelines for P2M

## Project Overview

P2M is a Presentation-to-Markdown system with:
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, Radix UI
- **Backend**: Express.js (ESM), MySQL, JWT authentication
- **AI**: Google Gemini integration for slide generation

## Directory Structure

```
p2m/
├── backend/               # Express API server (port 3001)
│   ├── api/              # API route handlers (TypeScript)
│   │   ├── users/
│   │   ├── presentations/
│   │   ├── slides/
│   │   ├── contexts/
│   │   ├── files/
│   │   └── presentations_access/
│   ├── database/         # SQL schemas
│   ├── middleware/       # Auth middleware
│   ├── routes/           # Auth routes
│   └── app.js            # Entry point
├── frontend/             # React SPA (port 3000)
│   └── src/
│       ├── components/   # UI components
│       │   └── ui/       # Shadcn/UI components
│       ├── context/      # React contexts (Auth, Theme)
│       ├── hooks/        # Custom hooks
│       └── lib/          # Utilities
├── prompt/               # AI prompt templates
└── docs/                 # Documentation
```

---

## Build & Test Commands

### Frontend (in `/frontend`)
```bash
npm run dev          # Start dev server (port 3000)
npm run build        # TypeScript check + Vite build
npm run lint         # ESLint (flat config, extends typescript-eslint/recommended)
npm run preview      # Preview production build
```

### Backend (in `/backend`)
```bash
npm run dev          # Start server (node server.js, port 3001)
npm run test:db      # Test database connection
```

### Running Single Tests
```bash
# Frontend lint on specific file
npx eslint frontend/src/components/button.tsx

# Frontend TypeScript check on specific file
npx tsc --noEmit frontend/src/components/button.tsx
```

---

## Code Style Guidelines

### General Principles

- **Be explicit over implicit** - Make behavior clear through code structure
- **Separation of concerns** - Keep components, hooks, and utilities focused
- **Failure modes matter** - Handle errors explicitly, don't silently swallow exceptions
- **Learning-oriented** - Clarity and maintainability > cleverness

### TypeScript Conventions

1. **Type Annotations**
   - Use explicit types for function parameters and return values
   - Define interfaces for complex objects (prefer `interface` over `type` for object shapes)
   - Use `type` for unions, intersections, and utility types

   ```typescript
   // Good
   interface User {
     id: string;
     email: string;
     isLoggedIn: boolean;
   }
   
   type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
   
   // Good - explicit return type
   function fetchUser(id: string): Promise<User> {
     // ...
   }
   ```

2. **Null/Undefined**
   - Prefer `null` for intentionally absent values
   - Use optional chaining (`?.`) and nullish coalescing (`??`) when appropriate
   - Avoid `any` type - use `unknown` when type is truly unknown

3. **Imports**
   - Use path aliases: `@/` maps to `./src/`
   - Import types separately when only using types: `import type { User } from "..."`
   - Group imports: external packages → internal modules → relative imports

### React Conventions

1. **Component Structure**
   ```typescript
   // Props type as interface
   interface ComponentProps {
     title: string;
     onAction?: () => void;
   }
   
   // Named export for hooks, default for pages
   export function MyComponent({ title, onAction }: ComponentProps) {
     return (/* ... */);
   }
   
   // Or default for page components
   export default function Dashboard() {
     return (/* ... */);
   }
   ```

2. **Hooks**
   - Custom hooks start with `use`: `useAuth`, `useIsMobile`
   - Always include dependency arrays in `useEffect`
   - Extract complex logic into custom hooks

3. **State Management**
   - Use React Context for global state (auth, theme)
   - Keep context providers minimal and focused
   - Prefer local state for component-specific data

### Backend Conventions

1. **Express.js**
   - Use ES modules (`import/export`)
   - Centralized error handling with `app.use((err, req, res, next) => {...})`
   - 404 handler for unmatched routes
   - CORS configured with allowed origins from environment

   ```javascript
   // Error handler pattern
   app.use((err, req, res, next) => {
     console.error(err.stack);
     res.status(err.status || 500).json({
       error: err.message || "Internal server error",
     });
   });
   ```

2. **Database**
   - Use MySQL with prepared statements (sql-template-strings)
   - Foreign key constraints with cascade delete
   - UUID primary keys (VARCHAR 255)

3. **API Routes Structure**
   - Router files in `api/{resource}/router.ts`
   - Service files in `api/{resource}/{resource}-service.ts`
   - Index files export and combine modules

### Naming Conventions

| Entity | Convention | Example |
|--------|------------|---------|
| Components | PascalCase | `AuthForm.tsx`, `MarkdownRenderer.tsx` |
| Hooks | camelCase, prefixed `use` | `useAuth.ts`, `useIsMobile.ts` |
| Utilities | camelCase | `utils.ts`, `cn()` |
| Contexts | PascalCase | `AuthContext.tsx`, `ThemeContext.tsx` |
| API Routes | kebab-case | `presentations_access/` |
| Database tables | snake_case | `presentations_access` |
| Environment vars | UPPER_SNAKE_CASE | `JWT_ACCESS_TOKEN_SECRET_KEY` |

### File Organization

1. **Component Files**
   - One component per file
   - File name matches component name
   - Co-locate tests when available

2. **Imports Order**
   ```typescript
   import React from "react";                    // React/core
   import { useState, useEffect } from "react";    // React hooks
   
   import { Button } from "@/components/ui/button";     // UI components
   import { cn } from "@/lib/utils";                     // lib utilities
   
   import { useAuth } from "@/context/AuthContext";      // contexts
   import type { User } from "@/types";                  // types
   
   import "./component.css";                      // styles
   ```

### Styling (Tailwind CSS 4)

1. **Class Organization**
   - Use Tailwind's logical ordering (layout → spacing → typography → colors)
   - Use CSS variables for theme colors: `bg-primary`, `text-muted-foreground`
   - Use `cn()` utility for conditional classes

   ```typescript
   import { cn } from "@/lib/utils"
   
   function Card({ className }: { className?: string }) {
     return (
       <div className={cn(
         "rounded-lg border bg-card text-card-foreground shadow-sm",
         className
       )}>
         {children}
       </div>
     );
   }
   ```

2. **Theme Support**
   - Use semantic color tokens: `bg-background`, `text-foreground`
   - Support dark mode with `dark:` prefix
   - Use CSS variables via Tailwind config

### Error Handling

1. **Frontend**
   - Handle API errors with try/catch
   - Show user-friendly error messages
   - Use console.error for debugging (not console.log in production)

   ```typescript
   try {
     const response = await fetchwithauth("/api/resource", "GET");
     const data = await response.json();
     return data;
   } catch (error) {
     console.error("Failed to fetch resource:", error);
     throw error; // or return fallback
   }
   ```

2. **Backend**
   - Return appropriate HTTP status codes (400, 401, 403, 404, 500)
   - Never expose stack traces in production
   - Log errors server-side for debugging

### Security Considerations

- Never commit secrets (use `.env` files)
- Validate all user input (use Zod on frontend)
- Use parameterized queries for database
- Implement proper CORS policies
- Sanitize markdown content before rendering

---

## Linting & Type Checking

### ESLint Configuration
- Flat config in `frontend/eslint.config.js`
- Extends: `typescript-eslint/recommended`, `react-hooks/recommended`, `react-refresh/vite`
- Ignores: `dist/` folder

### TypeScript Configuration
- Path alias: `@/*` → `./src/*`
- Use `tsc -b` for project references build

---

## Database Schema

Tables (MySQL):
- `users` - id, username, email, password
- `presentations` - id, title, user_id, created_at
- `slides` - id, content, presentation_id, slide_order
- `contexts` - id, prompt, presentation_id
- `files` - id, storage_key, context_id, mime_type, size_bytes
- `presentations_access` - id, user_id, presentation_id, access_type, expires_at

---

## Key Dependencies

### Frontend
- React 19, React DOM 19
- Tailwind CSS 4 + @tailwindcss/vite
- Radix UI primitives
- React Hook Form + Zod
- react-markdown + remark-gfm
- recharts, react-syntax-highlighter

### Backend
- Express 5
- mysql2
- jsonwebtoken
- @google/genai
- cookie-parser
