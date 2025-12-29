@tasks @US-019
Feature: Delete task (US-019)
  As a language teacher
  I want to delete tasks I no longer need
  So that I can keep my task list organized

  Background:
    Given I am authenticated
    And I am viewing task details

  Scenario: See delete button
    Then I see a "Delete" button

  Scenario: Confirmation dialog appears
    When I click the "Delete" button
    Then I see a confirmation dialog

  Scenario: Confirm deletion
    When I click the "Delete" button
    And I confirm the deletion
    Then the task is deleted
    And I am redirected to task list

  Scenario: Cancel deletion
    When I click the "Delete" button
    And I cancel the deletion
    Then the task is not deleted
