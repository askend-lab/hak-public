# US-26: Complete Onboarding Wizard

**Feature:** F08 Onboarding  
**Priority:** Medium

## User Story

As a **new user**  
I want to **follow guided tooltips explaining the interface**  
So that **I can learn how to use the application**

## Acceptance Criteria

- [x] **AC-1:** Wizard starts after role selection
- [x] **AC-2:** Tooltips highlight specific UI elements
- [x] **AC-3:** Each step has Next/Back navigation
- [x] **AC-4:** Wizard can be skipped at any time
- [x] **AC-5:** Completing wizard marks onboarding as done
- [x] **AC-6:** Help button (?) in header navigates to `/role-selection`
- [x] **AC-7:** Demo sentences are pre-filled during wizard
- [x] **AC-8:** Wizard overlay dims background content

## UI Behavior

### Wizard Overlay

```
┌─────────────────────────────────────────────────────────┐
│ [Header]                                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────┐                       │
│  │ [Noormees] [läks] [kooli]  │ ← Highlighted element  │
│  └─────────────────────────────┘                       │
│              ↓                                          │
│     ┌────────────────────────┐                         │
│     │ Sisesta tekst siia     │ ← Tooltip              │
│     │                        │                         │
│     │ Kirjuta sõnad ja vajuta│                         │
│     │ Enter, et kuulata      │                         │
│     │ hääldust.              │                         │
│     │                        │                         │
│     │    [Tagasi] [Edasi]    │                         │
│     └────────────────────────┘                         │
│                                                         │
│  (rest of page dimmed)                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Wizard Steps (Example)

1. **Text Input** - Explain how to enter text
2. **Play Button** - Explain synthesis and playback
3. **Word Click** - Explain variant exploration
4. **Add Sentence** - Explain multiple sentences
5. **Save to Task** - Explain task creation (if teacher role)

### Tooltip Component

```
┌────────────────────────────────────┐
│ [Mascot Icon]                      │
│                                    │
│ Step Title                         │
│                                    │
│ Explanation text that guides       │
│ the user through this feature.     │
│                                    │
│ Step 1 of 5                        │
│                                    │
│ [Jäta vahele]  [Tagasi]  [Edasi]  │
└────────────────────────────────────┘
```

### Navigation

| Button | Action |
|--------|--------|
| Edasi | Go to next step |
| Tagasi | Go to previous step |
| Jäta vahele | Skip remaining steps, mark complete |

### Demo Sentences

Pre-filled when wizard starts:
```javascript
sentences = [
  { id: 'demo-1', text: 'Noormees läks kooli', tags: ['Noormees', 'läks', 'kooli'] },
  { id: 'demo-2', text: '', tags: [] }  // Empty for user to try
];
```

### Restart Wizard

1. User clicks ? (help) button in header
2. User is navigated to `/role-selection` (localStorage is NOT cleared)
3. Role selection page appears
4. User selects a role → navigates to `/synthesis` → wizard starts
5. User can go through wizard again

### Completing Wizard

```javascript
localStorage.setItem('eki_onboarding', JSON.stringify({
  selectedRole: 'learner',
  completed: true,  // ← Set to true
  wizardStep: 5
}));
```

## Related Test Cases

- [TC-17: Onboarding Flow](../../02-TEST-CASES/F08-onboarding/TC-17-onboarding.md)

## Notes

- Wizard content may vary by role
- Elements are highlighted using data-onboarding-target attributes
- Background is interactive but dimmed
