@tasks @US-020
Feature: Add synthesis entries to task (US-020)
  As a language teacher
  I want to add synthesized text entries to a task
  So that I can build exercise collections for students

  Background:
    Given I am authenticated

  Scenario: See add to task button
    Given I have synthesized audio
    Then I see an "Add to task" button

  Scenario: Select task dialog
    Given I have synthesized audio
    When I click the "Add to task" button
    Then I see a task selection dialog

  Scenario: Add to existing task
    Given I have synthesized audio
    And I have an existing task
    When I click the "Add to task" button
    And I select the existing task
    Then the entry is added to the task

  Scenario: Create new task option
    Given I have synthesized audio
    When I click the "Add to task" button
    Then I see an option to create new task

  Scenario: Success notification after adding
    Given I have synthesized audio
    And I have an existing task
    When I add entry to task successfully
    Then I see a success notification
