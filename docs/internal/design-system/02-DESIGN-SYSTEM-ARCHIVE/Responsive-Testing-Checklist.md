# Responsive Testing Checklist

This checklist ensures all pages and components are tested at the 6 standard breakpoints defined in the design system.

## Standard Breakpoints

| Breakpoint | Width | Device Type |
|------------|-------|-------------|
| XS | 375px | Small mobile (iPhone SE) |
| SM | 640px | Mobile landscape / Small tablet |
| MD | 768px | Tablet portrait |
| LG | 1024px | Tablet landscape / Small desktop |
| XL | 1280px | Desktop |
| 2XL | 1536px | Large desktop |

## Testing Instructions

1. Open browser DevTools (F12 or Cmd+Option+I)
2. Toggle device toolbar (Cmd+Shift+M or Ctrl+Shift+M)
3. Set responsive viewport to each width
4. Check all items below at each breakpoint

---

## Pages Checklist

### Role Selection Page
- [ ] **375px**: Cards stack vertically, centered
- [ ] **640px**: Cards stack vertically with proper spacing
- [ ] **768px**: Cards may start to arrange horizontally
- [ ] **1024px**: Cards display in row layout
- [ ] **1280px+**: Full desktop layout

### Synthesis Page
- [ ] **375px**: Single column, header stacks, buttons full-width
- [ ] **640px**: Header actions may be horizontal
- [ ] **768px**: Content still single column
- [ ] **1024px**: Two-column layout appears (if using --two-column)
- [ ] **1280px+**: Full two-column layout with sticky sidebar

### Tasks List Page
- [ ] **375px**: Task rows wrap, actions stack
- [ ] **640px**: Task rows more compact
- [ ] **768px**: Full row layout
- [ ] **1024px+**: Desktop layout with full metadata visible

### Task Detail Page
- [ ] **375px**: Hero actions stack full-width, back button above
- [ ] **640px**: Slight improvements in spacing
- [ ] **768px**: Header actions may be horizontal
- [ ] **1024px+**: Full horizontal layout for hero section

### Shared Task Page
- [ ] **375px**: Info banner stacks vertically
- [ ] **640px**: Banner text may be horizontal
- [ ] **768px**: Full banner layout
- [ ] **1024px+**: Desktop layout

---

## Components Checklist

### Modals
- [ ] **375px**: Full viewport width (-32px), adjusted padding
- [ ] **640px**: Full viewport width
- [ ] **768px+**: Fixed width based on size variant

### Pronunciation Variants Panel
- [ ] **375px**: Full viewport width, content stacks
- [ ] **640px**: Full viewport width, improved spacing
- [ ] **768px**: Panel width constrained (max 518px)
- [ ] **1024px+**: Standard panel width

### Header Navigation
- [ ] **375px**: Nav hidden, mobile menu visible
- [ ] **640px**: Nav hidden, mobile menu visible
- [ ] **768px**: Nav visible with reduced spacing
- [ ] **1024px+**: Full nav with proper spacing

### Footer
- [ ] **375px**: Stacked vertical layout
- [ ] **640px**: May start 2-column wrap
- [ ] **768px**: 2-column wrapped layout
- [ ] **1024px+**: Horizontal no-wrap layout

### Page Headers
- [ ] **375px**: Stacked layout (title, description, actions)
- [ ] **640px**: Actions may be horizontal
- [ ] **768px**: Actions horizontal for --with-actions
- [ ] **1024px**: --full variant goes horizontal

### Synthesis Results
- [ ] **375px**: Actions stack vertically
- [ ] **640px**: Phonetic actions may be horizontal
- [ ] **768px**: Full layout with proper spacing
- [ ] **1024px+**: Desktop layout

---

## Quick Test Commands

```bash
# Run the frontend dev server
pnpm --filter frontend dev

# Then test in browser at:
# http://localhost:5173/
```

## Browser DevTools Presets

For quick testing, save these device presets in Chrome DevTools:
- "Mobile XS" - 375 x 667
- "Mobile SM" - 640 x 800
- "Tablet MD" - 768 x 1024
- "Desktop LG" - 1024 x 768
- "Desktop XL" - 1280 x 800
- "Desktop 2XL" - 1536 x 900

---

**See also:**
- [Breakpoints & Structure](./05-Responsive-Layout-Breakpoints.md) - Breakpoint definitions
- [Layout Behavior Guide](./05-Layout-Behavior-Guide.md) - Expected responsive behavior
