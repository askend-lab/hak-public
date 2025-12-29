@synthesis @US-001
Feature: Basic text synthesis (US-001)
  As a user
  I want to enter text and hear it synthesized
  So that I can learn Estonian pronunciation

  Background:
    Given I am on the main page

  Scenario: Synthesize a word
    When I enter "Tere" in the synthesis text field
    And I click the play button
    Then I hear the synthesized audio
    And the audio player shows the audio is playing

  Scenario: Action buttons are disabled when no text entered
    Given the text input is empty
    Then the "Mängi kõik" button should be disabled
    And the "Lisa ülesandesse" button should be disabled

  Scenario: Play all button should play all sentences sequentially
    Given I have entered "Tere" in the synthesis text field
    When I click the "Mängi kõik" button
    Then all sentences should be synthesized and played
