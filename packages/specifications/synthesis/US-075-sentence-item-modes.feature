@ready @synthesis @component @US-075
Feature: Sentence synthesis item display modes (US-075)
  As a user of the application
  I want sentence items to render differently based on context
  So that I see the right controls for synthesis, task, or shared views

  Scenario: Input mode shows editable tags and text field
    Given I am on the synthesis page
    Then each sentence row shows editable word tags
    And each row has a text input field for new words
    And each row has a clear button when text is present

  Scenario: Tags mode shows clickable word tags
    Given I am viewing a task detail with entries
    Then each entry shows word tags
    And clicking a tag opens the variants panel

  Scenario: Readonly mode shows plain text
    Given I am viewing a shared task
    Then each entry shows text without editing controls
    And I can only play the audio

  Scenario: Draggable entries show drag handle
    Given I am in a view with draggable entries
    Then each entry shows a drag handle indicator
