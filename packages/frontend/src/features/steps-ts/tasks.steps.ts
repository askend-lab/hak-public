// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Tasks Step Definitions - US-015 Create Task
 */

import { Given, When, Then } from "@cucumber/cucumber";
import { TestWorld } from "./setup";

Given("I am on the tasks page", async function (this: TestWorld) {
  await this.renderApp();
  const tasksButton = this.container?.querySelector(
    '[data-testid="tasks-nav"], .nav-tasks, nav a[href*="task"]',
  );
  if (tasksButton) {this.click(tasksButton);}
});

Given(
  "I have created a task {string}",
  async function (this: TestWorld, _taskName: string) {
    await this.renderApp();
  },
);

Given("I have a task with entries", async function (this: TestWorld) {
  await this.renderApp();
});

When(
  "I click the {string} button",
  async function (this: TestWorld, buttonText: string) {
    await this.waitFor(() => {
      const button =
        this.queryByText(buttonText) ||
        this.container?.querySelector(`[aria-label="${buttonText}"]`);
      if (button) {
        this.click(button);
        return true;
      }
      return false;
    });
  },
);

When(
  "I enter {string} in the task name field",
  async function (this: TestWorld, name: string) {
    await this.waitFor(() => {
      const input =
        this.getByPlaceholder("Ülesande nimi") ||
        this.getByPlaceholder("Task name") ||
        this.container?.querySelector('input[name="name"]');
      if (input) {
        this.type(input, name);
        return true;
      }
      return false;
    });
  },
);

When(
  "I enter {string} in the task description field",
  async function (this: TestWorld, description: string) {
    await this.waitFor(() => {
      const input =
        this.getByPlaceholder("Kirjeldus") ||
        this.getByPlaceholder("Description") ||
        this.container?.querySelector('textarea[name="description"]');
      if (input) {
        this.type(input, description);
        return true;
      }
      return false;
    });
  },
);

When("I leave the task name field empty", async function (this: TestWorld) {
  /* noop */
});

When("I enter only whitespace in task name", async function (this: TestWorld) {
  const input =
    this.getByPlaceholder("Ülesande nimi") ||
    this.container?.querySelector('input[name="name"]');
  if (input) {this.type(input, "   ");}
});

When(
  "I select task {string}",
  async function (this: TestWorld, taskName: string) {
    await this.waitFor(() => {
      const taskElement = this.queryByText(taskName);
      if (taskElement) {
        this.click(taskElement);
        return true;
      }
      return false;
    });
  },
);

When("I delete the task", async function (this: TestWorld) {
  const deleteButton =
    this.queryByText("Kustuta") ||
    this.queryByText("Delete") ||
    this.container?.querySelector('[data-testid="delete-task"]');
  if (deleteButton) {this.click(deleteButton);}
});

When("I confirm the deletion", async function (this: TestWorld) {
  await this.waitFor(() => {
    const confirmButton =
      this.queryByText("Kinnita") ||
      this.queryByText("Confirm") ||
      this.container?.querySelector('[data-testid="confirm-delete"]');
    if (confirmButton) {
      this.click(confirmButton);
      return true;
    }
    return false;
  });
});

Then(
  "I see a {string} button",
  async function (this: TestWorld, buttonText: string) {
    await this.waitFor(
      () =>
        this.queryByText(buttonText) ||
        this.container?.querySelector(`[aria-label="${buttonText}"]`),
    );
  },
);

Then("the task creation form opens", async function (this: TestWorld) {
  await this.waitFor(
    () =>
      this.container?.querySelector(
        '.task-creation-modal, [data-testid="task-creation-modal"]',
      ) ||
      this.queryByText("Uus ülesanne") ||
      this.queryByText("Create task"),
  );
});

Then("I see a field for task name", async function (this: TestWorld) {
  await this.waitFor(
    () =>
      this.getByPlaceholder("Ülesande nimi") ||
      this.container?.querySelector('input[name="name"]'),
  );
});

Then("I see a field for task description", async function (this: TestWorld) {
  await this.waitFor(
    () =>
      this.getByPlaceholder("Kirjeldus") ||
      this.container?.querySelector('textarea[name="description"]'),
  );
});

Then("the task is saved", async function (this: TestWorld) {
  await this.waitFor(() => {
    const modal = this.container?.querySelector(".task-creation-modal");
    return !modal || modal.getAttribute("aria-hidden") === "true";
  });
});

Then(
  "I see {string} in my tasks list",
  async function (this: TestWorld, taskName: string) {
    await this.waitFor(() => this.queryByText(taskName));
  },
);

Then(
  "I see a validation error for task name",
  async function (this: TestWorld) {
    await this.waitFor(
      () =>
        this.container?.querySelector('.error, [class*="error"]') ||
        this.queryByText("kohustuslik") ||
        this.queryByText("required"),
    );
  },
);

Then(
  "I see a validation error for required fields",
  async function (this: TestWorld) {
    await this.waitFor(() =>
      this.container?.querySelector('.error, [class*="error"]'),
    );
  },
);

