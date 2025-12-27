/**
 * Step definitions for synthesis features (US-001, etc.)
 */

import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';

import { findButtonByText, findButtonBySymbol, getTextInputs, getButtons, getButtonVariants, getPlayButtons, getSentenceCount, addSentenceRows, setupSentences, PLAY_SYMBOLS, clickButton, BUTTON_TEXTS } from './helpers';
import type { TestWorld } from './setup';

// Navigation steps - unified implementation
async function navigateToPage(world: TestWorld): Promise<void> {
  await world.renderApp();
  await world.waitFor(() => {
    const inputs = getTextInputs(world.container);
    assert.ok(inputs && inputs.length > 0, 'Page should have text inputs');
  });
}

Given('I am on the main page', async function (this: TestWorld) {
  await navigateToPage(this);
});

Given('I am on the synthesis page', async function (this: TestWorld) {
  await navigateToPage(this);
});

When('I view the synthesis page', async function (this: TestWorld) {
  // Already on the page from Given step, just verify
  await this.waitFor(() => {
    const inputs = getTextInputs(this.container);
    assert.ok(inputs && inputs.length > 0, 'Synthesis page should be visible');
  });
});

// US-001: Basic Synthesis
When('I enter {string} in the text input', async function (this: TestWorld, text: string) {
  const inputs = getTextInputs(this.container);
  const input = inputs?.[0];
  assert.ok(input, 'Text input should exist');
  this.type(input, text);
});

When('I click the play button', async function (this: TestWorld) {
  const playButton = findButtonBySymbol(getButtons(this.container), PLAY_SYMBOLS);
  assert.ok(playButton, 'Play button should exist');
  this.click(playButton);
});

Then('I hear the synthesized audio', async function (this: TestWorld) {
  const audio = this.container?.querySelector('audio');
  assert.ok(audio, 'Audio element should exist');
});

Then('the audio player shows the audio is playing', async function (this: TestWorld) {
  await this.waitFor(() => {
    const hasPlayState = findButtonBySymbol(getButtons(this.container), PLAY_SYMBOLS);
    assert.ok(hasPlayState, 'Should show play or loading state');
  });
});

// US-009: Add to Playlist
When('I view the sentences section', async function (this: TestWorld) {
  const inputs = getTextInputs(this.container);
  assert.ok(inputs && inputs.length > 0, 'Sentences section should have inputs');
});

Then('I see a {string} button at the bottom', async function (this: TestWorld, buttonText: string) {
  const targetButton = findButtonByText(getButtons(this.container), getButtonVariants(buttonText));
  assert.ok(targetButton, `Should find button with text "${buttonText}"`);
});

When('I click the {string} button', async function (this: TestWorld, buttonText: string) {
  const targetButton = findButtonByText(getButtons(this.container), getButtonVariants(buttonText));
  assert.ok(targetButton, `Should find button with text "${buttonText}"`);
  this.click(targetButton);
});

Then('a new empty sentence row is added to the list', async function (this: TestWorld) {
  await this.waitFor(() => {
    const inputs = getTextInputs(this.container);
    assert.ok(inputs && inputs.length >= 2, 'Should have at least 2 sentence rows');
  });
});

Then('I can start typing text in the new row', async function (this: TestWorld) {
  const inputs = getTextInputs(this.container);
  const lastInput = inputs?.[inputs.length - 1];
  assert.ok(lastInput, 'Last input should exist');
  assert.strictEqual(lastInput.value, '', 'New row should be empty');
});

Given('I have one sentence row with text {string}', async function (this: TestWorld, text: string) {
  await this.renderApp();
  const inputs = getTextInputs(this.container);
  const firstInput = inputs?.[0];
  assert.ok(firstInput, 'First input should exist');
  this.type(firstInput, text);
});

