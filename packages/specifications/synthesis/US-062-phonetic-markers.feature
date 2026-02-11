@ready @synthesis @markers @US-062
Feature: Phonetic marker symbols and transformations (US-062)
  As a language researcher
  I want to use phonetic markers in my text
  So that I can precisely control pronunciation in synthesis

  Scenario: See available phonetic markers
    Given the phonetic editing panel is open
    Then I see marker buttons for kolmas välde, rõhk, peenendus, liitsõnapiir

  Scenario: Insert marker at cursor position
    Given I am editing phonetic text
    When I click a marker button
    Then the marker symbol is inserted at the cursor
    And the cursor moves after the inserted symbol

  Scenario: Markers transform between UI and API format
    Given I have entered UI markers in phonetic text
    When I apply the phonetic changes
    Then the markers are transformed to Vabamorf format

  Scenario: View marker descriptions in guide
    Given the phonetic editing panel is open
    When I open the markers guide
    Then I see each marker with name, rule, and examples
