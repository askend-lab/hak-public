@synthesis @US-005 @ready
Feature: View pronunciation variants (US-005)
  As a language learner
  I want to see alternative pronunciation variants for ambiguous words
  So that I can choose the correct pronunciation based on context

  Scenario: Open variants panel by clicking word
    Given I have synthesized text containing "mees"
    When I click on the word "mees"
    Then the pronunciation variants panel opens
    And I see multiple pronunciation options

  Scenario: Preview variant pronunciation
    Given the pronunciation variants panel is open for "mees"
    When I click the play button next to a variant
    Then I hear that specific pronunciation
    And the variant audio plays using the synthesis API

  Scenario: Select a pronunciation variant
    Given I see multiple variants for "koer"
    When I click "Kasuta" (Use) on a specific variant
    Then that variant replaces the word's phonetic form
    And the variants panel closes
    And the audio cache is invalidated

  Scenario: Variant shows phonetic details
    Given the variants panel is open
    When I view the variant list
    Then each variant shows its phonetic form
    And each variant has a description or context tag
    And each variant has a play button