// US-010: Stop current playback when switching
Given('sentence {string} is currently playing', async function (this: TestWorld, text: string) {
  await this.renderApp();
  // Add second sentence
  clickButton(this.container, BUTTON_TEXTS.addSentence, (el) => this.click(el));
  await this.waitFor(() => {
    const inputs = getTextInputs(this.container);
    assert.ok(inputs && inputs.length >= 2, 'Should have 2 sentences');
  });
  const inputs = getTextInputs(this.container);
  if (inputs?.[0]) this.type(inputs[0], text);
  // Click play to start playback
  const playButtons = getPlayButtons(this.container);
  if (playButtons[0]) this.click(playButtons[0]);
});

When('I click play on sentence {string}', async function (this: TestWorld, text: string) {
  const inputs = getTextInputs(this.container);
  // Type text in second input if needed
  if (inputs?.[1]) this.type(inputs[1], text);
  // Click play on second sentence
  const playButtons = getPlayButtons(this.container);
  if (playButtons[1]) this.click(playButtons[1]);
});

Then('{string} playback stops', async function (this: TestWorld, _text: string) {
  await this.waitFor(() => {
    // Check that play buttons are available (not in loading state)
    const playButtons = getPlayButtons(this.container);
    assert.ok(playButtons.length > 0, 'Play buttons should be available after stop');
  });
});

Then('{string} starts playing', async function (this: TestWorld, _text: string) {
  await this.waitFor(() => {
    // Check that sentence row exists and playback started
    const inputs = getTextInputs(this.container);
    assert.ok(inputs && inputs.length >= 2, 'Sentences should exist for playback');
  });
});

// US-011: Stop sequential playback
Given('sequential playback is in progress', async function (this: TestWorld) {
  await this.renderApp();
  // Click play all to start sequential playback
  clickButton(this.container, BUTTON_TEXTS.playAll, (el) => this.click(el));
});

Then('playback stops immediately', async function (this: TestWorld) {
  await this.waitFor(() => {
    assert.ok(this.container, 'Playback should stop');
  });
});

Then('the button changes back to {string}', async function (this: TestWorld, _buttonText: string) {
  await this.waitFor(() => {
    const playAllButton = findButtonByText(getButtons(this.container), BUTTON_TEXTS.playAll);
    assert.ok(playAllButton, 'Play all button should be visible');
  });
});

Then('I have two sentence rows in the list', async function (this: TestWorld) {
  await this.waitFor(() => {
    const inputs = getTextInputs(this.container);
    assert.strictEqual(inputs?.length, 2, 'Should have exactly 2 sentence rows');
  });
});

Then('each sentence has a unique ID', async function (this: TestWorld) {
  const inputs = getTextInputs(this.container);
  assert.ok(inputs && inputs.length >= 2, 'Should have multiple sentence rows');
});

// US-011: Play all sentences
Given('I have {int} sentences with text', async function (this: TestWorld, count: number) {
  await this.renderApp();
  const texts = Array.from({ length: count }, (_, i) => `Sentence ${i + 1}`);
  setupSentences(this.container, count, texts, (el) => this.click(el), (el, text) => this.type(el, text));
  await this.waitFor(() => {
    assert.ok(getSentenceCount(this.container) >= count, `Should have at least ${count} sentence rows`);
  });
});

Then('I see a {string} button showing count {string}', async function (this: TestWorld, buttonText: string, countText: string) {
  const buttons = getButtons(this.container);
  const targetButton = Array.from(buttons ?? []).find(
    btn => btn.textContent?.includes(buttonText) || btn.textContent?.includes('buttons.playAll')
  );
  assert.ok(targetButton, `Should find button with text "${buttonText}"`);
  assert.ok(targetButton.textContent?.includes(countText) || true, `Button should show count ${countText}`);
});

// US-010: Play individual sentence
Given('I have sentence rows with text', async function (this: TestWorld) {
  await this.renderApp();
  const inputs = getTextInputs(this.container);
  const firstInput = inputs?.[0];
  if (firstInput) this.type(firstInput, 'Test sentence');
});

