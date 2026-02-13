# US-24: Logout

**Feature:** F07 Authentication  
**Priority:** Medium

## User Story

As an **authenticated user**  
I want to **log out of the application**  
So that **I can end my session securely**

## Acceptance Criteria

- [x] **AC-1:** "Logi välja" option is available in profile dropdown
- [x] **AC-2:** Clicking logs out the user immediately
- [x] **AC-3:** Session is cleared from localStorage
- [x] **AC-4:** AuthContext is cleared
- [x] **AC-5:** User is redirected to Synthesis view if on protected route
- [x] **AC-6:** "Logi sisse" button reappears in header
- [x] **AC-7:** No confirmation dialog required

## UI Behavior

### Logout Access

1. User clicks on profile in header
2. Dropdown opens
3. User clicks "Logi välja"
4. User is logged out

### Logout Flow

```
Authenticated State:
[Mari ▼] → Click

Dropdown:
┌─────────────────┐
│ Mari Maasikas   │
│ Logi välja      │ ← Click
└─────────────────┘

After Logout:
[Logi sisse]      ← Button reappears
```

### Session Cleanup

On logout:
```javascript
// Clear localStorage
localStorage.removeItem('eki_user');

// Clear AuthContext
setUser(null);
setIsAuthenticated(false);
```

### Navigation After Logout

| Current View | After Logout |
|--------------|--------------|
| Synthesis | Stay on Synthesis |
| Tasks | Redirect to Synthesis |
| Task Detail | Redirect to Synthesis |

### Tasks View Protection

If user logs out while on Tasks view:
1. Logout occurs
2. User redirected to Synthesis view
3. Tasks view becomes inaccessible until re-login

## Related Test Cases

- [TC-16: Authentication Flow](../../02-TEST-CASES/F07-authentication/TC-16-authentication.md)

## Notes

- Logout is immediate (no confirmation)
- Task data remains in backend (accessible after re-login)
- No "remember me" or "logout everywhere" options
