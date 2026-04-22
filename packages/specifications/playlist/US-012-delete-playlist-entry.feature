@playlist @US-012 @skip
Feature: Remove sentence from list (US-012)
  As a language learner
  I want to remove a sentence from my list
  So that I can focus only on the phrases I need to practice

  Scenario: Remove option in menu
    Given I have sentence rows in the list
    When I click the three-dots menu on a sentence
    Then I see an "Eemalda" option in the dropdown

  Scenario: Remove a sentence
    Given I have 3 sentences in the list
    When I click "Eemalda" on the second sentence
    Then the sentence is removed from the list
    And I have 2 sentences remaining

  Scenario: Last sentence becomes empty instead of removed
    Given I have only 1 sentence in the list
    When I click "Eemalda" on that sentence
    Then the sentence is cleared to empty
    And I still have 1 sentence row visible
