@tasks @sharing @US-097
Feature: Share task from task list (US-097)
  As a language teacher
  I want to share a task directly from the task list
  So that I can quickly distribute exercises without opening details

  Background:
    Given I am authenticated
    And I am on the tasks page
    And I have a task in the list

  Scenario: Share from task row menu
    When I click the more options button on a task
    And I click "Jaga"
    Then the share modal opens for that task

  Scenario: Task gets a share token on first share
    Given my task has no share token yet
    When I share the task
    Then a share token is generated and assigned

  Scenario: Share token persists after first share
    Given my task already has a share token
    When I share the task again
    Then the same share token is used
