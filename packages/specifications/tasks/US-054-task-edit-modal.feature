@tasks @edit @US-054
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
