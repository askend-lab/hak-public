# EKI App Style Guide

This document describes the CSS/SCSS conventions used in this application, aligned with the EKI Storybook design system.

> **📚 For complete architecture overview, see the Design System Architecture documentation**

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

For detailed token governance (naming conventions, when to add tokens, etc.), see [`styles/tokens/README.md`](tokens/Token-Governance.md).

### Usage

```scss
@import "../tokens/colors";

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
.block {
} // Component root
.block__element {
} // Child element (use __ double underscore)
.block--modifier {
} // Variant (use -- double dash)
.block__element--modifier {
} // Element variant
```

### Examples

#### From EKI Storybook

```scss
// Button component
.button {
}
.button--primary {
}
.button--secondary {
}
.button--small {
}
.button--large {
}

// Modal component
.modal {
}
.modal__top {
}
.modal__title {
}
.modal--small {
}
.modal--medium {
}
.modal--large {
}

// Input component
.input {
}
.input--small {
}
.input--medium {
}
.input--large {
}
.input-wrapper {
}
.input-label {
}
```

#### App-Specific Components

```scss
// Task Manager
.task-manager {
}
.task-manager__header {
}
.task-manager__list {
}
.task-manager--loading {
}

// Playlist
.playlist {
}
.playlist__item {
}
.playlist__controls {
}
.playlist--playing {
}

// Audio Player
.audio-player {
}
.audio-player__play-button {
}
.audio-player__progress {
}
.audio-player--loading {
}
```

## Responsive Layout System

The app uses a universal layout system with 4 variants:

1. **Minimal**: Simple pages (role selection)
2. **Full**: Complex pages with description and actions (synthesis, tasks)
3. **With Actions**: List pages with title and actions (task list)
4. **Empty State**: Error/empty pages

See the Layout System Documentation for details.

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

---

**See also:**

- [Color Usage Guide](./Style-Guide-Colors.md) - Color tokens and usage
- [Token Governance](./tokens/Token-Governance.md) - Token management rules
