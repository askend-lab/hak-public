# Quick Reference: Common Tasks

**Fast lookup guide for everyday development tasks**

---

## Add a Color Token

```scss
// 1. Add to styles/tokens/_colors.scss
:root {
  --color-new-name: #HEX;  // Description
}
$color-new-name: var(--color-new-name);

// 2. Use in component
.my-component {
  color: $color-new-name;
}
```

## Style a Button

```tsx
// Use storybook classes
<button className="button button--primary">
  Click Me
</button>

// Variants available:
// button--primary, button--secondary, button--small, button--large
```

## Create New Component

```bash
# 1. Create file
touch styles/components/_component-name.scss

# 2. Add BEM structure
.component-name {}
.component-name__element {}
.component-name--modifier {}

# 3. Import in main.scss
@import 'components/component-name';
```

## Add Hover State

```scss
.button {
  background: $color-primary;
  transition: background 0.2s ease;
  
  &:hover {
    background: $color-primary-hover;
  }
}
```

## Make Component Responsive

Using breakpoint mixins:

```scss
@import '../tokens/breakpoints';

.component {
  // Mobile first (320px+)
  flex-direction: column;
  gap: $spacing-2;
  
  // Tablet (768px+)
  @include tablet {
    flex-direction: row;
    gap: $spacing-4;
  }
  
  // Desktop (1024px+)  
  @include desktop {
    gap: $spacing-6;
  }
}
```

## Create a Page Layout

Choose from 4 layout types:

```tsx
// 1. Minimal (role selection, simple pages)
<div className="page-layout">
  <header className="page-layout__header">...</header>
  <main className="page-layout__main">
    <div className="page-header page-header--minimal">
      <h1 className="page-header__title">Page Title</h1>
    </div>
    <div className="page-content">...</div>
  </main>
  <footer className="page-layout__footer page-footer--full">...</footer>
</div>

// 2. Full (synthesis, task details - with description & actions)
// Use .page-header--full with __content, __description, __actions

// 3. With Actions (task list - title & actions, no description)
// Use .page-header--with-actions with __title, __actions

// 4. Empty State (no header)
// Use .page-content--empty with .empty-state
```

---

## Storybook Components (Use These First!)

| Component | Classes |
|-----------|---------|
| Button | `.button`, `.button--primary`, `.button--secondary` |
| Input | `.input`, `.input-wrapper`, `.input-label` |
| Avatar | `.avatar`, `.avatar__initials` |
| Checkbox | `.checkbox-btn` |
| Radio | `.radio-btn` |
| Select | `.select` |

---

## Validation Commands

```bash
# Run all design system checks
npm run validate:design

# Build the application
npm run build

# Run dev server
npm run dev

# Run tests
npm test
```

---

## File Locations

```
styles/
├── tokens/              # Design tokens
│   ├── _colors.scss
│   ├── _typography.scss
│   ├── _spacing.scss
│   ├── _borders.scss
│   └── _opacity.scss
├── components/          # App components
│   └── _component-name.scss
└── main.scss           # Entry point

docs/design-system/
├── README.md                    # Documentation index
├── 01-Introduction.md           # Getting started
├── Quick-Reference-Tokens.md    # Token reference
└── Quick-Reference-Best-Practices.md  # Best practices
```

---

## Need More Info?

- **Full Documentation**: [README.md](./README.md) - Start here
- **Token Reference**: [Quick-Reference-Tokens.md](./Quick-Reference-Tokens.md)
- **Best Practices**: [Quick-Reference-Best-Practices.md](./Quick-Reference-Best-Practices.md)
- **Token Governance**: `styles/tokens/README.md`
- **Onboarding**: [DESIGN_SYSTEM_ONBOARDING.md](./DESIGN_SYSTEM_ONBOARDING.md)
