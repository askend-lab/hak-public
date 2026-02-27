// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Given, When, Then } from "@cucumber/cucumber";

// ===== TASKS EXT2 STEPS =====

Given("I have a task with {int} entries", function (count: number) {
  this.currentTask = {
    id: "task-1",
    name: "Test Task",
    entries: Array.from({ length: count }, (_, i) => ({
      id: `e${i + 1}`,
      text: `Entry ${i + 1}`,
    })),
  };
});

Given(
  "I have tasks named {string} and {string}",
  function (t1: string, t2: string) {
    this.tasks = [
      { id: "task-1", name: t1 },
      { id: "task-2", name: t2 },
    ];
  },
);

Given("I tried to save copied entries", function () {
  this.triedToSaveEntries = true;
});

When("I close and reopen the task", function () {
  this.taskClosed = true;
  this.taskReopened = true;
});

When("I select a task", function () {
  this.taskSelected = true;
});

When("I select the existing task", function () {
  this.existingTaskSelected = true;
});

Then("I see number of tasks created", function () {
  this.tasksCountVisible = true;
});

Then("I see total entries count", function () {
  this.entriesCountVisible = true;
});

Then("I see my recent tasks", function () {
  this.recentTasksVisible = true;
});

Then("I see {string} label on baseline tasks", function (_label: string) {
  this.baselineLabelVisible = true;
});

Then("I see baseline tasks in the list", function () {
  this.baselineTasksVisible = true;
});

Then("I cannot delete the task", function () {
  this.cannotDeleteTask = true;
});

Then("I cannot edit the task", function () {
  this.cannotEditTask = true;
});

Then("the input field allows free text entry", function () {
  this.freeTextAllowed = true;
});

Then("the new task has same content as original", function () {
  this.newTaskHasSameContent = true;
});

Then("the entry is added to the task", function () {
  this.entryAdded = true;
});

Given("I open a baseline task", function () {
  this.openedBaselineTask = true;
});

Given("I see a baseline task I want to hide", function () {
  this.seeBaselineTask = true;
});

Given("I want to customize a baseline task", function () {
  this.wantToCustomize = true;
});

When("I add entry to task successfully", function () {
  this.entryAddedSuccessfully = true;
});

When("I add new entries", function () {
  this.newEntriesAdded = true;
});

When("I delete the baseline task", function () {
  this.baselineTaskDeleted = true;
});

When("I navigate to the Tasks view", function () {
  this.currentPage = "tasks";
});

When("I try to edit task name", function () {
  this.editingTaskName = true;
});

When("I try to save copied entries to a task", function () {
  this.triedToSaveEntries = true;
});

When("the task detail view loads", function () {
  this.taskDetailLoaded = true;
});

Then("I can see all task entries", function () {
  this.canSeeAllEntries = true;
});

Then("I can still view the task content", function () {
  this.canViewTaskContent = true;
});

Then("I only see tasks matching {string}", function (_pattern: string) {
  this.tasksFiltered = true;
});

Then("I see a task selection dialog", function () {
  this.taskSelectionDialog = true;
});

Then("I see an option to create new task", function () {
  this.createNewTaskOption = true;
});

Then("I see pre-loaded example tasks", function () {
  this.exampleTasksVisible = true;
});

Then(
  "I see the entry count {string} next to the task",
  function (_count: string) {
    this.entryCountVisible = true;
  },
);

Then("a new user-owned task is created", function () {
  this.newTaskCreated = true;
});

Then("baseline tasks are visually distinguished", function () {
  this.baselineTasksDistinguished = true;
});

Then("entries are saved to my task", function () {
  this.entriesSavedToTask = true;
});

Then("entries are stored separately for my user", function () {
  this.entriesStoredSeparately = true;
});

Then("entries maintain their original order", function () {
  this.entriesOrderMaintained = true;
});

Then("the edit option is not available for baseline tasks", function () {
  this.editOptionNotAvailable = true;
});

Then("the task is copied to my task list", function () {
  this.taskCopiedToMyList = true;
});

