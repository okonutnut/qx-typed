# AGENTS.md - Developer Guidelines for qx-typed

qx-typed is a TypeScript-based web application using the qooxdoo UI framework with Tailwind CSS, compiled to AMD modules with an ASP.NET (HotChocolate GraphQL) backend.

## Build Commands

```bash
npm install              # Install dependencies
npm run build-css        # Compile Tailwind/Basecoat into resource/app/styles.css
npm run build            # build-css + TypeScript compile to lib/application.js
npm run watch            # TypeScript watch mode (auto-compile on changes)
npm run build-dist       # Build and package deployable dist/ output
npm run serve:frontend   # Serve static files on port 8080
npm run serve:reload     # Live reload dev server (proxy to frontend)
npm run serve:backend    # Run ASP.NET backend server
```

**There are no test commands configured.** This project does not use a test framework.

## Project Architecture

### Frontend (TypeScript + qooxdoo)
- Compiled as **one AMD bundle** to `lib/application.js` (no runtime imports/exports)
- `src/application.ts` entry point switches between `LoginLayout` and `MainLayout`
- Cross-module globals (`username`, `userRole`, `setContent`) declared in `src/data/globals.ts`
- Domain model interfaces in `src/types/models.d.ts`
- Custom component public APIs in `src/types/custom-components.d.ts`

### Backend (ASP.NET + HotChocolate GraphQL)
- GraphQL server in `backend/` using HotChocolate
- Types in `backend/Types/*.cs`, Queries in `backend/Queries/Query.cs`, Mutations in `backend/Mutations/Mutation.cs`
- Run with `npm run serve:backend`

## Code Style Guidelines

### TypeScript Configuration
- Target: ES6, Module system: AMD (outFile: `lib/application.js`)
- No strict type checking (`types: []`)
- Use `// @ts-ignore` sparingly for qooxdoo type declarations

### Naming Conventions
- **Classes**: PascalCase (e.g., `MainPage`, `BsButton`)
- **Interfaces**: PascalCase (e.g., `SidebarItem`)
- **Private properties**: Double underscore prefix (e.g., `__collapsed`)
- **Public methods**: camelCase (e.g., `setIcon`, `onClick`)
- **Files**: kebab-case (e.g., `app-pages.ts`, `sidebar-item.ts`)

### Imports
- No explicit import statements (AMD global scope)
- Use qooxdoo via global `qx` namespace (e.g., `qx.ui.container.Composite`)
- Custom UI components prefixed with `Bs` (e.g., `BsButton`, `BsInput`)

### File Organization
```
src/
├── application.ts       # Entry point, switches layouts
├── app-colors.ts        # Theme color constants
├── sidebar.ts           # Main sidebar component
├── navbar.ts            # Navigation bar
├── data/
│   ├── globals.ts       # Global type declarations and runtime globals
│   └── sidebar-item.ts  # Sidebar data types
├── pages/               # Page components (FormPage, ButtonsPage, etc.)
├── layouts/             # Layout components (MainLayout, LoginLayout)
├── components/ui/        # Reusable UI components (BsButton, BsInput, etc.)
├── types/               # Ambient type declarations
├── services/            # API service (api.ts)
└── components/
    ├── SVGIcons.ts      # SVG icon wrapper
    └── InlineSvgIcon.ts # Inline SVG implementation
```

## Component Patterns

**Class Structure:**
```typescript
class MyComponent extends qx.ui.container.Composite {
  static events = { select: "qx.event.type.Data" };

  private __privateProp: string;

  constructor(param: string) {
    super();
    this.setLayout(new qx.ui.layout.VBox());
    this.__privateProp = param;
  }

  public publicMethod(): void { /* ... */ }
  private __privateMethod(): void { /* ... */ }
}
```

**Event Handling:**
```typescript
component.addListener("select", (ev: qx.event.type.Data) => {
  const data = ev.getData() as string;
});
this.fireDataEvent("select", someValue);
```

**UI Components:**
- `Bs*` components wrap native HTML in `qx.ui.embed.Html`
- Use Tailwind + Basecoat utility classes via `className` constructor arg
- Theme colors resolved through `AppColors` (reads CSS custom properties)

## Custom UI Components (src/components/ui/)

The project includes a custom component library prefixed with `Bs` (Basecoat):

| Component | Description |
|-----------|-------------|
| `BsButton` | Button with variants (primary, secondary, destructive, etc.), icons, and click events |
| `BsInput` | Text input field with label, error state, and styling |
| `BsPassword` | Password input with visibility toggle |
| `BsTextarea` | Multi-line text input |
| `BsSelect` | Dropdown select with options |
| `BsAvatar` | User avatar with image or initials |
| `BsAlertDialog` | Native `<dialog>` element for confirmations, not a qooxdoo widget |
| `BsDrawer` | Slide-out drawer for mobile navigation |
| `BsSidebarButton` | Sidebar navigation button with icon support |
| `BsSidebarAccount` | User account section in sidebar |
| `BsSeparator` | Horizontal divider |
| `BsInputGroup` | Group multiple inputs with labels |

**Usage Example:**
```typescript
const btn = new BsButton("Submit", new InlineSvgIcon("check"), "btn-primary", "primary");
btn.addListener("execute", () => { /* handler */ });
```

**Note:** `BsAlertDialog` appends a native `<dialog>` to `document.body` rather than being a qooxdoo widget.

## Key Patterns

**Page Registration (src/pages/app-pages.ts):**
```typescript
const PAGE_DEFINITIONS: PageDefinition[] = [
  { label: "Page Name", iconName: "icon-name", factory: () => new PageClass() },
];

const SIDEBAR_DEFINITIONS: SidebarDefinition[] = [
  { label: "Group", children: [{ label: "Page Name" }] },
];
```

**Layout Management:**
```typescript
globalThis.setContent(widgetOrFactory, title?: string);
```

**CRUD Pages:**
- Keep local `__rows` array mirroring table model
- Column 0 is hidden ID column for selection
- Mutations call `Api.post/put/del`, then refresh via `__loadData()`
- Form dialogs use `BsAlertDialog` with `footerButtons: "ok-cancel"`

**Adding a New Page:**
1. Create `src/pages/<name>.ts` extending `qx.ui.container.Composite`
2. Add entry to `PAGE_DEFINITIONS` in `src/pages/app-pages.ts` with matching `label` and `factory`
3. Add same `label` to appropriate group in `SIDEBAR_DEFINITIONS`
4. Add GraphQL type in `backend/Types/<Name>Type.cs`
5. Add query/mutation fields in `backend/Queries/Query.cs` / `backend/Mutations/Mutation.cs`
6. Add model interface to `src/types/models.d.ts`

## SVG Icons
- Icons from `lucide-static` in `resource/app/icons/`
- Use `InlineSvgIcon` class to fetch and inject SVGs inline
- Build-dist only copies icons referenced in source

## Development Workflow

1. Make changes in `src/` TypeScript files
2. Run `npm run watch` to auto-compile on changes
3. Run `npm run build` before deploying
4. Run `npm run build-dist` for production build in `dist/`

## Important Notes

- No test framework or linting configured
- All source files share single global scope (AMD bundle)
- TypeScript compiles to `lib/application.js`
- Mobile breakpoint at 768px (handled in `src/layouts/main.ts`)