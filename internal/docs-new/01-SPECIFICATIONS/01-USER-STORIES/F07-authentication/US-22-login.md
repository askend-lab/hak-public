# US-22: Login with eID

**Feature:** F07 Authentication  
**Priority:** Critical

## User Story

As a **registered user**  
I want to **log in using my Estonian eID (isikukood)**  
So that **I can access task management features**

## Acceptance Criteria

- [x] **AC-1:** "Logi sisse" button is visible in header when not authenticated
- [x] **AC-2:** Clicking opens the Login modal
- [x] **AC-3:** Modal offers three authentication method tabs: Smart-ID, Mobiil-ID, ID-kaart
- [x] **AC-4:** Isikukood (personal ID code) input field is available
- [x] **AC-5:** Input validates isikukood format
- [x] **AC-6:** Invalid format shows error message
- [x] **AC-7:** Valid credentials authenticate user
- [x] **AC-8:** Session persists in localStorage
- [x] **AC-9:** User profile appears in header after login
- [x] **AC-10:** Login modal closes after successful authentication

## UI Behavior

### Login Button

Located in header, right side:
```
[Logo]  [Kõnesüntees] [Ülesanded]     [?] [Logi sisse] [☰]
```

### Login Modal

```
┌─────────────────────────────────────┐
│ Logi sisse                      [X]│
├─────────────────────────────────────┤
│                                     │
│ Sisene, et luua ja hallata         │
│ ülesandeid                          │
│                                     │
│ ┌─────────┬─────────┬─────────────┐ │
│ │Smart-ID │Mobiil-ID│  ID-kaart   │ │ ← Tabs
│ └─────────┴─────────┴─────────────┘ │
│                                     │
│ Isikukood                           │
│ ┌─────────────────────────────────┐ │
│ │ 39901010011                     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Viga: Vale isikukoodi formaat]    │ ← Error if invalid
│                                     │
│               [Sisene]              │
└─────────────────────────────────────┘
```

### Isikukood Validation

Estonian personal ID code format:
- 11 digits
- First digit: gender + century (1-6)
- Positions 2-7: birth date (YYMMDD)
- Positions 8-10: sequence number
- Position 11: checksum

Valid examples: `39901010011`, `49901010012`
Invalid examples: `12345678901` (wrong checksum), `1234` (too short)

### Authentication Flow

1. User enters isikukood
2. User selects authentication method (tab)
3. User clicks "Sisene"
4. System validates format
5. If invalid: Show error, remain on modal
6. If valid: Authenticate against mock user database
7. If user not found: Show error
8. If authenticated: 
   - Store user in AuthContext
   - Store session in localStorage
   - Close modal
   - Show user profile in header

### Session Persistence

After successful login:
```javascript
localStorage.setItem('eki_user', JSON.stringify({
  id: 'user-123',
  name: 'Mari Maasikas',
  isikukood: '49901010012'
}));
```

On page load:
- Check localStorage for existing session
- Restore AuthContext if session exists

## Error Messages

| Condition | Message |
|-----------|---------|
| Empty input | "Sisesta isikukood" |
| Wrong format | "Vale isikukoodi formaat" |
| User not found | "Kasutajat ei leitud" |

## Related Test Cases

- [TC-16: Authentication Flow](../../02-TEST-CASES/F07-authentication/TC-16-authentication.md)

## Notes

- Current implementation uses mock user database
- Real eID integration pending for production
- Smart-ID/Mobiil-ID/ID-kaart tabs are visual only (same flow currently)
