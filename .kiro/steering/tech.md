# Tech Steering for Math Farm

## Overview

Math Farm is a self-hosted web application for mathematics education, built with a modern JavaScript/TypeScript stack. All technologies must be open-source, free, and runnable on a single server without external cloud dependencies. Prioritize performance, accessibility (WCAG 2.2 compliance), and client-side computations for math tools to minimize server load.

## Languages and Core Stack

- **Primary Languages**: TypeScript (strict mode, ^5.5.0) for all code; JavaScript only for third-party libs if unavoidable.
- **Frontend Framework**: React (^19.0.0) with React DOM (^19.0.0).
- **Backend Server**: Express.js (^5.0.0).
- **Build Tool**: Vite (^5.0.0) with Hot Module Replacement (HMR).
- **Routing**: Wouter (^3.0.0) for lightweight client-side routing.
- **State Management**: TanStack Query (^5.0.0) for server state; React hooks for local state.
- **Database**: SQLite (file-based) with Drizzle ORM (^0.3.0) and better-sqlite3 (^11.0.0) driver.
- **Authentication**: jsonwebtoken (^9.0.0) for JWT sessions; bcrypt (^5.1.0) for password hashing.

## UI and Styling

- **Styling**: Tailwind CSS (^4.0.0) with PostCSS (^8.4.0) and Autoprefixer (^10.4.0).
- **Components**: shadcn/ui (latest via CLI init).
- **Icons**: Lucide React (^0.4.0) for UI; React Icons (^5.0.0) for logos.
- **Themes**: Support light/dark modes with HSL-based purple color scheme (e.g., primary: hsl(262, 65%, 45%)).

## Math and Interactive Features

- **Math Rendering**: MathJax (^4.0.0-beta) for LaTeX/TeX expressions; use better-react-mathjax (^2.0.0) wrapper.
- **Math Libraries**:
  - math.js (^12.0.0) for calculations, matrices, and units.
  - Nerdamer (^1.1.0) for symbolic solving (equations, derivatives).
  - JSXGraph (^1.10.0) for interactive graphing and geometry.
- **Exports**: jsPDF (^2.5.0) for client-side PDF generation (optional).
- **Guidelines**: All math tools must run client-side; provide step-by-step solutions with instant feedback using local storage for progress.

## Development and Testing Tools

- **TypeScript Types**: Include @types/\* for React, Node, Express, etc. (e.g., @types/react ^18.3.0, updated for React 19).
- **Vite Plugins**: @vitejs/plugin-react (^4.3.0).
- **Testing**: Vitest (^2.0.0) for unit tests; Cypress (^13.13.0) for end-to-end (optional).
- **Linting/Formatting**: ESLint (^9.9.0) and Prettier (^3.3.0) (optional).
- **Process Management**: PM2 (^5.3.0) for server daemon (optional).

## Coding Standards and Best Practices

- **Accessibility**: Full WCAG 2.2 compliance: Semantic HTML, ARIA labels, 4.5:1 color contrast, keyboard navigation.
- **Performance**: Code splitting, tree shaking, lazy loading (e.g., for routes and MathJax). Use AVIF/WebP for images. Aim for Core Web Vitals (LCP < 2.5s).
- **Security**: HTTPS enforcement (self-signed or Let's Encrypt); sanitize inputs to prevent XSS/SQL injection. No external APIs or paid services.
- **Browser Compatibility**: Target Chrome 120+, Firefox 115+, Safari 17+, Edge 120+. Graceful degradation for older browsers.
- **Preferences**:
  - Favor functional components in React.
  - Use RESTful APIs; keep endpoints minimal.
  - Offline support via Service Workers and PWA.
  - Self-hosted only: No cloud providers; backup SQLite files manually.

## Constraints

- No additional npm installs beyond the specified dependencies.
- Stick to the purple theme and responsive breakpoints (mobile <640px, tablet 640-1024px, desktop >1024px).
- For math curriculum content, ensure step-by-step explanations align with levels (elementary to advanced, including specialized topics like game design math).
