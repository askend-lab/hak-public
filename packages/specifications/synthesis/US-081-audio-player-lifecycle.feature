@synthesis @audio @US-081
Feature: Audio player lifecycle management (US-081)
  As a language learner
  I want the audio player to properly manage its lifecycle
  So that playback is reliable and resources are cleaned up

  Scenario: Stop current audio when playing new sentence
    Given audio is playing for one sentence
    When I play a different sentence
    Then the previous audio stops
    And the new audio starts

  Scenario: Clean up audio on component unmount
    Given audio is playing
    When I navigate away from the page
    Then the audio is stopped and resources are released

  Scenario: Abort sequential playback
    Given sequential playback is in progress
    When I click the play all button to stop
    Then the abort signal is triggered
    And all playback stops immediately

  Scenario: Handle audio play promise rejection
    Given the browser blocks autoplay
    When audio play is attempted
    Then the error is handled gracefully
    And the UI returns to idle state
