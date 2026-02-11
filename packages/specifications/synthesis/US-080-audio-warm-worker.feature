@synthesis @performance @US-080
Feature: Audio warm-up worker for faster playback (US-080)
  As a language learner
  I want the audio system to be pre-warmed
  So that the first playback starts without delay

  Scenario: Audio context is initialized on page load
    Given I am on the synthesis page
    When the page finishes loading
    Then the audio warm-up worker initializes

  Scenario: First play has minimal delay after warm-up
    Given the audio system has been warmed up
    When I click play for the first time
    Then playback starts without noticeable extra delay

  Scenario: Audio works without warm-up as fallback
    Given the warm-up worker failed to initialize
    When I click play
    Then audio still works with standard initialization
