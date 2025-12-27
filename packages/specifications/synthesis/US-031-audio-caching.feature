Feature: Audio performance optimization - caching (US-031)
  As a language learner
  I want synthesized audio to load quickly when revisiting the same text
  So that I can practice efficiently without waiting for re-synthesis

  Scenario: Instant playback from cache
    Given I have synthesized audio for "Tere"
    And the audio has finished playing
    When I click play again for the same text
    Then the audio plays immediately from cache
    And no API call is made to the synthesis service

  Scenario: Cache invalidation on text change
    Given I have cached audio for "Tere"
    When I modify the text to "Tere hommikust"
    Then the cache is automatically invalidated
    And the next play synthesizes new audio

  Scenario: Cache invalidation on variant selection
    Given I have cached audio for "mees"
    When I select a different pronunciation variant
    Then the cache is invalidated
    And the next play uses the new variant

  Scenario: Download uses cached audio
    Given I have cached audio for "Tere"
    When I click download for the same text
    Then the download uses the cached version
    And no re-synthesis is required

  Scenario: Retry on cache corruption
    Given cached audio has become corrupted
    When playback fails
    Then the system invalidates the cache
    And automatically retries synthesis once
