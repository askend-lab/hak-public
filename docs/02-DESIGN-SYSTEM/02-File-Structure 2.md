# File Structure and Design Token System

## File Structure

```
styles/
├── tokens/                    # Layer 1: Design Tokens
│   ├── _index.scss           # Barrel export (optional)
│   ├── _colors.scss          # Color tokens (50+ colors)
│   ├── _typography.scss      # Font tokens
│   ├── _spacing.scss         # Spacing scale (4px grid)
│   ├── _borders.scss         # Border radii and widths
│   └── README.md             # Token governance documentation
│
├── abstracts/                 # Storybook-specific imports
│   └── _storybook-imports.scss  # Storybook CSS var references
│
├── base/                      # Base/reset styles
│   └── _reset.scss           # CSS reset and normalizations
│
├── components/                # Layer 3: App-specific components
│   ├── _panel.scss           # Sliding panel component
│   ├── _paper.scss           # Dropdown/popover surface
│   ├── _modal-base.scss      # Dialog modal base
│   ├── _audio-player.scss    # Audio playback
│   ├── _playlist.scss        # Playlist component
│   ├── _task-manager.scss    # Task management UI
│   ├── _textarea.scss        # Textarea component
│   └── ... (32 component files)
│
├── main.scss                  # Entry point (imports all)
└── README.md                  # Style guide and BEM documentation
```

**Naming Conventions:**
- Tokens: `_category-name.scss` (e.g., `_colors.scss`)
- Components: `_component-name.scss` (e.g., `_task-manager.scss`)
- Partials: Prefix with underscore `_` (SCSS convention)
- Main: `main.scss` (no underscore, compiled entry)

## Design Token System

### Dual-Layer Token System

Our token system uses a **dual-layer approach** combining CSS custom properties with SCSS variables:

```scss
// Layer 1: CSS Custom Properties (runtime-changeable)
:root {
  --color-primary: #173148;
  --color-secondary: #D7E5F2;
  --spacing-md: 1rem;
}

// Layer 2: SCSS Aliases (compile-time, IDE autocomplete)
$color-primary: var(--color-primary);
$color-secondary: var(--color-secondary);
$spacing-md: var(--spacing-md);
```

**Why Dual-Layer?**

| Feature | CSS Custom Properties | SCSS Variables |
|---------|----------------------|----------------|
| Runtime changes | ✅ Yes (theming) | ❌ No (compile-time) |
| IDE autocomplete | ⚠️ Limited | ✅ Excellent |
| Browser cascade | ✅ Yes | ❌ No |
| Performance | ✅ Fast | ✅ Fast |
| Our approach | Define once | Reference everywhere |

**When to use each:**
- **Always use SCSS aliases** in component styles
- **CSS vars enable** runtime theming if needed later
- **Never hardcode** values directly

### Token Categories

#### 1. Colors (`styles/tokens/_colors.scss`)

**50+ color tokens organized by purpose:**

```scss
// Brand colors
$color-primary: var(--color-primary);         // #173148 (dark blue)
$color-secondary: var(--color-secondary);     // #D7E5F2 (light blue)

// Text colors
$color-text-primary: var(--color-text-primary);
$color-text-secondary: var(--color-text-secondary);
$color-text-placeholder: var(--color-text-placeholder);

// Status colors
$color-error: var(--color-error);
$color-warning: var(--color-warning);
$color-success: var(--color-success);

// Component-specific
$color-tag-bg: var(--color-tag-bg);
$color-menu-hover: var(--color-menu-hover);
$color-input-bg-light: var(--color-input-bg-light);
```

#### 2. Typography (`styles/tokens/_typography.scss`)

```scss
// Font families
$font-body: var(--font-body);                // 'Inter', sans-serif

// Font sizes (16px base)
$font-size-xs: var(--font-size-xs);         // 12px
$font-size-sm: var(--font-size-sm);         // 14px
$font-size-md: var(--font-size-md);         // 16px
$font-size-lg: var(--font-size-lg);         // 18px

// Font weights
$font-weight-regular: var(--font-weight-regular);    // 400
$font-weight-medium: var(--font-weight-medium);      // 500
$font-weight-semibold: var(--font-weight-semibold);  // 600
$font-weight-bold: var(--font-weight-bold);          // 700
```

#### 3. Spacing (`styles/tokens/_spacing.scss`)

**4px grid system:**

```scss
// Base spacing scale (4px grid + half-steps)
$spacing-0: var(--spacing-0);        // 0
$spacing-1: var(--spacing-1);        // 4px
$spacing-1-5: var(--spacing-1-5);    // 6px
$spacing-2: var(--spacing-2);        // 8px
$spacing-3: var(--spacing-3);        // 12px
$spacing-3-5: var(--spacing-3-5);    // 14px
$spacing-4: var(--spacing-4);        // 16px
$spacing-5: var(--spacing-5);        // 20px
$spacing-6: var(--spacing-6);        // 24px
$spacing-8: var(--spacing-8);        // 32px
$spacing-9: var(--spacing-9);        // 36px
$spacing-10: var(--spacing-10);      // 40px
$spacing-11: var(--spacing-11);      // 44px
$spacing-12: var(--spacing-12);      // 48px
$spacing-15: var(--spacing-15);      // 60px
$spacing-16: var(--spacing-16);      // 64px
$spacing-17: var(--spacing-17);      // 68px

// Semantic aliases
$spacing-xs: var(--spacing-xs);      // 4px
$spacing-sm: var(--spacing-sm);      // 8px
$spacing-md: var(--spacing-md);      // 16px
$spacing-lg: var(--spacing-lg);      // 24px
$spacing-xl: var(--spacing-xl);      // 32px
$spacing-2xl: var(--spacing-2xl);    // 48px

// Accessibility
$spacing-touch-target: var(--spacing-touch-target); // 44px (WCAG 2.5.5)
```

#### 4. Borders (`styles/tokens/_borders.scss`)

```scss
// Border radii
$border-radius-sm: var(--border-radius-sm);      // 6px
$border-radius: var(--border-radius);            // 8px
$border-radius-md: var(--border-radius-md);      // 8px
$border-radius-lg: var(--border-radius-lg);      // 12px
$border-radius-xl: var(--border-radius-xl);      // 16px
$border-radius-round: var(--border-radius-round); // 10rem
$border-radius-full: var(--border-radius-full);  // 9999px

// Border widths
$border-width-thin: var(--border-width-thin);    // 1px
$border-width-medium: var(--border-width-medium); // 2px
$border-width-thick: var(--border-width-thick);  // 3px
```

### Naming Convention

**Pattern:** `$[category]-[property]-[variant]-[state]`

**Examples:**
- `$color-primary` - Base primary color
- `$color-text-secondary` - Secondary text color
- `$color-soft-primary-bg` - Soft primary background
- `$color-outlined-danger-hover` - Outlined danger hover state
- `$spacing-md` - Medium spacing
- `$font-size-lg` - Large font size

**Rules:**
- ✅ **Semantic names**: `$color-error` (meaning-based)
- ❌ **Descriptive names**: `$color-red-500` (appearance-based)
- ✅ **Consistent prefixes**: All colors start with `$color-`
- ✅ **Kebab-case**: `$color-text-placeholder` not `$colorTextPlaceholder`

### Token Governance

For detailed guidelines on when and how to add tokens, see [`styles/tokens/README.md`](../styles/tokens/README.md).

**Quick Reference:**

**Add a token when:**
- Value used in 2+ places
- Value has semantic meaning
- Value may need theming

**Don't add a token for:**
- One-off values
- Purely decorative values
- Component-specific values
