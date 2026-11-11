@ready @tasks @data @US-067
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
