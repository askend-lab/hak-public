# US-026: View user profile

**Feature:** F-008  
**Status:** [x] ✅ Implemented in prototype  
**Implementation:** `UserProfile.tsx`, `AuthContext.tsx`

## User Story

As an **authenticated user**  
I want to **view my profile information**  
So that **I can see my account details and settings**

## Acceptance Criteria

[x] **AC-1:** Profile access  
GIVEN I am logged in  
WHEN I click on my user icon or name  
THEN I see a dropdown or navigate to my profile page  
_Verified by:_ UserProfile dropdown with user info, logout, clear storage

[x] **AC-2:** Profile information display  
GIVEN I am viewing my profile  
WHEN the page loads  
THEN I see my isikukood, name, and account creation date  
_Verified by:_ UserProfile dropdown with user info, logout, clear storage

[x] **AC-3:** Task statistics  
GIVEN I am viewing my profile  
WHEN the page loads  
THEN I see statistics like number of tasks created and total entries  
_Verified by:_ UserProfile dropdown with user info, logout, clear storage

[x] **AC-4:** Recent activity  
GIVEN I have been using the application  
WHEN I view my profile  
THEN I see my recent tasks and activity  
_Verified by:_ UserProfile dropdown with user info, logout, clear storage

## Screenshot

![View User Profile](../screenshots/US-026-view-profile.png)

## Notes

**Reference prototype:** EKI-ui-prototype user profile view  
**Edge cases:** New users with no activity, users with many tasks

