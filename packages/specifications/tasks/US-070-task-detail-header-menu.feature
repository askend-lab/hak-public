@tasks @detail @US-070
Feature: Task detail header with actions menu (US-070)
  As a language teacher viewing task details
  I want to access edit, share, and delete actions from the header
  So that I can manage the task without leaving the detail view

  Background:
    Given I am authenticated
    And I am viewing a task with entries

  Scenario: See task header with actions
    Then I see the task name as the page title
    And I see Share and Play All buttons
    And I see a more options menu button

  Scenario: Open header options menu
    When I click the more options button
    Then I see "Muuda" and "Kustuta" options

  Scenario: Edit task from detail header
    When I click the more options button
    And I click "Muuda"
    Then the task edit form opens

  Scenario: Delete task from detail header
    When I click the more options button
    And I click "Kustuta"
    Then a delete confirmation dialog appears

  Scenario: Share task from detail header
    When I click the "Jaga" button
    Then the share task modal opens
