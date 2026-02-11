@synthesis @variants @US-061
Feature: Pronunciation variants panel interactions (US-061)
  As a language learner
  I want to explore pronunciation variants for a selected word
  So that I can choose the correct pronunciation for my context

  Background:
    Given I am on the synthesis page
    And I am viewing synthesis results

  Scenario: Open variants panel for a word
    When I click on a word tag
    And I select "View variants"
    Then the pronunciation variants panel opens
    And variants are fetched from the API

  Scenario: See list of pronunciation variants
    Given the variants panel is open
    Then I see a list of unique pronunciation variants
    And each variant shows its phonetic description

  Scenario: Play a pronunciation variant
    Given the variants panel is open
    When I click play on a variant
    Then I hear the audio for that variant

  Scenario: Use a variant in the sentence
    Given the variants panel is open
    When I click "Use" on a variant
    Then the variant replaces the word in the sentence

  Scenario: Close variants panel
    Given the variants panel is open
    When I click the close button
    Then the variants panel closes
