# US-25: Select User Role

**Feature:** F08 Onboarding  
**Priority:** High

## User Story

As a **new user**  
I want to **select my role (learner, teacher, or specialist)**  
So that **the application can provide relevant guidance**

## Acceptance Criteria

- [ ] **AC-1:** Role selection is available at `/role-selection` route
- [ ] **AC-2:** First-time users are redirected to `/role-selection` when landing on synthesis
- [ ] **AC-3:** Three role options are presented: Õppija, Õpetaja, Spetsialist
- [ ] **AC-4:** Each role has a description and icon/mascot
- [ ] **AC-5:** Clicking a role navigates to `/synthesis` and starts the wizard
- [ ] **AC-6:** Role is stored in OnboardingContext
- [ ] **AC-7:** Role persists in localStorage after wizard completion
- [ ] **AC-8:** Returning users go directly to synthesis (skip role selection redirect)
- [ ] **AC-9:** Users can navigate away from role selection using header navigation
- [ ] **AC-10:** Help button navigates to `/role-selection` (does not reset localStorage)

## UI Behavior

### Role Selection Page

Full-page display replacing main content:

```
┌─────────────────────────────────────────────────────────┐
│                    Tere tulemast!                       │
│                                                         │
│            Vali oma roll, et alustada                   │
│                                                         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│  │           │  │           │  │           │           │
│  │  [Mascot] │  │  [Mascot] │  │  [Mascot] │           │
│  │           │  │           │  │           │           │
│  │  Õppija   │  │  Õpetaja  │  │Spetsialist│           │
│  │           │  │           │  │           │           │
│  │  Soovin   │  │  Loon     │  │  Uurin    │           │
│  │  õppida   │  │  harjut-  │  │  keele-   │           │
│  │  hääldust │  │  usi      │  │  tehnol.  │           │
│  │           │  │           │  │           │           │
│  └───────────┘  └───────────┘  └───────────┘           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Role Options

| Role | Estonian | Description |
|------|----------|-------------|
| Learner | Õppija | Soovin õppida eesti keele hääldust |
| Teacher | Õpetaja | Loon ja jagan hääldusharjutusi |
| Specialist | Spetsialist | Uurin keeletehnoloogilisi võimalusi |

### Selection Flow

1. New user visits site at `/` or `/synthesis`
2. OnboardingContext shows no completed onboarding
3. User is redirected to `/role-selection`
4. User clicks on a role card
5. Role is stored in context (with `completed: false`)
6. User is navigated to `/synthesis`
7. Wizard starts with role-specific content
8. Demo sentences are pre-filled

### Navigation from Role Selection

Users can navigate away from role selection using the header navigation:

- **First-time users:** Navigating away does NOT mark onboarding complete. They will be redirected back to role selection on their next visit.
- **Returning users (via help button):** Their localStorage still has `completed: true`, so they won't be redirected on next visit.

### Role Persistence

```javascript
localStorage.setItem('eki_onboarding', JSON.stringify({
  selectedRole: 'learner',
  completed: false,
  wizardStep: 0
}));
```

### Returning User

If `onboarding.completed === true` in localStorage:
- No redirect to `/role-selection` on initial app load
- Show main synthesis page directly
- Can still access `/role-selection` via help button or direct URL

## Related Test Cases

- [TC-17: Onboarding Flow](../../02-TEST-CASES/F08-onboarding/TC-17-onboarding.md)

## Notes

- Role affects wizard content
- Demo sentences pre-filled after selection
- Role can be changed via help button (navigates to `/role-selection`)
- Help button does NOT clear localStorage - returning users won't see role selection again on next visit unless they select a new role
- Redirect to role selection only happens on initial app load (not when navigating within the app)
