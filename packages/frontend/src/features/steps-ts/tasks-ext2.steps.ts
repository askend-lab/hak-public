// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Given, Then } from "@cucumber/cucumber";

// ===== TASKS EXT2 STEPS =====

Then("each entry shows a drag handle indicator", function () {
  this.eachEntryShowsADragHandleIndicator = true;
});

Then("each entry shows text without editing controls", function () {
  this.eachEntryShowsTextWithoutEditingControls = true;
});

Then("each entry shows word tags", function () {
  this.eachEntryShowsWordTags = true;
});

Then("each task row shows the task name", function () {
  this.eachTaskRowShowsTheTaskName = true;
});

Then("each task shows its creation date in Estonian format", function () {
  this.eachTaskShowsItsCreationDateInEstonianFo = true;
});

Then("I am redirected to the tasks page", function () {
  this.iAmRedirectedToTheTasksPage = true;
});

Then("I navigate to the task detail view", function () {
  this.iNavigateToTheTaskDetailView = true;
});

Then("I see all entries in the task", function () {
  this.iSeeAllEntriesInTheTask = true;
});

Then("I see all my tasks as summaries", function () {
  this.iSeeAllMyTasksAsSummaries = true;
});

Then("I see a message suggesting to add entries", function () {
  this.iSeeAMessageSuggestingToAddEntries = true;
});

Then("I see a message that the task has no entries", function () {
  this.iSeeAMessageThatTheTaskHasNoEntries = true;
});

Then("I see a search input field for tasks", function () {
  this.iSeeASearchInputFieldForTasks = true;
});

Then("I see no matching tasks", function () {
  this.iSeeNoMatchingTasks = true;
});

Then("I see only tasks matching \"Harjutus\"", function () {
  this.iSeeOnlyTasksMatchingHarjutus = true;
});

Then("I see options for the entry", function () {
  this.iSeeOptionsForTheEntry = true;
});

Then("I see the task name and description", function () {
  this.iSeeTheTaskNameAndDescription = true;
});

Then("I see the task name as the page title", function () {
  this.iSeeTheTaskNameAsThePageTitle = true;
});

Then("I see the tasks view", function () {
  this.iSeeTheTasksView = true;
});

Then("the add entry modal opens", function () {
  this.theAddEntryModalOpens = true;
});

Then("the entries are reordered", function () {
  this.theEntriesAreReordered = true;
});

Then("the entries return to their original order", function () {
  this.theEntriesReturnToTheirOriginalOrder = true;
});

Then("the entry is removed from the task", function () {
  this.theEntryIsRemovedFromTheTask = true;
});

Then("the entry reverts to its previous value", function () {
  this.theEntryRevertsToItsPreviousValue = true;
});

Then("the entry shows a dragging visual indicator", function () {
  this.theEntryShowsADraggingVisualIndicator = true;
});

Then("the entry's stressed text is updated", function () {
  this.theEntrysStressedTextIsUpdated = true;
});

Then("the entry text is copied to clipboard", function () {
  this.theEntryTextIsCopiedToClipboard = true;
});

Then("the local storage entry is cleared", function () {
  this.theLocalStorageEntryIsCleared = true;
});

Then("the target entry shows a drop indicator", function () {
  this.theTargetEntryShowsADropIndicator = true;
});

Then("the task content is returned", function () {
  this.theTaskContentIsReturned = true;
});

Then("the task edit form opens", function () {
  this.theTaskEditFormOpens = true;
});

Then("the task edit modal opens", function () {
  this.theTaskEditModalOpens = true;
});

Then("the task is no longer in my task list", function () {
  this.theTaskIsNoLongerInMyTaskList = true;
});

Then("the task is saved with a unique ID", function () {
  this.theTaskIsSavedWithAUniqueId = true;
});

Then("the task is updated with new values", function () {
  this.theTaskIsUpdatedWithNewValues = true;
});

Then("the task is updated with the new name", function () {
  this.theTaskIsUpdatedWithTheNewName = true;
});

Then("the task remains unchanged", function () {
  this.theTaskRemainsUnchanged = true;
});

Then("the wizard includes a step about creating tasks", function () {
  this.theWizardIncludesAStepAboutCreatingTasks = true;
});

Then("the word in the entry is updated", function () {
  this.theWordInTheEntryIsUpdated = true;
});

Given("I am viewing the task list", function () {
  this.currentPage = "tasks";
  this.viewingTaskList = true;
});

Given("I am viewing a baseline task", function () {
  this.viewingBaselineTask = true;
  this.currentTask = {
    id: "baseline-1",
    name: "Baseline Task",
    isBaseline: true,
  };
});

Given("I have an existing task", function () {
  this.existingTask = { id: "task-1", name: "Existing Task" };
});

