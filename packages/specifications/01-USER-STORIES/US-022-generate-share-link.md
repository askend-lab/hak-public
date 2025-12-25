# US-022: Generate shareable link for task

**Feature:** F-006  
**Status:** [x] ✅ Implemented in prototype  
**Implementation:** `ShareTaskModal.tsx`, `DataService.ts`

## User Story

As a **language teacher**  
I want to **generate a shareable link for my task**  
So that **I can distribute exercises to students**

## Acceptance Criteria

[x] **AC-1:** Share button display  
GIVEN I am viewing task details  
WHEN the page loads  
THEN I see a "Share" button  
_Verified by:_ ShareTaskModal with unique share token and copy-to-clipboard

[x] **AC-2:** Generate unique link  
GIVEN I click the "Share" button  
WHEN the button is clicked  
THEN a unique shareable URL is generated for the task  
_Verified by:_ ShareTaskModal with unique share token and copy-to-clipboard

[x] **AC-3:** Display share link  
GIVEN a share link has been generated  
WHEN generation completes  
THEN the link is displayed in a dialog with copy button  
_Verified by:_ ShareTaskModal with unique share token and copy-to-clipboard

[x] **AC-4:** Copy link to clipboard  
GIVEN the share link is displayed  
WHEN I click "Copy link"  
THEN the URL is copied to my clipboard  
_Verified by:_ ShareTaskModal with unique share token and copy-to-clipboard

[x] **AC-5:** Link persistence  
GIVEN a task has been shared  
WHEN I return to the task later  
THEN the same share link is available  
_Verified by:_ ShareTaskModal with unique share token and copy-to-clipboard

## Screenshot

![Generate Share Link](../screenshots/US-022-generate-share-link.png)

## Notes

**Reference prototype:** EKI-ui-prototype task sharing functionality  
**Edge cases:** Link expiration, access revocation, multiple share links

