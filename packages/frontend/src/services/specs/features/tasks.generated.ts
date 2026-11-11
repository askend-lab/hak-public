// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab
//
// AUTO-GENERATED - DO NOT EDIT
// Run: pnpm --filter @hak/frontend sync-features
// Group: tasks

export const FEATURES_TASKS: Record<string, string> = {
  'US-015-create-task': `@tasks @US-015 @ready
Feature: Create new task (US-015)
  As a language teacher
  I want to create a new pronunciation task
  So that I can organize learning materials for my students

  Background:
    Given I am authenticated
    And I am on the tasks page

  Scenario: See create task button
    Then I see a "Create new task" button

  Scenario: Open task creation form
    When I click the "Create new task" button
    Then the task creation form opens
    And I see a field for task name
    And I see a field for task description

  Scenario: Create task successfully
    When I click the "Create new task" button
    And I enter "Pronunciation Exercise 1" in the task name field
    And I enter "Basic Estonian words" in the task description field
    And I click the "Save" button
    Then the task is saved
    And I see "Pronunciation Exercise 1" in my tasks list

  Scenario: Validation error for empty name
    When I click the "Create new task" button
    And I leave the task name field empty
    And I click the "Save" button
    Then I see a validation error for task name

  Scenario: Required fields validation
    When I click the "Create new task" button
    And I enter only whitespace in task name
    And I click the "Save" button
    Then I see a validation error for required fields
`,

  'US-016-view-task-list': `@tasks @US-016 @ready
Feature: View task list (US-016)
  As a language teacher
  I want to view all my created tasks
  So that I can manage and access my pronunciation exercises

  Background:
    Given I am authenticated

  Scenario: Navigate to tasks page
    When I navigate to the tasks section
    Then I see the tasks list page

  Scenario: See empty state when no tasks
    Given I have no tasks
    When I view the tasks page
    Then I see an empty state message
    And I see instructions to create first task

  Scenario: View task card information
    Given I have a task named "Lesson 1" with description "Basic words"
    When I view the tasks page
    Then I see a task card with name "Lesson 1"
    And I see the task description "Basic words"

  Scenario: Tasks sorted by newest first
    Given I have multiple tasks
    When I view the tasks page
    Then tasks are sorted by creation date newest first
`,

  'US-017-view-task-details': `@tasks @US-017 @ready
Feature: View task details (US-017)
  As a language teacher
  I want to view detailed information about a specific task
  So that I can review and manage its content

  Background:
    Given I am authenticated

  Scenario: Navigate to task detail view
    Given I have a task in the list
    When I click on the task
    Then I see the task detail view

  Scenario: See task information
    Given I am viewing a task detail
    Then I see the task name
    And I see the task description
    And I see the creation date

  Scenario: See entries list
    Given I am viewing a task with entries
    Then I see a list of entries
    And each entry shows text and phonetic form

  Scenario: Play all entries button
    Given I am viewing a task with multiple entries
    Then I see a "Play all" button
`,

  'US-018-edit-task': `@tasks @US-018 @ready
Feature: Edit task metadata (US-018)
  As a language teacher
  I want to edit task name and description
  So that I can update task information as needed

  Background:
    Given I am authenticated
    And I am viewing task details

  Scenario: See edit button
    Then I see a "Edit" button

  Scenario: Open edit form
    When I click the "Edit" button
    Then I see the edit form
    And the form is pre-filled with task name
    And the form is pre-filled with task description

  Scenario: Save changes
    When I click the "Edit" button
    And I change the task name to "Updated Task"
    And I click the "Save" button
    Then the task name is updated to "Updated Task"

  Scenario: Cancel editing
    When I click the "Edit" button
    And I change the task name to "Changed"
    And I click the "Cancel" button
    Then the original task name is preserved

  Scenario: Validation error for empty name
    When I click the "Edit" button
    And I clear the task name field
    And I click the "Save" button
    Then I see a validation error
`,

  'US-019-delete-task': `@tasks @US-019 @ready
Feature: Delete task (US-019)
  As a language teacher
  I want to delete tasks I no longer need
  So that I can keep my task list organized

  Background:
    Given I am authenticated
    And I am viewing task details

  Scenario: See delete button
    Then I see a "Delete" button

  Scenario: Confirmation dialog appears
    When I click the "Delete" button
    Then I see a confirmation dialog

  Scenario: Confirm deletion
    When I click the "Delete" button
    And I confirm the deletion
    Then the task is deleted
    And I am redirected to task list

  Scenario: Cancel deletion
    When I click the "Delete" button
    And I cancel the deletion
    Then the task is not deleted
`,

  'US-020-add-synthesis-to-task': `@tasks @US-020
Feature: Add synthesis entries to task (US-020)
  As a language teacher
  I want to add synthesized text entries to a task
  So that I can build exercise collections for students

  Background:
    Given I am authenticated

  Scenario: See add to task button
    Given I have synthesized audio
    Then I see an "Add to task" button

  Scenario: Select task dialog
    Given I have synthesized audio
    When I click the "Add to task" button
    Then I see a task selection dialog

  Scenario: Add to existing task
    Given I have synthesized audio
    And I have an existing task
    When I click the "Add to task" button
    And I select the existing task
    Then the entry is added to the task

  Scenario: Create new task option
    Given I have synthesized audio
    When I click the "Add to task" button
    Then I see an option to create new task

  Scenario: Success notification after adding
    Given I have synthesized audio
    And I have an existing task
    When I add entry to task successfully
    Then I see a success notification

  # --- Modal behavior scenarios (prototype alignment) ---

  @skip
  Scenario: Task dialog has search functionality
    Given I have synthesized audio
    And I have multiple tasks
    When I click the "Add to task" button
    Then I see a search input in the dialog
    And the search input has placeholder "Otsi"

  @skip
  Scenario: Search filters task list
    Given I have synthesized audio
    And I have tasks named "Pronunciation" and "Grammar"
    When I click the "Add to task" button
    And I type "Pron" in the search input
    Then I only see tasks matching "Pron"

  @skip
  Scenario: Close dialog by clicking backdrop
    Given I have synthesized audio
    When I click the "Add to task" button
    And I click outside the dialog
    Then the dialog closes

  @skip
  Scenario: Dialog shows task entry count
    Given I have synthesized audio
    And I have a task with 3 entries
    When I click the "Add to task" button
    Then I see the entry count "3 kirjet" next to the task
`,

  'US-021-add-playlist-to-task': `@tasks @US-021
Feature: Add playlist entries to task (US-021)
  As a language teacher
  I want to add entire playlist to a task
  So that I can save curated pronunciation sequences as exercises

  Background:
    Given I am authenticated

  Scenario: See add playlist to task button
    Given I have entries in playlist
    Then I see an "Add all to task" button

  Scenario: Add all entries to task
    Given I have entries in playlist
    When I click the "Add all to task" button
    And I select a task
    Then all playlist entries are added to the task

  Scenario: Preserve entry order
    Given I have multiple entries in playlist
    When I add playlist to task
    Then entries maintain their original order

  Scenario: Success notification after adding playlist
    Given I have entries in playlist
    When I add playlist to task successfully
    Then I see a success notification
`,

  'US-048-task-search 2': `@ready @tasks @search @US-048
Feature: Search and filter tasks in sentence menu (US-048)
  As a language learner with many tasks
  I want to search for specific tasks in the sentence menu
  So that I can quickly find and add sentences to the right task

  Background:
    Given I am authenticated
    And I am on the synthesis page
    And I have a sentence "Tere"

  Scenario: See search input in task menu
    When I click the three-dots menu on a sentence
    Then I see a search input field for tasks

  Scenario: Filter tasks by name
    When I click the three-dots menu on a sentence
    And I type "Harjutus" in the search input
    Then I see only tasks matching "Harjutus"

  Scenario: No results for search query
    When I click the three-dots menu on a sentence
    And I type "nonexistent" in the search input
    Then I see no matching tasks

  Scenario: Create new task from menu
    When I click the three-dots menu on a sentence
    And I click "Loo uus ülesanne"
    Then a new task is created with the sentence
`,

  'US-048-task-search': `@ready @tasks @search @US-048
Feature: Search and filter tasks in sentence menu (US-048)
  As a language learner with many tasks
  I want to search for specific tasks in the sentence menu
  So that I can quickly find and add sentences to the right task

  Background:
    Given I am authenticated
    And I am on the synthesis page
    And I have a sentence "Tere"

  Scenario: See search input in task menu
    When I click the three-dots menu on a sentence
    Then I see a search input field for tasks

  Scenario: Filter tasks by name
    When I click the three-dots menu on a sentence
    And I type "Harjutus" in the search input
    Then I see only tasks matching "Harjutus"

  Scenario: No results for search query
    When I click the three-dots menu on a sentence
    And I type "nonexistent" in the search input
    Then I see no matching tasks

  Scenario: Create new task from menu
    When I click the three-dots menu on a sentence
    And I click "Loo uus ülesanne"
    Then a new task is created with the sentence
`,

  'US-050-task-entries-management 2': `@ready @tasks @entries @US-050
Feature: Manage entries within a task (US-050)
  As a language teacher
  I want to manage individual entries within a task
  So that I can curate the best pronunciation exercises

  Background:
    Given I am authenticated
    And I am viewing a task with entries

  Scenario: See task entries list
    Then I see all entries in the task
    And each entry shows its text content

  Scenario: Play entry audio from task view
    When I click the play button on an entry
    Then the audio for that entry is synthesized and played

  Scenario: Remove entry from task
    When I click remove on an entry
    Then the entry is removed from the task

  Scenario: Empty task shows helpful message
    Given I am viewing an empty task
    Then I see a message suggesting to add entries
    And I see a link to the synthesis page
`,

  'US-050-task-entries-management': `@ready @tasks @entries @US-050
Feature: Manage entries within a task (US-050)
  As a language teacher
  I want to manage individual entries within a task
  So that I can curate the best pronunciation exercises

  Background:
    Given I am authenticated
    And I am viewing a task with entries

  Scenario: See task entries list
    Then I see all entries in the task
    And each entry shows its text content

  Scenario: Play entry audio from task view
    When I click the play button on an entry
    Then the audio for that entry is synthesized and played

  Scenario: Remove entry from task
    When I click remove on an entry
    Then the entry is removed from the task

  Scenario: Empty task shows helpful message
    Given I am viewing an empty task
    Then I see a message suggesting to add entries
    And I see a link to the synthesis page
`,

  'US-054-task-edit-modal 2': `@ready @tasks @edit @US-054
Feature: Edit task via modal form (US-054)
  As a language teacher
  I want to edit task name and description via a modal form
  So that I can update task information without leaving the page

  Background:
    Given I am authenticated
    And I have a task in the list

  Scenario: Open task edit modal
    When I click the edit button on a task
    Then the task edit modal opens
    And the fields are pre-filled with current values

  Scenario: Save edited task name
    Given the task edit modal is open
    When I change the task name to "Updated Name"
    And I click the "Salvesta" button
    Then the task is updated with the new name

  Scenario: Validation error for empty name in edit
    Given the task edit modal is open
    When I clear the task name field
    And I click the "Salvesta" button
    Then I see "Ülesande nimi on kohustuslik" error

  Scenario: Cancel editing without saving
    Given the task edit modal is open
    When I close the modal without saving
    Then the task remains unchanged
`,

  'US-054-task-edit-modal': `@ready @tasks @edit @US-054
Feature: Edit task via modal form (US-054)
  As a language teacher
  I want to edit task name and description via a modal form
  So that I can update task information without leaving the page

  Background:
    Given I am authenticated
    And I have a task in the list

  Scenario: Open task edit modal
    When I click the edit button on a task
    Then the task edit modal opens
    And the fields are pre-filled with current values

  Scenario: Save edited task name
    Given the task edit modal is open
    When I change the task name to "Updated Name"
    And I click the "Salvesta" button
    Then the task is updated with the new name

  Scenario: Validation error for empty name in edit
    Given the task edit modal is open
    When I clear the task name field
    And I click the "Salvesta" button
    Then I see "Ülesande nimi on kohustuslik" error

  Scenario: Cancel editing without saving
    Given the task edit modal is open
    When I close the modal without saving
    Then the task remains unchanged
`,

  'US-065-add-entry-modal 2': `@ready @tasks @modal @US-065
Feature: Add new task entry via modal (US-065)
  As a language teacher
  I want to add new entries to a task via a modal form
  So that I can build exercise collections efficiently

  Scenario: Open add entry modal
    Given I am viewing a task detail
    When I click the "Add entry" button
    Then the add entry modal opens

  Scenario: Add entry successfully
    Given the add entry modal is open
    When I enter "Tere tulemast" in the title field
    And I enter a description
    And I click "Lisa"
    Then the entry is added to the task
    And the modal closes

  Scenario: Validation error for empty title
    Given the add entry modal is open
    When I leave the title field empty
    And I click "Lisa"
    Then I see "Pealkiri on kohustuslik" error

  Scenario: Show loading state during submission
    Given the add entry modal is open
    When I submit the form
    Then the button shows "Lisaan..." loading text
    And the form fields are disabled
`,

  'US-065-add-entry-modal': `@ready @tasks @modal @US-065
Feature: Add new task entry via modal (US-065)
  As a language teacher
  I want to add new entries to a task via a modal form
  So that I can build exercise collections efficiently

  Scenario: Open add entry modal
    Given I am viewing a task detail
    When I click the "Add entry" button
    Then the add entry modal opens

  Scenario: Add entry successfully
    Given the add entry modal is open
    When I enter "Tere tulemast" in the title field
    And I enter a description
    And I click "Lisa"
    Then the entry is added to the task
    And the modal closes

  Scenario: Validation error for empty title
    Given the add entry modal is open
    When I leave the title field empty
    And I click "Lisa"
    Then I see "Pealkiri on kohustuslik" error

  Scenario: Show loading state during submission
    Given the add entry modal is open
    When I submit the form
    Then the button shows "Lisaan..." loading text
    And the form fields are disabled
`,

  'US-067-task-data-operations 2': `@ready @tasks @data @US-067
Feature: Task CRUD data operations (US-067)
  As an authenticated user
  I want the data service to handle task operations reliably
  So that my tasks are created, read, updated, and deleted correctly

  Background:
    Given I am authenticated

  Scenario: Create task with entries
    When I create a task with name and description
    Then the task is saved with a unique ID
    And the task has a creation timestamp

  Scenario: Retrieve user tasks list
    Given I have multiple tasks
    When I request my task list
    Then I see all my tasks as summaries
    And each summary shows entry count

  Scenario: Update task metadata
    Given I have an existing task
    When I update the task name and description
    Then the task is updated with new values
    And the updated timestamp changes

  Scenario: Delete task permanently
    Given I have an existing task
    When I delete the task
    Then the task is no longer in my task list
`,

  'US-067-task-data-operations': `@ready @tasks @data @US-067
Feature: Task CRUD data operations (US-067)
  As an authenticated user
  I want the data service to handle task operations reliably
  So that my tasks are created, read, updated, and deleted correctly

  Background:
    Given I am authenticated

  Scenario: Create task with entries
    When I create a task with name and description
    Then the task is saved with a unique ID
    And the task has a creation timestamp

  Scenario: Retrieve user tasks list
    Given I have multiple tasks
    When I request my task list
    Then I see all my tasks as summaries
    And each summary shows entry count

  Scenario: Update task metadata
    Given I have an existing task
    When I update the task name and description
    Then the task is updated with new values
    And the updated timestamp changes

  Scenario: Delete task permanently
    Given I have an existing task
    When I delete the task
    Then the task is no longer in my task list
`,

  'US-070-task-detail-header-menu 2': `@ready @tasks @detail @US-070
Feature: Task detail header with actions menu (US-070)
  As a language teacher viewing task details
  I want to access edit, share, and delete actions from the header
  So that I can manage the task without leaving the detail view

  Background:
    Given I am authenticated
    And I am viewing a task with entries

  Scenario: See task header with actions
    Then I see the task name as the page title
    And I see Share and Play All buttons
    And I see a more options menu button

  Scenario: Open header options menu
    When I click the more options button
    Then I see "Muuda" and "Kustuta" options

  Scenario: Edit task from detail header
    When I click the more options button
    And I click "Muuda"
    Then the task edit form opens

  Scenario: Delete task from detail header
    When I click the more options button
    And I click "Kustuta"
    Then a delete confirmation dialog appears

  Scenario: Share task from detail header
    When I click the "Jaga" button
    Then the share task modal opens
`,

  'US-070-task-detail-header-menu': `@ready @tasks @detail @US-070
Feature: Task detail header with actions menu (US-070)
  As a language teacher viewing task details
  I want to access edit, share, and delete actions from the header
  So that I can manage the task without leaving the detail view

  Background:
    Given I am authenticated
    And I am viewing a task with entries

  Scenario: See task header with actions
    Then I see the task name as the page title
    And I see Share and Play All buttons
    And I see a more options menu button

  Scenario: Open header options menu
    When I click the more options button
    Then I see "Muuda" and "Kustuta" options

  Scenario: Edit task from detail header
    When I click the more options button
    And I click "Muuda"
    Then the task edit form opens

  Scenario: Delete task from detail header
    When I click the more options button
    And I click "Kustuta"
    Then a delete confirmation dialog appears

  Scenario: Share task from detail header
    When I click the "Jaga" button
    Then the share task modal opens
`,

  'US-071-task-entry-actions 2': `@ready @tasks @entries @US-071
Feature: Task entry row actions (US-071)
  As a language teacher viewing task details
  I want to perform actions on individual entries via a row menu
  So that I can manage each sentence in the task

  Background:
    Given I am authenticated
    And I am viewing a task with entries

  Scenario: Open entry row menu
    When I click the menu button on an entry
    Then I see options for the entry

  Scenario: Copy entry text to clipboard
    When I click "Kopeeri tekst" on an entry
    Then the entry text is copied to clipboard
    And I see a success notification

  Scenario: Delete entry from task
    When I click "Kustuta" on an entry
    Then the entry is removed from the task
    And I see a confirmation notification

  Scenario: Explore phonetic form of entry
    When I click "Uuri häälduskuju" on an entry
    Then the phonetic panel opens for that entry
`,

  'US-071-task-entry-actions': `@ready @tasks @entries @US-071
Feature: Task entry row actions (US-071)
  As a language teacher viewing task details
  I want to perform actions on individual entries via a row menu
  So that I can manage each sentence in the task

  Background:
    Given I am authenticated
    And I am viewing a task with entries

  Scenario: Open entry row menu
    When I click the menu button on an entry
    Then I see options for the entry

  Scenario: Copy entry text to clipboard
    When I click "Kopeeri tekst" on an entry
    Then the entry text is copied to clipboard
    And I see a success notification

  Scenario: Delete entry from task
    When I click "Kustuta" on an entry
    Then the entry is removed from the task
    And I see a confirmation notification

  Scenario: Explore phonetic form of entry
    When I click "Uuri häälduskuju" on an entry
    Then the phonetic panel opens for that entry
`,

  'US-072-task-entry-drag-drop 2': `@ready @tasks @drag-drop @US-072
Feature: Reorder task entries via drag and drop (US-072)
  As a language teacher
  I want to reorder entries in a task by dragging them
  So that I can arrange exercises in the optimal learning order

  Background:
    Given I am authenticated
    And I am viewing a task with entries

  Scenario: Start dragging an entry
    When I start dragging an entry
    Then the entry shows a dragging visual indicator

  Scenario: See drop target while dragging
    Given I am dragging an entry
    When I hover over another entry
    Then the target entry shows a drop indicator

  Scenario: Drop entry to reorder
    Given I am dragging an entry
    When I drop it on another entry position
    Then the entries are reordered
    And the new order is persisted

  Scenario: Cancel drag operation
    Given I am dragging an entry
    When I release outside a valid drop target
    Then the entries return to their original order
`,

  'US-072-task-entry-drag-drop': `@ready @tasks @drag-drop @US-072
Feature: Reorder task entries via drag and drop (US-072)
  As a language teacher
  I want to reorder entries in a task by dragging them
  So that I can arrange exercises in the optimal learning order

  Background:
    Given I am authenticated
    And I am viewing a task with entries

  Scenario: Start dragging an entry
    When I start dragging an entry
    Then the entry shows a dragging visual indicator

  Scenario: See drop target while dragging
    Given I am dragging an entry
    When I hover over another entry
    Then the target entry shows a drop indicator

  Scenario: Drop entry to reorder
    Given I am dragging an entry
    When I drop it on another entry position
    Then the entries are reordered
    And the new order is persisted

  Scenario: Cancel drag operation
    Given I am dragging an entry
    When I release outside a valid drop target
    Then the entries return to their original order
`,

  'US-073-task-entry-variants 2': `@ready @tasks @variants @US-073
Feature: View pronunciation variants for task entries (US-073)
  As a language teacher viewing task details
  I want to see pronunciation variants for words in task entries
  So that I can verify correct pronunciation is used

  Background:
    Given I am authenticated
    And I am viewing a task with entries

  Scenario: Click word tag to see variants
    When I click on a word tag in a task entry
    Then the pronunciation variants panel opens
    And variants for that word are loaded

  Scenario: Use variant to update entry
    Given the variants panel is open for a task entry
    When I select a variant to use
    Then the word in the entry is updated
    And the change is persisted to the task

  Scenario: Close variants panel in task view
    Given the variants panel is open for a task entry
    When I close the variants panel
    Then the panel closes
    And the entry remains unchanged
`,

  'US-073-task-entry-variants': `@ready @tasks @variants @US-073
Feature: View pronunciation variants for task entries (US-073)
  As a language teacher viewing task details
  I want to see pronunciation variants for words in task entries
  So that I can verify correct pronunciation is used

  Background:
    Given I am authenticated
    And I am viewing a task with entries

  Scenario: Click word tag to see variants
    When I click on a word tag in a task entry
    Then the pronunciation variants panel opens
    And variants for that word are loaded

  Scenario: Use variant to update entry
    Given the variants panel is open for a task entry
    When I select a variant to use
    Then the word in the entry is updated
    And the change is persisted to the task

  Scenario: Close variants panel in task view
    Given the variants panel is open for a task entry
    When I close the variants panel
    Then the panel closes
    And the entry remains unchanged
`,

  'US-074-task-detail-states 2': `@ready @tasks @detail @US-074
Feature: Task detail view states (US-074)
  As a language teacher
  I want the task detail view to handle different states
  So that I see appropriate feedback for loading, errors, and empty tasks

  Background:
    Given I am authenticated

  Scenario: Show loading state while fetching task
    When I navigate to a task detail page
    Then I see a loading indicator
    And I see a back button

  Scenario: Show error when task not found
    When I navigate to a non-existent task
    Then I see "Ülesannet ei leitud" error message
    And I see a back button

  Scenario: Show empty state for task without entries
    Given I am viewing an empty task
    Then I see the empty state illustration
    And I see a "Hakkan sisu looma" button
    And I can navigate to synthesis from the empty state

  Scenario: Show error when not authenticated
    Given I am not authenticated
    When I try to access a task detail
    Then I see "Kasutaja pole sisse logitud" error
`,

  'US-074-task-detail-states': `@ready @tasks @detail @US-074
Feature: Task detail view states (US-074)
  As a language teacher
  I want the task detail view to handle different states
  So that I see appropriate feedback for loading, errors, and empty tasks

  Background:
    Given I am authenticated

  Scenario: Show loading state while fetching task
    When I navigate to a task detail page
    Then I see a loading indicator
    And I see a back button

  Scenario: Show error when task not found
    When I navigate to a non-existent task
    Then I see "Ülesannet ei leitud" error message
    And I see a back button

  Scenario: Show empty state for task without entries
    Given I am viewing an empty task
    Then I see the empty state illustration
    And I see a "Hakkan sisu looma" button
    And I can navigate to synthesis from the empty state

  Scenario: Show error when not authenticated
    Given I am not authenticated
    When I try to access a task detail
    Then I see "Kasutaja pole sisse logitud" error
`,

  'US-076-task-list-row 2': `@ready @tasks @list @US-076
Feature: Task list row with expandable description (US-076)
  As a language teacher
  I want to see task summaries in a list with expandable details
  So that I can quickly scan and manage my tasks

  Background:
    Given I am authenticated
    And I am on the tasks page
    And I have multiple tasks

  Scenario: See task row with name and meta
    Then each task row shows the task name
    And each row shows the entry count
    And each row shows the creation date

  Scenario: Expand truncated description
    Given a task has a long description
    When I click "Näita rohkem"
    Then the full description is revealed

  Scenario: Collapse expanded description
    Given a task description is expanded
    When I click "Näita vähem"
    Then the description is truncated again

  Scenario: Click task row to view details
    When I click on a task row
    Then I navigate to the task detail view

  Scenario: Open task row context menu
    When I click the more options button on a task row
    Then I see options for "Muuda", "Jaga", and "Kustuta"
`,

  'US-076-task-list-row': `@ready @tasks @list @US-076
Feature: Task list row with expandable description (US-076)
  As a language teacher
  I want to see task summaries in a list with expandable details
  So that I can quickly scan and manage my tasks

  Background:
    Given I am authenticated
    And I am on the tasks page
    And I have multiple tasks

  Scenario: See task row with name and meta
    Then each task row shows the task name
    And each row shows the entry count
    And each row shows the creation date

  Scenario: Expand truncated description
    Given a task has a long description
    When I click "Näita rohkem"
    Then the full description is revealed

  Scenario: Collapse expanded description
    Given a task description is expanded
    When I click "Näita vähem"
    Then the description is truncated again

  Scenario: Click task row to view details
    When I click on a task row
    Then I navigate to the task detail view

  Scenario: Open task row context menu
    When I click the more options button on a task row
    Then I see options for "Muuda", "Jaga", and "Kustuta"
`,

  'US-077-tasks-empty-state 2': `@ready @tasks @empty @US-077
Feature: Tasks page empty and error states (US-077)
  As an authenticated user with no tasks
  I want to see helpful guidance when my task list is empty
  So that I know how to get started creating tasks

  Background:
    Given I am authenticated

  Scenario: Show empty state when no tasks exist
    Given I have no tasks
    When I navigate to the tasks page
    Then I see an empty state message
    And I see a "Create new task" button

  Scenario: Show loading while fetching tasks
    When I navigate to the tasks page
    Then I see a loading indicator while tasks are being fetched

  Scenario: Show error when task loading fails
    Given the task API is unavailable
    When I navigate to the tasks page
    Then I see an error message
`,

  'US-077-tasks-empty-state': `@ready @tasks @empty @US-077
Feature: Tasks page empty and error states (US-077)
  As an authenticated user with no tasks
  I want to see helpful guidance when my task list is empty
  So that I know how to get started creating tasks

  Background:
    Given I am authenticated

  Scenario: Show empty state when no tasks exist
    Given I have no tasks
    When I navigate to the tasks page
    Then I see an empty state message
    And I see a "Create new task" button

  Scenario: Show loading while fetching tasks
    When I navigate to the tasks page
    Then I see a loading indicator while tasks are being fetched

  Scenario: Show error when task loading fails
    Given the task API is unavailable
    When I navigate to the tasks page
    Then I see an error message
`,

  'US-083-add-all-sentences-to-task 2': `@ready @tasks @bulk @US-083
Feature: Add all playlist sentences to a task (US-083)
  As a language teacher
  I want to add all current playlist sentences to a task at once
  So that I can quickly save my work as a reusable exercise

  Background:
    Given I am authenticated
    And I am on the synthesis page
    And I have multiple sentences with text

  Scenario: See add all to task button
    Then I see a "Lisa ülesandesse" button

  Scenario: Add all sentences to existing task
    When I click "Lisa ülesandesse"
    And I select an existing task from the dropdown
    Then all sentences are added to that task
    And I see a success notification

  Scenario: Create new task from all sentences
    When I click "Lisa ülesandesse"
    And I click "Loo uus ülesanne"
    Then a new task is created with all sentences
    And I am redirected to the tasks view

  Scenario: Button disabled when no text entered
    Given all sentence inputs are empty
    Then the "Lisa ülesandesse" button is disabled
`,

  'US-083-add-all-sentences-to-task': `@ready @tasks @bulk @US-083
Feature: Add all playlist sentences to a task (US-083)
  As a language teacher
  I want to add all current playlist sentences to a task at once
  So that I can quickly save my work as a reusable exercise

  Background:
    Given I am authenticated
    And I am on the synthesis page
    And I have multiple sentences with text

  Scenario: See add all to task button
    Then I see a "Lisa ülesandesse" button

  Scenario: Add all sentences to existing task
    When I click "Lisa ülesandesse"
    And I select an existing task from the dropdown
    Then all sentences are added to that task
    And I see a success notification

  Scenario: Create new task from all sentences
    When I click "Lisa ülesandesse"
    And I click "Loo uus ülesanne"
    Then a new task is created with all sentences
    And I am redirected to the tasks view

  Scenario: Button disabled when no text entered
    Given all sentence inputs are empty
    Then the "Lisa ülesandesse" button is disabled
`,

  'US-097-task-share-from-list 2': `@ready @tasks @sharing @US-097
Feature: Share task from task list (US-097)
  As a language teacher
  I want to share a task directly from the task list
  So that I can quickly distribute exercises without opening details

  Background:
    Given I am authenticated
    And I am on the tasks page
    And I have a task in the list

  Scenario: Share from task row menu
    When I click the more options button on a task
    And I click "Jaga"
    Then the share modal opens for that task

  Scenario: Task gets a share token on first share
    Given my task has no share token yet
    When I share the task
    Then a share token is generated and assigned

  Scenario: Share token persists after first share
    Given my task already has a share token
    When I share the task again
    Then the same share token is used
`,

  'US-097-task-share-from-list': `@ready @tasks @sharing @US-097
Feature: Share task from task list (US-097)
  As a language teacher
  I want to share a task directly from the task list
  So that I can quickly distribute exercises without opening details

  Background:
    Given I am authenticated
    And I am on the tasks page
    And I have a task in the list

  Scenario: Share from task row menu
    When I click the more options button on a task
    And I click "Jaga"
    Then the share modal opens for that task

  Scenario: Task gets a share token on first share
    Given my task has no share token yet
    When I share the task
    Then a share token is generated and assigned

  Scenario: Share token persists after first share
    Given my task already has a share token
    When I share the task again
    Then the same share token is used
`,

  'US-099-task-entry-text-update 2': `@ready @tasks @entries @US-099
Feature: Update task entry text and stressed text (US-099)
  As a language teacher
  I want to update the text of individual task entries
  So that I can correct or improve exercise content

  Background:
    Given I am authenticated
    And I am viewing a task with entries

  Scenario: Update entry stressed text via phonetic panel
    When I open the phonetic panel for an entry
    And I edit the phonetic text
    And I click "Rakenda"
    Then the entry's stressed text is updated
    And the change is persisted to storage

  Scenario: Update entry via variant selection
    When I click a word tag in an entry
    And I select a pronunciation variant
    Then the entry text reflects the chosen variant
    And the task is saved with updated content

  Scenario: Revert on save failure
    Given I updated an entry locally
    When the save to backend fails
    Then the entry reverts to its previous value
    And I see an error notification
`,

  'US-099-task-entry-text-update': `@ready @tasks @entries @US-099
Feature: Update task entry text and stressed text (US-099)
  As a language teacher
  I want to update the text of individual task entries
  So that I can correct or improve exercise content

  Background:
    Given I am authenticated
    And I am viewing a task with entries

  Scenario: Update entry stressed text via phonetic panel
    When I open the phonetic panel for an entry
    And I edit the phonetic text
    And I click "Rakenda"
    Then the entry's stressed text is updated
    And the change is persisted to storage

  Scenario: Update entry via variant selection
    When I click a word tag in an entry
    And I select a pronunciation variant
    Then the entry text reflects the chosen variant
    And the task is saved with updated content

  Scenario: Revert on save failure
    Given I updated an entry locally
    When the save to backend fails
    Then the entry reverts to its previous value
    And I see an error notification
`,

  'US-101-add-sentences-append-replace': `@ready @tasks @bulk @US-101
Feature: Append or replace sentences when adding to existing task (US-101)
  As a language teacher
  I want to choose between appending and replacing sentences when adding to an existing task
  So that I can either extend the task or start fresh with new content

  Background:
    Given I am authenticated
    And I am on the synthesis page
    And I have multiple sentences with text
    And there is an existing task "ccc" with 1 sentence

  Scenario: See append and replace options when task has entries
    When I click "Lisa ülesandesse"
    And I select the existing task "ccc"
    Then I see the task has 1 existing sentence
    And I see a "Lisa juurde" button
    And I see a "Asenda olemasolevad" button

  Scenario: Append sentences to existing task
    When I click "Lisa ülesandesse"
    And I select the existing task "ccc"
    And I click "Lisa juurde"
    Then the new sentences are added after existing ones
    And the task now has both old and new sentences
    And I see a success notification

  Scenario: Replace sentences in existing task
    When I click "Lisa ülesandesse"
    And I select the existing task "ccc"
    And I click "Asenda olemasolevad"
    Then all existing sentences are removed
    And only the new sentences remain in the task
    And I see a success notification

  Scenario: Append preserves sentence order
    When I append 2 sentences to a task with 1 existing sentence
    Then the existing sentence keeps order 1
    And the new sentences have orders 2 and 3

  Scenario: Replace resets sentence order
    When I replace sentences in a task with 2 new sentences
    Then the new sentences have orders 1 and 2

  Scenario: Default behavior is append
    When I add sentences to a task without specifying mode
    Then the sentences are appended to the existing ones
`,
};
