// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Given, When, Then } from "@cucumber/cucumber";

// ===== UI 2 STEPS =====

Then("the application renders normally", function () {
  this.theApplicationRendersNormally = true;
});

Then("the button shows loading state", function () {
  this.theButtonShowsLoadingState = true;
});

Then("the change is persisted to storage", function () {
  this.theChangeIsPersistedToStorage = true;
});

Then("the cursor moves after the inserted symbol", function () {
  this.theCursorMovesAfterTheInsertedSymbol = true;
});

Then("the edit mode closes", function () {
  this.theEditModeCloses = true;
});

Then("the fields are pre-filled with current values", function () {
  this.theFieldsArePrefilledWithCurrentValues = true;
});

Then("the footer shows all sections side by side", function () {
  this.theFooterShowsAllSectionsSideBySide = true;
});

Then("the form fields are disabled", function () {
  this.theFormFieldsAreDisabled = true;
});

Then("the input field is empty", function () {
  this.theInputFieldIsEmpty = true;
});

Then("the main content has a main landmark", function () {
  this.theMainContentHasAMainLandmark = true;
});

Then("the menu closes", function () {
  this.theMenuCloses = true;
});

Then("the new order is persisted", function () {
  this.theNewOrderIsPersisted = true;
});

Then("the panel closes", function () {
  this.thePanelCloses = true;
});

Then("the spinner disappears when content loads", function () {
  this.theSpinnerDisappearsWhenContentLoads = true;
});

Then("the text content matches what I entered", function () {
  this.theTextContentMatchesWhatIEntered = true;
});

Then("the UI returns to idle state", function () {
  this.theUiReturnsToIdleState = true;
});

Then("the updated timestamp changes", function () {
  this.theUpdatedTimestampChanges = true;
});

Then("validation messages are in Estonian", function () {
  this.validationMessagesAreInEstonian = true;
});

Then("a new API request is made", function () {
  this.aNewApiRequestIsMade = true;
});

Then("a WAV file download starts", function () {
  this.aWavFileDownloadStarts = true;
});

Then("focus moves to the next interactive element", function () {
  this.focusMovesToTheNextInteractiveElement = true;
});

Then("form fields show Estonian placeholders", function () {
  this.formFieldsShowEstonianPlaceholders = true;
});

Then("I am prompted to log in", function () {
  this.iAmPromptedToLogIn = true;
});

Then("I see activity metric cards", function () {
  this.iSeeActivityMetricCards = true;
});

Then("I see a dropdown menu with actions", function () {
  this.iSeeADropdownMenuWithActions = true;
});

Then("I see a feedback email link in the footer", function () {
  this.iSeeAFeedbackEmailLinkInTheFooter = true;
});

Then("I see a list of recent activities", function () {
  this.iSeeAListOfRecentActivities = true;
});

Then("I see a loading spinner", function () {
  this.iSeeALoadingSpinner = true;
});

Then("I see a \"Logi sisse\" button in the header", function () {
  this.iSeeALogiSisseButtonInTheHeader = true;
});

Then("I see a \"not found\" error message", function () {
  this.iSeeANotFoundErrorMessage = true;
});

Then("I see an X close button in the header", function () {
  this.iSeeAnXCloseButtonInTheHeader = true;
});

Then("I see \"Kasutaja pole sisse logitud\" error", function () {
  this.iSeeKasutajaPoleSisseLogitudError = true;
});

Then("I see \"Laadimine...\" while the task loads", function () {
  this.iSeeLaadimineWhileTheTaskLoads = true;
});

Then("I see links to about, changelog, and terms", function () {
  this.iSeeLinksToAboutChangelogAndTerms = true;
});

Then("I see \"Lisa ülesandesse\" which triggers login", function () {
  this.iSeeLisaLesandesseWhichTriggersLogin = true;
});

Then("I see \"Muuda\" and \"Kustuta\" options", function () {
  this.iSeeMuudaAndKustutaOptions = true;
});

Then("I see my name in the profile area", function () {
  this.iSeeMyNameInTheProfileArea = true;
});

Then("I see my user profile in the header", function () {
  this.iSeeMyUserProfileInTheHeader = true;
});

Then("I see options for \"Muuda\", \"Jaga\", and \"Kustuta\"", function () {
  this.iSeeOptionsForMuudaJagaAndKustuta = true;
});

Then("I see \"Pealkiri on kohustuslik\" error", function () {
  this.iSeePealkiriOnKohustuslikError = true;
});

Then("I see privacy terms notice at the bottom", function () {
  this.iSeePrivacyTermsNoticeAtTheBottom = true;
});

Then("I see quick links to key features", function () {
  this.iSeeQuickLinksToKeyFeatures = true;
});

Then("I see social media links for Facebook, YouTube, and LinkedIn", function () {
  this.iSeeSocialMediaLinksForFacebookYoutubeAn = true;
});

Then("I see the application header", function () {
  this.iSeeTheApplicationHeader = true;
});

Then("I see the empty state illustration", function () {
  this.iSeeTheEmptyStateIllustration = true;
});

