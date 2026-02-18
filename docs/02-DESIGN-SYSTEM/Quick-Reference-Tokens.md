# Quick Reference: Design Tokens

**Complete token reference for all design values**

---

## Colors

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

## Spacing (4px grid)

```scss
$spacing-xs   // 4px
$spacing-sm   // 8px
$spacing-md   // 16px
$spacing-lg   // 24px
$spacing-xl   // 32px
$spacing-2xl  // 48px
```

## Typography

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

## Borders

```scss
$border-radius-sm    // 6px
$border-radius       // 8px
$border-radius-lg    // 12px
$border-radius-round // 10rem
```

## Opacity (interaction states)

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

## Breakpoints

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

## Token Usage Examples

### Using Colors

```scss
.component {
  color: $color-text-primary;
  background: $color-soft-neutral-bg;
  border: 1px solid $color-outlined-neutral;
}

.component:hover {
  background: $color-soft-primary-bg;
}
```

### Using Spacing

```scss
.component {
  padding: $spacing-md;
  margin-bottom: $spacing-lg;
  gap: $spacing-sm;
}
```

### Using Typography

```scss
.component {
  font-family: $font-body;
  font-size: $font-size-md;
  font-weight: $font-weight-medium;
  line-height: $line-height-normal;
}
```

### Using Breakpoints

```scss
.component {
  width: 100%;
  
  @include tablet {
    width: 50%;
  }
  
  @include desktop {
    width: 33.333%;
  }
}
```

---

## Need More Info?

- **Common Tasks**: [Quick-Reference-Common-Tasks.md](./Quick-Reference-Common-Tasks.md)
- **Best Practices**: [Quick-Reference-Best-Practices.md](./Quick-Reference-Best-Practices.md)
- **Full Token Documentation**: [03-File-Structure.md](./03-File-Structure.md)
- **Token Governance**: `styles/tokens/README.md`
