@playlist @persistence @US-035
Feature: US-035 Session persistence
  As a language learner
  I want my entered sentences to persist across page refreshes and browser sessions
  So that I don't lose my work when I accidentally refresh or close the browser

  Background:
    Given I am on the synthesis page

  Scenario: Sentences persist on page refresh
    Given I have entered text in one or more sentences
    When I refresh the page
    Then my entered sentences are restored
    And the tags and input text are preserved

  Scenario: Sentences persist on browser close
    Given I have entered text in one or more sentences
    When I close the browser tab and reopen the application
    Then my entered sentences are restored

  Scenario: Transient UI state resets on reload
    Given I have a sentence that was playing audio
    When I refresh the page
    Then the isPlaying state is reset to false
    And the isLoading state is reset to false

  Scenario: Audio URLs are preserved
    Given I have synthesized audio for a sentence
    When I refresh the page
    Then the cached audio URL is restored
    And I can replay without re-synthesis

  Scenario: Multiple sentences order preserved
    Given I have multiple sentences in a specific order
    When I refresh the page
    Then the sentences appear in the same order

  Scenario: Empty state after clearing all
    Given I have cleared all sentence content
    When I refresh the page
    Then I see a single empty sentence row
