---
name: basecoatui
description: BasecoatUI - Your custom shadcn-style component library. A separate UI layer built to be compatible with Qooxdoo. Use for BsButton, BsCard, BsAvatar, BsInput, BsDrawer, etc.
metadata:
  audience: developers
  workflow: github
---

## What do I do?

BasecoatUI is your **custom shadcn-style component library** - a separate UI layer from native Qooxdoo. These components wrap HTML/CSS with Tailwind classes and integrate with Qooxdoo via `qx.ui.embed.Html`.

This is **not** Qooxdoo's native UI. Use the qooxdoo skill for native framework questions.

Use the API reference at `src/basecoatui.api.md` for detailed component documentation, including constructors, methods, events, and type definitions.

## When to use me?

- Creating UI with BsButton, BsCard, BsAvatar, BsInput, etc.
- Building forms with BsInputGroup, BsTextarea, BsSelect
- Working with drawers (BsDrawer) or dialogs (BsAlertDialog)
- Building sidebar navigation (BsSidebarButton, BsSidebarAccount)
- Using shadcn-style Tailwind CSS components
- If you need help with the official BasecoatUI components use this website for reference and ask questions about how to use them https://basecoatui.com/. 

**Not for:** Native Qooxdoo widgets or framework questions - use the qooxdoo skill for those.

## Components

| Component | File | Description |
|-----------|------|-------------|
| `BsButton` | `src/components/ui/Button.ts` | Button with variants (default, secondary, destructive, outline, ghost, link) |
| `BsCard` | `src/components/ui/Card.ts` | Card container with border and padding |
| `BsAvatar` | `src/components/ui/Avatar.ts` | Avatar with image and fallback |
| `BsInput` | `src/components/ui/Input.ts` | Text input with optional leading icon |
| `BsTextarea` | `src/components/ui/Textarea.ts` | Multi-line text input |
| `BsPassword` | `src/components/ui/Password.ts` | Password input field |
| `BsSelect` | `src/components/ui/Select.ts` | Dropdown select |
| `BsInputGroup` | `src/components/ui/InputGroup.ts` | Input with label and error message |
| `BsSeparator` | `src/components/ui/Separator.ts` | Horizontal/vertical divider |
| `BsDrawer` | `src/components/ui/Drawer.ts` | Bottom sheet drawer with drag-to-close |
| `BsAlertDialog` | `src/components/ui/AlertDialog.ts` | Singleton modal dialog |
| `BsSidebarButton` | `src/components/ui/SidebarButton.ts` | Sidebar navigation button |
| `BsSidebarAccount` | `src/components/ui/SidebarAccount.ts` | Account menu with avatar and dropdown |

## When to use me?

Use this skill when:
- Creating or modifying UI using BasecoatUI components
- Need to know component constructors, methods, or events
- Building forms, cards, drawers, or sidebar navigation
- Working with the custom shadcn-style UI layer

## Patterns

### Creating Components

```typescript
// Button with variant
const btn = new BsButton("Click me", undefined, { variant: "destructive", size: "sm" });
btn.onClick(() => console.log("clicked"));

// Card with content
const card = new BsCard();
card.setContent(new qx.ui.basic.Label("Hello"));

// Input with leading icon
const input = new BsInput("", "Enter email...");
input.setLeadingHtml(`<svg>...</svg>`);
input.onInput((val) => console.log(val));

// Alert dialog
BsAlertDialog.show({
  title: "Confirm",
  description: "Are you sure?",
  footerButtons: "ok-cancel",
  onContinue: () => console.log("confirmed")
});
```

### Chaining

All setters return `this` for chaining:

```typescript
new BsAvatar()
  .setSrc("user.png")
  .setShape("rounded")
  .setFallback("JD");
```

### Events

Components fire Qooxdoo events. Use `addListener` or convenience methods:

```typescript
button.addListener("execute", handler);  // or button.onClick(handler)
input.addListener("input", handler);     // or input.onInput(handler)
```

## Style Classes

Components use Tailwind CSS classes. Key variants:

- **Button variants:** `btn-primary`, `btn-secondary`, `btn-destructive`, `btn-outline`, `btn-ghost`, `btn-link`
- **Size prefixes:** `btn-sm-*`, `btn-lg-*`, `btn-icon`
- **Common classes:** `bg-card`, `text-foreground`, `border-border`, `input`, `select`, `textarea`
