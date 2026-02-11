@synthesis @display @US-096
Feature: Stressed text display with visual markers (US-096)
  As a language learner
  I want stress markers to be visually distinct in the UI
  So that I can easily identify stressed syllables

  Scenario: Stress markers are rendered as visual indicators
    Given I have synthesized text with stress markers
    Then the stressed syllables are visually highlighted

  Scenario: Third pitch accent marker is displayed
    Given the text contains kolmas välde marker
    Then the marker is shown as a backtick symbol in the UI

  Scenario: Compound word boundary is displayed
    Given the text contains a compound word boundary
    Then the boundary is shown as a plus symbol in the UI
