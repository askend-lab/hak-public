@misc @modal @US-046
Feature: Confirmation dialogs for destructive actions (US-046)
  As a user performing a destructive action
  I want to see a confirmation dialog before proceeding
  So that I can avoid accidental data loss

  Scenario: See confirmation dialog before deleting
    Given I am about to delete a task
    When I click the delete button
    Then I see a confirmation dialog with a warning message
    And I see confirm and cancel buttons

  Scenario: Confirm destructive action
    Given I see a confirmation dialog
    When I click the confirm button
    Then the action is executed
    And the dialog closes

  Scenario: Cancel destructive action
    Given I see a confirmation dialog
    When I click the cancel button
    Then the action is not executed
    And the dialog closes

  Scenario: Danger variant styling
    Given a destructive action requires confirmation
    When the confirmation dialog appears
    Then the dialog is styled with danger indicators
