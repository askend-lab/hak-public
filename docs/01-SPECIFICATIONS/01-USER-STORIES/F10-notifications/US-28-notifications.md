# US-28: Display and Dismiss Notifications

**Feature:** F10 Notifications  
**Priority:** Medium

## User Story

As a **user**  
I want to **see notifications about my actions**  
So that **I know when operations succeed or fail**

## Acceptance Criteria

- [ ] **AC-1:** Notifications appear in top-right corner
- [ ] **AC-2:** Four types supported: success, error, info, warning
- [ ] **AC-3:** Each notification has title and optional description
- [ ] **AC-4:** Notifications auto-dismiss after timeout
- [ ] **AC-5:** Notifications can be manually dismissed (X button)
- [ ] **AC-6:** Optional action button can be included
- [ ] **AC-7:** Multiple notifications can stack
- [ ] **AC-8:** Latest notifications appear at top

## UI Behavior

### Notification Types

| Type | Color | Icon | Usage |
|------|-------|------|-------|
| Success | Green | ✓ | Operation completed |
| Error | Red | ✗ | Operation failed |
| Info | Blue | ℹ | Informational message |
| Warning | Yellow | ⚠ | Caution needed |

### Notification Structure

```
┌────────────────────────────────────┐
│ [✓] Ülesanne loodud!           [X]│
│                                    │
│ 3 lauset lisatud ülesandesse       │
│ Hääldusharjutus 1!                 │
│                                    │
│              [Vaata ülesannet]     │ ← Optional action
└────────────────────────────────────┘
```

### Notification Placement

```
┌─────────────────────────────────────────┐
│ [Header]                                │
├─────────────────────────────────────────┤
│                    ┌──────────────────┐ │
│                    │ Notification 1   │ │ ← Latest
│                    └──────────────────┘ │
│                    ┌──────────────────┐ │
│                    │ Notification 2   │ │ ← Older
│                    └──────────────────┘ │
│                                         │
│ [Main Content]                          │
│                                         │
└─────────────────────────────────────────┘
```

### Auto-Dismiss

- Default timeout: 5 seconds
- Error notifications may persist longer
- Timer resets on hover (optional)

### Manual Dismiss

- X button in top-right of each notification
- Click immediately removes notification

### Action Buttons

Some notifications include action buttons:

| Notification | Action |
|--------------|--------|
| Task created | "Vaata ülesannet" → Opens task |
| Entries added | "Vaata ülesannet" → Opens task |
| Link copied | None |

### Example Notifications

**Success:**
```
[✓] Ülesanne loodud!
    Hääldusharjutus 1 loodud ja 3 lauset lisatud!
    [Vaata ülesannet]
```

**Error:**
```
[✗] Lausete lisamine ebaõnnestus
```

**Info:**
```
[ℹ] Link kopeeritud!
```

## API

```typescript
showNotification(
  type: 'success' | 'error' | 'info' | 'warning',
  title: string,
  description?: string,
  timeout?: number,
  icon?: string,
  action?: { label: string; onClick: () => void }
);
```

## Related Test Cases

- [TC-19: Notification Display](../../02-TEST-CASES/F10-notifications/TC-19-notifications.md)

## Notes

- Implemented via NotificationContext
- NotificationContainer renders all active notifications
- Notifications are not persisted (lost on page refresh)
