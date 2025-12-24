@draft @unimplemented
Feature: Baseline tasks access (US-033)
  As a new user
  I want to see example tasks when I first log in
  So that I understand how to use the application and can practice immediately

  Background:
    Given the task service is available
    And baseline tasks are loaded from mock-tasks.json

  @draft
  Scenario: Baseline tasks visible to all users
    Given I am a newly authenticated user
    When I navigate to the Tasks view
    Then I see pre-loaded example tasks
    And baseline tasks include "Välted ja rõhud"
    And baseline tasks include "Palatalisatsioon"

  @draft
  Scenario: Baseline tasks marked distinctly
    Given I am viewing the task list
    When baseline tasks are displayed
    Then they are visually distinguished from user-created tasks
    And baseline tasks show "Näidis" tag

  @draft
  Scenario: Can play baseline task entries
    Given I open a baseline task "Välted ja rõhud"
    When the task detail view loads
    Then I can play all entries
    And I hear pronunciations for each entry

  @draft
  Scenario: Can add entries to baseline tasks
    Given I am viewing a baseline task
    When I add a new entry with text "Tere"
    Then the entry is stored separately per user
    And I see the new entry in the task

  @draft
  Scenario: Can hide baseline tasks
    Given I don't want to see a baseline task
    When I delete the baseline task "Palatalisatsioon"
    Then it is hidden from my view
    And other baseline tasks remain visible

  @draft
  Scenario: Cannot edit baseline task metadata
    Given I open a baseline task
    When I try to edit the task name
    Then the edit is not allowed
    And I see a message "Baseline tasks cannot be edited"

  @draft
  Scenario: Can copy baseline tasks
    Given I want to customize a baseline task "Välted ja rõhud"
    When I click "Copy task"
    Then a new user-owned task is created
    And the new task has the same content
    And I can edit the copied task

  @draft
  Scenario: Baseline tasks persist across sessions
    Given baseline tasks are available
    When I log out
    And I log back in
    Then the same baseline tasks are available
