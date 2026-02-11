@playlist @audio @US-057
Feature: Playlist audio playback controls (US-057)
  As a language learner
  I want to control audio playback for my playlist
  So that I can practice listening at my own pace

  Background:
    Given I am on the synthesis page
    And I have multiple sentences with text

  Scenario: Stop current playback when playing another
    Given sentence "Tere" is currently playing
    When I click the play button for "Kuidas läheb"
    Then "Tere" stops playing
    And "Kuidas läheb" starts playing

  Scenario: Stop sequential playback manually
    Given sequential playback is in progress
    When I click the play all button again
    Then sequential playback stops

  Scenario: Resume after playback completes
    Given all sentences have finished playing
    When I click the play all button
    Then sequential playback starts from the beginning

  Scenario: Play button shows loading state
    When I click the play button for a sentence
    Then the play button shows a loading spinner
    And the spinner is replaced by pause icon when playing
