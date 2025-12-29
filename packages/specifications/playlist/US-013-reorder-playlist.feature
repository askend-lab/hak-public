@playlist @US-013
Feature: Reorder sentences via drag and drop (US-013)
  As a language learner
  I want to change the order of my sentences
  So that I can organize phrases in my preferred learning sequence

  Scenario: Drag handle visible on each sentence
    Given I have multiple sentence rows
    When I view the sentences section
    Then each sentence displays a drag handle

  Scenario: Reorder sentences by drag and drop
    Given I have sentences in order "A", "B", "C"
    When I drag sentence "A" to position after "B"
    Then the order becomes "B", "A", "C"

  Scenario: Visual feedback during drag
    Given I am dragging a sentence
    When the drag is in progress
    Then the dragged sentence appears semi-transparent
    And the drop target shows a visual indicator
