/**
 * Step definitions for phonetic guide features (US-024)
 */

import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';

import type { TestWorld } from './setup';

// US-024: View phonetic guide
Given('I am viewing the synthesis page', async function (this: TestWorld) {
  await this.renderApp();
  // Enter text to trigger phonetic display
  const input = this.container?.querySelector('input[type="text"], textarea') as HTMLInputElement;
  if (input) this.type(input, 'tere');
  await this.waitFor(() => {
    assert.ok(this.container, 'Synthesis page should be rendered');
  });
});

When(/^I click the help icon \(\?\) near the phonetic text$/, async function (this: TestWorld) {
  // Find and click help icon near phonetic text
  await this.waitFor(() => {
    const helpIcon = this.container?.querySelector('[data-testid="phonetic-help"], button[aria-label*="help"], .help-icon');
    assert.ok(helpIcon, 'Help icon should exist near phonetic text');
    this.click(helpIcon);
  });
});

Then('the phonetic guide modal opens', async function (this: TestWorld) {
  await this.waitFor(() => {
    const modal = this.container?.querySelector('[role="dialog"][aria-label*="Phonetic"], .phonetic-guide-modal');
    assert.ok(modal, 'Phonetic guide modal should be open');
  });
});

Then('I see explanations for phonetic symbols', async function (this: TestWorld) {
  await this.waitFor(() => {
    const text = this.container?.textContent ?? '';
    assert.ok(text.includes('Kolmas pikkusaste') || text.includes('third degree'), 'Should see symbol explanations');
  });
});

Given('the phonetic guide is open', async function (this: TestWorld) {
  await this.renderApp();
  // Click help icon to open modal
  const helpIcon = this.container?.querySelector('[data-testid="phonetic-help"]');
  if (helpIcon) this.click(helpIcon);
  await this.waitFor(() => {
    const modal = this.container?.querySelector('[role="dialog"]');
    assert.ok(modal, 'Modal should be open');
  });
});

When(/^I read through the content$/, async function (this: TestWorld) {
  const modal = this.container?.querySelector('[role="dialog"]');
  assert.ok(modal, 'Modal content should be readable');
});

Then(/^I see explanation for ` \(third degree length\)$/, async function (this: TestWorld) {
  const text = this.container?.textContent ?? '';
  assert.ok(text.includes('`') && text.includes('Kolmas pikkusaste'), 'Should explain ` symbol');
});

Then(/^I see explanation for ´ \(stress marker\)$/, async function (this: TestWorld) {
  const text = this.container?.textContent ?? '';
  assert.ok(text.includes('´') && text.includes('Rõhumärk'), 'Should explain ´ symbol');
});

Then(/^I see explanation for ' \(palatalization\)$/, async function (this: TestWorld) {
  const text = this.container?.textContent ?? '';
  assert.ok(text.includes("'") && text.includes('Palatalisatsioon'), 'Should explain palatalization');
});

Then(/^I see explanation for \+ \(compound word boundary\)$/, async function (this: TestWorld) {
  const text = this.container?.textContent ?? '';
  assert.ok(text.includes('+') && text.includes('Liitsõna'), 'Should explain + symbol');
});

When(/^I view a symbol's explanation$/, async function (this: TestWorld) {
  const modal = this.container?.querySelector('[role="dialog"]');
  assert.ok(modal, 'Symbol explanation should be visible in modal');
});

Then('I see example words using that symbol', async function (this: TestWorld) {
  const text = this.container?.textContent ?? '';
  assert.ok(text.includes('Näide:'), 'Should see example words');
});

Then('the examples show correct usage in context', async function (this: TestWorld) {
  const text = this.container?.textContent ?? '';
  assert.ok(text.includes('sa`ada') || text.includes('kooli+tüdruk'), 'Examples should show usage');
});

Given('the phonetic guide modal is open', async function (this: TestWorld) {
  await this.renderApp();
  const helpIcon = this.container?.querySelector('[data-testid="phonetic-help"]');
  if (helpIcon) this.click(helpIcon);
  await this.waitFor(() => {
    const modal = this.container?.querySelector('[role="dialog"]');
    assert.ok(modal, 'Modal should be open');
  });
});

When('I click the close button', async function (this: TestWorld) {
  const closeButton = this.container?.querySelector('[aria-label="Close"]') as HTMLButtonElement;
  if (closeButton) {
    this.click(closeButton);
  } else {
    const buttons = this.container?.querySelectorAll('button');
    const close = Array.from(buttons ?? []).find(b => b.textContent?.includes('×'));
    if (close) this.click(close);
  }
});

Then('the modal closes', async function (this: TestWorld) {
  await this.waitFor(() => {
    const modal = this.container?.querySelector('.phonetic-guide-modal');
    assert.ok(!modal, 'Modal should be closed');
  });
});

Then('I return to the main synthesis view', async function (this: TestWorld) {
  const input = this.container?.querySelector('input[type="text"], textarea');
  assert.ok(input, 'Should see main synthesis view with input');
});
