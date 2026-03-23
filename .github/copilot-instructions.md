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

## High-level architecture

- Frontend is a qooxdoo + TypeScript SPA compiled as **one AMD bundle** to `lib/application.js` (`tsconfig.json` uses `outFile`). There are no runtime module imports/exports — all `src\**\*.ts` files share a single global scope after compilation.
- `src\application.ts` is the entry point (`qx.registry.registerMainMethod`) and switches between `LoginLayout` and `MainLayout`.
- Navigation is definition-driven in `src\pages\app-pages.ts`:
  - `PAGE_DEFINITIONS` maps labels to page factories.
  - `SIDEBAR_DEFINITIONS` describes sidebar hierarchy.
  - `manipulateSidebarItems()` removes sidebar leaves without matching page factories.
- `src\layouts\main.ts` controls responsive shell behavior (breakpoint at 768px):
  - Desktop: `Sidebar` + content area.
  - Mobile: `BsDrawer` + mobile top bar.
  - Uses global `setContent(...)` (declared in `src\data\globals.ts`) for page swaps and navbar title updates.
- CRUD pages under `src\pages\*.ts` use `Api` (`src\services\api.ts`) to call PHP endpoints in `api\*.php`.
- Backend is PHP + SQLite:
  - `api\database.php` provides JSON/CORS headers, session auth helpers (`requireAuth`, `requireRole`), JSON body/response utilities, and the shared PDO singleton.
  - `api\schema.sql` defines the full schema; DB file is `api\sias.db`.
  - Each PHP endpoint switches on `$_SERVER['REQUEST_METHOD']` for CRUD routing (GET/POST/PUT/DELETE).
- Packaging: `scripts\build-dist.mjs` copies runtime files and only the inline SVG icons actually referenced in `src\`.

## Key conventions

### TypeScript & module system
- All source files share a single global scope (AMD `outFile` bundle). Classes, types, and constants defined in any `src\` file are available everywhere — no `import`/`export` statements.
- Cross-module globals (`username`, `userRole`, `userFullName`, `setContent`) are declared in `src\data\globals.ts` and assigned at runtime via `globalThis`.
- Domain model interfaces live in `src\types\models.d.ts` as ambient declarations.
- Custom component public APIs are declared in `src\types\custom-components.d.ts` as ambient interfaces (separate from the class implementations).

### UI component pattern
- `Bs*` components (`BsButton`, `BsInput`, `BsSelect`, etc.) wrap native HTML elements inside `qx.ui.embed.Html` widgets. They render HTML strings internally and bind native DOM events after `appear`.
- Custom qooxdoo events are declared via a `static events` property on the class (e.g., `static events = { execute: "qx.event.type.Event" }`).
- `BsAlertDialog` is **not** a qooxdoo widget — it creates native `<dialog>` elements appended to `document.body`.
- Styling uses Tailwind + Basecoat utility classes (`btn-sm`, `btn-primary`, `w-full`) passed via `className` constructor args. Theme colors are resolved through `AppColors` which reads CSS custom properties at runtime.

### Icons
- Icons come from `lucide-static` (SVG files in `resource\app\icons\`). `InlineSvgIcon` fetches SVGs at runtime via `fetch()` and injects them inline.
- The build-dist script only copies icons actually referenced in source code (detected via regex patterns like `new InlineSvgIcon("name"`, `.setIcon("name"`, `iconName: "name"`).

### Adding a new page
1. Create `src\pages\<name>.ts` extending `qx.ui.container.Composite`.
2. Add an entry to `PAGE_DEFINITIONS` in `src\pages\app-pages.ts` with a matching `label` and `factory`.
3. Add the same `label` to the appropriate group in `SIDEBAR_DEFINITIONS`.
4. Create `api\<name>.php` for the backend, requiring `database.php` and switching on `$_SERVER['REQUEST_METHOD']`.
5. Add the corresponding model interface to `src\types\models.d.ts`.

### Page CRUD pattern
- Keep a local typed `__rows` array mirroring the table model.
- Column 0 is a hidden ID column used for selection/lookup.
- Mutations call `Api.post`/`Api.put`/`Api.del` then refresh via `__loadData()`.
- Form dialogs use `BsAlertDialog` with `footerButtons: "ok-cancel"` and an `onContinue` callback.

### PHP endpoints
- Every endpoint starts with `require_once __DIR__ . '/database.php';`.
- Use `jsonBody()` to read request data, `jsonResponse()` / `jsonError()` to respond.
- Mutating operations require `requireRole('admin')` (or other roles as appropriate).
- Use PDO prepared statements with named placeholders (`:param`).
