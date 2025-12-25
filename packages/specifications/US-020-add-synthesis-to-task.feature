@draft
Feature: Add synthesis entries to task (US-020)
  As a language teacher
  I want to add synthesized text entries to a task
  So that I can build exercise collections for students

  Background:
    Given the audio pipeline is available
    And the task service is available

  @wip
  Scenario: Add synthesized text to existing task
    Given I am authenticated as "teacher@test.com"
    And I have entered text "Tere päevast"
    And the audio has been synthesized successfully
    And I have an existing task named "Lesson 1"
    When I click "Add to task" button
    And I select task "Lesson 1" from the list
    And I confirm the selection
    Then the entry is added to task "Lesson 1"
    And I see a success notification "Entry added to Lesson 1"

  @draft
  Scenario: Create new task and add entry
    Given I am authenticated as "teacher@test.com"
    And I have entered text "Tere"
    And the audio has been synthesized successfully
    When I click "Add to task" button
    And I click "Create new task"
    And I enter task name "New Lesson"
    And I save the new task
    Then a new task "New Lesson" is created
    And the entry is added to task "New Lesson"
    And I see a success notification "Entry added to New Lesson"

  @draft
  Scenario: Unauthenticated user is redirected to login
    Given I am not authenticated
    And I have entered text "Tere"
    And the audio has been synthesized successfully
    When I click "Add to task" button
    Then I am redirected to the login page
    And I see a message "Please login to save tasks"

  @draft
  Scenario: Handle synthesis error gracefully
    Given I am authenticated as "teacher@test.com"
    And I have entered text "Tere"
    And the audio synthesis fails with error "Service unavailable"
    When I try to add to task
    Then I see an error notification "Could not synthesize audio"
    And the "Add to task" button is disabled

  @draft
  Scenario: Handle empty task list
    Given I am authenticated as "teacher@test.com"
    And I have entered text "Tere"
    And the audio has been synthesized successfully
    And I have no existing tasks
    When I click "Add to task" button
    Then I see the task creation form directly
    And I see a message "Create your first task"
