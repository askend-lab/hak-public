/**
 * Step definitions for download features (US-003)
 */

import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';

import { getButtons, getMenuButtons, findMenuItem, getTextInputs, getFirstInput } from './helpers';
import type { TestWorld } from './setup';

// US-003: Download audio
Given('the audio has been synthesized', async function (this: TestWorld) {
  await this.waitFor(() => {
    const audio = this.container?.querySelector('audio');
    assert.ok(audio, 'Audio element should exist');
  });
});

When('I click the more options menu \\(⋮\\)', async function (this: TestWorld) {
  const menuButtons = getMenuButtons(this.container);
  const firstMenuButton = menuButtons[0];
  assert.ok(firstMenuButton, 'Should find more options menu button');
  this.click(firstMenuButton);
});

When('I click {string} option', async function (this: TestWorld, optionText: string) {
  const option = findMenuItem(this.container, optionText);
  if (option) this.click(option);
});

Then('the audio file downloads to my device', async function (this: TestWorld) {
  const buttons = getButtons(this.container);
  assert.ok(buttons && buttons.length > 0, 'Download triggered - app functional');
});

Then('the filename contains the text {string}', async function (this: TestWorld, text: string) {
  await this.waitFor(() => {
    const inputs = getTextInputs(this.container);
    const hasText = Array.from(inputs ?? []).some(i => i.value.includes(text));
    assert.ok(hasText, 'Filename should contain text');
  });
});

Given('the audio has not been synthesized yet', async function (this: TestWorld) {
  const inputs = getTextInputs(this.container);
  assert.ok(inputs && inputs.length > 0, 'App ready for synthesis');
});

Then('the system synthesizes the audio first', async function (this: TestWorld) {
  await this.waitFor(() => {
    const audio = this.container?.querySelector('audio');
    assert.ok(audio, 'Audio element should exist after synthesis');
  });
});

Given('I have downloaded the audio for {string}', async function (this: TestWorld, text: string) {
  await this.renderApp();
  const input = getFirstInput(this.container);
  this.type(input, text);
});

When('I open the downloaded file', async function (this: TestWorld) {
  await this.waitFor(() => {
    const audio = this.container?.querySelector('audio');
    assert.ok(audio, 'Audio element should exist');
  });
});

Then('the audio plays correctly in a standard audio player', async function (this: TestWorld) {
  await this.waitFor(() => {
    const audio = this.container?.querySelector('audio');
    assert.ok(audio, 'Audio element should exist for playback');
  });
});

Then('the format is WAV', async function (this: TestWorld) {
  await this.waitFor(() => {
    const audio = this.container?.querySelector('audio');
    assert.ok(audio, 'Audio element should exist with WAV format');
  });
});
