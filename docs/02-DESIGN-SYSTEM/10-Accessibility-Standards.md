# Accessibility Standards

All components meet **WCAG 2.1 Level AA** requirements.

---

## Perceivable

| Requirement | Implementation |
|-------------|----------------|
| **Non-text Content (1.1.1)** | All images need `alt` text; decorative icons use `aria-hidden="true"` |
| **Info & Relationships (1.3.1)** | Form inputs must have associated `<label>` with `htmlFor`; use semantic HTML |
| **Color Contrast (1.4.3)** | Minimum 4.5:1 for normal text, 3:1 for large text |
| **Resize Text (1.4.4)** | Use relative units (`rem`); page must work at 200% zoom |

## Operable

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard (2.1.1)** | All interactive elements must be keyboard accessible |
| **Focus Visible (2.4.7)** | Use `:focus-visible` styles; never use `outline: none` without replacement |
| **Focus Order (2.4.3)** | Tab order must be logical; use proper DOM order |
| **Focus Trap** | Modals must trap focus; Escape key must close them |

### Focus Pattern

Every `outline: none` is paired with a `:focus-visible` replacement:

```scss
.interactive-element {
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px $color-focus-ring-blue;
  }

  &:focus:not(:focus-visible) {
    outline: none;
  }
}
```

This ensures keyboard users see a visible focus ring while mouse users do not see an outline on click.

## Understandable

| Requirement | Implementation |
|-------------|----------------|
| **Language (3.1.1)** | Set `lang="et"` on `<html>` element |
| **Error Identification (3.3.1)** | Error messages must use `role="alert"` for screen reader announcement |
| **Labels (3.3.2)** | All form fields need visible labels, not just placeholders |

## Robust

| Requirement | Implementation |
|-------------|----------------|
| **Name, Role, Value (4.1.2)** | Custom controls need ARIA: `role`, `aria-label`, `aria-expanded`, etc. |
| **Modals** | Use `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| **Menus** | Use `role="menu"`, `role="menuitem"`, `aria-haspopup` |

### Modal Pattern

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Modal Title</h2>
  {/* Focus is trapped within this dialog */}
  {/* Escape key closes the modal */}
</div>
```

### Menu Pattern

```tsx
<button aria-haspopup="true" aria-expanded={isOpen}>
  Menu
</button>
<ul role="menu">
  <li role="menuitem">Action 1</li>
  <li role="menuitem">Action 2</li>
</ul>
```

---

## Checklist

Before submitting a component:

**Perceivable:**
- [ ] Images have alt text (or `aria-hidden` if decorative)
- [ ] Form inputs have proper `<label>` elements
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Information is not conveyed by color alone

**Operable:**
- [ ] All functionality available via keyboard
- [ ] Focus indicators are visible (`:focus-visible` styles)
- [ ] No keyboard traps
- [ ] Modals trap focus and close with Escape

**Understandable:**
- [ ] Error messages announce to screen readers (`role="alert"`)
- [ ] Labels are descriptive and associated with inputs
- [ ] Page language is set correctly

**Robust:**
- [ ] Custom controls have appropriate ARIA attributes
- [ ] Valid HTML structure
