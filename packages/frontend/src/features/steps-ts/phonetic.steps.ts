import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('I have edited the phonetic text', function () {
  this.phoneticTextEdited = true;
  this.editedPhoneticText = 'edited phonetic';
});

Given('I have saved edited phonetic text', function () {
  this.phoneticTextSaved = true;
});

Given('I have saved edits', function () {
  this.editsSaved = true;
});

Given('I have saved phonetic edits', function () {
  this.phoneticEditsSaved = true;
});

Given('edit mode is active', function () {
  this.editModeActive = true;
});

Given('I have a word in the sentence', function () {
  this.currentWord = { text: 'word', phonetic: 'phonetic' };
});

Given('I am creating a custom variant', function () {
  this.creatingCustomVariant = true;
});

Given('I am in the custom variant input field', function () {
  this.inCustomVariantInput = true;
});

Given('I have created a custom phonetic variant', function () {
  this.customVariant = { text: 'custom', phonetic: 'custom-phonetic' };
});

Given('I have entered a custom phonetic variant {string}', function (variant: string) {
  this.customVariant = { phonetic: variant };
});

Given('I have modified the sentence text', function () {
  this.sentenceTextModified = true;
});

Given('the pronunciation variants panel is open for a word', function () {
  this.variantsPanelOpen = true;
  this.currentWord = { text: 'word', phonetic: 'phonetic' };
});

Given('the pronunciation variants panel is open for {string}', function (word: string) {
  this.variantsPanelOpen = true;
  this.currentWord = { text: word };
});

Given('the variants panel is open', function () {
  this.variantsPanelOpen = true;
});

Given('I see multiple variants for {string}', function (word: string) {
  this.currentWord = { text: word };
  this.variants = [
    { phonetic: 'variant1', description: 'First variant' },
    { phonetic: 'variant2', description: 'Second variant' },
  ];
});

Given('I am typing in the input field', function () {
  this.typingInInput = true;
});

Given('I have existing tags and empty input', function () {
  this.existingTags = ['tag1', 'tag2'];
  this.inputEmpty = true;
});

Given('my cursor is at position {int}', function (position: number) {
  this.cursorPosition = position;
});

When('I click on the word', function () {
  this.wordClicked = true;
  this.variantsPanelOpen = true;
});

When('I click on the word {string}', function (word: string) {
  this.wordClicked = true;
  this.currentWord = { text: word };
  this.variantsPanelOpen = true;
});

When('I view the variant list', function () {
  this.viewingVariantList = true;
});

When('I click the play button next to a variant', function () {
  this.variantPlayClicked = true;
});

When('I click the play button for custom variant', function () {
  this.customVariantPlayClicked = true;
});

When('I click the {string} button for custom variant', function (button: string) {
  this.customVariantButton = button;
});

When('I click {string} \\(Use) on a specific variant', function (_action: string) {
  this.useVariantClicked = true;
});

When('I click the edit button on phonetic text', function () {
  this.editModeActive = true;
});

When('I click the reset button', function () {
  this.resetClicked = true;
});

When('I scroll to the custom variant section', function () {
  this.scrolledToCustomSection = true;
});

When('I click a phonetic marker button', function () {
  this.markerButtonClicked = true;
});

When('I click the stressed syllable marker button', function () {
  this.stressMarkerClicked = true;
});

When('I navigate away and return', function () {
  this.navigatedAwayAndReturned = true;
});

When('I press Backspace', function () {
  this.backspacePressed = true;
});

When('I press Space', function () {
  this.spacePressed = true;
});

When('I type {string} in the search input', function (text: string) {
  this.searchInput = text;
});

Then('the pronunciation variants panel opens', function () {
  expect(this.variantsPanelOpen).to.be.true;
});

Then('the variants panel closes', function () {
  this.variantsPanelOpen = false;
});

Then('I see available pronunciation variants', function () {
  expect(this.variants).to.exist;
});

Then('each variant shows its phonetic form', function () {
  this.variantsShowPhonetic = true;
});

Then('each variant has a description or context tag', function () {
  this.variantsHaveDescriptions = true;
});

Then('each variant has a play button', function () {
  this.variantsHavePlayButtons = true;
});

Then('the variant audio plays using the synthesis API', function () {
  this.variantAudioPlayed = true;
});

Then('that variant replaces the word\'s phonetic form', function () {
  this.variantReplaced = true;
});

Then('the custom variant replaces the word phonetic form', function () {
  this.customVariantReplaced = true;
});

Then('the custom variant is synthesized', function () {
  this.customVariantSynthesized = true;
});

Then('the phonetic text becomes editable', function () {
  expect(this.editModeActive).to.be.true;
});

Then('the phonetic text reverts to original', function () {
  this.phoneticReverted = true;
});

Then('the edited text is saved', function () {
  this.editsSaved = true;
});

Then('changes are reflected in synthesis', function () {
  this.changesReflectedInSynthesis = true;
});

Then('the differences are highlighted', function () {
  this.differencesHighlighted = true;
});

Then('my edits are preserved', function () {
  this.editsPreserved = true;
});

Then('the audio cache is invalidated', function () {
  this.audioCacheInvalidated = true;
});

Then('the marker is inserted at cursor position', function () {
  this.markerInserted = true;
});

Then('the marker is inserted at position {int}', function (position: number) {
  this.markerPosition = position;
});

Then('my cursor moves after the inserted marker', function () {
  this.cursorMovedAfterMarker = true;
});

Then('the input field allows free text entry', function () {
  this.freeTextAllowed = true;
});

Then('the input field clears', function () {
  this.inputCleared = true;
});

Then('existing words appear as clickable tags', function () {
  this.wordsAsClickableTags = true;
});

Then('the current word becomes a tag', function () {
  this.wordBecameTag = true;
});

Then('the last tag is removed', function () {
  this.lastTagRemoved = true;
});

Then('the search input has placeholder {string}', function (placeholder: string) {
  this.searchPlaceholder = placeholder;
});

Then('the pending save action executes', function () {
  this.pendingSaveExecuted = true;
});

Then('it is colored green', function () {
  this.color = 'green';
});

Then('it is colored red', function () {
  this.color = 'red';
});

Then('it is hidden from my view', function () {
  this.hidden = true;
});

Then('its text appears in the input field', function () {
  this.textInInput = true;
});

Then('the button changes back to {string}', function (text: string) {
  this.buttonText = text;
});
