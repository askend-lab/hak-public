# TC-17: Onboarding Flow

**User Story:** US-25, US-26  
**Feature:** F08 Onboarding  
**Priority:** Medium  
**Type:** Functional

## Description

Verify role selection and onboarding wizard for new users.

## Pre-conditions

- [ ] Application loaded at `/` or `/synthesis`
- [ ] Clear localStorage to simulate new user
- [ ] Or click help button to navigate to `/role-selection`
- [ ] Role selection page is available at `/role-selection`

## Test Steps

### Role Selection Display

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Clear localStorage and load `/` | Redirected to `/role-selection` | ☐ |
| 2 | Verify URL | URL is `/role-selection` | ☐ |
| 3 | Verify page content | Three role options displayed | ☐ |
| 4 | Verify roles | Õppija, Õpetaja, Spetsialist | ☐ |
| 5 | Verify descriptions | Each role has description | ☐ |

### Select Role

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click on "Õppija" (Learner) | Role selected | ☐ |
| 2 | Verify URL | Navigated to `/synthesis` | ☐ |
| 3 | Observe transition | Wizard starts | ☐ |
| 4 | Verify demo sentences | Pre-filled sentences appear | ☐ |

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
| 2 | Click help button (?) in header | Navigated to `/role-selection` | ☐ |
| 3 | Verify URL | URL is `/role-selection` | ☐ |
| 4 | Verify | Role selection appears | ☐ |
| 5 | Verify localStorage | `completed: true` still in localStorage (not cleared) | ☐ |

### Navigate Away from Role Selection (First-time User)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Clear localStorage and load `/` | Redirected to `/role-selection` | ☐ |
| 2 | Click "Kõnesüntees" in header nav | Navigated to `/synthesis` | ☐ |
| 3 | Verify | Synthesis page loads (NOT role selection) | ☐ |
| 4 | Reload page | Redirected back to `/role-selection` | ☐ |

### Navigate Away from Role Selection (Returning User via Help)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Complete onboarding, then click help button | Navigated to `/role-selection` | ☐ |
| 2 | Click "Ülesanded" in header nav | Navigated to `/tasks` | ☐ |
| 3 | Verify | Tasks page loads | ☐ |
| 4 | Reload page | Synthesis page loads (no redirect to role selection) | ☐ |

### Returning User

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Complete onboarding | Onboarding done | ☐ |
| 2 | Reload page | Page loads | ☐ |
| 3 | Verify | Main view loads directly (no redirect to role selection) | ☐ |

## Demo Sentences

After role selection, these sentences should be pre-filled:
- "Noormees läks kooli"
- Empty sentence for user input

## Notes

- Onboarding state persists in localStorage
- Different roles may have slightly different wizard content
- Help button always accessible in header - navigates to `/role-selection`
- Help button does NOT clear localStorage
- First-time users are only redirected to role selection on initial app load (not when navigating within the app)
- Role selection is available at `/role-selection` route
