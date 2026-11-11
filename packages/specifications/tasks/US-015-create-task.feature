@tasks @US-015 @ready
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