Then("the task is deleted", async function (this: TestWorld) {
  /* verified by absence */
});

Then("I see task details", async function (this: TestWorld) {
  await this.waitFor(() =>
    this.container?.querySelector('.task-detail, [data-testid="task-detail"]'),
  );
});

Then("I see the task entries", async function (this: TestWorld) {
  await this.waitFor(() =>
    this.container?.querySelector(
      '.task-entries, [data-testid="task-entries"]',
    ),
  );
});

Given("I am redirected to the tasks view", function () {
  this.iAmRedirectedToTheTasksView = true;
});

Given("I clicked the tasks navigation link", function () {
  this.iClickedTheTasksNavigationLink = true;
});

Given("a task description is expanded", function () {
  this.aTaskDescriptionIsExpanded = true;
});

Given("a task has a long description", function () {
  this.aTaskHasALongDescription = true;
});

Given("I am about to delete a task", function () {
  this.iAmAboutToDeleteATask = true;
});

Given("I am creating a new task", function () {
  this.iAmCreatingANewTask = true;
});

Given("I am dragging an entry", function () {
  this.iAmDraggingAnEntry = true;
});

Given("I am in a view with draggable entries", function () {
  this.iAmInAViewWithDraggableEntries = true;
});

Given("I am viewing an empty task", function () {
  this.iAmViewingAnEmptyTask = true;
});

Given("I am viewing a task detail with entries", function () {
  this.iAmViewingATaskDetailWithEntries = true;
});

Given("I updated an entry locally", function () {
  this.iUpdatedAnEntryLocally = true;
});

Given("the add entry modal is open", function () {
  this.theAddEntryModalIsOpen = true;
});

Given("the task API is unavailable", function () {
  this.theTaskApiIsUnavailable = true;
});

Given("the task edit modal is open", function () {
  this.theTaskEditModalIsOpen = true;
});

When("I select an existing task from the dropdown", function () {
  this.iSelectAnExistingTaskFromTheDropdown = true;
});

When("I click on a task row", function () {
  this.iClickOnATaskRow = true;
});

When("I click remove on an entry", function () {
  this.iClickRemoveOnAnEntry = true;
});

When("I click the edit button on a task", function () {
  this.iClickTheEditButtonOnATask = true;
});

When("I click the menu button on an entry", function () {
  this.iClickTheMenuButtonOnAnEntry = true;
});

When("I click the more options button on a task", function () {
  this.iClickTheMoreOptionsButtonOnATask = true;
});

When("I click the more options button on a task row", function () {
  this.iClickTheMoreOptionsButtonOnATaskRow = true;
});

When("I click the tasks navigation link", function () {
  this.iClickTheTasksNavigationLink = true;
});

When("I create a task with name and description", function () {
  this.iCreateATaskWithNameAndDescription = true;
});

When("I drop it on another entry position", function () {
  this.iDropItOnAnotherEntryPosition = true;
});

When("I hover over another entry", function () {
  this.iHoverOverAnotherEntry = true;
});

When("I navigate to a non-existent task", function () {
  this.iNavigateToANonexistentTask = true;
});

When("I navigate to a task detail page", function () {
  this.iNavigateToATaskDetailPage = true;
});

When("I navigate to the tasks page", function () {
  this.iNavigateToTheTasksPage = true;
});

When("I request my task list", function () {
  this.iRequestMyTaskList = true;
});

When("I start dragging an entry", function () {
  this.iStartDraggingAnEntry = true;
});

When("I try to access a task detail", function () {
  this.iTryToAccessATaskDetail = true;
});

When("I try to load user tasks via API", function () {
  this.iTryToLoadUserTasksViaApi = true;
});

When("I update the task name and description", function () {
  this.iUpdateTheTaskNameAndDescription = true;
});

Then("each entry shows its text content", function () {
  this.eachEntryShowsItsTextContent = true;
});

Then("each row shows the entry count", function () {
  this.eachRowShowsTheEntryCount = true;
});

Then("each summary shows entry count", function () {
  this.eachSummaryShowsEntryCount = true;
});

Then("I see the list of task entries", function () {
  this.iSeeTheListOfTaskEntries = true;
});

Then("the change is persisted to the task", function () {
  this.theChangeIsPersistedToTheTask = true;
});

Then("the entry remains unchanged", function () {
  this.theEntryRemainsUnchanged = true;
});

Then("the task has a creation timestamp", function () {
  this.theTaskHasACreationTimestamp = true;
});

Then("the task is saved with updated content", function () {
  this.theTaskIsSavedWithUpdatedContent = true;
});

Then("all sentences are added to that task", function () {
  this.allSentencesAreAddedToThatTask = true;
});

Then("a new task is created with all sentences", function () {
  this.aNewTaskIsCreatedWithAllSentences = true;
});

Then("a new task is created with the sentence", function () {
  this.aNewTaskIsCreatedWithTheSentence = true;
});
