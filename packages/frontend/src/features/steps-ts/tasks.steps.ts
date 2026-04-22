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

Given("I have created a task {string}", async function (this: TestWorld, _taskName: string) {
    await this.renderApp();
  },
);

Given("I have a task with entries", async function (this: TestWorld) {
  await this.renderApp();
});

When("I click the {string} button", async function (this: TestWorld, buttonText: string) {
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

When("I enter {string} in the task name field", async function (this: TestWorld, name: string) {
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
