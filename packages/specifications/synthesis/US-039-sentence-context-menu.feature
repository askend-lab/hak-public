@synthesis @menu @US-039
Feature: Sentence context menu actions (US-039)
  As a language learner
  I want to access actions for each sentence via a context menu
  So that I can manage sentences efficiently

  Background:
    Given I am on the synthesis page
    And I have a sentence "Tere tulemast"

  Scenario: Open sentence context menu
    When I click the three-dots menu on a sentence
    Then I see a dropdown menu with actions

  Scenario: Copy sentence text
    When I click the three-dots menu on a sentence
    And I click "Kopeeri tekst"
    Then the sentence text is copied to clipboard
    And the menu closes

  Scenario: Explore phonetic form from menu
    When I click the three-dots menu on a sentence
    And I click "Uuri häälduskuju"
    Then the phonetic panel opens for that sentence
    And the menu closes

  Scenario: Download audio from menu
    When I click the three-dots menu on a sentence
    And I click "Lae alla .wav fail"
    Then the audio download starts
    And the menu closes

  Scenario: Remove sentence from menu
    When I click the three-dots menu on a sentence
    And I click "Eemalda"
    Then the sentence is removed from the list
