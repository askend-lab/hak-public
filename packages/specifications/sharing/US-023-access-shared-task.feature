@sharing @US-023
Feature: Access shared task via link (US-023)
  As a language student
  I want to access a task via a shared link
  So that I can complete exercises assigned by my teacher

  Scenario: Open shared task link
    Given I have a shared task link
    When I open the shared link
    Then I see the shared task details

  Scenario: Read-only view
    Given I am viewing a shared task
    Then I can see all task entries
    And I cannot edit the task
    And I cannot delete the task

  Scenario: Play audio entries
    Given I am viewing a shared task
    When I click play on an entry
    Then I hear the synthesized audio

  Scenario: Access without authentication
    Given I am not authenticated
    When I open a shared task link
    Then I can still view the task content

  Scenario: Copy shared task to my tasks
    Given I am authenticated
    And I am viewing a shared task
    When I click the "Copy to my tasks" button
    Then the task is copied to my task list
