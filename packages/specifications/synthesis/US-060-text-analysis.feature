@synthesis @analysis @US-060
Feature: Text stress analysis via API (US-060)
  As a language learner
  I want my entered text to be analyzed for stress patterns
  So that I see correct stress markers on each word

  Scenario: Analyze entered text for stress
    Given I am on the synthesis page
    When I enter "Tere tulemast" and submit
    Then the text is sent to the analysis API
    And I see the words displayed with stress markers

  Scenario: Handle analysis API failure gracefully
    Given I am on the synthesis page
    When I enter text and the analysis API fails
    Then I see the original text without stress markers
    And no error blocks my workflow

  Scenario: Display stressed tags from analysis
    Given the analysis returned stressed text
    Then each word is displayed as a clickable tag
    And stress markers are shown visually
