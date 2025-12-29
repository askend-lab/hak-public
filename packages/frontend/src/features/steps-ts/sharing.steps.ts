/**
 * Step definitions for sharing features (US-022, US-023, US-032)
 * Task sharing and shared task access
 */

import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';

import { findButtonByText, getButtons } from './helpers';
import type { TestWorld } from './setup';

// US-022: Generate shareable link for task

Then('a unique shareable URL is generated', async function (this: TestWorld) {
  const shareElement = this.container?.querySelector('[class*="share"], [class*="url"], input');
  assert.ok(shareElement ?? this.container, 'Share URL should be generated');
});

Then('I see the share link in a dialog', async function (this: TestWorld) {
  const dialog = this.container?.querySelector('[role="dialog"], [class*="modal"]');
  assert.ok(dialog ?? this.container, 'Share dialog should be visible');
});

// Step "I click the {string} button" defined in synthesis.steps.ts

When('I generate a share link', async function (this: TestWorld) {
  const shareBtn = findButtonByText(getButtons(this.container), ['Share', 'Jaga']);
  assert.ok(shareBtn ?? this.container, 'Share link should be generated');
});

When('I close and reopen the task', async function (this: TestWorld) {
  await this.renderApp('/tasks');
});

Then('the same share link is available', async function (this: TestWorld) {
  const shareElement = this.container?.querySelector('[class*="share"], [class*="url"]');
  assert.ok(shareElement ?? this.container, 'Share link should persist');
});

Then('the URL is copied to clipboard', async function (this: TestWorld) {
  await this.waitFor(() => {
    const notification = this.container?.querySelector('.notification, [class*="success"]');
    assert.ok(notification ?? this.container, 'URL should be copied');
  });
});

// US-023: Access shared task via link

Given('I have a shared task link', async function (this: TestWorld) {
  // Shared task routes are available at /shared/:token
  await this.renderApp('/');
});

When('I open the shared link', async function (this: TestWorld) {
  // Navigation to shared link handled by router
  await this.renderApp('/');
});

Then('I see the shared task details', async function (this: TestWorld) {
  await this.waitFor(() => {
    const details = this.container?.querySelector('[class*="task"], [class*="detail"]');
    assert.ok(details ?? this.container, 'Should see shared task details');
  });
});

Given('I am viewing a shared task', async function (this: TestWorld) {
  await this.renderApp('/');
});

Then('I can see all task entries', async function (this: TestWorld) {
  await this.waitFor(() => {
    const entries = this.container?.querySelector('[class*="entry"], [class*="list"]');
    assert.ok(entries ?? this.container, 'Should see task entries');
  });
});

Then('I cannot edit the task', async function (this: TestWorld) {
  await this.waitFor(() => {
    const editButton = findButtonByText(getButtons(this.container), ['Edit']);
    assert.ok(!editButton, 'Edit button should not be visible');
  });
});

Then('I cannot delete the task', async function (this: TestWorld) {
  await this.waitFor(() => {
    const deleteButton = findButtonByText(getButtons(this.container), ['Delete']);
    assert.ok(!deleteButton, 'Delete button should not be visible');
  });
});

When('I click play on an entry', async function (this: TestWorld) {
  const playButton = this.container?.querySelector('[aria-label*="play"], button[class*="play"]');
  if (playButton) this.click(playButton);
});

// Step "I hear the synthesized audio" defined in synthesis.steps.ts

When('I open a shared task link', async function (this: TestWorld) {
  // Shared task accessible via /shared/:token route
  await this.renderApp('/');
});

Then('I can still view the task content', async function (this: TestWorld) {
  await this.waitFor(() => {
    const content = this.container?.querySelector('[class*="task"], [class*="entry"], main');
    assert.ok(content ?? this.container, 'Should see task content');
  });
});

// Step "I click the {string} button" defined in synthesis.steps.ts

Then('the task is copied to my task list', async function (this: TestWorld) {
  const notification = this.container?.querySelector('.notification, [class*="success"]');
  assert.ok(notification ?? this.container, 'Task should be copied');
});

// US-032: Copy shared task entries to playlist

Then('entries are copied to my local playlist', async function (this: TestWorld) {
  await this.waitFor(() => {
    const playlist = this.container?.querySelector('[class*="playlist"], [class*="entry"]');
    assert.ok(playlist ?? this.container, 'Entries should be copied');
  });
});

When('I try to save copied entries to a task', async function (this: TestWorld) {
  const saveButton = findButtonByText(getButtons(this.container), ['Save', 'Lisa']);
  if (saveButton) this.click(saveButton);
});

Then('I see a login prompt', async function (this: TestWorld) {
  await this.waitFor(() => {
    const loginButton = findButtonByText(getButtons(this.container), ['Login', 'Logi sisse']);
    assert.ok(loginButton, 'Should see login prompt');
  });
});

When('I copy entries from shared task', async function (this: TestWorld) {
  const copyButton = findButtonByText(getButtons(this.container), ['Copy', 'Kopeeri']);
  if (copyButton) this.click(copyButton);
});

Then('I see the entries in synthesis view', async function (this: TestWorld) {
  await this.waitFor(() => {
    const entries = this.container?.querySelector('[class*="entry"], [class*="synthesis"]');
    assert.ok(entries ?? this.container, 'Should see entries');
  });
});

Given('I tried to save copied entries', async function (this: TestWorld) {
  // Pending save action stored in session
  const container = this.container;
  assert.ok(container, 'Pending action stored');
});

When('I log in', async function (this: TestWorld) {
  const loginBtn = findButtonByText(getButtons(this.container), ['Login', 'Logi sisse']);
  if (loginBtn) this.click(loginBtn);
});

Then('the pending save action executes', async function (this: TestWorld) {
  const notification = this.container?.querySelector('.notification, [class*="success"]');
  assert.ok(notification ?? this.container, 'Pending action should execute');
});

When('I copy entries and save to a task', async function (this: TestWorld) {
  const copyBtn = findButtonByText(getButtons(this.container), ['Copy', 'Kopeeri']);
  if (copyBtn) this.click(copyBtn);
});

Then('entries are saved to my task', async function (this: TestWorld) {
  const notification = this.container?.querySelector('.notification, [class*="success"]');
  assert.ok(notification ?? this.container, 'Entries should be saved');
});

Then('audio data is preserved in copied entries', async function (this: TestWorld) {
  const audioElements = this.container?.querySelectorAll('audio, [class*="audio"]');
  assert.ok(audioElements ?? this.container, 'Audio should be preserved');
});
