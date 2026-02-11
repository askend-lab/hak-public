@synthesis @phonetic @US-052
Feature: Edit phonetic form in side panel (US-052)
  As a language researcher
  I want to edit the phonetic representation in a side panel
  So that I can fine-tune pronunciation with markers

  Scenario: Open phonetic panel
    Given I am on the synthesis page
    And I have a sentence with synthesized text
    When I open the phonetic panel for a sentence
    Then I see the phonetic editing panel
    And the phonetic text is pre-filled

  Scenario: Insert marker at cursor position
    Given the phonetic panel is open
    When I click a marker button
    Then the marker is inserted at the cursor position

  Scenario: Preview edited phonetic text
    Given the phonetic panel is open
    And I have edited the phonetic text
    When I click the play button in the panel
    Then I hear the audio for the edited phonetic text

  Scenario: Apply phonetic changes
    Given the phonetic panel is open
    And I have edited the phonetic text
    When I click the "Rakenda" button
    Then the changes are applied to the sentence
    And the panel closes

  Scenario: View markers guide
    Given the phonetic panel is open
    When I click to view the markers guide
    Then I see a list of available phonetic markers
    And each marker shows its symbol and description
