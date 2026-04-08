// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Given, When, Then } from "@cucumber/cucumber";

// ===== US-101 APPEND/REPLACE STEPS =====

Given("there is an existing task {string} with {int} sentence", function (_name: string, _count: number) {
  this.existingTaskName = _name;
  this.existingTaskSentenceCount = _count;
});

When("I select the existing task {string}", function (_name: string) {
  this.selectedExistingTask = _name;
});

Then("I see the task has {int} existing sentence", function (_count: number) {
  this.existingSentenceCount = _count;
});

When("I click \"Lisa juurde\"", function () {
  this.clickedAppendButton = true;
});

When("I click \"Asenda olemasolevad\"", function () {
  this.clickedReplaceButton = true;
});

Then("the new sentences are added after existing ones", function () {
  this.newSentencesAppended = true;
});

Then("the task now has both old and new sentences", function () {
  this.taskHasBothOldAndNew = true;
});

Then("all existing sentences are removed", function () {
  this.existingSentencesRemoved = true;
});

Then("only the new sentences remain in the task", function () {
  this.onlyNewSentencesRemain = true;
});

When("I append {int} sentences to a task with {int} existing sentence", function (_newCount: number, _existingCount: number) {
  this.appendedSentences = _newCount;
  this.existingSentenceCount = _existingCount;
});

Then("the existing sentence keeps order {int}", function (_order: number) {
  this.existingSentenceOrder = _order;
});

Then("the new sentences have orders {int} and {int}", function (_order1: number, _order2: number) {
  this.newSentenceOrders = [_order1, _order2];
});

When("I replace sentences in a task with {int} new sentences", function (_count: number) {
  this.replacedWithCount = _count;
});

When("I add sentences to a task without specifying mode", function () {
  this.addedWithoutMode = true;
});

Then("the sentences are appended to the existing ones", function () {
  this.sentencesAppended = true;
});
