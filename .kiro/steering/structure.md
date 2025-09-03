```markdown
# Structure Steering for Math Farm

## Overview

Math Farm follows a monorepo structure with separate folders for frontend (React app), backend (Express server), and shared resources. This ensures clear separation of concerns while allowing easy integration. New files must adhere to these patterns: Use kebab-case for folders, PascalCase for React components (e.g., Header.tsx), camelCase for variables/functions, and descriptive names. Place new components in appropriate subfolders; avoid root-level clutter. For scalability, keep files modular (<300 lines where possible).

## Root Level Structure

- client/ # Frontend React application source
- server/ # Backend Express.js application
- shared/ # Shared types, schemas, and utilities (e.g., Drizzle schemas)
- deployment-ready/ # Production build artifacts (generated; do not edit manually)
- attached_assets/ # Static assets like images, fonts, or data files
- dist/ # Build output directory (Vite-generated static files for serving)

## Frontend Structure (client/)

- index.html # Main HTML template (entry point for Vite)
- src/ # All frontend source code
  - components/ # Reusable React components
    - ui/ # shadcn/ui components (e.g., Button.tsx, Card.tsx)
    - layout/ # Layout components (e.g., Header.tsx, Sidebar.tsx, Footer.tsx)
  - pages/ # Route-specific components (e.g., Home.tsx, TopicPage.tsx, ToolsPage.tsx)
  - hooks/ # Custom React hooks (e.g., useThemeToggle.ts, useMathSolver.ts)
  - lib/ # Utility libraries and configurations (e.g., mathUtils.ts, config.ts)
  - data/ # Static data and constants (e.g., topicsData.json, curriculumConstants.ts)
  - App.tsx # Main app component with routing (Wouter setup)
  - main.tsx # React app entry point (renders App)
  - index.css # Global styles and CSS variables (Tailwind imports, custom HSL themes)

## Guidelines for Frontend

- Components: Place domain-specific components in subfolders under components/ (e.g., components/math/ for EquationSolver.tsx).
- Pages: One file per major route; use dynamic params for /topic/:id.
- Hooks: Prefix with 'use' (e.g., useProgressTracker.ts); keep hooks pure and reusable.
- Lib: Non-React utilities like API fetchers or math wrappers (e.g., integrate MathJax here).
- Data: JSON/TS files for mock data or constants; load dynamically if large.

## Backend Structure (server/)

- index.ts # Express server entry point (app setup, middleware, route mounting)
- routes.ts # API route registration (e.g., /api/topics, /api/users; use Express Router)
- storage.ts # Database interface and operations (Drizzle queries, SQLite interactions)
- vite.ts # Vite development integration (for HMR in dev mode)
- public/ # Static file serving (production; symlinks to ../dist/)

## Guidelines for Backend

- Routes: Group by domain (e.g., userRoutes.ts, topicRoutes.ts) if grows; keep RESTful (GET/POST/PUT/DELETE).
- Storage: Database helpers; add subfolders like models/ for schemas if complex.
- Utilities: Add utils/ folder for helpers (e.g., authUtils.ts for JWT/bcrypt).
- Public: Auto-generated or linked; serve frontend builds from here in production.

## Shared Resources (shared/)

- schema.ts # Drizzle database schemas and types (e.g., usersTable, topicsTable)
- types.ts # Shared TypeScript types/interfaces (e.g., User, Topic; import in both client/server)

## Guidelines for Shared

- Keep minimal: Only cross-concern items like DB schemas or API types.
- Add subfolders if needed (e.g., types/api.ts for response shapes).

## General Project Guidelines

- Naming Conventions: Files: lowercase-with-dashes.ts (utils), PascalCase.tsx (components). Folders: lowercase.
- File Placement: New features start with a component/page, then hook if needed, then API route/storage.
- Build/Deployment: Vite builds to dist/; Express serves from public/ in prod. Use PM2 for running.
- Version Control: Ignore node_modules/, dist/, .env; commit .kiro/ for steering.
- Expansion: For new sections (e.g., community), add pages/Community.tsx and routes/community.ts.
```
