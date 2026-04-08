# Token Reference — Layout & Typography

Continuation of [Token Reference (Colors)](./08-Token-Reference.md). All values defined in `styles/tokens/`.

---

## Spacing

Based on a 4px grid with half-step extensions.

### Base Scale

```scss
$spacing-0      // 0
$spacing-1      // 4px   (0.25rem)
$spacing-1-5    // 6px   (0.375rem)
$spacing-2      // 8px   (0.5rem)
$spacing-3      // 12px  (0.75rem)
$spacing-3-5    // 14px  (0.875rem)
$spacing-4      // 16px  (1rem)
$spacing-5      // 20px  (1.25rem)
$spacing-6      // 24px  (1.5rem)
$spacing-8      // 32px  (2rem)
$spacing-9      // 36px  (2.25rem)
$spacing-10     // 40px  (2.5rem)
$spacing-11     // 44px  (2.75rem)
$spacing-12     // 48px  (3rem)
$spacing-15     // 60px  (3.75rem)
$spacing-16     // 64px  (4rem)
$spacing-17     // 68px  (4.25rem)
```

### Semantic Aliases

```scss
$spacing-xs     // 4px   (= $spacing-1)
$spacing-sm     // 8px   (= $spacing-2)
$spacing-md     // 16px  (= $spacing-4)
$spacing-lg     // 24px  (= $spacing-6)
$spacing-xl     // 32px  (= $spacing-8)
$spacing-2xl    // 48px  (= $spacing-12)
```

### Accessibility

```scss
$spacing-touch-target  // 44px (2.75rem) — WCAG 2.5.5 minimum touch target
```

---

## Typography

### Font Families

```scss
$font-body      // "Inter", sans-serif
$font-mono      // "Monaco", "Menlo", monospace
```

### Font Sizes

```scss
$font-size-2xs           // 10px  (0.625rem)
$font-size-xs            // 12px  (0.75rem)
$font-size-sm            // 14px  (0.875rem)
$font-size-md            // 16px  (1rem)
$font-size-lg            // 18px  (1.125rem)
$font-size-xl            // 20px  (1.25rem)
$font-size-2xl           // 24px  (1.5rem)
$font-size-3xl           // 28px  (1.75rem)
$font-size-4xl           // 32px  (2rem)
$font-size-5xl           // 36px  (2.25rem)
$font-size-content-title // 34px  (2.125rem)
```

### Font Weights

```scss
$font-weight-regular     // 400
$font-weight-medium      // 500
$font-weight-semibold    // 600
$font-weight-bold        // 700
```

### Line Heights

```scss
$line-height-none        // 1.0   (100%)
$line-height-tight       // 1.15  (115%)
$line-height-normal      // 1.4   (140%)
$line-height-medium      // 1.5   (150%)
$line-height-relaxed     // 1.55  (155%)
$line-height-loose       // 1.75  (175%)
```

### Letter Spacing

```scss
$letter-spacing-tight         // -0.025em
$letter-spacing-normal        // 0
$letter-spacing-subtle        // 0.15px
$letter-spacing-wide          // 0.025em
$letter-spacing-content-title // 0.0025em (0.25%)
$letter-spacing-content-body  // 0.005em  (0.5%)
```

### Semantic Heading Tokens

```scss
// Page Title (H1)
$heading-page-title-size           // 24px (desktop)
$heading-page-title-size-mobile    // 20px (mobile)
$heading-page-title-weight         // 400
$heading-page-title-line           // 100%

// Page Description (subtitle)
$heading-page-description-size          // 16px (desktop)
$heading-page-description-size-mobile   // 14px (mobile)
$heading-page-description-weight        // 400
$heading-page-description-line          // 140%
```

---

## Borders, Opacity & Breakpoints

### Border Radii

```scss
$border-radius-sm    // 6px
$border-radius       // 8px (default)
$border-radius-md    // 8px
$border-radius-lg    // 12px
$border-radius-xl    // 16px
$border-radius-round // 10rem (pill shape)
$border-radius-full  // 9999px (circle)
```

### Border Widths

```scss
$border-width-thin   // 1px
$border-width-medium // 2px
$border-width-thick  // 3px
```

### Opacity

```scss
$opacity-hover           // 0.8
$opacity-active          // 0.6
$opacity-disabled        // 0.5
$opacity-loading         // 0.7
$opacity-menu-disabled   // 0.3
$opacity-placeholder     // 0.64
$opacity-subtle          // 0.87
```

### Breakpoints

```scss
$breakpoint-xs: 375px      // Small mobile (iPhone SE)
$breakpoint-mobile: 480px  // Mobile portrait max
$breakpoint-sm: 640px      // Mobile landscape / Small tablet
$breakpoint-md: 768px      // Tablet portrait
$breakpoint-lg: 1024px     // Tablet landscape / Small desktop
$breakpoint-xl: 1280px     // Desktop
$breakpoint-2xl: 1536px    // Large desktop
```

### Content Max-Widths

```scss
$content-narrow: 640px
$content-default: 920px
$content-wide: 1280px
$content-full: 1536px
```

### Responsive Mixins

```scss
@include respond-above($breakpoint) { }  // min-width (preferred)
@include respond-below($breakpoint) { }  // max-width (sparingly)
@include respond-between($min, $max) { }

// Semantic helpers
@include mobile-landscape { }  // 640px+
@include tablet { }            // 768px+
@include desktop { }           // 1024px+
@include desktop-large { }     // 1280px+
```

