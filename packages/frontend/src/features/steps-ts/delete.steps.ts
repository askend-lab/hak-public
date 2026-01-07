/**
 * Step definitions for delete/remove features (US-012)
 */

import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';

import { getTextInputs, getSentenceCount, setupSentences, findMenuItem, clickMenuButton } from './helpers';
import type { TestWorld } from './setup';

// US-012: Delete sentence
Given('I have sentence rows in the list', async function (this: TestWorld) {
  await this.renderApp();
  await this.waitFor(() => {
    assert.ok(getSentenceCount(this.container) >= 1, 'Should have at least 1 sentence row');
  });
});

When('I click the three-dots menu on a sentence', async function (this: TestWorld) {
  clickMenuButton(this.container, 0, (el) => this.click(el));
  // Wait for menu to open
  await this.waitFor(() => {
    const dropdown = this.container?.querySelector('.more-menu__dropdown');
    if (!dropdown) throw new Error('Menu dropdown should be visible');
  });
});

Then('I see an {string} option in the dropdown', async function (this: TestWorld, optionText: string) {
  await this.waitFor(() => {
    const option = findMenuItem(this.container, optionText);
    assert.ok(option, `Should find "${optionText}" option`);
  });
});

Given('I have {int} sentences in the list', async function (this: TestWorld, count: number) {
  await this.renderApp();
  setupSentences(this.container, count, Array(count).fill('Test'), (el) => this.click(el), (el, text) => this.type(el, text));
  await this.waitFor(() => {
    assert.ok(getSentenceCount(this.container) >= count, `Should have at least ${count} sentences`);
  });
});

When('I click {string} on the second sentence', async function (this: TestWorld, _buttonText: string) {
  clickMenuButton(this.container, 1, (el) => this.click(el));
  await this.waitFor(() => {
    const removeBtn = findMenuItem(this.container, 'eemalda');
    assert.ok(removeBtn, 'Should find Eemalda option');
    this.click(removeBtn as Element);
  });
});

Then('the sentence is removed from the list', async function (this: TestWorld) {
  await this.waitFor(() => {
    const count = getSentenceCount(this.container);
    assert.ok(count >= 1, 'Sentence list should update after removal');
  });
});

Then('I have {int} sentences remaining', async function (this: TestWorld, count: number) {
  await this.waitFor(() => {
    assert.strictEqual(getSentenceCount(this.container), count, `Should have ${count} sentences`);
  });
});

// US-012: Last sentence becomes empty
Given('I have only {int} sentence in the list', async function (this: TestWorld, _count: number) {
  await this.renderApp();
  const inputs = getTextInputs(this.container);
  if (inputs?.[0]) this.type(inputs[0], 'Test sentence');
});

When('I click {string} on that sentence', async function (this: TestWorld, _buttonText: string) {
  clickMenuButton(this.container, 0, (el) => this.click(el));
  await this.waitFor(() => {
    const removeBtn = findMenuItem(this.container, 'eemalda');
    assert.ok(removeBtn, 'Should find Eemalda option');
    this.click(removeBtn as Element);
  });
});

Then('the sentence is cleared to empty', async function (this: TestWorld) {
  await this.waitFor(() => {
    const inputs = getTextInputs(this.container);
    assert.ok(inputs?.[0]?.value === '', 'First input should be empty');
  });
});

Then('I still have {int} sentence row visible', async function (this: TestWorld, count: number) {
  await this.waitFor(() => {
    assert.strictEqual(getSentenceCount(this.container), count, `Should have ${count} sentence row`);
  });
});
