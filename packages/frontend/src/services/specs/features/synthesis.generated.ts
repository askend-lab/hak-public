// AUTO-GENERATED - DO NOT EDIT
// Run: pnpm --filter @hak/frontend sync-features
// Group: synthesis

export const FEATURES_SYNTHESIS: Record<string, string> = {
  "US-001-basic-synthesis": `@synthesis @US-001
Feature: Basic text synthesis (US-001)
  As a user
  I want to enter text and hear it synthesized
  So that I can learn Estonian pronunciation

  Background:
    Given I am on the main page

  Scenario: Synthesize a word
    When I enter "Tere" in the synthesis text field
    And I click the play button
    Then I hear the synthesized audio
    And the audio player shows the audio is playing

  Scenario: Action buttons are disabled when no text entered
    Given the text input is empty
    Then the "Mängi kõik" button should be disabled
    And the "Lisa ülesandesse" button should be disabled

  Scenario: Play all button should play all sentences sequentially
    Given I have entered "Tere" in the synthesis text field
    When I click the "Mängi kõik" button
    Then all sentences should be synthesized and played
`,

  "US-003-download-audio": `@synthesis @US-003
Feature: Download synthesized audio (US-003)
  As a language learner
  I want to download the synthesized audio file
  So that I can listen to it offline or use it in other applications

  Background:
    Given I am on the main page

  Scenario: Download audio via menu
    Given I have entered "Tere" in the synthesis text field
    And the audio has been synthesized
    When I click the more options menu (⋮)
    And I click "Download" option
    Then the audio file downloads to my device
    And the filename contains the text "Tere"

  Scenario: Download generates audio if not cached
    Given I have entered "Päike paistab" in the synthesis text field
    And the audio has not been synthesized yet
    When I click the more options menu (⋮)
    And I click "Download" option
    Then the system synthesizes the audio first
    And the audio file downloads to my device

  Scenario: Downloaded file is playable
    Given I have downloaded the audio for "Tere"
    When I open the downloaded file
    Then the audio plays correctly in a standard audio player
    And the format is WAV
`,

  "US-004-view-stressed-text": `@synthesis @US-004 @ready
Feature: View text with stress markers (US-004)
  As a language learner
  I want to see the Estonian text with stress markers visually indicated
  So that I can understand which syllables to emphasize when pronouncing

  Scenario: Display phonetic markers after synthesis
    Given I have entered "mees" in the synthesis text field
    When the synthesis is complete
    Then I see the phonetic text with stress markers
    And the stressed syllables are visually distinct

  Scenario: Show Estonian phonetic notation
    Given I have synthesized "koolitüdruk"
    When I view the phonetic form
    Then it uses Estonian phonetic markers (\`, ´, ', +)
    And compound word boundaries are marked with "+"

  Scenario: Compare original and phonetic text
    Given I have synthesized "Tere hommikust"
    When I view the stressed text display
    Then I can see both original text and phonetic form
    And the differences are highlighted
`,

  "US-005-view-pronunciation-variants": `@synthesis @US-005 @ready
Feature: View pronunciation variants (US-005)
  As a language learner
  I want to see alternative pronunciation variants for ambiguous words
  So that I can choose the correct pronunciation based on context

  Scenario: Open variants panel by clicking word
    Given I have synthesized text containing "mees"
    When I click on the word "mees"
    Then the pronunciation variants panel opens
    And I see multiple pronunciation options

  Scenario: Preview variant pronunciation
    Given the pronunciation variants panel is open for "mees"
    When I click the play button next to a variant
    Then I hear that specific pronunciation
    And the variant audio plays using the synthesis API

  Scenario: Select a pronunciation variant
    Given I see multiple variants for "koer"
    When I click "Kasuta" (Use) on a specific variant
    Then that variant replaces the word's phonetic form
    And the variants panel closes
    And the audio cache is invalidated

  Scenario: Variant shows phonetic details
    Given the variants panel is open
    When I view the variant list
    Then each variant shows its phonetic form
    And each variant has a description or context tag
    And each variant has a play button
`,

  "US-007-edit-phonetic-text": `@synthesis @US-007
Feature: Edit phonetic text manually (US-007)
  As a language teacher
  I want to manually edit the phonetic text with stress markers
  So that I can correct or customize the pronunciation for specific teaching purposes

  Background:
    Given I have synthesized text

  Scenario: Activate edit mode
    When I click the edit button on phonetic text
    Then the phonetic text becomes editable

  Scenario: Insert phonetic marker
    Given edit mode is active
    When I click a phonetic marker button
    Then the marker is inserted at cursor position

  Scenario: Save edited phonetic text
    Given I have edited the phonetic text
    When I click save
    Then the edited text is saved

  Scenario: Re-synthesize with edited phonetic
    Given I have saved edited phonetic text
    When I trigger synthesis
    Then the audio uses the edited phonetic form
`,

  "US-008-save-phonetic-edits": `@synthesis @US-008 @ready
Feature: Save phonetic text edits (US-008)
  As a language teacher
  I want to save my phonetic text edits
  So that I can reuse the customized pronunciation in future sessions

  Background:
    Given I have edited the phonetic text

  Scenario: Save confirmation
    When I click the save button
    Then a confirmation message appears

  Scenario: Edit persistence
    Given I have saved phonetic edits
    When I navigate away and return
    Then my edits are preserved

  Scenario: Reset to original
    Given I have saved edits
    When I click the reset button
    Then the phonetic text reverts to original
`,

  "US-014-edit-sentence-inline": `@synthesis @US-014
Feature: Edit sentence inline (US-014)
  As a language learner
  I want to edit my sentence text directly in the input field
  So that I can quickly make changes without needing a separate edit mode

  Background:
    Given I have a sentence row

  Scenario: Always-editable sentences
    When I view the sentence
    Then I can type new words in the input field
    And existing words appear as clickable tags

  Scenario: Add words via Space key
    Given I am typing in the input field
    When I press Space
    Then the current word becomes a tag
    And the input field clears

  Scenario: Edit existing words via Backspace
    Given I have existing tags and empty input
    When I press Backspace
    Then the last tag is removed
    And its text appears in the input field

  Scenario: Cache invalidation on edit
    Given I have modified the sentence text
    When the text changes
    Then cached audio is cleared
    And next playback triggers fresh synthesis

  Scenario: Phonetic customization per word
    Given I have a word in the sentence
    When I click on the word
    Then I can customize its phonetic form
    And changes are reflected in synthesis
`,

  "US-031-audio-caching": `@synthesis @performance @caching @US-031
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
`,

  "US-034-custom-phonetic-variant": `@synthesis @phonetic @US-034
Feature: US-034 Create custom phonetic variant
  As a language learner or advanced user
  I want to manually create and test custom phonetic variants for words
  So that I can experiment with specific pronunciations not provided by the automatic variants

  Background:
    Given I am on the synthesis page
    And the pronunciation variants panel is open for a word

  Scenario: Custom variant input field visible
    When I scroll to the custom variant section
    Then I see a custom phonetic input field
    And the input field allows free text entry

  Scenario: Phonetic marker toolbar available
    Given I am in the custom variant input field
    Then I see quick-insert buttons for phonetic markers
    And I see a button for third quantity marker
    And I see a button for stressed syllable marker
    And I see a button for palatalization marker
    And I see a button for compound word boundary marker

  Scenario: Insert marker at cursor position
    Given I am in the custom variant input field
    And my cursor is at position 3
    When I click the stressed syllable marker button
    Then the marker is inserted at position 3
    And my cursor moves after the inserted marker

  Scenario: Preview custom variant
    Given I have entered a custom phonetic variant "m\`ee+s"
    When I click the play button for custom variant
    Then the custom variant is synthesized
    And I hear the audio playback

  Scenario: Select custom variant
    Given I have created a custom phonetic variant
    When I click the "Kasuta" button for custom variant
    Then the custom variant replaces the word phonetic form
    And the variants panel closes

  Scenario: Access phonetic guide
    Given I am creating a custom variant
    When I click the phonetic guide button
    Then I see the phonetic guide modal
    And the guide explains available markers
`,
};
