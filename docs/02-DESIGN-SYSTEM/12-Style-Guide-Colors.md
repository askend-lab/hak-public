# Style Guide - Color Usage

## Color Usage

### Never hardcode colors

```scss
// Bad
.my-component {
  color: #173148;
  background: #d7e5f2;
}

// Good
.my-component {
  color: $color-primary;
  background: $color-secondary;
}
```

### Available color tokens

| Token                   | Usage                    |
| ----------------------- | ------------------------ |
| `$color-primary`        | Main brand color         |
| `$color-secondary`      | Secondary brand color    |
| `$color-text-primary`   | Primary text             |
| `$color-text-secondary` | Secondary text           |
| `$color-surface-bg`     | Page background          |
| `$color-error`          | Error states             |
| `$color-warning`        | Warning states           |
| `$color-success`        | Success states           |
| `$color-soft-*-bg`      | Soft variant backgrounds |
| `$color-outlined-*`     | Outlined variant colors  |

## Storybook Components

These components are from EKI Storybook and should be used as-is:

- **Button**: `.button`, `.button--primary`, `.button--secondary`
- **Input**: `.input`, `.input-wrapper`, `.input-label`
- **Avatar**: `.avatar`, `.avatar__initials`
- **Modal**: `.modal` (for notifications/toasts only)
- **Checkbox**: `.checkbox-btn`
- **Radio Button**: `.radio-btn`
- **Select**: `.select`

## App-Specific Components

Components unique to this app (documented in `STORYBOOK-BACKLOG.md` for future proposal):

- Task Manager
- Audio Player
- Playlist
- Panel (sliding panels)
- Paper (dropdown surfaces)
- Modal (dialog windows - different from notification modals)

---

**See also:**

- [Style Guide Overview](./Style-Guide.md) - Architecture and BEM conventions
- [Token Governance](./tokens/Token-Governance.md) - Token management rules
