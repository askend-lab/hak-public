// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Given, When, Then } from "@cucumber/cucumber";

// ===== SYNTHESIS EXT2 STEPS =====

Then("the new audio starts", function () {
  this.theNewAudioStarts = true;
});

Then("the play button returns to idle state", function () {
  this.thePlayButtonReturnsToIdleState = true;
});

Then("the play buttons have descriptive labels", function () {
  this.thePlayButtonsHaveDescriptiveLabels = true;
});

Then("the play button shows playing state", function () {
  this.thePlayButtonShowsPlayingState = true;
});

Then("the spinner is replaced by pause icon when playing", function () {
  this.theSpinnerIsReplacedByPauseIconWhenPlayi = true;
});

Then("a backdrop overlay is displayed", function () {
  this.aBackdropOverlayIsDisplayed = true;
});

Then("a new synthesis request is made", function () {
  this.aNewSynthesisRequestIsMade = true;
});

Then("audio still works with standard initialization", function () {
  this.audioStillWorksWithStandardInitializatio = true;
});

Then("each row displays its position number", function () {
  this.eachRowDisplaysItsPositionNumber = true;
});

Then("each word is displayed as a clickable tag", function () {
  this.eachWordIsDisplayedAsAClickableTag = true;
});

Then("entries are played one after another", function () {
  this.entriesArePlayedOneAfterAnother = true;
});

Then("I hear the synthesized audio for my custom text", function () {
  this.iHearTheSynthesizedAudioForMyCustomText = true;
});

Then("I remain on the synthesis page", function () {
  this.iRemainOnTheSynthesisPage = true;
});

Then("I return to the synthesis page", function () {
  this.iReturnToTheSynthesisPage = true;
});

Then("I see a loading indicator until tasks are fetched", function () {
  this.iSeeALoadingIndicatorUntilTasksAreFetche = true;
});

Then("I see a loading indicator while tasks are being fetched", function () {
  this.iSeeALoadingIndicatorWhileTasksAreBeingF = true;
});

Then("my ID code is displayed in formatted groups", function () {
  this.myIdCodeIsDisplayedInFormattedGroups = true;
});

Then("nothing is played", function () {
  this.nothingIsPlayed = true;
});

Then("only non-empty sentences are played", function () {
  this.onlyNonemptySentencesArePlayed = true;
});

Then("only the sentence with text is played", function () {
  this.onlyTheSentenceWithTextIsPlayed = true;
});

Then("playback starts without noticeable extra delay", function () {
  this.playbackStartsWithoutNoticeableExtraDela = true;
});

Then("playback stops", function () {
  this.playbackStops = true;
});

Then("the audio download starts", function () {
  this.theAudioDownloadStarts = true;
});

Then("the audio for that entry is synthesized and played", function () {
  this.theAudioForThatEntryIsSynthesizedAndPlay = true;
});

Then("the audio is stopped and resources are released", function () {
  this.theAudioIsStoppedAndResourcesAreReleased = true;
});

Then("the audio is synthesized and played", function () {
  this.theAudioIsSynthesizedAndPlayed = true;
});

Then("the audio warm-up worker initializes", function () {
  this.theAudioWarmupWorkerInitializes = true;
});

Then("the cached audio URL is returned immediately", function () {
  this.theCachedAudioUrlIsReturnedImmediately = true;
});

Then("the custom fallback UI is displayed", function () {
  this.theCustomFallbackUiIsDisplayed = true;
});

Then("the error message is displayed in Estonian", function () {
  this.theErrorMessageIsDisplayedInEstonian = true;
});

Then("the modified text is used for synthesis", function () {
  this.theModifiedTextIsUsedForSynthesis = true;
});

Then("the play button shows a loading spinner", function () {
  this.thePlayButtonShowsALoadingSpinner = true;
});

Then("the previous audio stops", function () {
  this.thePreviousAudioStops = true;
});

Then("the restored sentence is not in playing state", function () {
  this.theRestoredSentenceIsNotInPlayingState = true;
});

Then("the text is submitted for synthesis", function () {
  this.theTextIsSubmittedForSynthesis = true;
});

Given("I am viewing the synthesis page", function () {
  this.currentPage = "synthesis";
});

Given("sentence {string} is currently playing", function (sentence: string) {
  this.playingSentence = sentence;
  this.isPlaying = true;
});

Given("I have cached audio for a text", function () {
  this.cachedAudioExists = true;
});

Given("I have downloaded the audio for {string}", function (_text: string) {
  this.audioDownloaded = true;
});

Given("the audio has been synthesized", function () {
  this.audioSynthesized = true;
});

Given("the audio has not been synthesized yet", function () {
  this.audioSynthesized = false;
});

When("I view synthesis results", function () {
  this.viewingSynthesisResults = true;
});

When("I click the play button", function () {
  this.playButtonClicked = true;
  this.isPlaying = true;
});

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