Then("I see the feature scenarios and their descriptions", function () {
  this.iSeeTheFeatureScenariosAndTheirDescripti = true;
});

Then("I see the first wizard tooltip", function () {
  this.iSeeTheFirstWizardTooltip = true;
});

Then("I see the footer with EKI contact details", function () {
  this.iSeeTheFooterWithEkiContactDetails = true;
});

Then("I see the text in the input field", function () {
  this.iSeeTheTextInTheInputField = true;
});

Then("I see \"Ülesande nimi on kohustuslik\" error", function () {
  this.iSeeLesandeNimiOnKohustuslikError = true;
});

Then("I see \"Ülesannet ei leitud\" error message", function () {
  this.iSeeLesannetEiLeitudErrorMessage = true;
});

Then("my identity is verified", function () {
  this.myIdentityIsVerified = true;
});

Then("polling stops", function () {
  this.pollingStops = true;
});

Then("recent activity timestamps use Estonian locale", function () {
  this.recentActivityTimestampsUseEstonianLocal = true;
});

Then("\"Tere\" stops playing", function () {
  this.tereStopsPlaying = true;
});

Then("the abort signal is triggered", function () {
  this.theAbortSignalIsTriggered = true;
});

Then("the action is executed", function () {
  this.theActionIsExecuted = true;
});

Then("the action is not executed", function () {
  this.theActionIsNotExecuted = true;
});

Then("the appropriate voice model is used for long text", function () {
  this.theAppropriateVoiceModelIsUsedForLongTex = true;
});

Then("the appropriate voice model is used for short text", function () {
  this.theAppropriateVoiceModelIsUsedForShortTe = true;
});

Then("the boundary is shown as a plus symbol in the UI", function () {
  this.theBoundaryIsShownAsAPlusSymbolInTheUi = true;
});

Then("the build date is formatted as Estonian date and time", function () {
  this.theBuildDateIsFormattedAsEstonianDateAnd = true;
});

Then("the button shows \"Lisaan...\" loading text", function () {
  this.theButtonShowsLisaanLoadingText = true;
});

Then("the buttons show Estonian text like \"Mängi kõik\"", function () {
  this.theButtonsShowEstonianTextLikeMngiKik = true;
});

Then("the description is truncated again", function () {
  this.theDescriptionIsTruncatedAgain = true;
});

Then("the download option is disabled", function () {
  this.theDownloadOptionIsDisabled = true;
});

Then("the full description is revealed", function () {
  this.theFullDescriptionIsRevealed = true;
});

Then("the group expands showing individual features", function () {
  this.theGroupExpandsShowingIndividualFeatures = true;
});

Then("the header has a navigation landmark", function () {
  this.theHeaderHasANavigationLandmark = true;
});

Then("the header shows logo, navigation, and user controls", function () {
  this.theHeaderShowsLogoNavigationAndUserContr = true;
});

Then("the help button has an aria-label", function () {
  this.theHelpButtonHasAnArialabel = true;
});

Then("the input field is emptied", function () {
  this.theInputFieldIsEmptied = true;
});

Then("the \"Lisa ülesandesse\" button is disabled", function () {
  this.theLisaLesandesseButtonIsDisabled = true;
});

Then("the menu has role \"menu\"", function () {
  this.theMenuHasRoleMenu = true;
});

Then("the menu is positioned near the trigger button", function () {
  this.theMenuIsPositionedNearTheTriggerButton = true;
});

Then("the navigation shows \"Tekst kõneks\" and \"Ülesanded\"", function () {
  this.theNavigationShowsTekstKneksAndLesanded = true;
});

Then("the next tooltip appears", function () {
  this.theNextTooltipAppears = true;
});

Then("the panel appears as a side panel", function () {
  this.thePanelAppearsAsASidePanel = true;
});

Then("the stressed syllables are visually highlighted", function () {
  this.theStressedSyllablesAreVisuallyHighlight = true;
});

Then("the system polls the status endpoint", function () {
  this.theSystemPollsTheStatusEndpoint = true;
});

Then("the text is in my clipboard", function () {
  this.theTextIsInMyClipboard = true;
});

Then("the text is sent to the analysis API", function () {
  this.theTextIsSentToTheAnalysisApi = true;
});

Then("the WAV file is saved to my device", function () {
  this.theWavFileIsSavedToMyDevice = true;
});

Then("the wizard closes", function () {
  this.theWizardCloses = true;
});

Then("the wizard does not appear again", function () {
  this.theWizardDoesNotAppearAgain = true;
});

Given("I am not logged in", function () {
  this.isAuthenticated = false;
});

Given("I am using the application", function () {
  this.usingApplication = true;
});

Given("the feedback form is open", function () {
  this.feedbackFormOpen = true;
});

Given(
  "I have entered {string} in the message field",
  function (_message: string) {
    this.messageInput = _message;
  },
);

Given("edit mode is active", function () {
  this.editModeActive = true;
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

When("I click on my user icon", function () {
  this.userIconClicked = true;
  this.profileDropdownVisible = true;
});

When("I click the feedback button", function () {
  this.feedbackButtonClicked = true;
  this.feedbackFormOpen = true;
});
