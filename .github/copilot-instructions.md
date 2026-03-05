# Copilot Instructions for qx-typed

## Build, test, and lint commands

```bash
npm install
npm run build-css     # Compile Tailwind/Basecoat into resource/app/styles.css
npm run build         # build-css + TypeScript compile to lib/application.js
npm run watch         # TypeScript watch mode
npm run dev           # watch + PHP server + browser-sync reload
npm run build-dist    # Build and package deployable dist/ output
```

- Tests: no automated test runner is configured in `package.json` right now.
- Lint: no lint script is configured in `package.json` right now.
- Single-test command: not available until a test framework is added.

## High-level architecture

- Frontend is a qooxdoo + TypeScript SPA compiled as one AMD bundle to `lib/application.js` (`tsconfig.json` uses `outFile`).
- `src\application.ts` is the entry point (`qx.registry.registerMainMethod`) and switches between `LoginLayout` and `MainLayout`.
- Navigation is definition-driven in `src\pages\app-pages.ts`:
  - `PAGE_DEFINITIONS` maps labels to page factories.
  - `SIDEBAR_DEFINITIONS` describes sidebar hierarchy.
  - `manipulateSidebarItems()` removes sidebar leaves without matching page factories.
- `src\layouts\main.ts` controls responsive shell behavior:
  - Desktop: `Sidebar` + content area.
  - Mobile: `BsDrawer` + mobile top bar.
  - Uses global `setContent(...)` (declared in `src\data\globals.ts`) for page swaps and navbar title updates.
- CRUD pages under `src\pages\*.ts` use `Api` (`src\services\api.ts`) to call PHP endpoints in `api\*.php`.
- Backend is simple PHP + SQLite:
  - `api\database.php` sets JSON/CORS headers, session auth helpers, and shared PDO connection.
  - `api\schema.sql` defines schema; DB file is `api\sias.db`.
  - Auth/session endpoint is `api\auth.php`.
- Packaging: `scripts\build-dist.mjs` copies runtime files and only the inline SVG icons actually referenced in `src\`.

## Key conventions

- Source of truth is `src\**` and `styles.css`; `lib\application.js` is generated output from TypeScript.
- For a new page/route, update both `PAGE_DEFINITIONS` and `SIDEBAR_DEFINITIONS` (same label text is used to connect them).
- UI primitives (`BsButton`, `BsInput`, `BsSidebarButton`, etc.) wrap native HTML inside `qx.ui.embed.Html`; keep qooxdoo event wiring patterns (`addListener`, custom `events`) consistent.
- Styling is utility-class based (Tailwind + Basecoat class strings like `btn-sm`, `btn-primary`, `w-full`) passed through component `className` args.
- Page CRUD pattern is consistent:
  - Keep a local typed `__rows` array mirroring the table model.
  - Column 0 is usually hidden ID for selection/lookup.
  - Mutations call API then refresh data with `__loadData()`.
- Mutating backend operations generally require role checks (`requireRole('admin')`) in PHP endpoints.
