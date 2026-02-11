@ready @tasks @variants @US-073
Feature: View pronunciation variants for task entries (US-073)
  As a language teacher viewing task details
  I want to see pronunciation variants for words in task entries
  So that I can verify correct pronunciation is used

  Background:
    Given I am authenticated
    And I am viewing a task with entries

  Scenario: Click word tag to see variants
    When I click on a word tag in a task entry
    Then the pronunciation variants panel opens
    And variants for that word are loaded

  Scenario: Use variant to update entry
    Given the variants panel is open for a task entry
    When I select a variant to use
    Then the word in the entry is updated
    And the change is persisted to the task

  Scenario: Close variants panel in task view
    Given the variants panel is open for a task entry
    When I close the variants panel
    Then the panel closes
    And the entry remains unchanged
