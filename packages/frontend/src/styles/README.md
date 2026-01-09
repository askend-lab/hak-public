# EKI App Style Guide

This document describes the CSS/SCSS conventions used in this application, aligned with the EKI Storybook design system.

> **📚 For complete architecture overview, see [Design System Architecture](../docs/DESIGN_SYSTEM_ARCHITECTURE.md)**

## Architecture

The styles follow an ITCSS-inspired layer structure:

```
styles/
├── tokens/           # Design tokens (colors, typography, spacing, borders, breakpoints)
├── base/             # Reset and base element styles
├── components/       # Component-specific styles (BEM)
│   ├── _page-layouts.scss  # ← Universal responsive layout system
│   ├── _paper.scss         # Paper component (dropdowns, menus)
│   └── ...other components
└── main.scss         # Entry point - imports in correct order
```

## Design Tokens

All design values are defined in `styles/tokens/`:

- `_colors.scss` - Color palette
- `_typography.scss` - Font families, sizes, weights
- `_spacing.scss` - Spacing scale (4px grid)
- `_borders.scss` - Border radii and widths

For detailed token governance (naming conventions, when to add tokens, etc.), see [`styles/tokens/README.md`](tokens/README.md).

### Usage

```scss
@import '../tokens/colors';

.my-component {
  color: $color-primary;
  background: $color-surface-bg;
  padding: $spacing-md;
  border-radius: $border-radius;
}
```

## BEM Naming Convention

All component classes follow the BEM (Block Element Modifier) methodology, matching EKI Storybook patterns.

### Structure

```scss
.block {}                    // Component root
.block__element {}           // Child element (use __ double underscore)
.block--modifier {}          // Variant (use -- double dash)
.block__element--modifier {} // Element variant
```

### Examples

#### From EKI Storybook

```scss
// Button component
.button {}
.button--primary {}
.button--secondary {}
.button--small {}
.button--large {}

// Modal component
.modal {}
.modal__top {}
.modal__title {}
.modal--small {}
.modal--medium {}
.modal--large {}

// Input component
.input {}
.input--small {}
.input--medium {}
.input--large {}
.input-wrapper {}
.input-label {}
```

#### App-Specific Components

```scss
// Task Manager
.task-manager {}
.task-manager__header {}
.task-manager__list {}
.task-manager--loading {}

// Playlist
.playlist {}
.playlist__item {}
.playlist__controls {}
.playlist--playing {}

// Audio Player
.audio-player {}
.audio-player__play-button {}
.audio-player__progress {}
.audio-player--loading {}
```

## Responsive Layout System

The app uses a universal layout system with 4 variants:

1. **Minimal**: Simple pages (role selection)
2. **Full**: Complex pages with description and actions (synthesis, tasks)
3. **With Actions**: List pages with title and actions (task list)
4. **Empty State**: Error/empty pages

See [Layout System Documentation](../docs/DESIGN_SYSTEM_ARCHITECTURE.md#responsive-layout-system) for details.

### Breakpoints

Mobile-first approach with 6 breakpoints:
- xs: 375px (small mobile)
- sm: 640px (mobile landscape)
- md: 768px (tablet)
- lg: 1024px (desktop)
- xl: 1280px (large desktop)
- 2xl: 1536px (XL desktop)

### Naming Rules

1. **Block names**: Use lowercase with hyphens for multi-word names
   - Good: `.task-manager`, `.audio-player`
   - Bad: `.taskManager`, `.TaskManager`

2. **Element names**: Use double underscore `__`
   - Good: `.task-manager__header`
   - Bad: `.task-manager-header`

3. **Modifier names**: Use double dash `--`
   - Good: `.button--primary`
   - Bad: `.button-primary`

4. **No deep nesting**: Avoid `.block__element__subelement`
   - Good: `.card__title`, `.card__actions`
   - Bad: `.card__header__title`

## Color Usage

### Never hardcode colors

```scss
// Bad
.my-component {
  color: #173148;
  background: #D7E5F2;
}

// Good
.my-component {
  color: $color-primary;
  background: $color-secondary;
}
```

### Available color tokens

| Token | Usage |
|-------|-------|
| `$color-primary` | Main brand color |
| `$color-secondary` | Secondary brand color |
| `$color-text-primary` | Primary text |
| `$color-text-secondary` | Secondary text |
| `$color-surface-bg` | Page background |
| `$color-error` | Error states |
| `$color-warning` | Warning states |
| `$color-success` | Success states |
| `$color-soft-*-bg` | Soft variant backgrounds |
| `$color-outlined-*` | Outlined variant colors |

## Storybook Components

These components are from EKI Storybook and should be used as-is:

- **Button**: `.button`, `.button--primary`, `.button--secondary`
- **Input**: `.input`, `.input-wrapper`, `.input-label`
- **Avatar**: `.avatar`, `.avatar__initials`
- **Modal**: `.modal` (for notifications/toasts only)
- **Checkbox**: `.checkbox-btn`
- **Radio Button**: `.radio-btn`
- **Select**: `.select`

## App-Specific Components

Components unique to this app (documented in `STORYBOOK-BACKLOG.md` for future proposal):

- Task Manager
- Audio Player
- Playlist
- Panel (sliding panels)
- Paper (dropdown surfaces)
- Modal (dialog windows - different from notification modals)
