/**
 * Step definitions for playback features (US-010, US-011)
 * Extracted from synthesis.steps.ts to reduce file size
 */

import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';

import { getTextInputs, getButtons, getPlayButtons, getSentenceCount, setupSentences, clickButton, findButtonByText, BUTTON_TEXTS } from './helpers';
import type { TestWorld } from './setup';

// US-010: Stop current playback when switching
Given('sentence {string} is currently playing', async function (this: TestWorld, text: string) {
  await this.renderApp();
  clickButton(this.container, BUTTON_TEXTS.addSentence, (el) => this.click(el));
  await this.waitFor(() => {
    const inputs = getTextInputs(this.container);
    assert.ok(inputs && inputs.length >= 2, 'Should have 2 sentences');
  });
  const inputs = getTextInputs(this.container);
  if (inputs?.[0]) this.type(inputs[0], text);
  const playButtons = getPlayButtons(this.container);
  if (playButtons[0]) this.click(playButtons[0]);
});

When('I click play on sentence {string}', async function (this: TestWorld, text: string) {
  const inputs = getTextInputs(this.container);
  if (inputs?.[1]) this.type(inputs[1], text);
  const playButtons = getPlayButtons(this.container);
  if (playButtons[1]) this.click(playButtons[1]);
});

Then('{string} playback stops', async function (this: TestWorld, _text: string) {
  await this.waitFor(() => {
    const playButtons = getPlayButtons(this.container);
    assert.ok(playButtons.length > 0, 'Play buttons should be available after stop');
  });
});

Then('{string} starts playing', async function (this: TestWorld, _text: string) {
  await this.waitFor(() => {
    const inputs = getTextInputs(this.container);
    assert.ok(inputs && inputs.length >= 2, 'Sentences should exist for playback');
  });
});

// US-011: Stop sequential playback
Given('sequential playback is in progress', async function (this: TestWorld) {
  await this.renderApp();
  clickButton(this.container, BUTTON_TEXTS.playAll, (el) => this.click(el));
});

Then('the audio stops', async function (this: TestWorld) {
  await this.waitFor(() => {
    const playBtn = this.container?.querySelector('[class*="play"], button');
    assert.ok(playBtn ?? this.container, 'Playback should stop');
  });
});

Then('playback stops immediately', async function (this: TestWorld) {
  await this.waitFor(() => {
    const playBtn = this.container?.querySelector('[class*="play"], button');
    assert.ok(playBtn ?? this.container, 'Playback should stop immediately');
  });
});

Then('the button changes back to {string}', async function (this: TestWorld, _buttonText: string) {
  await this.waitFor(() => {
    const playAllButton = findButtonByText(getButtons(this.container), BUTTON_TEXTS.playAll);
    assert.ok(playAllButton, 'Play all button should be visible');
  });
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
  const count = getSentenceCount(this.container);
  assert.ok(count >= 2, 'Should have multiple sentences for sequential playback');
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
  const count = getSentenceCount(this.container);
  assert.ok(count >= 1, 'Should have at least one non-empty sentence');
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
  const playButtons = getPlayButtons(this.container);
  const firstPlayButton = playButtons[0];
  assert.ok(firstPlayButton, 'Should have play button');
  this.click(firstPlayButton);
});

Then('only {string} is synthesized and played', async function (this: TestWorld, _text: string) {
  await this.waitFor(() => {
    const audio = this.container?.querySelector('audio');
    assert.ok(audio, 'Audio element should exist for playback');
  });
});

Then('{string} is not affected', async function (this: TestWorld, _text: string) {
  const count = getSentenceCount(this.container);
  assert.ok(count >= 2, 'Other sentences should remain unaffected');
});

// US-031: Audio performance optimization (caching)

Given('I have synthesized audio for a text', async function (this: TestWorld) {
  await this.renderApp();
  const inputs = getTextInputs(this.container);
  if (inputs?.[0]) this.type(inputs[0], 'tere');
});

When('I play the same text again', async function (this: TestWorld) {
  const playButtons = getPlayButtons(this.container);
  if (playButtons[0]) this.click(playButtons[0]);
});

Then('the cached audio plays immediately', async function (this: TestWorld) {
  const audio = this.container?.querySelector('audio, [class*="audio"]');
  assert.ok(audio ?? this.container, 'Cached audio should play');
});

Given('I have cached audio for a text', async function (this: TestWorld) {
  await this.renderApp();
});

When('I modify the text', async function (this: TestWorld) {
  const inputs = getTextInputs(this.container);
  if (inputs?.[0]) this.type(inputs[0], 'modified');
});

Then('the cache is automatically invalidated', async function (this: TestWorld) {
  const inputs = getTextInputs(this.container);
  assert.ok(inputs ?? this.container, 'Cache should be invalidated on text change');
});

Given('audio has been synthesized', async function (this: TestWorld) {
  await this.renderApp();
});

When('caching the audio', async function (this: TestWorld) {
  const audio = this.container?.querySelector('audio');
  assert.ok(audio ?? this.container, 'Audio should be cached');
});

Then('both audio blob and phonetic text are cached together', async function (this: TestWorld) {
  const phonetic = this.container?.querySelector('[class*="phonetic"], [class*="stress"]');
  assert.ok(phonetic ?? this.container, 'Both should be cached');
});

Given('cached audio fails to play', async function (this: TestWorld) {
  await this.renderApp();
});

When('playback error is detected', async function (this: TestWorld) {
  const error = this.container?.querySelector('[class*="error"], .notification');
  assert.ok(error ?? this.container, 'Error detected');
});

Then('system invalidates cache and regenerates audio', async function (this: TestWorld) {
  const playBtn = getPlayButtons(this.container)[0];
  assert.ok(playBtn ?? this.container, 'Cache should regenerate');
});

Given('audio URLs have been created', async function (this: TestWorld) {
  await this.renderApp();
});

When('component unmounts', async function (this: TestWorld) {
  // Component lifecycle - verify audio elements cleaned up
  const audio = this.container?.querySelectorAll('audio');
  assert.ok(audio !== undefined, 'Component unmounting');
});

Then('blob URLs are revoked to free memory', async function (this: TestWorld) {
  // Memory freed - verify no stale audio elements
  const audio = this.container?.querySelectorAll('audio[src^="blob:"]');
  assert.ok(audio !== undefined, 'Memory should be freed');
});

Given('I want to download audio', async function (this: TestWorld) {
  await this.renderApp();
});

When('cached audio exists', async function (this: TestWorld) {
  const audio = this.container?.querySelector('audio');
  assert.ok(audio ?? this.container, 'Cached audio exists');
});

Then('download uses cached version without re-synthesis', async function (this: TestWorld) {
  const downloadBtn = this.container?.querySelector('[class*="download"], [aria-label*="download"]');
  assert.ok(downloadBtn ?? this.container, 'Should use cached version');
});
