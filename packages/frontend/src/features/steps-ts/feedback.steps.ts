/**
 * Step definitions for feedback features (US-029)
 */

import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';

import { BUTTON_TEXTS, findButtonByText, getButtons, clickButton } from './helpers';
import type { TestWorld } from './setup';

// US-029: Submit Feedback

Given('I am using the application', async function (this: TestWorld) {
  await this.renderApp();
});

When('I view the footer area', async function (this: TestWorld) {
  const footer = this.container?.querySelector('footer');
  assert.ok(footer, 'Footer should exist');
});

Then('I see a feedback button or link', async function (this: TestWorld) {
  const feedbackButton = findButtonByText(getButtons(this.container), BUTTON_TEXTS.feedback);
  assert.ok(feedbackButton, 'Should find feedback button');
});

When('I click the feedback button', async function (this: TestWorld) {
  clickButton(this.container, BUTTON_TEXTS.feedback, (el) => this.click(el));
});

Then('the feedback modal opens', async function (this: TestWorld) {
  await this.waitFor(() => {
    const modal = this.container?.querySelector('[role="dialog"][aria-label*="eedback"]');
    assert.ok(modal, 'Feedback modal should be open');
  });
});

Then('I see a message input field', async function (this: TestWorld) {
  const textarea = this.container?.querySelector('textarea, input[name="message"]');
  assert.ok(textarea, 'Message input field should exist');
});

Then('I see an optional email field', async function (this: TestWorld) {
  const emailField = this.container?.querySelector('input[type="email"], input[name="email"]');
  assert.ok(emailField, 'Email input field should exist');
});

Given('the feedback form is open', async function (this: TestWorld) {
  await this.renderApp();
  // Click feedback button to open form
  clickButton(this.container, BUTTON_TEXTS.feedback, (el) => this.click(el));
});

Given('I have entered {string} in the message field', async function (this: TestWorld, message: string) {
  const textarea = this.container?.querySelector('textarea, input[name="message"]') as HTMLTextAreaElement;
  assert.ok(textarea, 'Message field should exist');
  this.type(textarea, message);
});

When('I click the submit button', async function (this: TestWorld) {
  const submitButton = this.container?.querySelector('button[type="submit"]') as HTMLButtonElement;
  assert.ok(submitButton, 'Submit button should exist');
  this.click(submitButton);
});

Then('my feedback is submitted', async function (this: TestWorld) {
  await this.waitFor(() => {
    const text = this.container?.textContent ?? '';
    assert.ok(text.includes('Täname') || text.includes('Thank'), 'Feedback should be submitted');
  });
});

Then('I see a thank you confirmation message', async function (this: TestWorld) {
  await this.waitFor(() => {
    const text = this.container?.textContent ?? '';
    assert.ok(text.includes('Täname') || text.includes('Thank'), 'Should see thank you message');
  });
});

When('I view the email field', async function (this: TestWorld) {
  const emailField = this.container?.querySelector('input[type="email"], input[name="email"]');
  assert.ok(emailField, 'Email field should exist');
});

Then('it is clearly marked as optional', async function (this: TestWorld) {
  const text = this.container?.textContent?.toLowerCase() ?? '';
  assert.ok(text.includes('optional'), 'Email should be marked optional');
});

Then('I can submit without entering an email', async function (this: TestWorld) {
  const submitButton = this.container?.querySelector('button[type="submit"]') as HTMLButtonElement;
  assert.ok(submitButton, 'Submit button should be clickable without email');
  this.click(submitButton);
});
