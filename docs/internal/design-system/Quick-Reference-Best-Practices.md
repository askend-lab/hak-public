# Quick Reference: Best Practices

**DO's and DON'Ts for design system compliance**

---

## BEM Naming

```scss
.block {}                    // Component root
.block__element {}           // Child (double underscore)
.block--modifier {}          // Variant (double dash)
.block__element--modifier {} // Element variant
```

**Examples:**

```scss
.task-card {}
.task-card__header {}
.task-card__title {}
.task-card__actions {}
.task-card--completed {}
.task-card__title--highlighted {}
```

---

## DO's and DON'Ts

### ✅ DO

```scss
// Use tokens
color: $color-primary;
padding: $spacing-md;

// Follow BEM
.component__element {}

// Add to SCSS files
.my-class { /* styles */ }
```

### ❌ DON'T

```scss
// Hardcode values
color: #173148;
padding: 16px;

// Use inline styles
<div style={{ color: 'red' }}>

// Use non-semantic names
.blue-text {}
.padding-large {}
```

---

## Quick Checklist

Before committing:

- [ ] No hardcoded colors (`#HEX`)
- [ ] No hardcoded spacing (`16px`)
- [ ] BEM naming used
- [ ] No inline styles
- [ ] Tokens imported at top
- [ ] `npm run validate:design` passes
- [ ] `npm run build` succeeds

---

## Common Mistakes

### ❌ Hardcoding Colors

```scss
// WRONG
.button {
  background: #173148;
  color: #FFFFFF;
}

// CORRECT
.button {
  background: $color-primary;
  color: $color-white;
}
```

### ❌ Hardcoding Spacing

```scss
// WRONG
.card {
  padding: 16px;
  margin: 24px;
}

// CORRECT
.card {
  padding: $spacing-md;
  margin: $spacing-lg;
}
```

### ❌ Inline Styles

```tsx
// WRONG
<div style={{ color: 'blue', padding: '16px' }}>
  Content
</div>

// CORRECT
<div className="info-box">
  Content
</div>
```

### ❌ Non-BEM Naming

```scss
// WRONG
.taskCardHeader {}
.task-card-header {}

// CORRECT
.task-card__header {}
```

---

## Validation Workflow

1. **Write code** with design tokens
2. **Visual check**: `npm run dev`
3. **Validate**: `npm run validate:design`
4. **Build**: `npm run build`
5. **Fix** any issues
6. **Commit** when all checks pass

---

## Getting Help

### Token Questions
- Check [Quick-Reference-Tokens.md](./Quick-Reference-Tokens.md)
- See `styles/tokens/README.md` for governance

### Component Questions  
- Check [Quick-Reference-Common-Tasks.md](./Quick-Reference-Common-Tasks.md)
- See [04-Component-Architecture.md](./04-Component-Architecture.md)

### Architecture Questions
- Start with [README.md](./README.md)
- See [02-Architecture-Overview.md](./02-Architecture-Overview.md)

### Onboarding
- Follow [DESIGN_SYSTEM_ONBOARDING.md](./DESIGN_SYSTEM_ONBOARDING.md)

---

## Emergency Fixes

If `validate:design` fails:

1. **Check error message** for specific file/line
2. **Search for hardcoded values**: `grep -r "#[0-9a-fA-F]" styles/components/`
3. **Replace with tokens** from [Quick-Reference-Tokens.md](./Quick-Reference-Tokens.md)
4. **Re-validate**: `npm run validate:design`

If build fails:

1. **Check for missing imports**
2. **Verify token file exists** in `styles/tokens/`
3. **Check import order** in `styles/main.scss`
4. **Rebuild**: `npm run build`
