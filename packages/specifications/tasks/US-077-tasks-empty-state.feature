@ready @tasks @empty @US-077
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
