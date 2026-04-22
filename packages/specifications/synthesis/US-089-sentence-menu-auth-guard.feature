@ready @synthesis @auth @US-089
Feature: Sentence menu adapts to auth state (US-089)
  As a user of the application
  I want the sentence menu to show different options based on login
  So that I see relevant actions for my authentication state

  Scenario: Authenticated user sees full menu
    Given I am authenticated
    And I am on the synthesis page
    When I open the sentence context menu
    Then I see task search, create task, phonetic, download, copy, and remove

  Scenario: Unauthenticated user sees limited menu
    Given I am not authenticated
    And I am on the synthesis page
    When I open the sentence context menu
    Then I see "Lisa ülesandesse" which triggers login
    And I see phonetic, download, copy, and remove options

  Scenario: Clicking add to task triggers login for guest
    Given I am not authenticated
    When I click "Lisa ülesandesse" in the menu
    Then the login modal opens
