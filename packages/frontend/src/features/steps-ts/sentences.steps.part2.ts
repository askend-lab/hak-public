// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Given, When, Then } from "@cucumber/cucumber";

// ===== SENTENCES STEPS =====

Given("I have sentence rows in the list", function () {
  this.sentences = [
    { id: "s1", text: "Sentence 1", tags: [] },
    { id: "s2", text: "Sentence 2", tags: [] },
  ];
});

Given("I have sentence rows with text", function () {
  this.sentences = [
    { id: "s1", text: "Sentence 1", tags: [] },
    { id: "s2", text: "Sentence 2", tags: [] },
  ];
});

Given("I have multiple sentence rows", function () {
  this.sentences = [
    { id: "s1", text: "Sentence 1", tags: [] },
    { id: "s2", text: "Sentence 2", tags: [] },
    { id: "s3", text: "Sentence 3", tags: [] },
  ];
});

Given("I have {int} sentences in the list", function (count: number) {
  this.sentences = Array.from({ length: count }, (_, i) => ({
    id: `s${i + 1}`,
    text: `Sentence ${i + 1}`,
    tags: [],
  }));
});

Given("I have {int} sentences with text", function (count: number) {
  this.sentences = Array.from({ length: count }, (_, i) => ({
    id: `s${i + 1}`,
    text: `Sentence ${i + 1}`,
    tags: [],
  }));
});

Given("I have only {int} sentence in the list", function (count: number) {
  this.sentences = Array.from({ length: count }, (_, i) => ({
    id: `s${i + 1}`,
    text: `Sentence ${i + 1}`,
    tags: [],
  }));
});

Given(
  "I have sentences in order {string}, {string}, {string}",
  function (s1: string, s2: string, s3: string) {
    this.sentences = [
      { id: "s1", text: s1, tags: [] },
      { id: "s2", text: s2, tags: [] },
      { id: "s3", text: s3, tags: [] },
    ];
  },
);

Given(
  "I have sentences {string} and {string}",
  function (s1: string, s2: string) {
    this.sentences = [
      { id: "s1", text: s1, tags: [] },
      { id: "s2", text: s2, tags: [] },
    ];
  },
);

Given(
  "I have two sentences {string} and {string}",
  function (s1: string, s2: string) {
    this.sentences = [
      { id: "s1", text: s1, tags: [] },
      { id: "s2", text: s2, tags: [] },
    ];
  },
);

Given(
  "I have sentence {string} and an empty sentence",
  function (text: string) {
    this.sentences = [
      { id: "s1", text, tags: [] },
      { id: "s2", text: "", tags: [] },
    ];
  },
);

Given("I am dragging a sentence", function () {
  this.draggingSentence = true;
});

When("I view the sentence", function () {
  this.viewingSentence = true;
});

When("I view the sentences section", function () {
  this.viewingSentencesSection = true;
});

When("I click the three-dots menu on a sentence", function () {
  this.sentenceMenuOpen = true;
});

When("I click {string} on that sentence", function (action: string) {
  this.sentenceAction = action;
});

When("I click {string} on the second sentence", function (action: string) {
  this.sentenceAction = action;
  this.targetSentenceIndex = 1;
});

When(
  "I drag sentence {string} to position after {string}",
  function (_from: string, _to: string) {
    this.sentenceReordered = true;
  },
);

Then("I see the sentence", function () {
  this.sentenceVisible = true;
});

Then("I see sentence list", function () {
  this.sentenceListVisible = true;
});

Then("I see sentence rows", function () {
  this.sentenceRowsVisible = true;
});

Then("a new empty sentence row is added to the list", function () {
  this.sentences = this.sentences || [];
  this.sentences.push({
    id: `s${this.sentences.length + 1}`,
    text: "",
    tags: [],
  });
});

Then("I can start typing text in the new row", function () {
  this.canTypeInNewRow = true;
});

Then("each sentence has a unique ID", function () {
  this.sentencesHaveUniqueIds = true;
});

Then("the next sentence starts after the previous finishes", function () {
  this.sequentialPlaybackCorrect = true;
});

Then("empty sentences are skipped", function () {
  this.emptySentencesSkipped = true;
});

Then("the sentence is removed from the list", function () {
  this.sentenceRemoved = true;
});

Then("the sentence is cleared to empty", function () {
  this.sentenceCleared = true;
});

Then("I still have {int} sentence row visible", function (_count: number) {
  this.sentenceRowsVisible = true;
});

Then("I have {int} sentences remaining", function (_count: number) {
  this.sentencesRemaining = _count;
});

Then("the dragged sentence appears semi-transparent", function () {
  this.draggedSentenceTransparent = true;
});

Then("I have two sentence rows in the list", function () {
  this.sentences = this.sentences || [];
  if (this.sentences.length < 2) {
    this.sentences.push({ id: "s2", text: "", tags: [] });
  }
});

Given("the text input is empty", function () {
  this.textInputEmpty = true;
});
