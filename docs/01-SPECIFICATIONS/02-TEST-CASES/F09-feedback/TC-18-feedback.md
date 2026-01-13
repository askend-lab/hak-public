# TC-18: Feedback Submission

**User Story:** US-27  
**Feature:** F09 Feedback  
**Priority:** Medium  
**Type:** Functional

## Description

Verify feedback form submission from footer.

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] Footer visible (scroll down if needed)

## Test Data

| Field | Value |
|-------|-------|
| Message | `Rakendus töötab suurepäraselt! Aitäh.` |
| Email | `test@example.com` |

## Test Steps

### Open Feedback Modal

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Scroll to footer | Footer visible | ☐ |
| 2 | Locate "Tagasiside" section | Section with description visible | ☐ |
| 3 | Click "Kirjuta meile" button | Feedback modal opens | ☐ |
| 4 | Verify modal content | Message field and email field | ☐ |

### Submit Feedback

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Enter message: test feedback | Text in textarea | ☐ |
| 2 | Enter email: `test@example.com` | Email in input | ☐ |
| 3 | Click "Saada" | Submission triggered | ☐ |
| 4 | Verify success | Success message or modal closes | ☐ |

### Validation - Empty Message

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Open feedback modal | Modal open | ☐ |
| 2 | Leave message empty | Empty textarea | ☐ |
| 3 | Click "Saada" | Button disabled or error shown | ☐ |

### Optional Email

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Enter message only | Message in textarea | ☐ |
| 2 | Leave email empty | No email | ☐ |
| 3 | Click "Saada" | Submission succeeds | ☐ |

### Cancel Feedback

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Open modal and enter text | Content entered | ☐ |
| 2 | Click X or "Tühista" | Modal closes | ☐ |
| 3 | Reopen modal | Form is empty (not persisted) | ☐ |

### No Authentication Required

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Ensure not logged in | Anonymous user | ☐ |
| 2 | Submit feedback | Works without login | ☐ |

## Notes

- Feedback currently logged to console (no email service)
- Email field is for optional follow-up contact
- No rate limiting in prototype
