@tasks @detail @US-074
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
