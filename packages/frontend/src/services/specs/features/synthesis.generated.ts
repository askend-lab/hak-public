// AUTO-GENERATED - DO NOT EDIT
// Run: pnpm --filter @hak/frontend sync-features
// Group: synthesis

export const FEATURES_SYNTHESIS: Record<string, string> = {
  'US-001-basic-synthesis': `Feature: Basic text synthesis (US-001)
  As a user
  I want to enter text and hear it synthesized
  So that I can learn Estonian pronunciation

  Scenario: Synthesize a word
    Given I am on the main page
    When I enter "Tere" in the text input
    And I click the play button
    Then I hear the synthesized audio
    And the audio player shows the audio is playing
`,

  'US-003-download-audio': `Feature: Download synthesized audio (US-003)
  As a language learner
  I want to download the synthesized audio file
  So that I can listen to it offline or use it in other applications

  Scenario: Download audio via menu
    Given I have entered "Tere" in the text input
    And the audio has been synthesized
    When I click the more options menu (⋮)
    And I click "Download" option
    Then the audio file downloads to my device
    And the filename contains the text "Tere"

  Scenario: Download generates audio if not cached
    Given I have entered "Päike paistab" in the text input
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

  'US-004-view-stressed-text': `Feature: View text with stress markers (US-004)
  As a language learner
  I want to see the Estonian text with stress markers visually indicated
  So that I can understand which syllables to emphasize when pronouncing

  Scenario: Display phonetic markers after synthesis
    Given I have entered "mees" in the text input
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

  'US-005-view-pronunciation-variants': `Feature: View pronunciation variants (US-005)
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

  'US-031-audio-caching': `Feature: Audio performance optimization - caching (US-031)
  As a language learner
  I want synthesized audio to load quickly when revisiting the same text
  So that I can practice efficiently without waiting for re-synthesis

  Scenario: Instant playback from cache
    Given I have synthesized audio for "Tere"
    And the audio has finished playing
    When I click play again for the same text
    Then the audio plays immediately from cache
    And no API call is made to the synthesis service

  Scenario: Cache invalidation on text change
    Given I have cached audio for "Tere"
    When I modify the text to "Tere hommikust"
    Then the cache is automatically invalidated
    And the next play synthesizes new audio

  Scenario: Cache invalidation on variant selection
    Given I have cached audio for "mees"
    When I select a different pronunciation variant
    Then the cache is invalidated
    And the next play uses the new variant

  Scenario: Download uses cached audio
    Given I have cached audio for "Tere"
    When I click download for the same text
    Then the download uses the cached version
    And no re-synthesis is required

  Scenario: Retry on cache corruption
    Given cached audio has become corrupted
    When playback fails
    Then the system invalidates the cache
    And automatically retries synthesis once
`,
};
