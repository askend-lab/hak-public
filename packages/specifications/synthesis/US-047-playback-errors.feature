@ready @synthesis @playback @US-047
Feature: Handle audio playback errors gracefully (US-047)
  As a language learner
  I want the application to handle audio playback failures
  So that I can retry or continue practicing without disruption

  Scenario: Show error when synthesis fails
    Given I have entered text for synthesis
    When the synthesis API returns an error
    Then I see an error notification
    And the play button returns to idle state

  Scenario: Handle playback interruption during play all
    Given sequential playback is in progress
    When playback error is detected
    Then the sequential playback stops
    And I see an error notification

  Scenario: Retry after playback failure
    Given audio playback failed for a sentence
    When I click the play button again
    Then a new synthesis request is made

  Scenario: Handle network timeout during synthesis
    Given I have entered text for synthesis
    When the synthesis request times out
    Then I see a timeout error notification
    And I can retry the synthesis
