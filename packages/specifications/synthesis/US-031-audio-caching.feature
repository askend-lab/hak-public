@synthesis @performance @caching @US-031
Feature: US-031 Audio performance optimization (caching)
  As a language learner
  I want synthesized audio to load quickly when revisiting the same text
  So that I can practice efficiently without waiting for re-synthesis

  Background:
    Given I am on the synthesis page

  Scenario: Audio generated once per unique text
    Given I have synthesized audio for a text
    When I play the same text again
    Then the cached audio plays immediately

  Scenario: Cache validation on text change
    Given I have cached audio for a text
    When I modify the text
    Then the cache is automatically invalidated

  Scenario: Cache stores phonetic text
    Given audio has been synthesized
    When caching the audio
    Then both audio blob and phonetic text are cached together

  Scenario: Automatic retry on cache corruption
    Given cached audio fails to play
    When playback error is detected
    Then system invalidates cache and regenerates audio

  Scenario: Memory cleanup on unmount
    Given audio URLs have been created
    When component unmounts
    Then blob URLs are revoked to free memory

  Scenario: Cache used for download
    Given I want to download audio
    When cached audio exists
    Then download uses cached version without re-synthesis