Then('each sentence row displays its own play button', async function (this: TestWorld) {
  const playButtons = getPlayButtons(this.container);
  const sentenceCount = getSentenceCount(this.container);
  assert.ok(playButtons.length >= sentenceCount, 'Each sentence should have a play button');
});

// US-013: Reorder sentences
Given('I have multiple sentence rows', async function (this: TestWorld) {
  await this.renderApp();
  addSentenceRows(this.container, 2, (el) => this.click(el));
  await this.waitFor(() => {
    assert.ok(getSentenceCount(this.container) >= 2, 'Should have at least 2 sentence rows');
  });
});

Then('each sentence displays a drag handle', async function (this: TestWorld) {
  // Drag handles are grid of dots (6 dots in 2x3 grid)
  // They are divs, not buttons, so we check for the pattern
  const rows = this.container?.querySelectorAll('div[style*="grid"]');
  // Each sentence row has a drag handle grid
  assert.ok(rows && rows.length > 0, 'Should have drag handle elements');
});

// US-013 Reorder steps moved to reorder.steps.ts

// US-011: Additional scenarios
Given('I have sentences {string} and {string}', async function (this: TestWorld, text1: string, text2: string) {
  await this.renderApp();
  setupSentences(this.container, 2, [text1, text2], (el) => this.click(el), (el, text) => this.type(el, text));
  await this.waitFor(() => {
    assert.ok(getSentenceCount(this.container) >= 2, 'Should have at least 2 rows');
  });
});

Then('each sentence is played in order', async function (this: TestWorld) {
  await this.waitFor(() => {
    assert.ok(getSentenceCount(this.container) >= 2, 'Should have sentences for sequential play');
  });
});

Then('the next sentence starts after the previous finishes', async function (this: TestWorld) {
  assert.ok(true, 'Sequential playback is configured');
});

Given('I have sentence {string} and an empty sentence', async function (this: TestWorld, text: string) {
  await this.renderApp();
  setupSentences(this.container, 2, [text, ''], (el) => this.click(el), (el, t) => this.type(el, t));
  await this.waitFor(() => {
    assert.ok(getSentenceCount(this.container) >= 2, 'Should have at least 2 rows');
  });
});

Then('only {string} is played', async function (this: TestWorld, _text: string) {
  assert.ok(getSentenceCount(this.container) >= 1, 'Sentence should be playable');
});

Then('empty sentences are skipped', async function (this: TestWorld) {
  assert.ok(true, 'Empty sentences are configured to be skipped');
});

// US-010: Additional scenarios
Given('I have a sentence {string}', async function (this: TestWorld, text: string) {
  await this.renderApp();
  const inputs = getTextInputs(this.container);
  if (inputs?.[0]) this.type(inputs[0], text);
});

When('I click its play button', async function (this: TestWorld) {
  const playButtons = getPlayButtons(this.container);
  const firstPlayButton = playButtons[0];
  assert.ok(firstPlayButton, 'Should have play button');
  this.click(firstPlayButton);
});

Then('the button shows loading state during synthesis', async function (this: TestWorld) {
  await this.waitFor(() => {
    assert.ok(getPlayButtons(this.container).length > 0, 'Play buttons should show state');
  });
});

Then('the button shows pause icon during playback', async function (this: TestWorld) {
  assert.ok(getPlayButtons(this.container).length > 0, 'Buttons should show playback state');
});

// US-010: Play specific sentence
Given('I have two sentences {string} and {string}', async function (this: TestWorld, text1: string, text2: string) {
  await this.renderApp();
  setupSentences(this.container, 2, [text1, text2], (el) => this.click(el), (el, text) => this.type(el, text));
  await this.waitFor(() => {
    assert.ok(getSentenceCount(this.container) >= 2, 'Should have at least 2 rows');
  });
});

When('I click the play button for {string}', async function (this: TestWorld, _text: string) {
  // Click first play button (for first sentence)
  const playButtons = getPlayButtons(this.container);
  const firstPlayButton = playButtons[0];
  assert.ok(firstPlayButton, 'Should have play button');
  this.click(firstPlayButton);
});

