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

See also: [Token Reference — Layout & Typography](./08b-Token-Reference-Layout.md)
