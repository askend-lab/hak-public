# US-020: Add synthesis entries to task

**Feature:** F-005  
**Status:** [x] ✅ Implemented in prototype  
**Implementation:** `app/page.tsx`, `TaskCreationModal.tsx`

## User Story

As a **language teacher**  
I want to **add synthesized text entries to a task**  
So that **I can build exercise collections for students**

## Acceptance Criteria

[x] **AC-1:** Add to task button display  
GIVEN I have synthesized audio in the results section  
WHEN synthesis is complete  
THEN I see an "Add to task" button  
_Verified by:_ "Add to task" button in synthesis view, creates/updates task with entry

[x] **AC-2:** Task selection dialog  
GIVEN I click "Add to task"  
WHEN the button is clicked  
THEN I see a dialog listing my existing tasks  
_Verified by:_ "Add to task" button in synthesis view, creates/updates task with entry

[x] **AC-3:** Add to existing task  
GIVEN I select a task from the list  
WHEN I confirm the selection  
THEN the synthesized entry is added to the selected task  
_Verified by:_ "Add to task" button in synthesis view, creates/updates task with entry

[x] **AC-4:** Create new task option  
GIVEN the task selection dialog is open  
WHEN I click "Create new task"  
THEN I can create a new task and add the entry to it  
_Verified by:_ "Add to task" button in synthesis view, creates/updates task with entry

[x] **AC-5:** Success notification  
GIVEN I have added an entry to a task  
WHEN the operation completes  
THEN I see a success notification  
_Verified by:_ "Add to task" button in synthesis view, creates/updates task with entry

## Screenshot

![Add Synthesis to Task](../screenshots/US-020-add-synthesis-to-task.png)

## Notes

**Reference prototype:** EKI-ui-prototype add to task functionality  
**Edge cases:** No existing tasks, authentication required, network errors

