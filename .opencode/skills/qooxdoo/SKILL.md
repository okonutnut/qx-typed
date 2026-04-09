---
name: qooxdoo
description: Qooxdoo native UI framework skill. Use for working with native Qooxdoo widgets, layouts, pages, and events. For custom shadcn-style components (BsButton, BsCard, etc.), use the basecoatui skill instead.
metadata:
  audience: developers
  workflow: github
---

## What do I do?

This skill covers the **native Qooxdoo framework** - the underlying UI toolkit. For BasecoatUI components (your shadcn-style layer), use the basecoatui skill instead.

Reference `src/qooxdoo.d.ts` for type definitions when writing Qooxdoo code.

## When to use me?

- Creating widgets with native Qooxdoo classes (`qx.ui.container.Composite`, `qx.ui.basic.Label`, etc.)
- Setting up layouts (`VBox`, `HBox`, `Grow`, `Grid`)
- Building pages and registering them
- Working with Qooxdoo events and listeners
- Styling with decorators, fonts, colors
- When a qx.bom.Font is used add a //@ts-ignore comment above it to avoid type errors due to Qooxdoo internals.

**Not for:** BasecoatUI components (BsButton, BsCard, etc.) - use the basecoatui skill for those.

## Project Structure

```
src/
  application.ts          # Entry point, exports qooxdooMain
  pages/
    app-pages.ts          # PAGE_DEFINITIONS & SIDEBAR_DEFINITIONS
    *-page.ts             # Individual page components
  components/ui/          # BasecoatUI components (BsButton, BsCard, etc.)
  layouts/                # Main and login layouts
  dialogs/                # Dialog components
  interfaces/             # TypeScript interfaces
  types/                  # Type definitions
```

## Widget Classes

| Class | Use Case |
|-------|----------|
| `qx.ui.container.Composite` | Generic container with layout |
| `qx.ui.container.Scroll` | Scrollable container |
| `qx.ui.basic.Label` | Text label |
| `qx.ui.basic.Atom` | Label + icon combination |
| `qx.ui.basic.Image` | Static image |
| `qx.ui.embed.Html` | Raw HTML content |
| `qx.ui.core.Widget` | Base widget class |
| `qx.ui.core.Spacer` | Flexible spacer |
| `qx.ui.popup.Popup` | Floating popup |
| `qx.ui.root.Inline` | Inline root for external DOM |

## Layouts

```typescript
// Vertical box with 10px spacing
new qx.ui.layout.VBox(10)

// Horizontal box with centering
new qx.ui.layout.HBox(16).set({ alignX: "center", alignY: "middle" })

// Fill available space
new qx.ui.layout.Grow()

// Grid (columns, spacing)
new qx.ui.layout.Grid(2, 10)

// Canvas (absolute positioning)
new qx.ui.layout.Canvas()
```

### Adding Widgets to Layout

```typescript
// Add to container
container.add(widget);

// With flex (takes remaining space)
container.add(widget, { flex: 1 });

// With edge (for Grow/Canvas layouts)
container.add(widget, { edge: 0 });

// Canvas positioning
container.add(widget, { left: 0, right: 0, top: 0, bottom: 0 });
```

## Creating Pages

Pages are zero-argument factories returning `qx.ui.core.Widget`.

1. Create `src/pages/my-page.ts`:
```typescript
class MyPage extends qx.ui.container.Composite {
  constructor() {
    super(new qx.ui.layout.VBox(20));
    this.setPadding(20);
    // Add content
  }
}
```

2. Register in `src/pages/app-pages.ts`:
```typescript
const PAGE_DEFINITIONS: PageDefinition[] = [
  { label: "My Page", iconName: "icon-name", element: () => new MyPage() },
];

const SIDEBAR_DEFINITIONS: SidebarDefinition[] = [
  {
    label: "Section",
    iconName: "folder",
    children: [
      { label: "My Page", iconName: "icon-name" },
    ],
  },
];
```

**Important:** Sidebar label must exactly match the page label.

## Events

### Static Events Declaration

```typescript
class MyWidget extends qx.ui.core.Widget {
  static events = {
    myEvent: "qx.event.type.Data",
    activate: "qx.event.type.Event",
  };
}
```

### Firing Events

```typescript
// Simple event
this.fireEvent("activate");

// Data event
this.fireDataEvent("myEvent", dataPayload);
```

### Listening to Events

```typescript
widget.addListener("eventName", (ev: qx.event.type.Data) => {
  const data = ev.getData();
});

// Cleanup on disappear
this.addListener("disappear", () => {
  // Remove listeners, cleanup resources
});
```

## Common Patterns

### Responsive Design

```typescript
private __responsiveWidth = qx.bom.Viewport.getWidth();

constructor() {
  // ...
  qx.event.Registration.addListener(window, "resize", this.__onResize, this);
}

private __onResize(): void {
  this.__responsiveWidth = qx.bom.Viewport.getWidth();
}

private __isMobile(): boolean {
  return this.__responsiveWidth < 768;
}
```

### Styling

```typescript
widget.setBackgroundColor("var(--card)");
widget.setTextColor("var(--foreground)");
widget.setPadding(20);

// Decorator for borders, radius, shadows
widget.setDecorator(
  new qx.ui.decoration.Decorator().set({
    radius: 8,
    style: "solid",
    width: 1,
    color: "var(--border)",
  })
);

// Font (requires @ts-ignore for Qooxdoo internals)
widget.setFont(new qx.bom.Font(18).set({ bold: true }));
```

### DOM Manipulation (via qx.ui.embed.Html)

```typescript
const html = new qx.ui.embed.Html("");
html.setAllowGrowX(true);

// Access native DOM after appear
html.addListenerOnce("appear", () => {
  const domEl = html.getContentElement().getDomElement();
  const nativeEl = domEl?.querySelector("input") as HTMLInputElement;
});
```

## Icons

Use `InlineSvgIcon` for Lucide icons:

```typescript
new InlineSvgIcon("user", 16)       // 16px user icon
new InlineSvgIcon("settings", 20)   // 20px settings icon
```

## Resource Paths

- Images: `resource/app/filename.png`
- Qooxdoo: `resource/qooxdoo.js`

## Global Functions

```typescript
// Navigate to page (set by MainLayout)
globalThis.setContent(contentWidget, "Page Title");
```

## Reference

Full type definitions: `src/qooxdoo.d.ts`
