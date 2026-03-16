# Development Workflows - Common Patterns

## Common Patterns

### Adding Hover States

```scss
.button--primary {
  background: $color-primary;
  transition: background 0.2s ease;
  
  &:hover {
    background: $color-primary-hover;
  }
  
  &:active {
    background: darken($color-primary, 5%);
  }
  
  &:disabled {
    background: $color-disabled-bg;
    cursor: not-allowed;
  }
}
```

### Adding Variants

```scss
// Size variants
.card--sm {
  padding: $spacing-2;
  font-size: $font-size-sm;
}

.card--md {
  padding: $spacing-4;
  font-size: $font-size-md;
}

.card--lg {
  padding: $spacing-6;
  font-size: $font-size-lg;
}

// Style variants
.card--outlined {
  border: 1px solid $color-outlined-neutral;
  background: transparent;
}

.card--elevated {
  box-shadow: 0 2px 8px rgba(23, 49, 72, 0.12);
}
```

### Responsive Design

```scss
.component {
  // Mobile first (base styles)
  display: flex;
  flex-direction: column;
  padding: $spacing-3;
  
  // Tablet (768px+)
  @media (min-width: 768px) {
    flex-direction: row;
    padding: $spacing-4;
  }
  
  // Desktop (1024px+)
  @media (min-width: 1024px) {
    padding: $spacing-6;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Validation Workflow

**Before committing:**

1. **Visual Check**: `npm run dev` - verify component looks correct
2. **Design System Validation**: `npm run validate:design` - check for hardcoded values
3. **Build Check**: `npm run build` - ensure no compilation errors
4. **Cross-browser Test**: Check in Chrome, Firefox, Safari

### Development Checklist

**Before submitting a component:**

```markdown
Design System Compliance:
- [ ] Uses design tokens exclusively ($color-*, $spacing-*, etc.)
- [ ] Follows BEM naming convention (.block__element--modifier)
- [ ] No hardcoded colors or spacing values
- [ ] No inline styles (except library-required)
- [ ] Imports tokens at the top of SCSS file

Implementation Quality:
- [ ] Responsive design implemented (mobile-first)
- [ ] Hover/focus/active states defined
- [ ] Loading and error states handled
- [ ] Accessibility attributes added (ARIA, roles)
- [ ] Cross-browser tested (Chrome, Firefox, Safari)

Documentation:
- [ ] Component purpose documented (if reusable)
- [ ] BEM class structure clear and consistent
- [ ] Added to STORYBOOK-BACKLOG.md (if proposable)

Verification:
- [ ] `npm run validate:design` passes
- [ ] `npm run build` succeeds
- [ ] `npm run dev` shows component correctly
- [ ] Visual regression check performed
```

---

**See also:**
- [Adding Components](./06-Development-Workflows-Adding.md) - Step-by-step guide
