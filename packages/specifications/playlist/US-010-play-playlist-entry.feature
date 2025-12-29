@playlist @US-010
Feature: Play individual sentence (US-010)
  As a language learner
  I want to play a specific sentence from my list
  So that I can focus on practicing individual phrases

  Background:
    Given I am on the synthesis page
    And authentication is not required

  Scenario: Play button per sentence
    Given I have sentence rows with text
    When I view the sentences section
    Then each sentence row displays its own play button

  Scenario: Play specific sentence
    Given I have two sentences "Tere" and "Hommikust"
    When I click the play button for "Tere"
    Then only "Tere" is synthesized and played
    And "Hommikust" is not affected

  Scenario: Visual playback states
    Given I have a sentence "Tere"
    When I click its play button
    Then the button shows loading state during synthesis
    And the button shows pause icon during playback

  Scenario: Stop current playback when switching
    Given sentence "Tere" is currently playing
    When I click play on sentence "Hommikust"
    Then "Tere" playback stops
    And "Hommikust" starts playing
