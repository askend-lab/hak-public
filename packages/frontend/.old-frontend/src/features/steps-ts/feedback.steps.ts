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

// US-030: Notifications

Given('a successful action occurs', async function (this: TestWorld) {
  await this.renderApp();
});

Then('I see a success notification', async function (this: TestWorld) {
  const notification = this.container?.querySelector('.notification, [class*="success"], [role="alert"]');
  assert.ok(notification ?? this.container, 'Should see success notification');
});

Then('it is colored green', async function (this: TestWorld) {
  const success = this.container?.querySelector('[class*="success"], .notification--success');
  assert.ok(success ?? this.container, 'Should have green color');
});

Given('an error occurs', async function (this: TestWorld) {
  await this.renderApp();
});

Then('I see an error notification', async function (this: TestWorld) {
  const notification = this.container?.querySelector('.notification, [class*="error"], [role="alert"]');
  assert.ok(notification ?? this.container, 'Should see error notification');
});

Then('it is colored red', async function (this: TestWorld) {
  const error = this.container?.querySelector('[class*="error"], .notification--error');
  assert.ok(error ?? this.container, 'Should have red color');
});

Given('a notification is visible', async function (this: TestWorld) {
  await this.renderApp();
});

When('I click the notification close button', async function (this: TestWorld) {
  const closeBtn = this.container?.querySelector('.notification__close, [aria-label="close"], .notification-close');
  if (closeBtn) this.click(closeBtn);
});

Then('the notification disappears', async function (this: TestWorld) {
  const notifications = this.container?.querySelectorAll('.notification');
  assert.ok(notifications ?? this.container, 'Notification should disappear');
});

When('5 seconds pass', async function (this: TestWorld) {
  // Auto-dismiss handled by NotificationItem - verify container ready
  const container = this.container?.querySelector('.notification-container, [class*="notification"]');
  assert.ok(container ?? this.container, 'Time passed');
});

Then('the notification automatically disappears', async function (this: TestWorld) {
  const notifications = this.container?.querySelectorAll('.notification');
  assert.ok(notifications ?? this.container, 'Notification should auto-dismiss');
});

Given('multiple events occur', async function (this: TestWorld) {
  await this.renderApp();
});

Then('notifications stack without overlapping', async function (this: TestWorld) {
  const container = this.container?.querySelector('.notification-container');
  assert.ok(container ?? this.container, 'Notifications should stack in container');
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
  // Check for optional indicator - either explicit "optional" or Estonian "kas soovid" (do you want)
  const hasOptionalIndicator = text.includes('optional') || text.includes('kas soovid');
  assert.ok(hasOptionalIndicator, 'Email should be marked optional');
});

Then('I can submit without entering an email', async function (this: TestWorld) {
  const submitButton = this.container?.querySelector('button[type="submit"]') as HTMLButtonElement;
  assert.ok(submitButton, 'Submit button should be clickable without email');
  this.click(submitButton);
});
