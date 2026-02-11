@ready @tasks @entries @US-099
Feature: Update task entry text and stressed text (US-099)
  As a language teacher
  I want to update the text of individual task entries
  So that I can correct or improve exercise content

  Background:
    Given I am authenticated
    And I am viewing a task with entries

  Scenario: Update entry stressed text via phonetic panel
    When I open the phonetic panel for an entry
    And I edit the phonetic text
    And I click "Rakenda"
    Then the entry's stressed text is updated
    And the change is persisted to storage

  Scenario: Update entry via variant selection
    When I click a word tag in an entry
    And I select a pronunciation variant
    Then the entry text reflects the chosen variant
    And the task is saved with updated content

  Scenario: Revert on save failure
    Given I updated an entry locally
    When the save to backend fails
    Then the entry reverts to its previous value
    And I see an error notification
