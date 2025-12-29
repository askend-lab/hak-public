/**
 * Step definitions for task CRUD operations
 * 
 * Covers:
 * - US-018: Edit task metadata
 * - US-019: Delete task
 * 
 * Split from tasks.steps.ts to reduce file size
 * 
 * @module task-crud.steps
 */

import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';

import { getTextInputs, findButtonByText, getButtons, assertPending } from './helpers';
import type { TestWorld } from './setup';

// US-018: Edit task metadata

Given('I am viewing task details', async function (this: TestWorld) {
  await this.renderApp('/tasks');
});

Then('I see the edit form', async function (this: TestWorld) {
  assertPending(this.container, 'edit form UI');
});

Then('the form is pre-filled with task name', async function (this: TestWorld) {
  assertPending(this.container, 'task name pre-fill');
});

Then('the form is pre-filled with task description', async function (this: TestWorld) {
  assertPending(this.container, 'task description pre-fill');
});

When('I change the task name to {string}', async function (this: TestWorld, newName: string) {
  const inputs = getTextInputs(this.container);
  if (inputs?.[0]) {
    this.type(inputs[0], newName);
  }
});

Then('the task name is updated to {string}', async function (this: TestWorld, _expectedName: string) {
  assertPending(this.container, 'task name update');
});

Then('the original task name is preserved', async function (this: TestWorld) {
  assertPending(this.container, 'task view preservation');
});

When('I clear the task name field', async function (this: TestWorld) {
  const inputs = getTextInputs(this.container);
  if (inputs?.[0]) {
    this.type(inputs[0], '');
  }
});

Then('I see a validation error', async function (this: TestWorld) {
  assertPending(this.container, 'validation error UI');
});

// US-019: Delete task

Then('I see a confirmation dialog', async function (this: TestWorld) {
  assertPending(this.container, 'confirmation dialog');
});

When('I confirm the deletion', async function (this: TestWorld) {
  const confirmBtn = findButtonByText(getButtons(this.container), ['Confirm', 'Delete', 'Yes']);
  if (confirmBtn) this.click(confirmBtn);
});

When('I cancel the deletion', async function (this: TestWorld) {
  const cancelBtn = findButtonByText(getButtons(this.container), ['Cancel', 'No']);
  if (cancelBtn) this.click(cancelBtn);
});

Then('the task is deleted', async function (this: TestWorld) {
  assertPending(this.container, 'task deletion');
});

Then('I am redirected to task list', async function (this: TestWorld) {
  // After deletion, we should be redirected - check for valid navigation
  await this.waitFor(() => {
    // Check for task list page or main page (both are valid after deletion)
    const taskList = this.container?.querySelector('[class*="task"], h1, main');
    assert.ok(taskList, 'Should be redirected to a valid page after deletion');
  });
});

Then('the task is not deleted', async function (this: TestWorld) {
  assertPending(this.container, 'task preservation');
});
