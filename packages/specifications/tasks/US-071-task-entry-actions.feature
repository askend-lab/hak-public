@tasks @entries @US-071
Feature: Task entry row actions (US-071)
  As a language teacher viewing task details
  I want to perform actions on individual entries via a row menu
  So that I can manage each sentence in the task

  Background:
    Given I am authenticated
    And I am viewing a task with entries

  Scenario: Open entry row menu
    When I click the menu button on an entry
    Then I see options for the entry

  Scenario: Copy entry text to clipboard
    When I click "Kopeeri tekst" on an entry
    Then the entry text is copied to clipboard
    And I see a success notification

  Scenario: Delete entry from task
    When I click "Kustuta" on an entry
    Then the entry is removed from the task
    And I see a confirmation notification

  Scenario: Explore phonetic form of entry
    When I click "Uuri häälduskuju" on an entry
    Then the phonetic panel opens for that entry
