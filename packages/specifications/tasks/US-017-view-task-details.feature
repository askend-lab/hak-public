@tasks @US-017 @ready
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
