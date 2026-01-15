/* eslint-disable max-lines */
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

  'US-033-baseline-tasks': `@tasks @baseline @US-033
Feature: US-033 Baseline tasks access
  As a new user
  I want to see example tasks when I first log in
  So that I understand how to use the application and can practice immediately

  Background:
    Given I am authenticated as a new user

  Scenario: Baseline tasks visible to all users
    When I navigate to the Tasks view
    Then I see pre-loaded example tasks
    And I see baseline tasks in the list

  Scenario: Baseline tasks marked distinctly
    Given I am viewing the task list
    Then baseline tasks are visually distinguished
    And I see "Näidis" label on baseline tasks

  Scenario: Can play baseline task entries
    Given I open a baseline task
    When the task detail view loads
    Then I can play all entries
    And I hear pronunciations

  Scenario: Can add entries to baseline tasks
    Given I am viewing a baseline task
    When I add new entries
    Then entries are stored separately for my user

  Scenario: Can hide baseline tasks
    Given I see a baseline task I want to hide
    When I delete the baseline task
    Then it is hidden from my view
    And the deletion is soft delete

  Scenario: Cannot edit baseline task metadata
    Given I open a baseline task
    When I try to edit task name
    Then the edit option is not available for baseline tasks

  Scenario: Can copy baseline tasks
    Given I want to customize a baseline task
    When I copy the baseline task
    Then a new user-owned task is created
    And the new task has same content as original

  Scenario: Baseline tasks persist across sessions
    Given baseline tasks are available
    When I log out and log back in
    Then the same baseline tasks are available
`,
};
