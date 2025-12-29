@tasks @baseline @US-033
Feature: US-033 Baseline tasks access
  As a new user
  I want to see example tasks when I first log in
  So that I understand how to use the application and can practice immediately

  Background:
    Given I am authenticated as a new user

  Scenario: Baseline tasks visible to all users
    When I navigate to the Tasks view
    Then I see pre-loaded example tasks
    And I see baseline tasks in the list

  Scenario: Baseline tasks marked distinctly
    Given I am viewing the task list
    Then baseline tasks are visually distinguished
    And I see "Näidis" label on baseline tasks

  Scenario: Can play baseline task entries
    Given I open a baseline task
    When the task detail view loads
    Then I can play all entries
    And I hear pronunciations

  Scenario: Can add entries to baseline tasks
    Given I am viewing a baseline task
    When I add new entries
    Then entries are stored separately for my user

  Scenario: Can hide baseline tasks
    Given I see a baseline task I want to hide
    When I delete the baseline task
    Then it is hidden from my view
    And the deletion is soft delete

  Scenario: Cannot edit baseline task metadata
    Given I open a baseline task
    When I try to edit task name
    Then the edit option is not available for baseline tasks

  Scenario: Can copy baseline tasks
    Given I want to customize a baseline task
    When I copy the baseline task
    Then a new user-owned task is created
    And the new task has same content as original

  Scenario: Baseline tasks persist across sessions
    Given baseline tasks are available
    When I log out and log back in
    Then the same baseline tasks are available
