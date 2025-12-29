@tasks @US-016
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
