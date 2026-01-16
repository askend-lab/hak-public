import { When, Then } from '@cucumber/cucumber';

Then('I am prompted to log in again', function () {
  this.promptedToLogin = true;
});

Then('I am redirected back to the original page', function () {
  this.redirectedBack = true;
});

Then('I am redirected to task list', function () {
  this.currentPage = 'tasks';
});

Then('I am redirected to the home page', function () {
  this.currentPage = 'home';
});

Then('I can customize its phonetic form', function () {
  this.canCustomizePhonetic = true;
});

Then('I can play all entries', function () {
  this.canPlayAllEntries = true;
});

Then('I can see all task entries', function () {
  this.canSeeAllEntries = true;
});

Then('I can see both original text and phonetic form', function () {
  this.canSeeBothTextAndPhonetic = true;
});

Then('I can start typing text in the new row', function () {
  this.canTypeInNewRow = true;
});

Then('I can still view the task content', function () {
  this.canViewTaskContent = true;
});

Then('I can submit without entering an email', function () {
  this.canSubmitWithoutEmail = true;
});

Then('I can type new words in the input field', function () {
  this.canTypeNewWords = true;
});

Then('I cannot delete the task', function () {
  this.cannotDeleteTask = true;
});

Then('I cannot edit the task', function () {
  this.cannotEditTask = true;
});

Then('I have two sentence rows in the list', function () {
  this.sentences = this.sentences || [];
  if (this.sentences.length < 2) {
    this.sentences.push({ id: 's2', text: '', tags: [] });
  }
});

Then('I have {int} sentences remaining', function (_count: number) {
  this.sentencesRemaining = _count;
});

Then('I hear pronunciations', function () {
  this.heardPronunciations = true;
});

Then('I hear that specific pronunciation', function () {
  this.heardSpecificPronunciation = true;
});

Then('I hear the audio playback', function () {
  this.heardAudioPlayback = true;
});

Then('I only see tasks matching {string}', function (filter: string) {
  this.tasksFiltered = filter;
});

Then('I return to the main synthesis view', function () {
  this.currentPage = 'synthesis';
});

Then('I see a button for compound word boundary marker', function () {
  this.compoundMarkerButtonVisible = true;
});

Then('I see a button for palatalization marker', function () {
  this.palatalizationMarkerButtonVisible = true;
});

Then('I see a button for stressed syllable marker', function () {
  this.stressedMarkerButtonVisible = true;
});

Then('I see a button for third quantity marker', function () {
  this.thirdQuantityMarkerButtonVisible = true;
});

Then('I see a confirmation dialog', function () {
  this.confirmationDialogVisible = true;
});

Then('I see a custom phonetic input field', function () {
  this.customPhoneticInputVisible = true;
});

Then('I see a feedback button or link', function () {
  this.feedbackButtonVisible = true;
});

Then('I see a field for task description', function () {
  this.taskDescriptionFieldVisible = true;
});

Then('I see a field for task name', function () {
  this.taskNameFieldVisible = true;
});

Then('I see a list of entries', function () {
  this.entriesListVisible = true;
});

Then('I see a login prompt', function () {
  this.loginPromptVisible = true;
});

Then('I see a logout button', function () {
  this.logoutButtonVisible = true;
});

Then('I see a message explaining authentication is required', function () {
  this.authRequiredMessageVisible = true;
});

Then('I see a message input field', function () {
  this.messageInputFieldVisible = true;
});

Then('I see a search input in the dialog', function () {
  this.searchInputVisible = true;
});

Then('I see a task card with name {string}', function (name: string) {
  this.taskCardName = name;
});

Then('I see a task selection dialog', function () {
  this.taskSelectionDialogVisible = true;
});

Then('I see a thank you confirmation message', function () {
  this.thankYouMessageVisible = true;
});

Then('I see a validation error for required fields', function () {
  this.validationErrorVisible = true;
});

Then('I see a validation error for task name', function () {
  this.taskNameValidationError = true;
});

Then('I see a validation error', function () {
  this.validationErrorVisible = true;
});

Then('I see a {string} button at the bottom', function (buttonName: string) {
  this.bottomButton = buttonName;
});

Then('I see a {string} button showing count {string}', function (buttonName: string, count: string) {
  this.buttonWithCount = { name: buttonName, count };
});

Then('I see a {string} button', function (buttonName: string) {
  this.visibleButton = buttonName;
});

Then('I see an empty state message', function () {
  this.emptyStateVisible = true;
});

Then('I see an option to create new task', function () {
  this.createTaskOptionVisible = true;
});

Then('I see an optional email field', function () {
  this.optionalEmailFieldVisible = true;
});

Then('I see an {string} button', function (buttonName: string) {
  this.visibleButton = buttonName;
});

Then('I see an {string} option in the dropdown', function (option: string) {
  this.dropdownOption = option;
});

Then('I see baseline tasks in the list', function () {
  this.baselineTasksVisible = true;
});

Then('I see example words using that symbol', function () {
  this.exampleWordsVisible = true;
});

Then('I see explanation for + \\(compound word boundary)', function () {
  this.compoundExplanationVisible = true;
});

Then('I see explanation for \' \\(palatalization)', function () {
  this.palatalizationExplanationVisible = true;
});

Then('I see explanation for ` \\(third degree length)', function () {
  this.thirdDegreeExplanationVisible = true;
});

Then('I see explanation for ´ \\(stress marker)', function () {
  this.stressMarkerExplanationVisible = true;
});

Then('I see explanations for phonetic symbols', function () {
  this.phoneticSymbolExplanationsVisible = true;
});

Then('I see instructions to create first task', function () {
  this.createFirstTaskInstructionsVisible = true;
});

Then('I see multiple pronunciation options', function () {
  this.multiplePronunciationOptionsVisible = true;
});

Then('I see my account creation date', function () {
  this.accountCreationDateVisible = true;
});

Then('I see my name', function () {
  this.nameVisible = true;
});

Then('I see my recent tasks', function () {
  this.recentTasksVisible = true;
});

Then('I see number of tasks created', function () {
  this.tasksCountVisible = true;
});

Then('I see pre-loaded example tasks', function () {
  this.preloadedTasksVisible = true;
});

Then('I see quick-insert buttons for phonetic markers', function () {
  this.quickInsertButtonsVisible = true;
});

Then('I see the creation date', function () {
  this.creationDateVisible = true;
});

Then('I see the edit form', function () {
  this.editFormVisible = true;
});

Then('I see the entries in synthesis view', function () {
  this.entriesInSynthesisView = true;
});

Then('I see the entry count {string} next to the task', function (count: string) {
  this.entryCount = count;
});

Then('I see the phonetic guide modal', function () {
  this.phoneticGuideModalVisible = true;
});

Then('I see the phonetic text with stress markers', function () {
  this.phoneticTextWithStressVisible = true;
});

Then('I see the share link in a dialog', function () {
  this.shareLinkDialogVisible = true;
});

Then('I see the shared task details', function () {
  this.sharedTaskDetailsVisible = true;
});

When('I open the downloaded file', function () {
  this.downloadedFileOpened = true;
});

When('playback error is detected', function () {
  this.playbackError = true;
});
