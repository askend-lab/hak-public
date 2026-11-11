@synthesis @US-014
Feature: Edit sentence inline (US-014)
  As a language learner
  I want to edit my sentence text directly in the input field
  So that I can quickly make changes without needing a separate edit mode

  Background:
    Given I have a sentence row

  Scenario: Always-editable sentences
    When I view the sentence
    Then I can type new words in the input field
    And existing words appear as clickable tags

  Scenario: Add words via Space key
    Given I am typing in the input field
    When I press Space
    Then the current word becomes a tag
    And the input field clears

  Scenario: Edit existing words via Backspace
    Given I have existing tags and empty input
    When I press Backspace
    Then the last tag is removed
    And its text appears in the input field

  Scenario: Cache invalidation on edit
    Given I have modified the sentence text
    When the text changes
    Then cached audio is cleared
    And next playback triggers fresh synthesis

  Scenario: Phonetic customization per word
    Given I have a word in the sentence
    When I click on the word
    Then I can customize its phonetic form
    And changes are reflected in synthesis
