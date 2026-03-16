// AUTO-GENERATED - DO NOT EDIT
// Run: pnpm --filter @hak/frontend sync-features
// Group: synthesis

export const FEATURES_SYNTHESIS: Record<string, string> = {
  'US-001-basic-synthesis': `@synthesis @US-001
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

  'US-003-download-audio': `@synthesis @US-003
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

  'US-004-view-stressed-text': `@synthesis @US-004 @ready
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

  'US-005-view-pronunciation-variants': `@synthesis @US-005 @ready
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

  'US-007-edit-phonetic-text': `@synthesis @US-007
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

  'US-008-save-phonetic-edits': `@synthesis @US-008 @ready
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

  'US-014-edit-sentence-inline': `@synthesis @US-014
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

  'US-031-audio-caching': `@synthesis @performance @caching @US-031
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

  'US-034-custom-phonetic-variant': `@synthesis @phonetic @US-034
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

  'US-039-sentence-context-menu': `@ready @synthesis @menu @US-039
Feature: Sentence context menu actions (US-039)
  As a language learner
  I want to access actions for each sentence via a context menu
  So that I can manage sentences efficiently

  Background:
    Given I am on the synthesis page
    And I have a sentence "Tere tulemast"

  Scenario: Open sentence context menu
    When I click the three-dots menu on a sentence
    Then I see a dropdown menu with actions

  Scenario: Copy sentence text
    When I click the three-dots menu on a sentence
    And I click "Kopeeri tekst"
    Then the sentence text is copied to clipboard
    And the menu closes

  Scenario: Explore phonetic form from menu
    When I click the three-dots menu on a sentence
    And I click "Uuri häälduskuju"
    Then the phonetic panel opens for that sentence
    And the menu closes

  Scenario: Download audio from menu
    When I click the three-dots menu on a sentence
    And I click "Lae alla .wav fail"
    Then the audio download starts
    And the menu closes

  Scenario: Remove sentence from menu
    When I click the three-dots menu on a sentence
    And I click "Eemalda"
    Then the sentence is removed from the list
`,

  'US-047-playback-errors': `@ready @synthesis @playback @US-047
Feature: Handle audio playback errors gracefully (US-047)
  As a language learner
  I want the application to handle audio playback failures
  So that I can retry or continue practicing without disruption

  Scenario: Show error when synthesis fails
    Given I have entered text for synthesis
    When the synthesis API returns an error
    Then I see an error notification
    And the play button returns to idle state

  Scenario: Handle playback interruption during play all
    Given sequential playback is in progress
    When playback error is detected
    Then the sequential playback stops
    And I see an error notification

  Scenario: Retry after playback failure
    Given audio playback failed for a sentence
    When I click the play button again
    Then a new synthesis request is made

  Scenario: Handle network timeout during synthesis
    Given I have entered text for synthesis
    When the synthesis request times out
    Then I see a timeout error notification
    And I can retry the synthesis
`,

  'US-049-text-input-behavior': `@ready @synthesis @input @US-049
Feature: Text input field behavior (US-049)
  As a language learner
  I want the text input to behave intuitively
  So that I can efficiently enter and manage sentences

  Background:
    Given I am on the synthesis page

  Scenario: Add new sentence row
    Given I have one sentence row
    When I click the add sentence button
    Then a new empty sentence row appears below

  Scenario: Clear sentence text
    Given I have a sentence "Tere"
    When I click the clear button on the sentence
    Then the sentence text is cleared
    And the input field is empty

  Scenario: Input focus after adding sentence
    Given I have one sentence row
    When I click the add sentence button
    Then the new sentence input is focused

  Scenario: Multiple sentence rows
    Given I have 3 sentences in the list
    Then I see 3 input rows
    And each row has its own play and menu buttons
`,

  'US-052-phonetic-panel': `@ready @synthesis @phonetic @US-052
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
`,

  'US-055-tag-editing': `@ready @synthesis @tags @US-055
Feature: Edit word tags in synthesized text (US-055)
  As a language learner
  I want to edit individual word tags in the synthesized output
  So that I can correct or customize pronunciation of specific words

  Background:
    Given I am on the synthesis page
    And I am viewing synthesis results

  Scenario: Open tag menu on a word
    When I click on a word tag
    Then I see the tag context menu

  Scenario: Edit tag text inline
    Given the tag menu is open
    When I click the edit option
    Then the tag becomes editable
    And I can type a new value

  Scenario: Commit tag edit on Enter
    Given a tag is in edit mode
    When I press Enter
    Then the tag value is updated
    And the edit mode closes

  Scenario: Delete a tag
    Given the tag menu is open
    When I click the delete option
    Then the tag is removed from the sentence

  Scenario: View variants from tag menu
    Given the tag menu is open
    When I click to view pronunciation variants
    Then the variants panel opens for that word
`,

  'US-056-voice-model-selection': `@ready @synthesis @voice @US-056
Feature: Automatic voice model selection (US-056)
  As a language learner
  I want the system to automatically select the best voice model
  So that I hear natural pronunciation for different text types

  Scenario: Short word uses appropriate voice
    Given I am on the synthesis page
    When I enter a single word "Tere"
    And the synthesis completes
    Then the appropriate voice model is used for short text

  Scenario: Long sentence uses appropriate voice
    Given I am on the synthesis page
    When I enter a long sentence
    And the synthesis completes
    Then the appropriate voice model is used for long text

  Scenario: Phonetic text uses correct model
    Given I have edited the phonetic text with markers
    When I play the edited phonetic text
    Then the voice model matches the phonetic input type
`,

  'US-060-text-analysis': `@ready @synthesis @analysis @US-060
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
`,

  'US-061-pronunciation-variants-panel': `@ready @synthesis @variants @US-061
Feature: Pronunciation variants panel interactions (US-061)
  As a language learner
  I want to explore pronunciation variants for a selected word
  So that I can choose the correct pronunciation for my context

  Background:
    Given I am on the synthesis page
    And I am viewing synthesis results

  Scenario: Open variants panel for a word
    When I click on a word tag
    And I select "View variants"
    Then the pronunciation variants panel opens
    And variants are fetched from the API

  Scenario: See list of pronunciation variants
    Given the variants panel is open
    Then I see a list of unique pronunciation variants
    And each variant shows its phonetic description

  Scenario: Play a pronunciation variant
    Given the variants panel is open
    When I click play on a variant
    Then I hear the audio for that variant

  Scenario: Use a variant in the sentence
    Given the variants panel is open
    When I click "Use" on a variant
    Then the variant replaces the word in the sentence

  Scenario: Close variants panel
    Given the variants panel is open
    When I click the close button
    Then the variants panel closes
`,

  'US-062-phonetic-markers': `@ready @synthesis @markers @US-062
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
`,

  'US-064-synthesis-polling': `@ready @synthesis @api @US-064
Feature: Asynchronous synthesis with polling (US-064)
  As a language learner
  I want synthesis to poll for results when processing takes time
  So that I eventually hear the audio even for complex text

  Scenario: Immediate result from cache
    Given I previously synthesized "Tere"
    When I synthesize "Tere" again
    Then the cached audio URL is returned immediately
    And no polling is needed

  Scenario: Poll for processing result
    Given I enter new text that requires processing
    When the synthesis API returns processing status
    Then the system polls the status endpoint
    And returns the audio when ready

  Scenario: Timeout after max poll attempts
    Given I enter text for synthesis
    When the synthesis does not complete within the timeout
    Then I see a timeout error notification

  Scenario: Handle error during polling
    Given the synthesis is being polled
    When the status endpoint returns an error
    Then polling stops
    And I see an error notification
`,

  'US-068-custom-variant-form': `@ready @synthesis @custom-variant @US-068
Feature: Create and test custom pronunciation variant (US-068)
  As a language researcher
  I want to create custom phonetic variants with markers
  So that I can experiment with specific pronunciations

  Scenario: Open custom variant form
    Given the pronunciation variants panel is open
    When I click to create a custom variant
    Then I see the custom variant input form

  Scenario: Enter custom phonetic text
    Given the custom variant form is open
    When I type a custom phonetic variant with markers
    Then I see the text in the input field

  Scenario: Play custom variant audio
    Given I have entered a custom phonetic variant
    When I click the play button
    Then I hear the synthesized audio for my custom text

  Scenario: Use custom variant in sentence
    Given I have entered a custom phonetic variant
    When I click the "Helinda" button
    Then the custom variant is applied to the sentence

  Scenario: Clear custom variant input
    Given I have entered a custom phonetic variant
    When I click the clear button
    Then the input field is emptied
`,

  'US-075-sentence-item-modes': `@ready @synthesis @component @US-075
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
`,

  'US-080-audio-warm-worker': `@ready @synthesis @performance @US-080
Feature: Audio warm-up worker for faster playback (US-080)
  As a language learner
  I want the audio system to be pre-warmed
  So that the first playback starts without delay

  Scenario: Audio context is initialized on page load
    Given I am on the synthesis page
    When the page finishes loading
    Then the audio warm-up worker initializes

  Scenario: First play has minimal delay after warm-up
    Given the audio system has been warmed up
    When I click play for the first time
    Then playback starts without noticeable extra delay

  Scenario: Audio works without warm-up as fallback
    Given the warm-up worker failed to initialize
    When I click play
    Then audio still works with standard initialization
`,

  'US-081-audio-player-lifecycle': `@ready @synthesis @audio @US-081
Feature: Audio player lifecycle management (US-081)
  As a language learner
  I want the audio player to properly manage its lifecycle
  So that playback is reliable and resources are cleaned up

  Scenario: Stop current audio when playing new sentence
    Given audio is playing for one sentence
    When I play a different sentence
    Then the previous audio stops
    And the new audio starts

  Scenario: Clean up audio on component unmount
    Given audio is playing
    When I navigate away from the page
    Then the audio is stopped and resources are released

  Scenario: Abort sequential playback
    Given sequential playback is in progress
    When I click the play all button to stop
    Then the abort signal is triggered
    And all playback stops immediately

  Scenario: Handle audio play promise rejection
    Given the browser blocks autoplay
    When audio play is attempted
    Then the error is handled gracefully
    And the UI returns to idle state
`,

  'US-085-copy-text-to-clipboard': `@ready @synthesis @clipboard @US-085
Feature: Copy synthesized text to clipboard (US-085)
  As a language learner
  I want to copy sentence text to the system clipboard
  So that I can paste it into other applications

  Scenario: Copy text from sentence menu
    Given I am on the synthesis page
    And I have a sentence "Tere tulemast"
    When I copy the sentence text via the menu
    Then the text is in my clipboard
    And I see a success notification

  Scenario: Copy text from task entry
    Given I am viewing a task with entries
    When I copy an entry's text
    Then the text is in my clipboard
    And I see "Tekst kopeeritud!" notification

  Scenario: Handle clipboard permission denied
    Given the browser denies clipboard access
    When I try to copy text
    Then I see an error notification
`,

  'US-086-sentence-download-wav': `@ready @synthesis @download @US-086
Feature: Download sentence audio as WAV file (US-086)
  As a language learner
  I want to download synthesized audio as a WAV file
  So that I can listen offline or use the audio in other tools

  Scenario: Download audio from sentence menu
    Given I am on the synthesis page
    And I have synthesized audio for "Tere"
    When I click "Lae alla .wav fail" in the sentence menu
    Then a WAV file download starts

  Scenario: Download button disabled without text
    Given I have an empty sentence
    When I open the sentence menu
    Then the download option is disabled

  Scenario: Download audio from task detail
    Given I am viewing a task with audio entries
    When I download audio for an entry
    Then the WAV file is saved to my device
`,

  'US-089-sentence-menu-auth-guard': `@ready @synthesis @auth @US-089
Feature: Sentence menu adapts to auth state (US-089)
  As a user of the application
  I want the sentence menu to show different options based on login
  So that I see relevant actions for my authentication state

  Scenario: Authenticated user sees full menu
    Given I am authenticated
    And I am on the synthesis page
    When I open the sentence context menu
    Then I see task search, create task, phonetic, download, copy, and remove

  Scenario: Unauthenticated user sees limited menu
    Given I am not authenticated
    And I am on the synthesis page
    When I open the sentence context menu
    Then I see "Lisa ülesandesse" which triggers login
    And I see phonetic, download, copy, and remove options

  Scenario: Clicking add to task triggers login for guest
    Given I am not authenticated
    When I click "Lisa ülesandesse" in the menu
    Then the login modal opens
`,

  'US-091-synthesis-view-layout': `@ready @synthesis @layout @US-091
Feature: Synthesis page layout and header (US-091)
  As a language learner
  I want the synthesis page to have a clear layout
  So that I can easily enter text and manage sentences

  Scenario: See synthesis page header with controls
    Given I am on the synthesis page
    Then I see the page header with "Mängi kõik" button
    And I see the "Lisa ülesandesse" button

  Scenario: Add sentence button at bottom of list
    Given I am on the synthesis page
    Then I see an add sentence button below the sentence list

  Scenario: Sentence rows are numbered
    Given I have multiple sentence rows
    Then each row displays its position number

  Scenario: Variants panel appears beside sentence
    Given I opened the variants panel for a word
    Then the panel appears as a side panel
    And it does not overlap other sentences
`,

  'US-093-demo-sentences': `@ready @synthesis @onboarding @US-093
Feature: Demo sentences for new users (US-093)
  As a new user going through onboarding
  I want to see pre-filled demo sentences
  So that I can immediately try the synthesis features

  Scenario: Demo sentences appear during onboarding
    Given I have selected a role
    And the onboarding wizard is active
    Then demo sentences are pre-filled in the input rows

  Scenario: Demo sentences are playable
    Given demo sentences are pre-filled
    When I click play on a demo sentence
    Then I hear the synthesized audio

  Scenario: Demo sentences can be edited
    Given demo sentences are pre-filled
    When I modify a demo sentence text
    Then the modified text is used for synthesis
`,

  'US-096-stressed-text-display': `@ready @synthesis @display @US-096
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
`,

  'US-098-variants-api-error': `@ready @synthesis @variants @US-098
Feature: Handle variants API errors gracefully (US-098)
  As a language learner
  I want the variants panel to handle API errors
  So that I can continue using the app even when variants fail

  Scenario: Show error when variants API fails
    Given I am on the synthesis page
    When I click a word tag to view variants
    And the variants API returns an error
    Then I see an error message in the variants panel

  Scenario: Retry after variants API failure
    Given the variants panel shows an error
    When I close and reopen the variants panel
    Then a new API request is made

  Scenario: Show loading state while fetching variants
    When I click a word tag to view variants
    Then the variants panel shows a loading indicator
`,
};
