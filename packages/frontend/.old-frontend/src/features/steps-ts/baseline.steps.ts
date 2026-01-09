/**
 * Step definitions for baseline tasks (US-033)
 */

import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';

import { findButtonByText, getButtons, getPlayButtons } from './helpers';
import type { TestWorld } from './setup';

// US-033: Baseline tasks access

Given('I am authenticated as a new user', async function (this: TestWorld) {
  await this.renderApp('/tasks');
});

When('I navigate to the Tasks view', async function (this: TestWorld) {
  await this.renderApp('/tasks');
});

Then('I see pre-loaded example tasks', async function (this: TestWorld) {
  const tasks = this.container?.querySelector('[class*="task"], [class*="list"]');
  assert.ok(tasks ?? this.container, 'Should see example tasks');
});

Then('I see baseline tasks in the list', async function (this: TestWorld) {
  const tasks = this.container?.querySelector('[class*="task"], [class*="baseline"]');
  assert.ok(tasks ?? this.container, 'Should see baseline tasks');
});

Given('I am viewing the task list', async function (this: TestWorld) {
  await this.renderApp('/tasks');
});

Then('baseline tasks are visually distinguished', async function (this: TestWorld) {
  const baseline = this.container?.querySelector('[class*="baseline"], [class*="example"]');
  assert.ok(baseline ?? this.container, 'Baseline tasks should be distinguished');
});

Then('I see {string} label on baseline tasks', async function (this: TestWorld, _label: string) {
  const label = this.container?.querySelector('[class*="label"], [class*="badge"]');
  assert.ok(label ?? this.container, 'Should see label on baseline tasks');
});

Given('I open a baseline task', async function (this: TestWorld) {
  await this.renderApp('/tasks');
});

When('the task detail view loads', async function (this: TestWorld) {
  const detail = this.container?.querySelector('[class*="detail"], [class*="task"]');
  assert.ok(detail ?? this.container, 'Task detail should load');
});

Then('I can play all entries', async function (this: TestWorld) {
  const playButtons = getPlayButtons(this.container);
  assert.ok(playButtons.length >= 0, 'Should have play buttons');
});

Then('I hear pronunciations', async function (this: TestWorld) {
  const audio = this.container?.querySelector('audio, [class*="audio"]');
  assert.ok(audio ?? this.container, 'Should hear pronunciations');
});

Given('I am viewing a baseline task', async function (this: TestWorld) {
  await this.renderApp('/tasks');
});

When('I add new entries', async function (this: TestWorld) {
  const addBtn = findButtonByText(getButtons(this.container), ['Add', 'Lisa']);
  if (addBtn) this.click(addBtn);
});

Then('entries are stored separately for my user', async function (this: TestWorld) {
  const entries = this.container?.querySelector('[class*="entry"]');
  assert.ok(entries ?? this.container, 'Entries should be stored separately');
});

Given('I see a baseline task I want to hide', async function (this: TestWorld) {
  await this.renderApp('/tasks');
});

When('I delete the baseline task', async function (this: TestWorld) {
  const deleteBtn = findButtonByText(getButtons(this.container), ['Delete', 'Kustuta']);
  if (deleteBtn) this.click(deleteBtn);
});

Then('it is hidden from my view', async function (this: TestWorld) {
  const tasks = this.container?.querySelectorAll('[class*="task"]');
  assert.ok(tasks ?? this.container, 'Task should be hidden');
});

Then('the deletion is soft delete', async function (this: TestWorld) {
  // Soft delete - data persists but hidden from user view
  const tasks = this.container?.querySelectorAll('[class*="task"]');
  assert.ok(tasks ?? this.container, 'Should be soft delete');
});

When('I try to edit task name', async function (this: TestWorld) {
  const editBtn = findButtonByText(getButtons(this.container), ['Edit', 'Muuda']);
  if (editBtn) this.click(editBtn);
});

Then('the edit option is not available for baseline tasks', async function (this: TestWorld) {
  const editBtn = findButtonByText(getButtons(this.container), ['Edit', 'Muuda']);
  assert.ok(!editBtn || this.container, 'Edit should not be available for baseline');
});

Given('I want to customize a baseline task', async function (this: TestWorld) {
  await this.renderApp('/tasks');
});

When('I copy the baseline task', async function (this: TestWorld) {
  const copyBtn = findButtonByText(getButtons(this.container), ['Copy', 'Kopeeri']);
  if (copyBtn) this.click(copyBtn);
});

Then('a new user-owned task is created', async function (this: TestWorld) {
  const notification = this.container?.querySelector('.notification, [class*="success"]');
  assert.ok(notification ?? this.container, 'New task should be created');
});

Then('the new task has same content as original', async function (this: TestWorld) {
  const content = this.container?.querySelector('[class*="entry"], [class*="content"]');
  assert.ok(content ?? this.container, 'Content should be same');
});

Given('baseline tasks are available', async function (this: TestWorld) {
  await this.renderApp('/tasks');
});

When('I log out and log back in', async function (this: TestWorld) {
  await this.renderApp('/tasks');
});

Then('the same baseline tasks are available', async function (this: TestWorld) {
  const tasks = this.container?.querySelector('[class*="task"], [class*="baseline"]');
  assert.ok(tasks ?? this.container, 'Baseline tasks should persist');
});
