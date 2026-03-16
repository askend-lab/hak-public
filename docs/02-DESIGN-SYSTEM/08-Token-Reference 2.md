# Token Reference

Complete reference of all design tokens. All values are defined in `styles/tokens/` and follow the dual-layer system (CSS custom property + SCSS alias).

**Usage:** Always use the `$scss-variable` form in component styles.

---

## Colors

### Brand

```scss
$color-primary          // #173148 (dark blue)
$color-secondary        // #D7E5F2 (light blue)
$color-tertiary         // rgba(23, 49, 72, 0.75)
```

### Text

```scss
$color-text-primary     // #173148
$color-text-secondary   // #32383e
$color-text-placeholder // #636b74
$color-text-on-secondary // #4e5964 (on secondary bg)
$color-text-disabled    // #767676
$color-text-dark        // #000000
```

### Neutral

```scss
$color-white            // #fff
$color-black            // #000
$color-gray             // #636b74
$color-overlay          // rgba(23, 49, 72, 0.25)
$color-surface-bg       // #fbfcfe (page background)
```

### Status

```scss
$color-error            // #e70505
$color-warning          // #ef6c00
$color-success          // #2e7d32
$color-red              // #d32f2f
$color-orange           // #de6837
$color-light-orange     // #fff5f1
```

### Soft Variants

```scss
// Primary
$color-soft-primary        // #12467b
$color-soft-primary-bg     // #e3effb

// Danger
$color-soft-danger         // #7d1212
$color-soft-danger-bg      // #fce4e4

// Success
$color-soft-success        // #0a470a
$color-soft-success-bg     // #e3fbe3

// Warning
$color-soft-warning        // #492b08
$color-soft-warning-bg     // #fdf0e1

// Neutral
$color-soft-neutral-bg     // #f0f4f8
```

### Outlined Variants

```scss
$color-outlined-primary         // #97c3f0
$color-outlined-neutral         // #a8c4ddbf
$color-outlined-danger          // #c41c1c
$color-outlined-success         // #1f7a1f
$color-outlined-warning         // #9a5b13
$color-outlined-warning-border  // #f3c896
```

### Hover States

```scss
$color-primary-hover            // #1a3a52
$color-secondary-hover          // #c5d9ed
$color-secondary-active         // #d6e9f7
$color-success-hover            // #246b27
$color-warning-hover            // #cc5900
$color-orange-hover             // #f28051
$color-outlined-danger-hover    // #a31717
$color-outlined-success-hover   // #196619
$color-outlined-warning-hover   // #7a490f
$color-soft-danger-hover        // #5f0e0e
$color-soft-danger-bg-hover     // #f8d4d4
$color-soft-primary-bg-hover    // #edf5fc
```

### Borders

```scss
$color-border-light         // #bed3e5
$color-border-input         // #e0e0e0
$color-border-neutral       // #e8eaed
$color-border-neutral-light // #c5cbd1
```

### Input & Form

```scss
$color-input-bg-light       // #f6fbff
$color-input-bg-soft        // #fafcfe
$color-input-border-focus   // #4a90e2
```

### Menu & Dropdown

```scss
$color-menu-hover       // rgba(0, 0, 0, 0.04)
$color-menu-active      // rgba(0, 0, 0, 0.08)
$color-menu-danger      // #c74848de
$color-menu-danger-bg   // #f2d9d7
```

### Tags

```scss
$color-tag-bg               // #f6fbff
$color-tag-border           // #bed3e5
$color-tag-hover-bg         // #e3f2ff
$color-tag-hover-border     // #4a90e2
$color-tag-active-bg        // #d0e8ff
$color-tag-selected-bg      // #173148
$color-tag-selected-border  // #173148
$color-tag-selected-text    // #ffffff
```

### Gradients

```scss
$color-gradient-light-end   // #f8fbff
$color-gradient-soft-bg     // #fafbfc
$color-gradient-light-bg    // #f8f9fa
```

### Shadows

```scss
$color-shadow-light         // rgba(0, 0, 0, 0.12)
$color-shadow-medium        // rgba(0, 51, 57, 0.25)
$color-shadow-subtle        // rgba(0, 0, 0, 0.08)
$color-shadow-primary-xs    // rgba(23, 49, 72, 0.08)
$color-shadow-primary-sm    // rgba(23, 49, 72, 0.15)
$color-shadow-primary-md    // rgba(23, 49, 72, 0.2)
$color-shadow-primary-lg    // rgba(23, 49, 72, 0.25)
$color-shadow-focus         // rgba(23, 49, 72, 0.1)
$color-shadow-dropdown      // rgba(23, 49, 72, 0.12)
$color-shadow-backdrop      // rgba(0, 0, 0, 0.5)
$color-shadow-backdrop-light // rgba(0, 0, 0, 0.25)
$color-focus-ring-blue      // rgba(11, 107, 203, 0.1)
```

### Utility

```scss
$color-disabled-bg          // #ccc
$color-spinner-primary      // #008fd3
$color-spinner-secondary    // #4a90e2
```

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

## Borders

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

---

## Opacity

### Interaction States

```scss
$opacity-hover           // 0.8
$opacity-active          // 0.6
$opacity-disabled        // 0.5
$opacity-loading         // 0.7
```

### UI Element States

```scss
$opacity-menu-disabled   // 0.3
$opacity-placeholder     // 0.64
$opacity-subtle          // 0.87
```

---

## Breakpoints

### Values

```scss
$breakpoint-xs: 375px      // Small mobile (iPhone SE)
$breakpoint-mobile: 480px  // Mobile portrait max
$breakpoint-sm: 640px      // Mobile landscape / Small tablet
$breakpoint-md: 768px      // Tablet portrait
$breakpoint-lg: 1024px     // Tablet landscape / Small desktop
$breakpoint-xl: 1280px     // Desktop
$breakpoint-2xl: 1536px    // Large desktop
```

### Container Max-Widths

```scss
$container-sm: 640px
$container-md: 768px
$container-lg: 1024px
$container-xl: 1280px
$container-2xl: 1536px
```

### Content Max-Widths (Semantic)

```scss
$content-narrow: 640px
$content-default: 920px
$content-wide: 1280px
$content-full: 1536px
```

### Responsive Mixins

```scss
// Min-width (mobile-first, preferred)
@include respond-above($breakpoint) { }

// Max-width (use sparingly)
@include respond-below($breakpoint) { }

// Between two breakpoints
@include respond-between($min, $max) { }

// Semantic helpers (recommended)
@include mobile-landscape { }  // 640px+
@include tablet { }            // 768px+
@include desktop { }           // 1024px+
@include desktop-large { }     // 1280px+
@include desktop-xlarge { }    // 1536px+
```

---

## Usage Examples

### Colors

```scss
.component {
  color: $color-text-primary;
  background: $color-soft-neutral-bg;
  border: $border-width-thin solid $color-outlined-neutral;

  &:hover {
    background: $color-soft-primary-bg;
  }
}
```

### Spacing

```scss
.component {
  padding: $spacing-4;
  margin-bottom: $spacing-6;
  gap: $spacing-2;
}
```

### Typography

```scss
.component {
  font-family: $font-body;
  font-size: $font-size-md;
  font-weight: $font-weight-medium;
  line-height: $line-height-normal;
  letter-spacing: $letter-spacing-normal;
}
```

### Responsive

```scss
.component {
  padding: $spacing-4;

  @include tablet {
    padding: $spacing-6;
  }

  @include desktop {
    padding: $spacing-8;
  }
}
```
