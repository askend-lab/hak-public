# Development Workflows - Adding Components

## Adding a New Component

**Step-by-step process:**

```
Step 1: Check if storybook component exists
  ↓
  Exists? → Use storybook classes (.button, .input, etc.)
  ↓
  Not in storybook? → Continue to Step 2

Step 2: Create component file
  ↓
  Create: styles/components/_component-name.scss
  ↓
  Follow BEM naming: .component-name, .component-name__element

Step 3: Use design tokens exclusively
  ↓
  Colors: $color-*
  Spacing: $spacing-*
  Typography: $font-*
  Borders: $border-radius-*

Step 4: Import in main.scss
  ↓
  Add: @import 'components/component-name';

Step 5: Add to STORYBOOK-BACKLOG.md if reusable
  ↓
  Document for potential storybook proposal
```

**Complete Example:**

```scss
// File: styles/components/_status-badge.scss
@import '../tokens/colors';
@import '../tokens/spacing';
@import '../tokens/typography';
@import '../tokens/borders';

// Base component
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: $spacing-1 $spacing-2;
  border-radius: $border-radius-round;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  background: $color-soft-neutral-bg;
  color: $color-text-secondary;
}

// Element: icon
.status-badge__icon {
  width: 12px;
  height: 12px;
  margin-right: $spacing-1;
}

// Modifiers: status variants
.status-badge--success {
  background: $color-soft-success-bg;
  color: $color-soft-success;
}

.status-badge--error {
  background: $color-soft-danger-bg;
  color: $color-soft-danger;
}

.status-badge--warning {
  background: $color-soft-warning-bg;
  color: $color-soft-warning;
}
```

Then in `styles/main.scss`:

```scss
// ... other imports ...
@import 'components/status-badge';
```

## Styling Existing Components

**DO's and DON'Ts:**

```scss
✅ DO:
// Use design tokens
.my-component {
  color: $color-primary;
  background: $color-soft-primary-bg;
  padding: $spacing-md;
  border-radius: $border-radius;
}

// Follow BEM naming
.my-component__header {}
.my-component__content {}
.my-component--large {}

// Add classes to SCSS files
.my-component__new-element {
  margin-top: $spacing-3;
}

❌ DON'T:
// Hardcode colors
.my-component {
  color: #173148;  // ❌ Use $color-primary
  background: #E3EFFB;  // ❌ Use $color-soft-primary-bg
}

// Use inline styles in React
<div style={{ color: 'blue', padding: '16px' }}>  // ❌

// Use non-semantic names
.blue-text {}  // ❌ Use .text-primary or similar
.padding-large {}  // ❌ Use BEM modifiers
```

---

**See also:**
- [Common Patterns](./06-Development-Workflows-Patterns.md) - Patterns and validation
