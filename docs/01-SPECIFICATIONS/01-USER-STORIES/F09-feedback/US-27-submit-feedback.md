# US-27: Submit Feedback

**Feature:** F09 Feedback  
**Priority:** Medium

## User Story

As a **user**  
I want to **submit feedback about the application**  
So that **I can help improve the service**

## Acceptance Criteria

- [ ] **AC-1:** Feedback button is visible in the footer
- [ ] **AC-2:** Clicking opens the Feedback modal
- [ ] **AC-3:** Modal has message textarea (required)
- [ ] **AC-4:** Modal has email input (optional)
- [ ] **AC-5:** "Saada" button submits feedback
- [ ] **AC-6:** Feedback is sent to `/api/feedback` endpoint
- [ ] **AC-7:** Success message shown after submission
- [ ] **AC-8:** Modal closes after successful submission
- [ ] **AC-9:** No authentication required

## UI Behavior

### Footer Access

```
┌─────────────────────────────────────────────────────────┐
│ [EKI Logo]  │ Hääldusabiline │ Sotsiaalmeedia │ Tagasiside │
│             │ - Portaaliest  │ - Facebook     │            │
│ Contact     │ - Versioon...  │ - Youtube      │ Iga arvamus│
│ info...     │ - Kasutus...   │ - LinkedIn     │ loeb!      │
│             │                │                │            │
│             │                │                │[Kirjuta    │
│             │                │                │ meile]     │
└─────────────────────────────────────────────────────────┘
```

### Feedback Modal

```
┌─────────────────────────────────────┐
│ Tagasiside                      [X]│
├─────────────────────────────────────┤
│                                     │
│ Sinu tagasiside aitab meil         │
│ teenust paremaks teha!              │
│                                     │
│ Sõnum *                             │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │ Kirjuta oma tagasiside siia... │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ E-post (valikuline)                 │
│ ┌─────────────────────────────────┐ │
│ │ nimi@näide.ee                   │ │
│ └─────────────────────────────────┘ │
│                                     │
│          [Tühista]      [Saada]    │
└─────────────────────────────────────┘
```

### Submission Flow

1. User clicks "Kirjuta meile" in footer
2. Feedback modal opens
3. User enters message (required)
4. User optionally enters email
5. User clicks "Saada"
6. Request sent to `/api/feedback`
7. On success:
   - Modal shows success message briefly
   - Modal closes
8. On error:
   - Error message displayed
   - Modal remains open

### API Request

```javascript
POST /api/feedback
{
  "message": "User's feedback text...",
  "email": "user@example.com"  // Optional
}
```

### Validation

| Field | Validation |
|-------|------------|
| Message | Required, non-empty |
| Email | Optional, valid email format if provided |

### Success State

Brief success message before modal closes:
```
┌─────────────────────────────────────┐
│                                     │
│     ✓ Aitäh tagasiside eest!       │
│                                     │
└─────────────────────────────────────┘
```

## Related Test Cases

- [TC-18: Feedback Submission](../../02-TEST-CASES/F09-feedback/TC-18-feedback.md)

## Notes

- No authentication required to submit
- Feedback currently logged (no email service connected)
- Email is for optional follow-up contact
