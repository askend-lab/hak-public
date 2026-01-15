# Architecture Overview

## Three-Layer Architecture

The design system follows a three-layer architecture pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: Design Tokens (styles/tokens/)                        │
│ ─────────────────────────────────────────────────────────────── │
│ Single source of truth for all design values                   │
│ • Colors (50+ tokens)                                           │
│ • Typography (fonts, sizes, weights, line heights)             │
│ • Spacing (4px grid system)                                     │
│ • Borders (radii, widths)                                       │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 2: Storybook Components (imported)                       │
│ ─────────────────────────────────────────────────────────────── │
│ Shared components from EKI Storybook (used as-is)              │
│ • Button, Input, Avatar                                         │
│ • Checkbox, Radio, Select                                       │
│ • Modal (notifications)                                         │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 3: App-Specific Components (styles/components/)          │
│ ─────────────────────────────────────────────────────────────── │
│ Components unique to this application                           │
│ • Task Manager, Audio Player, Playlist                          │
│ • Panel (sliding drawers), Paper (dropdowns)                    │
│ • Modal (dialogs), Textarea                                     │
│ • Phonetic displays, Synthesis results                          │
└─────────────────────────────────────────────────────────────────┘
```

**Layer Responsibilities:**

- **Layer 1** provides values
- **Layer 2** provides base UI patterns
- **Layer 3** provides app-specific functionality

**Dependencies:**
- Layer 2 depends on Layer 1
- Layer 3 depends on Layers 1 and 2
- Layers never depend upward

## ITCSS Methodology

The design system implements [ITCSS (Inverted Triangle CSS)](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/) methodology:

```
        ┌─────────────────┐
        │    Settings     │  ← Tokens (most generic, widest reach)
        ├─────────────────┤
        │      Base       │  ← Resets, element defaults
        ├─────────────────┤
        │   Components    │  ← BEM components (most specific)
        └─────────────────┘
```

### Settings Layer (Tokens)

**Location:** `styles/tokens/`

- CSS custom properties in `:root`
- SCSS variable aliases
- No actual styling, just values
- Highest reusability, lowest specificity

### Base Layer

**Location:** `styles/base/`

- CSS resets
- Base element styles (body, html)
- Normalizations
- No classes, just element selectors

### Components Layer

**Location:** `styles/components/`

- BEM-named classes
- Specific component styles
- Highest specificity, lowest reusability
- Each component in its own file

### Import Order Importance

The order of imports in `styles/main.scss` is **critical**:

```scss
// 1. Tokens FIRST (provide values)
@import 'tokens/colors';
@import 'tokens/typography';
@import 'tokens/spacing';
@import 'tokens/borders';

// 2. Storybook imports (optional overrides)
@import 'abstracts/storybook-imports';

// 3. Base styles (element defaults)
@import 'base/reset';

// 4. Components LAST (specific styles)
@import 'components/panel';
@import 'components/paper';
// ... more components
```

**Why this order matters:**
- Tokens must be defined before use
- Base styles use tokens
- Components use tokens and may extend base styles
- Specificity increases from top to bottom
