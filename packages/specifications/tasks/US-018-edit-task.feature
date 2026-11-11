@tasks @US-018 @ready
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
