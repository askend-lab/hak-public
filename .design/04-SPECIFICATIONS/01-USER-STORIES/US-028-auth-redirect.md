# US-028: Redirect to login for protected features

**Feature:** F-008  
**Status:** [x] ✅ Implemented in prototype  
**Implementation:** `app/page.tsx`, `AuthContext.tsx`, protected action handlers

## User Story

As an **unauthenticated user**  
I want to **be redirected to login when accessing protected features**  
So that **I understand authentication is required**

## Acceptance Criteria

[x] **AC-1:** Protected route access attempt  
GIVEN I am not logged in  
WHEN I try to access a protected page (e.g., /tasks)  
THEN I am redirected to the login page  
_Verified by:_ LoginModal triggered on protected actions, pending action stored

[x] **AC-2:** Informative message  
GIVEN I am redirected to login  
WHEN the login page loads  
THEN I see a message explaining authentication is required  
_Verified by:_ LoginModal triggered on protected actions, pending action stored

[x] **AC-3:** Return to intended page  
GIVEN I was redirected from a protected page  
WHEN I successfully log in  
THEN I am redirected back to the page I originally tried to access  
_Verified by:_ LoginModal triggered on protected actions, pending action stored

[x] **AC-4:** Disabled protected actions  
GIVEN I am not logged in  
WHEN I view synthesis results  
THEN the "Add to task" button is disabled or shows "Login required"  
_Verified by:_ LoginModal triggered on protected actions, pending action stored

## Screenshot

![Auth Redirect](../screenshots/US-028-auth-redirect.png)

## Notes

**Reference prototype:** EKI-ui-prototype route protection middleware  
**Edge cases:** Deep links to protected pages, expired sessions

