# Responsive Layout System - Breakpoints & Structure

## Breakpoint Strategy

The application uses a **mobile-first responsive approach** with 6 industry-standard breakpoints:

```scss
// Breakpoint values
$breakpoint-xs: 375px;   // Small mobile (iPhone SE)
$breakpoint-sm: 640px;   // Mobile landscape / Small tablet
$breakpoint-md: 768px;   // Tablet portrait
$breakpoint-lg: 1024px;  // Tablet landscape / Small desktop
$breakpoint-xl: 1280px;  // Desktop
$breakpoint-2xl: 1536px; // Large desktop
```

**Mobile-First Philosophy:**

- Start with mobile styles (320px+)
- Add complexity as screen size increases
- Use `@include tablet { }` instead of max-width queries
- Ensures best performance on mobile devices

**Responsive Mixins:**

```scss
// Min-width (mobile-first, preferred)
@include respond-above($breakpoint-md) { }

// Max-width (use sparingly)
@include respond-below($breakpoint-lg) { }

// Between two breakpoints
@include respond-between($breakpoint-sm, $breakpoint-md) { }

// Semantic helpers (recommended)
@include mobile-landscape { }  // 640px+
@include tablet { }            // 768px+
@include desktop { }           // 1024px+
@include desktop-large { }     // 1280px+
@include desktop-xlarge { }    // 1536px+
```

## Layout Architecture

The system provides **4 layout types** for different page needs.

## Page Structure

**Base Structure (all pages):**

```tsx
<div className="page-layout">
  <header className="page-layout__header">
    {/* Sticky header - navigation, logo, user profile */}
  </header>
  
  <main className="page-layout__main">
    {/* Page-specific header variant */}
    {/* Page content */}
  </main>
  
  <footer className="page-layout__footer">
    {/* Footer content */}
  </footer>
</div>
```

**Key Characteristics:**

- **Header**: Sticky, always visible on scroll
- **Main**: Scrollable, flexible height
- **Footer**: Always below content, may require scrolling
- **Responsive**: All elements adapt across 6 breakpoints

---

**See also:**
- [Layout Types](./05-Responsive-Layout-Types.md) - 4 layout type examples
