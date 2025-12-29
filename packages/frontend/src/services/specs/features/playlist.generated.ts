// AUTO-GENERATED - DO NOT EDIT
// Run: pnpm --filter @hak/frontend sync-features
// Group: playlist

export const FEATURES_PLAYLIST: Record<string, string> = {
  'US-009-add-to-playlist': `@playlist @US-009
Feature: Add sentence to synthesis list (US-009)
  As a language learner
  I want to add multiple sentence rows to the synthesis page
  So that I can prepare and practice several phrases in one session

  Scenario: Add sentence button is visible
    Given I am on the synthesis page
    When I view the sentences section
    Then I see a "Lisa lause" button at the bottom

  Scenario: Add new sentence row
    Given I am on the synthesis page
    When I click the "Lisa lause" button
    Then a new empty sentence row is added to the list
    And I can start typing text in the new row

  Scenario: Multiple sentences support
    Given I have one sentence row with text "Tere"
    When I click the "Lisa lause" button
    Then I have two sentence rows in the list
    And each sentence has a unique ID
`,

  'US-010-play-playlist-entry': `@playlist @US-010
Feature: Play individual sentence (US-010)
  As a language learner
  I want to play a specific sentence from my list
  So that I can focus on practicing individual phrases

  Background:
    Given I am on the synthesis page
    And authentication is not required

  Scenario: Play button per sentence
    Given I have sentence rows with text
    When I view the sentences section
    Then each sentence row displays its own play button

  Scenario: Play specific sentence
    Given I have two sentences "Tere" and "Hommikust"
    When I click the play button for "Tere"
    Then only "Tere" is synthesized and played
    And "Hommikust" is not affected

  Scenario: Visual playback states
    Given I have a sentence "Tere"
    When I click its play button
    Then the button shows loading state during synthesis
    And the button shows pause icon during playback

  Scenario: Stop current playback when switching
    Given sentence "Tere" is currently playing
    When I click play on sentence "Hommikust"
    Then "Tere" playback stops
    And "Hommikust" starts playing
`,

  'US-011-play-all-entries': `@playlist @US-011
Feature: Play all sentences sequentially (US-011)
  As a language learner
  I want to play all my sentences in sequence
  So that I can practice listening to multiple phrases without interruption

  Scenario: Play all button shows sentence count
    Given I have 3 sentences with text
    When I view the synthesis page
    Then I see a "Mängi kõik" button showing count "(3)"

  Scenario: Sequential playback of sentences
    Given I have sentences "Tere" and "Hommikust"
    When I click the "Mängi kõik" button
    Then each sentence is played in order
    And the next sentence starts after the previous finishes

  Scenario: Skip empty sentences
    Given I have sentence "Tere" and an empty sentence
    When I click the "Mängi kõik" button
    Then only "Tere" is played
    And empty sentences are skipped

  Scenario: Stop sequential playback
    Given sequential playback is in progress
    When I click the "Peata" button
    Then playback stops immediately
    And the button changes back to "Mängi kõik"
`,

  'US-012-delete-playlist-entry': `@playlist @US-012
Feature: Remove sentence from list (US-012)
  As a language learner
  I want to remove a sentence from my list
  So that I can focus only on the phrases I need to practice

  Scenario: Remove option in menu
    Given I have sentence rows in the list
    When I click the three-dots menu on a sentence
    Then I see an "Eemalda" option in the dropdown

  Scenario: Remove a sentence
    Given I have 3 sentences in the list
    When I click "Eemalda" on the second sentence
    Then the sentence is removed from the list
    And I have 2 sentences remaining

  Scenario: Last sentence becomes empty instead of removed
    Given I have only 1 sentence in the list
    When I click "Eemalda" on that sentence
    Then the sentence is cleared to empty
    And I still have 1 sentence row visible
`,

  'US-013-reorder-playlist': `@playlist @US-013
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
`,
};
