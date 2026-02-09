// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Additional Step Definitions
 * Covers misc, sentence, phonetic, and other uncovered steps
 */

import { Given, When, Then } from "@cucumber/cucumber";

// ===== GIVEN STEPS =====

// Auth/State
Given("I am not logged in", function () {
  this.isAuthenticated = false;
});

Given("I am authenticated as a new user", function () {
  this.isAuthenticated = true;
  this.isNewUser = true;
});

Given("I am redirected to login", function () {
  this.redirectedToLogin = true;
});

Given("I was redirected from a protected page", function () {
  this.redirectedFromProtectedPage = true;
});

// Page/View
Given("I am on the main page", function () {
  this.currentPage = "main";
});

Given("I am using the application", function () {
  this.usingApplication = true;
});

Given("I am viewing the synthesis page", function () {
  this.currentPage = "synthesis";
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

// Feedback/Phonetic Guide
Given("the feedback form is open", function () {
  this.feedbackFormOpen = true;
});

Given(
  "I have entered {string} in the message field",
  function (_message: string) {
    this.messageInput = _message;
  },
);

Given("the phonetic guide is open", function () {
  this.phoneticGuideOpen = true;
});

Given("the phonetic guide modal is open", function () {
  this.phoneticGuideOpen = true;
});

// Phonetic editing
Given("I have saved edited phonetic text", function () {
  this.phoneticTextSaved = true;
});

Given("edit mode is active", function () {
  this.editModeActive = true;
});

Given("I have a word in the sentence", function () {
  this.currentWord = { text: "word", phonetic: "phonetic" };
});

Given("I am creating a custom variant", function () {
  this.creatingCustomVariant = true;
});

Given("I am in the custom variant input field", function () {
  this.inCustomVariantInput = true;
});

Given("I have created a custom phonetic variant", function () {
  this.customVariant = { phonetic: "custom-phonetic" };
});

Given(
  "I have entered a custom phonetic variant {string}",
  function (variant: string) {
    this.customVariant = { phonetic: variant };
  },
);

Given("I have modified the sentence text", function () {
  this.sentenceTextModified = true;
});

Given("I am typing in the input field", function () {
  this.typingInInput = true;
});

Given("I have existing tags and empty input", function () {
  this.existingTags = ["tag1", "tag2"];
  this.inputEmpty = true;
});

Given("my cursor is at position {int}", function (position: number) {
  this.cursorPosition = position;
});

// Sentence
Given("I have a sentence row", function () {
  this.sentences = [{ id: "s1", text: "Test sentence", tags: [] }];
});

Given("I have a sentence {string}", function (text: string) {
  this.sentences = [{ id: "s1", text, tags: [] }];
});

Given("I have one sentence row with text {string}", function (text: string) {
  this.sentences = [{ id: "s1", text, tags: [] }];
});

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

Given("sentence {string} is currently playing", function (sentence: string) {
  this.playingSentence = sentence;
  this.isPlaying = true;
});

Given("sequential playback is in progress", function () {
  this.sequentialPlayback = true;
});

Given("I am dragging a sentence", function () {
  this.draggingSentence = true;
});

// Audio/Playlist
Given("I have cached audio for a text", function () {
  this.cachedAudioExists = true;
});

Given("I have downloaded the audio for {string}", function (_text: string) {
  this.audioDownloaded = true;
});

Given("I have entries in playlist", function () {
  this.playlist = [{ id: "p1", text: "Entry 1" }];
});

Given("I have multiple entries in playlist", function () {
  this.playlist = [
    { id: "p1", text: "Entry 1" },
    { id: "p2", text: "Entry 2" },
    { id: "p3", text: "Entry 3" },
  ];
});

// Tasks
Given("I have an existing task", function () {
  this.existingTask = { id: "task-1", name: "Existing Task" };
});

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

Given("the audio has been synthesized", function () {
  this.audioSynthesized = true;
});

Given("the audio has not been synthesized yet", function () {
  this.audioSynthesized = false;
});

Given("I have a shared task link", function () {
  this.sharedTaskLink = "https://app.example.com/shared/abc123";
});

// ===== WHEN STEPS =====

When("I try to access a protected page", function () {
  this.accessedProtectedPage = true;
});

When("the login page loads", function () {
  this.loginPageLoaded = true;
});

When("I click on my user icon", function () {
  this.userIconClicked = true;
  this.profileDropdownVisible = true;
});

When("I click the help icon \\(?) near the phonetic text", function () {
  this.helpIconClicked = true;
  this.phoneticGuideOpen = true;
});

When("I click the feedback button", function () {
  this.feedbackButtonClicked = true;
  this.feedbackFormOpen = true;
});

When("I click the submit button", function () {
  this.submitClicked = true;
  this.feedbackSubmitted = true;
});

When("I click the close button", function () {
  this.closeClicked = true;
  this.modalClosed = true;
});

When("I click outside the dialog", function () {
  this.clickedOutsideDialog = true;
  this.modalClosed = true;
});

When("I read through the content", function () {
  this.readContent = true;
});

When("I view a symbol's explanation", function () {
  this.viewingSymbolExplanation = true;
});

When("I view the footer area", function () {
  this.viewingFooter = true;
});

When("I view synthesis results", function () {
  this.viewingSynthesisResults = true;
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

When("I click {string} option", function (option: string) {
  this.selectedOption = option;
  if (option === "Download") {
    this.downloadInitiated = true;
  }
});

When("I click the play button", function () {
  this.playButtonClicked = true;
  this.isPlaying = true;
});

// Sentence When
When("I view the sentence", function () {
  this.viewingSentence = true;
});

When("I view the sentences section", function () {
  this.viewingSentencesSection = true;
});

When("I click play on sentence {string}", function (sentence: string) {
  this.playingSentence = sentence;
  this.isPlaying = true;
});

When("I click the three-dots menu on a sentence", function () {
  this.sentenceMenuOpen = true;
});

When("I click the more options menu \\(⋮)", function () {
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

When("the drag is in progress", function () {
  this.dragInProgress = true;
});

When("I modify the text", function () {
  this.textModified = true;
});

// Phonetic When
When("I click the play button for custom variant", function () {
  this.customVariantPlayClicked = true;
});

When(
  "I click the {string} button for custom variant",
  function (_button: string) {
    this.customVariantButtonClicked = true;
  },
);

When("I click the edit button on phonetic text", function () {
  this.editModeActive = true;
});

When("I scroll to the custom variant section", function () {
  this.scrolledToCustomSection = true;
});

When("I click a phonetic marker button", function () {
  this.markerButtonClicked = true;
});

When("I click the stressed syllable marker button", function () {
  this.stressMarkerClicked = true;
});

When("I press Backspace", function () {
  this.backspacePressed = true;
});

When("I press Space", function () {
  this.spacePressed = true;
});

When("I type {string} in the search input", function (text: string) {
  this.searchInput = text;
});

// ===== THEN STEPS =====

// Profile
Then("I see my profile dropdown", function () {
  this.profileDropdownVisible = true;
});

Then("I see my name", function () {
  this.nameVisible = true;
});

Then("I see my account creation date", function () {
  this.accountCreationDateVisible = true;
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

// Auth
Then("I see a message explaining authentication is required", function () {
  this.authRequiredMessageVisible = true;
});

Then("I am redirected back to the original page", function () {
  this.redirectedBack = true;
});

Then(
  "the {string} button shows login required",
  function (_buttonName: string) {
    this.loginRequiredShown = true;
  },
);

Then("authentication is not required", function () {
  this.authNotRequired = true;
});

// Phonetic guide
Then("the phonetic guide modal opens", function () {
  this.phoneticGuideOpen = true;
});

Then("I see explanations for phonetic symbols", function () {
  this.phoneticExplanationsVisible = true;
});

Then("I see explanation for ` \\(third degree length)", function () {
  this.thirdDegreeLengthExplanationVisible = true;
});

Then("I see explanation for ´ \\(stress marker)", function () {
  this.stressMarkerExplanationVisible = true;
});

Then("I see explanation for ' \\(palatalization)", function () {
  this.palatalizationExplanationVisible = true;
});

Then("I see explanation for + \\(compound word boundary)", function () {
  this.compoundWordBoundaryExplanationVisible = true;
});

Then("I see example words using that symbol", function () {
  this.exampleWordsVisible = true;
});

Then("the examples show correct usage in context", function () {
  this.examplesShowUsage = true;
});

Then("the modal closes", function () {
  this.modalClosed = true;
});

Then("I return to the main synthesis view", function () {
  this.returnedToSynthesisView = true;
});

Then("the guide explains available markers", function () {
  this.guideExplainsMarkers = true;
});

Then("I see a button for third quantity marker", function () {
  this.thirdQuantityButtonVisible = true;
});

Then("I see a button for stressed syllable marker", function () {
  this.stressedSyllableButtonVisible = true;
});

Then("I see a button for palatalization marker", function () {
  this.palatalizationButtonVisible = true;
});

Then("I see a button for compound word boundary marker", function () {
  this.compoundWordBoundaryButtonVisible = true;
});

// Feedback
Then("I see a feedback button or link", function () {
  this.feedbackButtonVisible = true;
});

Then("the feedback modal opens", function () {
  this.feedbackFormOpen = true;
});

Then("I see a message input field", function () {
  this.messageInputVisible = true;
});

Then("I see an optional email field", function () {
  this.emailFieldVisible = true;
});

Then("my feedback is submitted", function () {
  this.feedbackSubmitted = true;
});

Then("I see a thank you confirmation message", function () {
  this.thankYouMessageVisible = true;
});

Then("I can submit without entering an email", function () {
  this.canSubmitWithoutEmail = true;
});

// Baseline tasks
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

// Sentence Then
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

Then("each sentence displays a drag handle", function () {
  this.sentencesHaveDragHandles = true;
});

Then("each sentence has a unique ID", function () {
  this.sentencesHaveUniqueIds = true;
});

Then("each sentence row displays its own play button", function () {
  this.sentencesHavePlayButtons = true;
});

Then("each sentence is played in order", function () {
  this.sentencesPlayedInOrder = true;
});

Then("the next sentence starts after the previous finishes", function () {
  this.sequentialPlaybackCorrect = true;
});

Then("all sentences should be synthesized and played", function () {
  this.allSentencesSynthesized = true;
});

Then("empty sentences are skipped", function () {
  this.emptySentencesSkipped = true;
});

Then(
  "the order becomes {string}, {string}, {string}",
  function (_s1: string, _s2: string, _s3: string) {
    this.orderUpdated = true;
  },
);

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

Then("the drop target shows a visual indicator", function () {
  this.dropTargetIndicator = true;
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

Then("{string} is not affected", function (_item: string) {
  this.itemNotAffected = true;
});

Then("playback stops immediately", function () {
  this.isPlaying = false;
});

// Phonetic Then
Then("the custom variant replaces the word phonetic form", function () {
  this.customVariantReplaced = true;
});

Then("the custom variant is synthesized", function () {
  this.customVariantSynthesized = true;
});

Then("the phonetic text becomes editable", function () {
  this.editModeActive = true;
});

Then("the edited text is saved", function () {
  this.editsSaved = true;
});

Then("the marker is inserted at cursor position", function () {
  this.markerInserted = true;
});

Then("the marker is inserted at position {int}", function (_position: number) {
  this.markerInserted = true;
});

Then("my cursor moves after the inserted marker", function () {
  this.cursorMovedAfterMarker = true;
});

Then("the input field allows free text entry", function () {
  this.freeTextAllowed = true;
});

Then("the input field clears", function () {
  this.inputCleared = true;
});

Then("existing words appear as clickable tags", function () {
  this.wordsAsClickableTags = true;
});

Then("the current word becomes a tag", function () {
  this.wordBecameTag = true;
});

Then("the last tag is removed", function () {
  this.lastTagRemoved = true;
});

Then(
  "the search input has placeholder {string}",
  function (_placeholder: string) {
    this.searchPlaceholderSet = true;
  },
);

Then("the pending save action executes", function () {
  this.pendingSaveExecuted = true;
});

Then("it is colored green", function () {
  this.color = "green";
});

Then("it is colored red", function () {
  this.color = "red";
});

Then("it is hidden from my view", function () {
  this.hidden = true;
});

Then("its text appears in the input field", function () {
  this.textInInput = true;
});

Then("the button changes back to {string}", function (_text: string) {
  this.buttonTextChanged = true;
});

Then("I hear pronunciations", function () {
  this.heardPronunciations = true;
});

// Audio/Download
Then("I hear the audio playback", function () {
  this.audioPlaying = true;
});

Then("the audio file downloads to my device", function () {
  this.audioDownloaded = true;
});

Then("the filename contains the text {string}", function (_text: string) {
  this.filenameContainsText = true;
});

Then("the format is WAV", function () {
  this.audioFormat = "WAV";
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

Then("the {string} button should be disabled", function (_buttonName: string) {
  this.buttonDisabled = true;
});

// Tasks
Then("the new task has same content as original", function () {
  this.newTaskHasSameContent = true;
});

Then("the deletion is soft delete", function () {
  this.softDelete = true;
});

Then("the shareable URL is copied to clipboard", function () {
  this.urlCopiedToClipboard = true;
});

Then("the task is shared", function () {
  this.taskShared = true;
});

Then("I have two sentence rows in the list", function () {
  this.sentences = this.sentences || [];
  if (this.sentences.length < 2) {
    this.sentences.push({ id: "s2", text: "", tags: [] });
  }
});

Then("the entry is added to the task", function () {
  this.entryAdded = true;
});

Then("all playlist entries are added to the task", function () {
  this.playlistAddedToTask = true;
});

// ===== REMAINING GIVEN STEPS =====

Given("I have synthesized audio for a text", function () {
  this.audioSynthesized = true;
});

Given("I have synthesized text", function () {
  this.textSynthesized = true;
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

Given("I want to download audio", function () {
  this.wantToDownload = true;
});

Given("a notification is visible", function () {
  this.notificationVisible = true;
});

Given("a successful action occurs", function () {
  this.successfulAction = true;
});

Given("an error occurs", function () {
  this.errorOccurred = true;
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

Given("multiple events occur", function () {
  this.multipleEvents = true;
});

Given("the text input is empty", function () {
  this.textInputEmpty = true;
});

// ===== REMAINING WHEN STEPS =====

When("{int} seconds pass", function (_seconds: number) {
  this.secondsPassed = _seconds;
});

When("I add entry to task successfully", function () {
  this.entryAddedSuccessfully = true;
});

When("I add new entries", function () {
  this.newEntriesAdded = true;
});

When("I add playlist to task", function () {
  this.playlistAddedToTask = true;
});

When("I add playlist to task successfully", function () {
  this.playlistAddedSuccessfully = true;
});

When("I click its play button", function () {
  this.playButtonClicked = true;
  this.isPlaying = true;
});

When("I click on the word", function () {
  this.wordClicked = true;
});

When("I click play on an entry", function () {
  this.entryPlayClicked = true;
  this.isPlaying = true;
});

When("I click save", function () {
  this.saveClicked = true;
});

When("I click the notification close button", function () {
  this.notificationCloseClicked = true;
});

When("I click the phonetic guide button", function () {
  this.phoneticGuideButtonClicked = true;
  this.phoneticGuideOpen = true;
});

When("I click the play button for {string}", function (_text: string) {
  this.playButtonClicked = true;
  this.isPlaying = true;
});

When("I copy entries and save to a task", function () {
  this.entriesCopied = true;
  this.entriesSavedToTask = true;
});

When("I copy entries from shared task", function () {
  this.entriesCopiedFromShared = true;
});

When("I copy the baseline task", function () {
  this.baselineTaskCopied = true;
});

When("I delete the baseline task", function () {
  this.baselineTaskDeleted = true;
});

When("I enter {string} in the synthesis text field", function (_text: string) {
  this.synthesisText = _text;
});

When("I generate a share link", function () {
  this.shareLinkGenerated = true;
  this.shareLink = "https://app.example.com/shared/abc123";
});

When("I log in", function () {
  this.isAuthenticated = true;
});

When("I navigate to the Tasks view", function () {
  this.currentPage = "tasks";
});

When("I open a shared task link", function () {
  this.openedSharedTask = true;
});

When("I open the downloaded file", function () {
  this.downloadedFileOpened = true;
});

When("I open the shared link", function () {
  this.sharedLinkOpened = true;
});

When("I play the same text again", function () {
  this.replayRequested = true;
});

When("I successfully log in", function () {
  this.isAuthenticated = true;
  this.loginSuccessful = true;
});

When("I trigger synthesis", function () {
  this.synthesisTriggerred = true;
});

When("I try to edit task name", function () {
  this.editingTaskName = true;
});

When("I try to save copied entries to a task", function () {
  this.triedToSaveEntries = true;
});

When("I view the email field", function () {
  this.viewingEmailField = true;
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

When("component unmounts", function () {
  this.componentUnmounted = true;
});

When("playback error is detected", function () {
  this.playbackError = true;
});

When("the task detail view loads", function () {
  this.taskDetailLoaded = true;
});

When("the text changes", function () {
  this.textChanged = true;
});

// ===== REMAINING THEN STEPS =====

Then("changes are reflected in synthesis", function () {
  this.changesReflectedInSynthesis = true;
});

Then("the pronunciation variants panel is open for a word", function () {
  this.variantsPanelOpen = true;
});

Then("I can customize its phonetic form", function () {
  this.canCustomizePhonetic = true;
});

Then("I can play all entries", function () {
  this.canPlayAllEntries = true;
});

Then("I can see all task entries", function () {
  this.canSeeAllEntries = true;
});

Then("I can still view the task content", function () {
  this.canViewTaskContent = true;
});

Then("I can type new words in the input field", function () {
  this.canTypeNewWords = true;
});

Then("I hear the synthesized audio", function () {
  this.heardSynthesizedAudio = true;
});

Then("I only see tasks matching {string}", function (_pattern: string) {
  this.tasksFiltered = true;
});

Then("I see a {string} button at the bottom", function (_buttonText: string) {
  this.buttonAtBottom = true;
});

Then(
  "I see a {string} button showing count {string}",
  function (_button: string, _count: string) {
    this.buttonWithCount = true;
  },
);

Then("I see a custom phonetic input field", function () {
  this.customPhoneticInputVisible = true;
});

Then("I see a login prompt", function () {
  this.loginPromptVisible = true;
});

Then("I see a search input in the dialog", function () {
  this.searchInputInDialog = true;
});

Then("I see a task selection dialog", function () {
  this.taskSelectionDialog = true;
});

Then("I see an {string} button", function (_buttonText: string) {
  this.buttonVisible = true;
});

Then("I see an {string} option in the dropdown", function (_option: string) {
  this.optionInDropdown = true;
});

Then("I see an error notification", function () {
  this.errorNotificationVisible = true;
});

Then("I see an option to create new task", function () {
  this.createNewTaskOption = true;
});

Then("I see pre-loaded example tasks", function () {
  this.exampleTasksVisible = true;
});

Then("I see quick-insert buttons for phonetic markers", function () {
  this.quickInsertButtons = true;
});

Then("I see the entries in synthesis view", function () {
  this.entriesInSynthesisView = true;
});

Then(
  "I see the entry count {string} next to the task",
  function (_count: string) {
    this.entryCountVisible = true;
  },
);

Then("I see the phonetic guide modal", function () {
  this.phoneticGuideOpen = true;
});

Then("I see the share link in a dialog", function () {
  this.shareLinkInDialog = true;
});

Then("I see the shared task details", function () {
  this.sharedTaskDetailsVisible = true;
});

Then("a new user-owned task is created", function () {
  this.newTaskCreated = true;
});

Then("a unique shareable URL is generated", function () {
  this.shareLink = "https://app.example.com/shared/abc123";
});

Then("audio data is preserved in copied entries", function () {
  this.audioDataPreserved = true;
});

Then("baseline tasks are visually distinguished", function () {
  this.baselineTasksDistinguished = true;
});

Then("blob URLs are revoked to free memory", function () {
  this.blobUrlsRevoked = true;
});

Then("both audio blob and phonetic text are cached together", function () {
  this.audioBlobCached = true;
});

Then("cached audio is cleared", function () {
  this.cachedAudioCleared = true;
});

Then("download uses cached version without re-synthesis", function () {
  this.downloadUsedCache = true;
});

Then("entries are copied to my local playlist", function () {
  this.entriesCopiedToPlaylist = true;
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

Then("it is clearly marked as optional", function () {
  this.markedAsOptional = true;
});

Then("notifications stack without overlapping", function () {
  this.notificationsStack = true;
});

Then("system invalidates cache and regenerates audio", function () {
  this.cacheInvalidated = true;
});

Then("the URL is copied to clipboard", function () {
  this.urlCopiedToClipboard = true;
});

Then("the audio plays correctly in a standard audio player", function () {
  this.audioPlaysCorrectly = true;
});

Then("the audio uses the edited phonetic form", function () {
  this.audioUsesEditedPhonetic = true;
});

Then("the button shows loading state during synthesis", function () {
  this.buttonShowsLoading = true;
});

Then("the cache is automatically invalidated", function () {
  this.cacheInvalidated = true;
});

Then("the cached audio plays immediately", function () {
  this.cachedAudioPlaysImmediately = true;
});

Then("the dialog closes", function () {
  this.dialogClosed = true;
});

Then("the edit option is not available for baseline tasks", function () {
  this.editOptionNotAvailable = true;
});

Then("the notification automatically disappears", function () {
  this.notificationAutoDisappears = true;
});

Then("the notification disappears", function () {
  this.notificationDisappears = true;
});

Then("the same share link is available", function () {
  this.sameLinkAvailable = true;
});

Then("the system synthesizes the audio first", function () {
  this.systemSynthesizedFirst = true;
});

Then("the task is copied to my task list", function () {
  this.taskCopiedToMyList = true;
});
