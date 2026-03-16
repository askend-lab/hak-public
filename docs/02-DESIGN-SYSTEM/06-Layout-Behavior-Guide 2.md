# Responsive Layout - Behavior & Selection Guide

## Responsive Behavior

**Header (.page-layout__header):**

| Breakpoint | Height | Padding | Behavior |
|------------|--------|---------|----------|
| Mobile (< 640px) | 56px | 0 16px | Compact |
| Mobile landscape (640px+) | 60px | 0 20px | Standard |
| Tablet (768px+) | 60px | 0 24px | Standard |
| Desktop (1024px+) | 60px | 0 32px | Spacious |

**Page Headers:**

| Layout Type | Mobile | Tablet | Desktop |
|-------------|--------|--------|---------|
| Minimal | Stacked | Stacked | Stacked |
| Full | Stacked | Stacked | Horizontal (title/desc left, actions right) |
| With Actions | Stacked | Horizontal | Horizontal |

**Content (.page-content):**

| Breakpoint | Padding (top right bottom left) | Max Width | Behavior |
|------------|-------------------------------|-----------|----------|
| Mobile (< 640px) | 0 16px 24px 16px | 100% | Full width |
| Mobile landscape (640px+) | 0 20px 32px 20px | 100% | Full width |
| Tablet (768px+) | 0 24px 32px 24px | 920px | Constrained |
| Desktop (1024px+) | 0 32px 36px 32px | 920px | Constrained |
| Large (920px + 64px) | 0 | 920px | No side padding |

**Footer:**

| Breakpoint | Layout | Padding (top right bottom left) |
|------------|--------|-------------------------------|
| Mobile (< 640px) | Stacked (vertical) | 24px 16px 20px 16px |
| Mobile landscape (640px+) | Stacked (vertical) | 32px 20px 24px 20px |
| Tablet (768px+) | 2 columns (wrapped) | 32px 24px 32px 24px |
| Desktop (1024px+) | Horizontal (no wrap) | 36px 32px 24px 32px |

## Layout Selection Guide

**Decision Tree:**

```
Does the page need a header with content?
├─ No → Use .page-header--none (empty state)
└─ Yes
   ├─ Does it need action buttons?
   │  ├─ No → Use .page-header--minimal
   │  └─ Yes
   │     ├─ Does it need a description?
   │     │  ├─ Yes → Use .page-header--full
   │     │  └─ No → Use .page-header--with-actions
```

**Quick Reference:**

- **Minimal**: Title only → Role selection, simple pages
- **Full**: Title + description + actions → Synthesis, task details
- **With Actions**: Title + actions → Task list, directories
- **Empty State**: No header → Error pages, empty lists

## Responsive Utility Classes

**Hide/Show Elements:**

```scss
// Hide on mobile (< 768px)
.hide-mobile { display: none !important; }

// Hide on tablet and below (< 1024px)
.hide-tablet { display: none !important; }

// Hide on desktop and above (>= 1024px)
.hide-desktop { display: none !important; }

// Show only on mobile (< 768px)
.show-mobile-only { }

// Show only on tablet (768px - 1023px)
.show-tablet-only { }

// Show only on desktop (>= 1024px)
.show-desktop-only { }
```

**Usage Example:**

```tsx
<div className="hide-mobile">
  {/* Only visible on tablet and desktop */}
  <p>Desktop-specific content</p>
</div>

<div className="show-mobile-only">
  {/* Only visible on mobile */}
  <button>Mobile menu</button>
</div>
```

---

**See also:**
- [Layout Type Examples](./07-Layout-Types-Examples.md)
- [Breakpoints & Structure](./05-Responsive-Layout-Breakpoints.md)
