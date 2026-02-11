@ready @synthesis @api @US-064
Feature: Asynchronous synthesis with polling (US-064)
  As a language learner
  I want synthesis to poll for results when processing takes time
  So that I eventually hear the audio even for complex text

  Scenario: Immediate result from cache
    Given I previously synthesized "Tere"
    When I synthesize "Tere" again
    Then the cached audio URL is returned immediately
    And no polling is needed

  Scenario: Poll for processing result
    Given I enter new text that requires processing
    When the synthesis API returns processing status
    Then the system polls the status endpoint
    And returns the audio when ready

  Scenario: Timeout after max poll attempts
    Given I enter text for synthesis
    When the synthesis does not complete within the timeout
    Then I see a timeout error notification

  Scenario: Handle error during polling
    Given the synthesis is being polled
    When the status endpoint returns an error
    Then polling stops
    And I see an error notification
