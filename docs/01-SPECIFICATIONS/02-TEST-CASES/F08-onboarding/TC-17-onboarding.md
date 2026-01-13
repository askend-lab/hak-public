# TC-17: Onboarding Flow

**User Story:** US-25, US-26  
**Feature:** F08 Onboarding  
**Priority:** Medium  
**Type:** Functional

## Description

Verify role selection and onboarding wizard for new users.

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] Clear localStorage to simulate new user
- [ ] Or click help button to restart onboarding

## Test Steps

### Role Selection Display

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Clear localStorage and reload | Role selection page appears | ☐ |
| 2 | Verify page content | Three role options displayed | ☐ |
| 3 | Verify roles | Õppija, Õpetaja, Spetsialist | ☐ |
| 4 | Verify descriptions | Each role has description | ☐ |

### Select Role

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click on "Õppija" (Learner) | Role selected | ☐ |
| 2 | Observe transition | Wizard starts or main view loads | ☐ |
| 3 | Verify demo sentences | Pre-filled sentences appear | ☐ |

### Complete Wizard

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | If wizard tooltip appears | Tooltip visible over UI element | ☐ |
| 2 | Read tooltip content | Explanation of feature | ☐ |
| 3 | Click "Edasi" | Next tooltip appears | ☐ |
| 4 | Continue through steps | Each step highlights different feature | ☐ |
| 5 | Complete final step | Wizard ends | ☐ |
| 6 | Verify main view | Full synthesis UI accessible | ☐ |

### Skip Wizard

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | During wizard, click "Jäta vahele" | Wizard ends immediately | ☐ |
| 2 | Verify main view | Full synthesis UI accessible | ☐ |
| 3 | Verify onboarding marked complete | Won't show again | ☐ |

### Restart Onboarding

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Complete or skip onboarding | Main view visible | ☐ |
| 2 | Click help button (?) in header | Onboarding resets | ☐ |
| 3 | Verify | Role selection appears again | ☐ |

### Returning User

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Complete onboarding | Onboarding done | ☐ |
| 2 | Reload page | Page loads | ☐ |
| 3 | Verify | Main view loads directly (no role selection) | ☐ |

## Demo Sentences

After role selection, these sentences should be pre-filled:
- "Noormees läks kooli"
- Empty sentence for user input

## Notes

- Onboarding state persists in localStorage
- Different roles may have slightly different wizard content
- Help button always accessible in header
