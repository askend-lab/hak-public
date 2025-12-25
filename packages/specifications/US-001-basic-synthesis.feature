Feature: Basic text synthesis (US-001)
  As a user
  I want to enter text and hear it synthesized
  So that I can learn Estonian pronunciation

  Scenario: Synthesize a word
    Given I am on the main page
    When I enter "Tere" in the text input
    And I click the play button
    Then I hear the synthesized audio
    And the audio player shows the audio is playing
