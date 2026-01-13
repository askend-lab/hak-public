# US-25: Select User Role

**Feature:** F08 Onboarding  
**Priority:** High

## User Story

As a **new user**  
I want to **select my role (learner, teacher, or specialist)**  
So that **the application can provide relevant guidance**

## Acceptance Criteria

- [ ] **AC-1:** Role selection page appears for new users
- [ ] **AC-2:** Three role options are presented: Õppija, Õpetaja, Spetsialist
- [ ] **AC-3:** Each role has a description and icon/mascot
- [ ] **AC-4:** Clicking a role selects it
- [ ] **AC-5:** After selection, onboarding wizard starts
- [ ] **AC-6:** Role is stored in OnboardingContext
- [ ] **AC-7:** Role persists in localStorage
- [ ] **AC-8:** Returning users skip role selection

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

1. New user visits site
2. OnboardingContext shows no completed onboarding
3. Role selection page displays
4. User clicks on a role card
5. Role is stored in context
6. Wizard starts with role-specific content
7. Demo sentences are pre-filled

### Role Persistence

```javascript
localStorage.setItem('eki_onboarding', JSON.stringify({
  selectedRole: 'learner',
  completed: false,
  wizardStep: 0
}));
```

### Returning User

If `onboarding.completed === true`:
- Skip role selection
- Show main synthesis page directly

## Related Test Cases

- [TC-17: Onboarding Flow](../../02-TEST-CASES/F08-onboarding/TC-17-onboarding.md)

## Notes

- Role affects wizard content
- Demo sentences pre-filled after selection
- Role can be changed by restarting onboarding (help button)