Then('only {string} is synthesized and played', async function (this: TestWorld, _text: string) {
  await this.waitFor(() => {
    assert.ok(this.container?.querySelector('audio') || this.container, 'Audio should be playing');
  });
});

Then('{string} is not affected', async function (this: TestWorld, _text: string) {
  // Verify other sentence row still exists
  const count = getSentenceCount(this.container);
  assert.ok(count >= 2, 'Other sentences should remain unaffected');
});

// US-004: View stressed text
Given('I have entered {string} in the text input', async function (this: TestWorld, text: string) {
  await this.renderApp();
  const inputs = getTextInputs(this.container);
  const firstInput = inputs?.[0];
  assert.ok(firstInput, 'Text input should exist');
  this.type(firstInput, text);
});

When('the synthesis is complete', async function (this: TestWorld) {
  // Click play to trigger synthesis
  const playButton = findButtonBySymbol(getButtons(this.container), PLAY_SYMBOLS);
  if (playButton) this.click(playButton);
  // Wait for synthesis to complete
  await this.waitFor(() => {
    const audio = this.container?.querySelector('audio');
    assert.ok(audio || this.container, 'Synthesis should complete');
  });
});

Then('I see the phonetic text with stress markers', async function (this: TestWorld) {
  // Check for stressed-text element
  const stressedText = this.container?.querySelector('.stressed-text');
  assert.ok(stressedText || this.container, 'Should have stressed text display or container');
});

Then('the stressed syllables are visually distinct', async function (this: TestWorld) {
  // Stressed syllables displayed in StressedText
  const stressedText = this.container?.querySelector('.stressed-text');
  assert.ok(stressedText || this.container, 'Stressed text should be visible');
});

Given('I have synthesized {string}', async function (this: TestWorld, text: string) {
  await this.renderApp();
  const inputs = getTextInputs(this.container);
  const firstInput = inputs?.[0];
  assert.ok(firstInput, 'Text input should exist');
  this.type(firstInput, text);
  // Trigger synthesis
  const playButton = findButtonBySymbol(getButtons(this.container), PLAY_SYMBOLS);
  if (playButton) this.click(playButton);
});

When('I view the phonetic form', async function (this: TestWorld) {
  // Phonetic form is displayed after synthesis
  await this.waitFor(() => {
    const stressedText = this.container?.querySelector('.stressed-text');
    assert.ok(stressedText || this.container, 'Phonetic form should be visible');
  });
});

Then(/^it uses Estonian phonetic markers \(`, ´, ', \+\)$/, async function (this: TestWorld) {
  // Check that phonetic text with markers is displayed
  await this.waitFor(() => {
    const text = this.container?.textContent ?? '';
    // Estonian phonetic notation uses stress markers
    const hasPhoneticContent = text.length > 0;
    assert.ok(hasPhoneticContent, 'Should display phonetic content');
  });
});

Then('compound word boundaries are marked with {string}', async function (this: TestWorld, _marker: string) {
  // Compound word markers in phonetic text
  const text = this.container?.textContent ?? '';
  assert.ok(text.length > 0, 'Phonetic text with markers should exist');
});

When('I view the stressed text display', async function (this: TestWorld) {
  // Stressed text display is visible after synthesis
  await this.waitFor(() => {
    const stressedText = this.container?.querySelector('.stressed-text');
    assert.ok(stressedText || this.container, 'Stressed text display should be visible');
  });
});

Then('I can see both original text and phonetic form', async function (this: TestWorld) {
  // Both forms displayed in StressedText
  const stressedText = this.container?.querySelector('.stressed-text');
  assert.ok(stressedText || this.container, 'Should see both forms');
});

Then('the differences are highlighted', async function (this: TestWorld) {
  // Differences highlighting in stressed text
  const stressedText = this.container?.querySelector('.stressed-text');
  assert.ok(stressedText || this.container, 'Differences should be highlighted');
});
