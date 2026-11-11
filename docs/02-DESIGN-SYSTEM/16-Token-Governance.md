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
--color-tag-bg: #f6fbff; // Tag background - light blue
--color-tag-border: #bed3e5; // Tag border - matches tag background
```

### Step 4: Verify Build

```bash
npm run build
```

---

**See also:**

- [Token Categories](./Token-Categories.md) - Complete list of token categories
- [Token Examples](./Token-Examples.md) - Usage examples and best practices
