# AGENTS.md - Developer Guidelines for qx-typed

This document provides guidelines for agentic coding agents working in this codebase.

## Project Overview

qx-typed is a TypeScript-based web application using the qooxdoo UI framework with Tailwind CSS. It compiles TypeScript to AMD modules and serves as a standalone web application.

## Build Commands

```bash
# Build the project (CSS + TypeScript)
npm run build

# Build distribution version (optimized, minified)
npm run build-dist

# Watch for TypeScript changes (dev mode)
npm run watch

# Full dev server with live reload
npm run dev

# Build Tailwind CSS only
npm run build-css

# Serve with PHP (requires PHP installed)
npm run serve:php
```

**There are no test or lint commands configured.** This project does not use a test framework or linter.

## Code Style Guidelines

### TypeScript Configuration
- Target: ES6
- Module system: AMD (outFile: `lib/application.js`)
- No strict type checking enabled (types: [])
- Use `// @ts-ignore` sparingly when needed for qooxdoo type declarations

### Naming Conventions
- **Classes**: PascalCase (e.g., `MainPage`, `BsButton`)
- **Interfaces**: PascalCase with optional `I` prefix (e.g., `SidebarItem`)
- **Private properties**: Double underscore prefix (e.g., `__collapsed`, `__buttonEl`)
- **Public methods**: camelCase (e.g., `setIcon`, `onClick`)
- **Files**: kebab-case (e.g., `app-pages.ts`, `sidebar-item.ts`)

### Imports and Dependencies
- No explicit import statements (AMD module system uses global `qx` namespace)
- Use qooxdoo classes via global namespace (e.g., `qx.ui.container.Composite`)
- Custom components in `src/components/ui/` should be prefixed (e.g., `BsButton`, `BsInput`)
- Inline SVG icons use `InlineSvgIcon` from `src/components/InlineSvgIcon.ts`

### File Organization
```
src/
├── application.ts       # Main entry point, registers with qx.registry
├── app-colors.ts        # Color constants/theming
├── sidebar.ts           # Main sidebar component
├── navbar.ts            # Navigation bar
├── data/
│   ├── globals.ts       # Global type declarations
│   └── sidebar-item.ts  # Sidebar data types
├── pages/               # Page components (FormPage, ButtonsPage, etc.)
├── layouts/             # Layout components (MainLayout, LoginLayout)
└── components/
    ├── ui/              # Reusable UI components (Button, Input, etc.)
    ├── SVGIcons.ts      # SVG icon wrapper
    └── InlineSvgIcon.ts # Inline SVG implementation
```

### Component Patterns

**Class Structure:**
```typescript
class MyComponent extends qx.ui.container.Composite {
  static events = {
    // Event definitions
    select: "qx.event.type.Data",
  };

  private __privateProp: string;

  constructor(param: string) {
    super();
    this.__privateProp = param;
    this.setLayout(new qx.ui.layout.VBox());
    // initialization
  }

  public publicMethod(): void {
    // public API
  }

  private __privateMethod(): void {
    // internal implementation
  }
}
```

**Event Handling:**
```typescript
// Listen to events
component.addListener("select", (ev: qx.event.type.Data) => {
  const data = ev.getData() as string;
});

// Fire events
this.fireDataEvent("select", someValue);
```

### Error Handling
- Use `// @ts-ignore` when qooxdoo types are incomplete
- No try-catch patterns in current codebase
- Use qooxdoo's event system for error reporting to users

### UI Styling
- Tailwind CSS utility classes via `setHtml()` or CSS classes
- Custom components prefixed with `Bs` (Basecoat) for the design system
- Use `AppColors` from `src/app-colors.ts` for consistent theming

### Key Patterns

**Page Registration:**
```typescript
// In src/pages/app-pages.ts
const PAGE_DEFINITIONS: PageDefinition[] = [
  {
    label: "Page Name",
    iconName: "icon-name",
    factory: () => new PageClass(),
  },
];
```

**Layout Management:**
```typescript
// Set content dynamically
globalThis.setContent(widgetOrFactory, title?: string);
```

**Sidebar Navigation:**
```typescript
// Sidebar fires "select" event with label
sidebar.addListener("select", (ev) => {
  const label = ev.getData() as string;
});
```

### Working with qooxdoo

- All UI widgets extend qooxdoo base classes
- Use `.set()` for multiple properties: `widget.set({ prop1: val1, prop2: val2 })`
- Use `.setProperty(value)` for single properties: `widget.setWidth(100)`
- Layouts are set in constructor: `super(new qx.ui.layout.VBox())`
- Decorators: `widget.setDecorator(new qx.ui.decoration.Decorator().set({...}))`

### SVG Icons
- Icons stored in `resource/app/icons/`
- Use `InlineSvgIcon` class for inline SVG rendering
- Icon names referenced without extension in code

## Development Workflow

1. Make changes in `src/` TypeScript files
2. Run `npm run watch` to auto-compile on changes
3. Use `npm run dev` for full development experience with live reload
4. Run `npm run build` before deploying
5. Run `npm run build-dist` to create production build in `dist/`

## Important Notes

- This project does NOT have test files or test configuration
- No linting is configured - manually ensure code quality
- The AMD module system requires all code to be in `src/` directory
- TypeScript compiles to single file `lib/application.js`
