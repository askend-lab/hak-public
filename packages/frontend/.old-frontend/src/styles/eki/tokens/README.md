# Design Token Governance

This document defines the rules and conventions for managing design tokens in the EKI app.

## What Are Design Tokens?

Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes. We use them in place of hard-coded values (like hex codes for color or pixel values for spacing) to maintain a scalable and consistent visual system.

## Token Structure

All tokens follow a dual-layer system:

1. **CSS Custom Properties** (`:root` variables) - Runtime-changeable, cascade-friendly
2. **SCSS Variable Aliases** - Compile-time, IDE autocomplete support

```scss
// CSS Custom Property
:root {
  --color-primary: #173148;
}

// SCSS Alias
$color-primary: var(--color-primary);
```

## Naming Convention

### Pattern

```
$[category]-[property]-[variant]-[state]
```

### Examples

- `$color-primary` - Base primary color
- `$color-text-secondary` - Secondary text color
- `$color-soft-primary-bg` - Soft primary background
- `$color-outlined-danger-hover` - Outlined danger hover state
- `$spacing-md` - Medium spacing
- `$border-radius-sm` - Small border radius

### Rules

1. **Use semantic names**, not descriptive names
   - ✅ Good: `$color-primary`, `$color-error`
   - ❌ Bad: `$color-dark-blue`, `$color-red-500`

2. **Follow the category prefix**
   - Colors: `$color-*`
   - Spacing: `$spacing-*`
   - Typography: `$font-*`, `$font-size-*`, `$font-weight-*`, `$heading-*`
   - Borders: `$border-*`
   - Breakpoints: `$breakpoint-*`

3. **Use kebab-case** for multi-word names
   - ✅ Good: `$color-text-placeholder`
   - ❌ Bad: `$colorTextPlaceholder`, `$color_text_placeholder`

## When to Add a New Token

Add a new token when:

1. **The color/value is used in 2+ places** - Promotes consistency and makes updates easier
2. **The color/value represents a semantic meaning** - e.g., "error state" not just "red"
3. **The color/value may need theming support** - CSS custom properties enable runtime changes
4. **The color/value is part of a design system pattern** - e.g., hover states, focus states

Do NOT add a token for:

1. **One-off values** that won't be reused
2. **Values that are purely decorative** with no semantic meaning
3. **Values that are component-specific** and won't apply elsewhere

## When to Reuse Existing Tokens

Before adding a new token, check if an existing one can be reused:

```scss
// Instead of creating $color-modal-background
// Reuse: $color-white

// Instead of creating $color-button-disabled
// Reuse: $color-disabled-bg
```

## How to Add a New Token

### Step 1: Add CSS Custom Property

Add to the appropriate token file in `styles/tokens/`:

```scss
// In styles/tokens/_colors.scss
:root {
  // ... existing tokens ...
  
  // New token with comment explaining usage
  --color-new-semantic-name: #HEX; // Usage: Where this color is used
}
```

### Step 2: Add SCSS Alias

Add the SCSS variable alias below the CSS custom properties:

```scss
// SCSS Variable Aliases
$color-new-semantic-name: var(--color-new-semantic-name);
```

### Step 3: Document the Token

Add a comment explaining:
- Where it's used
- Why it exists
- Any relationships to other tokens

```scss
// Tag colors (for word tags, labels)
--color-tag-bg: #F6FBFF; // Tag background - light blue
--color-tag-border: #BED3E5; // Tag border - matches tag background
```

### Step 4: Verify Build

```bash
npm run build
```

## Token Categories

### Colors (`_colors.scss`)

- **Brand colors**: Primary, secondary, tertiary
- **Text colors**: Primary, secondary, placeholder, disabled
- **Surface colors**: Backgrounds, overlays
- **Status colors**: Error, warning, success
- **Soft variants**: Muted versions with backgrounds
- **Outlined variants**: Border/outline colors
- **Hover states**: Pre-computed hover colors
- **Component-specific**: Tags, menus, inputs, gradients

### Typography (`_typography.scss`)

- **Font families**: Body, monospace
- **Font sizes**: xs, sm, md, lg, xl, 2xl
- **Font weights**: Regular, medium, semibold, bold
- **Line heights**: None (100%), tight, normal, relaxed, loose
- **Letter spacing**: Tight, normal, wide
- **Semantic headings**: Page title, page description (composed tokens for consistent heading styles)

### Spacing (`_spacing.scss`)

- **Base scale**: 0, 1 (4px), 2 (8px), 3 (12px), 4 (16px), 5 (20px), 6 (24px), 8 (32px), 10 (40px), 12 (48px), 16 (64px)
- **Semantic aliases**: xs, sm, md, lg, xl, 2xl

### Borders (`_borders.scss`)

- **Border radii**: sm (6px), md (8px), lg (12px), xl (16px), round (10rem), full (9999px)
- **Border widths**: thin (1px), medium (2px), thick (3px)

## Examples

### Good Token Usage

```scss
.my-component {
  color: $color-primary;
  background: $color-soft-primary-bg;
  padding: $spacing-md;
  border-radius: $border-radius;
  
  &:hover {
    background: $color-soft-primary-bg-hover;
  }
}
```

### Bad Token Usage

```scss
.my-component {
  color: #173148; // ❌ Hardcoded - use $color-primary
  background: #E3EFFB; // ❌ Hardcoded - use $color-soft-primary-bg
  padding: 16px; // ❌ Hardcoded - use $spacing-md
  border-radius: 8px; // ❌ Hardcoded - use $border-radius
}
```

## Migration from Hardcoded Values

When refactoring existing code:

1. **Identify the semantic meaning** of the hardcoded value
2. **Find or create the appropriate token**
3. **Replace the hardcoded value** with the token
4. **Test visually** to ensure no regressions

## Token Updates

When updating token values:

1. **Update the CSS custom property** in the token file
2. **The SCSS alias automatically references the new value**
3. **Build and test** to ensure changes propagate correctly
4. **Document the change** if it affects multiple components

## Relationship to EKI Storybook

These app tokens extend the EKI Storybook design system:

- **Storybook tokens**: Imported from storybook (read-only)
- **App tokens**: Defined here, follow same conventions
- **Future migration**: App tokens may be proposed to storybook

See `docs/STORYBOOK-BACKLOG.md` for components/tokens to propose to central storybook.

## Validation

Run the design system validation script to check compliance:

```bash
npm run validate:design
```

This checks:
- No hardcoded colors in components
- No inline styles in React components
- All tokens properly documented
- Build succeeds
