@synthesis @custom-variant @US-068
Feature: Create and test custom pronunciation variant (US-068)
  As a language researcher
  I want to create custom phonetic variants with markers
  So that I can experiment with specific pronunciations

  Scenario: Open custom variant form
    Given the pronunciation variants panel is open
    When I click to create a custom variant
    Then I see the custom variant input form

  Scenario: Enter custom phonetic text
    Given the custom variant form is open
    When I type a custom phonetic variant with markers
    Then I see the text in the input field

  Scenario: Play custom variant audio
    Given I have entered a custom phonetic variant
    When I click the play button
    Then I hear the synthesized audio for my custom text

  Scenario: Use custom variant in sentence
    Given I have entered a custom phonetic variant
    When I click the "Helinda" button
    Then the custom variant is applied to the sentence

  Scenario: Clear custom variant input
    Given I have entered a custom phonetic variant
    When I click the clear button
    Then the input field is emptied
