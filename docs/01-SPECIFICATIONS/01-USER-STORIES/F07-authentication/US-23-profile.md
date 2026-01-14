# US-23: View User Profile

**Feature:** F07 Authentication  
**Priority:** Medium

## User Story

As an **authenticated user**  
I want to **see my profile information**  
So that **I know I am logged in correctly**

## Acceptance Criteria

- [ ] **AC-1:** User name is visible in header when authenticated
- [ ] **AC-2:** Profile area shows user's name
- [ ] **AC-3:** Profile dropdown/menu is accessible
- [ ] **AC-4:** Logout option is available
- [ ] **AC-5:** Profile replaces "Logi sisse" button

## UI Behavior

### Header When Authenticated

```
[Logo]  [Kõnesüntees] [Ülesanded]     [?] [Mari ▼] [☰]
                                           ↑
                                     UserProfile component
```

### Profile Display

UserProfile component shows:
- User's first name or full name
- Dropdown indicator (▼)

### Profile Dropdown

```
     [Mari ▼]
         ↓
┌─────────────────┐
│ Mari Maasikas   │ ← Full name
│ 499010xxxxx     │ ← Masked isikukood
├─────────────────┤
│ Logi välja      │ ← Logout action
└─────────────────┘
```

### Profile Information

| Field | Value | Notes |
|-------|-------|-------|
| Name | Mari Maasikas | Full name |
| Isikukood | 499010xxxxx | Partially masked |

## State Management

User data from AuthContext:
```typescript
interface User {
  id: string;
  name: string;
  isikukood: string;
}
```

## Related Test Cases

- [TC-16: Authentication Flow](../../02-TEST-CASES/F07-authentication/TC-16-authentication.md)

## Notes

- Profile is visible only when authenticated
- Clicking profile opens dropdown
- Mobile may show abbreviated version
