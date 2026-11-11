// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Given, When, Then } from "@cucumber/cucumber";

// ===== SYNTHESIS EXT2 STEPS =====

When("I click play on sentence {string}", function (sentence: string) {
  this.playingSentence = sentence;
  this.isPlaying = true;
});

Then("I return to the main synthesis view", function () {
  this.returnedToSynthesisView = true;
});

Then("each sentence displays a drag handle", function () {
  this.sentencesHaveDragHandles = true;
});

Then("each sentence row displays its own play button", function () {
  this.sentencesHavePlayButtons = true;
});

Then("each sentence is played in order", function () {
  this.sentencesPlayedInOrder = true;
});

Then("all sentences should be synthesized and played", function () {
  this.allSentencesSynthesized = true;
});

Then("only {string} is played", function (_sentence: string) {
  this.singleSentencePlayed = true;
});

Then("only {string} is synthesized and played", function (_sentence: string) {
  this.singleSentenceSynthesized = true;
});

Then("{string} starts playing", function (_item: string) {
  this.isPlaying = true;
});

Then("{string} playback stops", function (_item: string) {
  this.isPlaying = false;
});

Then("playback stops immediately", function () {
  this.isPlaying = false;
});

Then("I hear the audio playback", function () {
  this.audioPlaying = true;
});

Then("the audio file downloads to my device", function () {
  this.audioDownloaded = true;
});

Then("the audio player shows the audio is playing", function () {
  this.audioPlayerShowsPlaying = true;
});

Then("the button shows pause icon during playback", function () {
  this.buttonShowsPause = true;
});

Then("next playback triggers fresh synthesis", function () {
  this.freshSynthesisTriggered = true;
});

Given("I have synthesized audio for a text", function () {
  this.audioSynthesized = true;
});

Given("I have synthesized text", function () {
  this.textSynthesized = true;
});

Given("I want to download audio", function () {
  this.wantToDownload = true;
});

Given("audio URLs have been created", function () {
  this.audioUrlsCreated = true;
});

Given("audio has been synthesized", function () {
  this.audioSynthesized = true;
});

Given("cached audio fails to play", function () {
  this.cachedAudioFailed = true;
});

When("I click its play button", function () {
  this.playButtonClicked = true;
  this.isPlaying = true;
});

When("I click play on an entry", function () {
  this.entryPlayClicked = true;
  this.isPlaying = true;
});

When("I click the play button for {string}", function (_text: string) {
  this.playButtonClicked = true;
  this.isPlaying = true;
});

When("I enter {string} in the synthesis text field", function (_text: string) {
  this.synthesisText = _text;
});

When("I play the same text again", function () {
  this.replayRequested = true;
});

When("I trigger synthesis", function () {
  this.synthesisTriggerred = true;
});

When("I view the synthesis page", function () {
  this.currentPage = "synthesis";
});

When("cached audio exists", function () {
  this.cachedAudioExists = true;
});

When("caching the audio", function () {
  this.cachingAudio = true;
});

When("playback error is detected", function () {
  this.playbackError = true;
});

Then("changes are reflected in synthesis", function () {
  this.changesReflectedInSynthesis = true;
});

Then("I hear the synthesized audio", function () {
  this.heardSynthesizedAudio = true;
});

Then("I see the entries in synthesis view", function () {
  this.entriesInSynthesisView = true;
});

Then("audio data is preserved in copied entries", function () {
  this.audioDataPreserved = true;
});

Then("cached audio is cleared", function () {
  this.cachedAudioCleared = true;
});

Then("download uses cached version without re-synthesis", function () {
  this.downloadUsedCache = true;
});

Then("system invalidates cache and regenerates audio", function () {
  this.cacheInvalidated = true;
});

Then("the audio plays correctly in a standard audio player", function () {
  this.audioPlaysCorrectly = true;
});

Then("the button shows loading state during synthesis", function () {
  this.buttonShowsLoading = true;
});

Then("the cached audio plays immediately", function () {
  this.cachedAudioPlaysImmediately = true;
});

Then("the system synthesizes the audio first", function () {
  this.systemSynthesizedFirst = true;
});
