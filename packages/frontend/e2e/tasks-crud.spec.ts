import { test, expect } from '@playwright/test';

test.describe('Tasks CRUD Operations', () => {
  const testTaskName = `Test Task ${Date.now()}`;
  const updatedTaskName = `Updated Task ${Date.now()}`;

  test.beforeEach(async ({ page }) => {
    // Navigate to tasks page
    await page.goto('/tasks');
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Ülesanded');
  });

  test('Create - should create a new task', async ({ page }) => {
    // Click create button
    await page.locator('[data-testid="task-create-btn"]').click();

    // Wait for modal to appear
    await expect(page.locator('[data-testid="create-task-modal"]')).toBeVisible();

    // Fill in task name
    await page.locator('[data-testid="create-task-name-input"]').fill(testTaskName);

    // Click submit button
    await page.locator('[data-testid="create-task-submit-btn"]').click();

    // Wait for modal to close
    await expect(page.locator('[data-testid="create-task-modal"]')).not.toBeVisible();

    // Verify task appears in the list (use task-list scope to avoid notification)
    await expect(page.locator('[data-testid="task-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-list"]').getByText(testTaskName)).toBeVisible();
  });

  test('Read - should display task list', async ({ page }) => {
    // Check that task list or empty state is visible
    const taskList = page.locator('[data-testid="task-list"]');
    const emptyState = page.locator('.task-manager-empty');

    // Either task list or empty state should be visible
    await expect(taskList.or(emptyState)).toBeVisible();
  });

  test('Update - should edit a task', async ({ page }) => {
    // First create a task to edit
    await page.locator('[data-testid="task-create-btn"]').click();
    await page.locator('[data-testid="create-task-name-input"]').fill(testTaskName);
    await page.locator('[data-testid="create-task-submit-btn"]').click();
    await expect(page.locator('[data-testid="create-task-modal"]')).not.toBeVisible();

    // Wait for task to appear
    await expect(page.getByText(testTaskName)).toBeVisible();

    // Find the task row and click menu button
    const taskRow = page.locator('[data-testid^="task-row-"]').filter({ hasText: testTaskName });
    const menuBtn = taskRow.locator('[data-testid^="task-menu-btn-"]');
    await menuBtn.click();

    // Click edit button
    const editBtn = taskRow.locator('[data-testid^="task-edit-btn-"]');
    await editBtn.click();

    // Wait for edit modal
    await expect(page.locator('[data-testid="edit-task-modal"]')).toBeVisible();

    // Clear and fill new name
    const nameInput = page.locator('[data-testid="edit-task-name-input"]');
    await nameInput.clear();
    await nameInput.fill(updatedTaskName);

    // Click save
    await page.locator('[data-testid="edit-task-save-btn"]').click();

    // Wait for modal to close
    await expect(page.locator('[data-testid="edit-task-modal"]')).not.toBeVisible();

    // Verify updated name appears
    await expect(page.getByText(updatedTaskName)).toBeVisible();
  });

  test('Delete - should delete a task', async ({ page }) => {
    // First create a task to delete
    const deleteTaskName = `Delete Me ${Date.now()}`;
    await page.locator('[data-testid="task-create-btn"]').click();
    await page.locator('[data-testid="create-task-name-input"]').fill(deleteTaskName);
    await page.locator('[data-testid="create-task-submit-btn"]').click();
    await expect(page.locator('[data-testid="create-task-modal"]')).not.toBeVisible();

    // Wait for task to appear
    await expect(page.getByText(deleteTaskName)).toBeVisible();

    // Find the task row and click menu button
    const taskRow = page.locator('[data-testid^="task-row-"]').filter({ hasText: deleteTaskName });
    const menuBtn = taskRow.locator('[data-testid^="task-menu-btn-"]');
    await menuBtn.click();

    // Click delete button
    const deleteBtn = taskRow.locator('[data-testid^="task-delete-btn-"]');
    await deleteBtn.click();

    // Wait for delete confirmation modal
    await expect(page.locator('[data-testid="delete-confirm-modal"]')).toBeVisible();

    // Confirm deletion
    await page.locator('[data-testid="delete-confirm-btn"]').click();

    // Wait for modal to close
    await expect(page.locator('[data-testid="delete-confirm-modal"]')).not.toBeVisible();

    // Verify task is no longer visible
    await expect(page.getByText(deleteTaskName)).not.toBeVisible();
  });
});
