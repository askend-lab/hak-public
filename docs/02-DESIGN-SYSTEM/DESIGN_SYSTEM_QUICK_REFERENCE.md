# Design System Quick Reference

**One-page guide for common tasks**

---

## Common Tasks

### Add a Color Token

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

### Style a Button

```tsx
// Use storybook classes
<button className="button button--primary">
  Click Me
</button>

// Variants available:
// button--primary, button--secondary, button--small, button--large
```

### Create New Component

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

### Add Hover State

```scss
.button {
  background: $color-primary;
  transition: background 0.2s ease;
  
  &:hover {
    background: $color-primary-hover;
  }
}
```

### Make Component Responsive

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

### Create a Page Layout

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

## Token Quick Reference

### Colors

```scss
// Brand
$color-primary          // #173148 (dark blue)
$color-secondary        // #D7E5F2 (light blue)

// Text
$color-text-primary     // Primary text
$color-text-secondary   // Secondary text
$color-text-placeholder // Placeholder text

// Status
$color-error           // Error states
$color-warning         // Warning states
$color-success         // Success states

// Backgrounds
$color-surface-bg      // Page background
$color-white           // Pure white
$color-soft-neutral-bg // Light gray background
```

### Spacing (4px grid)

```scss
$spacing-xs   // 4px
$spacing-sm   // 8px
$spacing-md   // 16px
$spacing-lg   // 24px
$spacing-xl   // 32px
$spacing-2xl  // 48px
```

### Typography

```scss
// Font
$font-body    // 'Inter', sans-serif

// Sizes
$font-size-xs   // 12px
$font-size-sm   // 14px
$font-size-md   // 16px
$font-size-lg   // 18px
$font-size-xl   // 20px
$font-size-2xl  // 24px

// Weights
$font-weight-regular   // 400
$font-weight-medium    // 500
$font-weight-semibold  // 600
$font-weight-bold      // 700

// Line Heights
$line-height-none      // 1.0 (100%)
$line-height-tight     // 1.15 (115%)
$line-height-normal    // 1.4 (140%)

// Semantic Headings (use these for page headings)
$heading-page-title-size           // 24px (desktop)
$heading-page-title-size-mobile    // 20px (mobile)
$heading-page-title-weight         // 400
$heading-page-title-line           // 100%

$heading-page-description-size          // 16px (desktop)
$heading-page-description-size-mobile   // 14px (mobile)
$heading-page-description-weight        // 400
$heading-page-description-line          // 140%
```

### Borders

```scss
$border-radius-sm    // 6px
$border-radius       // 8px
$border-radius-lg    // 12px
$border-radius-round // 10rem
```

### Opacity (interaction states)

```scss
// Interaction states
$opacity-hover           // 0.8 - Hover state
$opacity-active          // 0.6 - Active/pressed state
$opacity-disabled        // 0.5 - Disabled elements
$opacity-loading         // 0.7 - Loading state

// UI element states
$opacity-menu-disabled   // 0.3 - Disabled menu items
$opacity-placeholder     // 0.64 - Placeholder text
$opacity-subtle          // 0.87 - Subtle text overlays
```

### Breakpoints

```scss
// Breakpoint tokens
$breakpoint-xs: 375px   // Small mobile
$breakpoint-sm: 640px   // Mobile landscape
$breakpoint-md: 768px   // Tablet
$breakpoint-lg: 1024px  // Desktop
$breakpoint-xl: 1280px  // Large desktop
$breakpoint-2xl: 1536px // XL desktop

// Semantic mixins
@include mobile-landscape { }
@include tablet { }
@include desktop { }
@include desktop-large { }
@include desktop-xlarge { }
```

---

## BEM Naming

```scss
.block {}                    // Component root
.block__element {}           // Child (double underscore)
.block--modifier {}          // Variant (double dash)
.block__element--modifier {} // Element variant
```

**Examples:**

```scss
.task-card {}
.task-card__header {}
.task-card__title {}
.task-card__actions {}
.task-card--completed {}
.task-card__title--highlighted {}
```

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

docs/
├── DESIGN_SYSTEM_ARCHITECTURE.md  # Full guide
├── DESIGN_SYSTEM_QUICK_REFERENCE.md # This file
└── STORYBOOK-BACKLOG.md           # Proposals
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

## DO's and DON'Ts

### ✅ DO

```scss
// Use tokens
color: $color-primary;
padding: $spacing-md;

// Follow BEM
.component__element {}

// Add to SCSS files
.my-class { /* styles */ }
```

### ❌ DON'T

```scss
// Hardcode values
color: #173148;
padding: 16px;

// Use inline styles
<div style={{ color: 'red' }}>

// Use non-semantic names
.blue-text {}
.padding-large {}
```

---

## Quick Checklist

Before committing:

- [ ] No hardcoded colors (`#HEX`)
- [ ] No hardcoded spacing (`16px`)
- [ ] BEM naming used
- [ ] No inline styles
- [ ] Tokens imported at top
- [ ] `npm run validate:design` passes
- [ ] `npm run build` succeeds

---

## Need More Info?

- **Full Architecture**: [DESIGN_SYSTEM_ARCHITECTURE.md](DESIGN_SYSTEM_ARCHITECTURE.md)
- **Token Governance**: [../styles/tokens/README.md](../styles/tokens/README.md)
- **Style Guide**: [../styles/README.md](../styles/README.md)
- **Onboarding**: [DESIGN_SYSTEM_ONBOARDING.md](DESIGN_SYSTEM_ONBOARDING.md)
