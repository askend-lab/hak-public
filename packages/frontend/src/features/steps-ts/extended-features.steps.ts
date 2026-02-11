// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Extended Feature Step Definitions
 * Auto-generated steps for US-036 through US-100
 */

import { Given, When, Then } from "@cucumber/cucumber";

// ===== GIVEN STEPS =====

Given("I am no longer authenticated", function () {
  this.iAmNoLongerAuthenticated = true;
});

Given("I am redirected to the synthesis page", function () {
  this.iAmRedirectedToTheSynthesisPage = true;
});

Given("I am redirected to the tasks view", function () {
  this.iAmRedirectedToTheTasksView = true;
});

Given("I clicked the tasks navigation link", function () {
  this.iClickedTheTasksNavigationLink = true;
});

Given("I have a sentence with synthesized text", function () {
  this.iHaveASentenceWithSynthesizedText = true;
});

Given("I have a task with a share token", function () {
  this.iHaveATaskWithAShareToken = true;
});

Given("I have a task without a share token", function () {
  this.iHaveATaskWithoutAShareToken = true;
});

Given("I have multiple sentences with text", function () {
  this.iHaveMultipleSentencesWithText = true;
});

Given("I have synthesized audio for \"Tere\"", function () {
  this.iHaveSynthesizedAudioForTere = true;
});

Given("a component has a custom error fallback", function () {
  this.aComponentHasACustomErrorFallback = true;
});

Given("a destructive action requires confirmation", function () {
  this.aDestructiveActionRequiresConfirmation = true;
});

Given("all sentence inputs are empty", function () {
  this.allSentenceInputsAreEmpty = true;
});

Given("all sentence rows are empty", function () {
  this.allSentenceRowsAreEmpty = true;
});

Given("all sentences have finished playing", function () {
  this.allSentencesHaveFinishedPlaying = true;
});

Given("a modal is open", function () {
  this.aModalIsOpen = true;
});

Given("a modal with close button is open", function () {
  this.aModalWithCloseButtonIsOpen = true;
});

Given("an error occurs in the application", function () {
  this.anErrorOccursInTheApplication = true;
});

Given("a sentence is currently playing audio", function () {
  this.aSentenceIsCurrentlyPlayingAudio = true;
});

Given("a small modal is open", function () {
  this.aSmallModalIsOpen = true;
});

Given("a tag is in edit mode", function () {
  this.aTagIsInEditMode = true;
});

Given("a task description is expanded", function () {
  this.aTaskDescriptionIsExpanded = true;
});

Given("a task has a long description", function () {
  this.aTaskHasALongDescription = true;
});

Given("a task has been shared with a token", function () {
  this.aTaskHasBeenSharedWithAToken = true;
});

Given("a task is shared as unlisted", function () {
  this.aTaskIsSharedAsUnlisted = true;
});

Given("audio is playing", function () {
  this.audioIsPlaying = true;
});

Given("audio is playing for one sentence", function () {
  this.audioIsPlayingForOneSentence = true;
});

Given("audio is playing on the shared page", function () {
  this.audioIsPlayingOnTheSharedPage = true;
});

Given("audio playback failed for a sentence", function () {
  this.audioPlaybackFailedForASentence = true;
});

Given("demo sentences are pre-filled", function () {
  this.demoSentencesArePrefilled = true;
});

Given("I am about to delete a task", function () {
  this.iAmAboutToDeleteATask = true;
});

Given("I am a new user visiting for the first time", function () {
  this.iAmANewUserVisitingForTheFirstTime = true;
});

Given("I am authenticated with a display name", function () {
  this.iAmAuthenticatedWithADisplayName = true;
});

Given("I am authenticated with Estonian eID", function () {
  this.iAmAuthenticatedWithEstonianEid = true;
});

Given("I am authenticated with stored tokens", function () {
  this.iAmAuthenticatedWithStoredTokens = true;
});

Given("I am creating a new task", function () {
  this.iAmCreatingANewTask = true;
});

Given("I am dragging an entry", function () {
  this.iAmDraggingAnEntry = true;
});

Given("I am editing phonetic text", function () {
  this.iAmEditingPhoneticText = true;
});

Given("I am in a view with draggable entries", function () {
  this.iAmInAViewWithDraggableEntries = true;
});

Given("I am loading the application", function () {
  this.iAmLoadingTheApplication = true;
});

Given("I am on a desktop screen", function () {
  this.iAmOnADesktopScreen = true;
});

Given("I am on any page", function () {
  this.iAmOnAnyPage = true;
});

Given("I am on the dashboard", function () {
  this.iAmOnTheDashboard = true;
});

Given("I am on the last wizard step", function () {
  this.iAmOnTheLastWizardStep = true;
});

Given("I am on the role selection page", function () {
  this.iAmOnTheRoleSelectionPage = true;
});

Given("I am on the specs page", function () {
  this.iAmOnTheSpecsPage = true;
});

Given("I am viewing an empty task", function () {
  this.iAmViewingAnEmptyTask = true;
});

Given("I am viewing a shared task with entries", function () {
  this.iAmViewingASharedTaskWithEntries = true;
});

Given("I am viewing a task detail with entries", function () {
  this.iAmViewingATaskDetailWithEntries = true;
});

Given("I am viewing a task with audio entries", function () {
  this.iAmViewingATaskWithAudioEntries = true;
});

Given("I attempt to log in with an invalid ID code", function () {
  this.iAttemptToLogInWithAnInvalidIdCode = true;
});

Given("I completed Google login", function () {
  this.iCompletedGoogleLogin = true;
});

Given("I completed TARA login", function () {
  this.iCompletedTaraLogin = true;
});

Given("I complete the login flow", function () {
  this.iCompleteTheLoginFlow = true;
});

Given("I enter new text that requires processing", function () {
  this.iEnterNewTextThatRequiresProcessing = true;
});

Given("I enter text for synthesis", function () {
  this.iEnterTextForSynthesis = true;
});

Given("I have 3 sentence rows", function () {
  this.iHave3SentenceRows = true;
});

Given("I have an empty sentence", function () {
  this.iHaveAnEmptySentence = true;
});

Given("I have an invalid share token", function () {
  this.iHaveAnInvalidShareToken = true;
});

Given("I have a URL with a random invalid token", function () {
  this.iHaveAUrlWithARandomInvalidToken = true;
});

Given("I have a valid share token", function () {
  this.iHaveAValidShareToken = true;
});

Given("I have a valid share token for an empty task", function () {
  this.iHaveAValidShareTokenForAnEmptyTask = true;
});

Given("I have completed the onboarding wizard", function () {
  this.iHaveCompletedTheOnboardingWizard = true;
});

Given("I have edited the phonetic text with markers", function () {
  this.iHaveEditedThePhoneticTextWithMarkers = true;
});

Given("I have entered a custom phonetic variant", function () {
  this.iHaveEnteredACustomPhoneticVariant = true;
});

Given("I have entered text for synthesis", function () {
  this.iHaveEnteredTextForSynthesis = true;
});

Given("I have entered UI markers in phonetic text", function () {
  this.iHaveEnteredUiMarkersInPhoneticText = true;
});

Given("I have one sentence row", function () {
  this.iHaveOneSentenceRow = true;
});

Given("I have previously entered sentences", function () {
  this.iHavePreviouslyEnteredSentences = true;
});

Given("I have selected a role", function () {
  this.iHaveSelectedARole = true;
});

Given("I have selected the \"Õppija\" role", function () {
  this.iHaveSelectedThePpijaRole = true;
});

Given("I have sentences in local storage", function () {
  this.iHaveSentencesInLocalStorage = true;
});

Given("I have synthesized text with stress markers", function () {
  this.iHaveSynthesizedTextWithStressMarkers = true;
});

Given("I log in with a valid Estonian ID code", function () {
  this.iLogInWithAValidEstonianIdCode = true;
});

Given("I open a modal dialog", function () {
  this.iOpenAModalDialog = true;
});

Given("I opened the variants panel for a word", function () {
  this.iOpenedTheVariantsPanelForAWord = true;
});

Given("I previously synthesized \"Tere\"", function () {
  this.iPreviouslySynthesizedTere = true;
});

Given("I see an error boundary message", function () {
  this.iSeeAnErrorBoundaryMessage = true;
});

Given("I see the login modal", function () {
  this.iSeeTheLoginModal = true;
});

Given("I selected the \"Õpetaja\" role", function () {
  this.iSelectedThePetajaRole = true;
});

Given("I updated an entry locally", function () {
  this.iUpdatedAnEntryLocally = true;
});

Given("I was redirected to login from tasks", function () {
  this.iWasRedirectedToLoginFromTasks = true;
});

Given("my task already has a share token", function () {
  this.myTaskAlreadyHasAShareToken = true;
});

Given("my task has no share token yet", function () {
  this.myTaskHasNoShareTokenYet = true;
});

Given("the add entry modal is open", function () {
  this.theAddEntryModalIsOpen = true;
});

Given("the analysis returned stressed text", function () {
  this.theAnalysisReturnedStressedText = true;
});

Given("the audio system has been warmed up", function () {
  this.theAudioSystemHasBeenWarmedUp = true;
});

Given("the browser blocks autoplay", function () {
  this.theBrowserBlocksAutoplay = true;
});

Given("the browser denies clipboard access", function () {
  this.theBrowserDeniesClipboardAccess = true;
});

Given("the build info modal is open", function () {
  this.theBuildInfoModalIsOpen = true;
});

Given("the callback URL has no tokens or code", function () {
  this.theCallbackUrlHasNoTokensOrCode = true;
});

Given("the custom variant form is open", function () {
  this.theCustomVariantFormIsOpen = true;
});

Given("the login provider returned an error", function () {
  this.theLoginProviderReturnedAnError = true;
});

Given("the phonetic editing panel is open", function () {
  this.thePhoneticEditingPanelIsOpen = true;
});

Given("the phonetic panel is open", function () {
  this.thePhoneticPanelIsOpen = true;
});

Given("the pronunciation variants panel is open", function () {
  this.thePronunciationVariantsPanelIsOpen = true;
});

Given("the sentence context menu is open", function () {
  this.theSentenceContextMenuIsOpen = true;
});

Given("the share modal is open", function () {
  this.theShareModalIsOpen = true;
});

Given("the synthesis is being polled", function () {
  this.theSynthesisIsBeingPolled = true;
});

Given("the tag menu is open", function () {
  this.theTagMenuIsOpen = true;
});

Given("the task API is unavailable", function () {
  this.theTaskApiIsUnavailable = true;
});

Given("the task edit modal is open", function () {
  this.theTaskEditModalIsOpen = true;
});

Given("the text contains a compound word boundary", function () {
  this.theTextContainsACompoundWordBoundary = true;
});

Given("the text contains kolmas välde marker", function () {
  this.theTextContainsKolmasVldeMarker = true;
});

Given("the variants panel is open for a task entry", function () {
  this.theVariantsPanelIsOpenForATaskEntry = true;
});

Given("the variants panel shows an error", function () {
  this.theVariantsPanelShowsAnError = true;
});

Given("the warm-up worker failed to initialize", function () {
  this.theWarmupWorkerFailedToInitialize = true;
});

// ===== WHEN STEPS =====

When("I click \"Eemalda\"", function () {
  this.iClickEemalda = true;
});

When("I click \"Jaga\"", function () {
  this.iClickJaga = true;
});

When("I click \"Kopeeri tekst\"", function () {
  this.iClickKopeeriTekst = true;
});

When("I click \"Kustuta\"", function () {
  this.iClickKustuta = true;
});

When("I click \"Lae alla .wav fail\"", function () {
  this.iClickLaeAllaWavFail = true;
});

When("I click \"Lisa\"", function () {
  this.iClickLisa = true;
});

When("I click \"Loo uus ülesanne\"", function () {
  this.iClickLooUusLesanne = true;
});

When("I click \"Muuda\"", function () {
  this.iClickMuuda = true;
});

When("I click \"Rakenda\"", function () {
  this.iClickRakenda = true;
});

When("I click \"Uuri häälduskuju\"", function () {
  this.iClickUuriHlduskuju = true;
});

When("I edit the phonetic text", function () {
  this.iEditThePhoneticText = true;
});

When("I enter a description", function () {
  this.iEnterADescription = true;
});

When("I select an existing task from the dropdown", function () {
  this.iSelectAnExistingTaskFromTheDropdown = true;
});

When("I select a pronunciation variant", function () {
  this.iSelectAPronunciationVariant = true;
});

When("I select \"View variants\"", function () {
  this.iSelectViewVariants = true;
});

When("the onboarding wizard is active", function () {
  this.theOnboardingWizardIsActive = true;
});

When("the onboarding wizard starts", function () {
  this.theOnboardingWizardStarts = true;
});

When("the synthesis completes", function () {
  this.theSynthesisCompletes = true;
});

When("a component error occurs", function () {
  this.aComponentErrorOccurs = true;
});

When("an API request fails", function () {
  this.anApiRequestFails = true;
});

When("an unauthenticated user accesses the share link", function () {
  this.anUnauthenticatedUserAccessesTheShareLin = true;
});

When("audio play is attempted", function () {
  this.audioPlayIsAttempted = true;
});

When("I apply the phonetic changes", function () {
  this.iApplyThePhoneticChanges = true;
});

When("I click a marker button", function () {
  this.iClickAMarkerButton = true;
});

When("I click a word tag in an entry", function () {
  this.iClickAWordTagInAnEntry = true;
});

When("I click a word tag to view variants", function () {
  this.iClickAWordTagToViewVariants = true;
});

When("I click \"Jätka Google'iga\"", function () {
  this.iClickJtkaGoogleiga = true;
});

When("I click \"Kopeeri tekst\" on an entry", function () {
  this.iClickKopeeriTekstOnAnEntry = true;
});

When("I click \"Kustuta\" on an entry", function () {
  this.iClickKustutaOnAnEntry = true;
});

When("I click \"Lae alla .wav fail\" in the sentence menu", function () {
  this.iClickLaeAllaWavFailInTheSentenceMenu = true;
});

When("I click \"Lisa ülesandesse\"", function () {
  this.iClickLisaLesandesse = true;
});

When("I click \"Lisa ülesandesse\" in the menu", function () {
  this.iClickLisaLesandesseInTheMenu = true;
});

When("I click login and authenticate", function () {
  this.iClickLoginAndAuthenticate = true;
});

When("I click \"Logi sisse TARA-ga\"", function () {
  this.iClickLogiSisseTaraga = true;
});

When("I click \"Mängi kõik\"", function () {
  this.iClickMngiKik = true;
});

When("I click \"Näita rohkem\"", function () {
  this.iClickNitaRohkem = true;
});

When("I click \"Näita vähem\"", function () {
  this.iClickNitaVhem = true;
});

When("I click on a feature group", function () {
  this.iClickOnAFeatureGroup = true;
});

When("I click on a task row", function () {
  this.iClickOnATaskRow = true;
});

When("I click on a word tag", function () {
  this.iClickOnAWordTag = true;
});

When("I click on a word tag in a task entry", function () {
  this.iClickOnAWordTagInATaskEntry = true;
});

When("I click play", function () {
  this.iClickPlay = true;
});

When("I click play for the first time", function () {
  this.iClickPlayForTheFirstTime = true;
});

When("I click play on a demo sentence", function () {
  this.iClickPlayOnADemoSentence = true;
});

When("I click play on a shared entry", function () {
  this.iClickPlayOnASharedEntry = true;
});

When("I click play on a variant", function () {
  this.iClickPlayOnAVariant = true;
});

When("I click remove on an entry", function () {
  this.iClickRemoveOnAnEntry = true;
});

When("I click the add sentence button", function () {
  this.iClickTheAddSentenceButton = true;
});

When("I click the back button", function () {
  this.iClickTheBackButton = true;
});

When("I click the build info button in the footer", function () {
  this.iClickTheBuildInfoButtonInTheFooter = true;
});

When("I click the cancel button", function () {
  this.iClickTheCancelButton = true;
});

When("I click the clear button", function () {
  this.iClickTheClearButton = true;
});

When("I click the clear button on the sentence", function () {
  this.iClickTheClearButtonOnTheSentence = true;
});

When("I click the confirm button", function () {
  this.iClickTheConfirmButton = true;
});

When("I click the delete button", function () {
  this.iClickTheDeleteButton = true;
});

When("I click the delete option", function () {
  this.iClickTheDeleteOption = true;
});

When("I click the edit button on a task", function () {
  this.iClickTheEditButtonOnATask = true;
});

When("I click the edit option", function () {
  this.iClickTheEditOption = true;
});

When("I click the help button in the header", function () {
  this.iClickTheHelpButtonInTheHeader = true;
});

When("I click the menu button on an entry", function () {
  this.iClickTheMenuButtonOnAnEntry = true;
});

When("I click the more options button", function () {
  this.iClickTheMoreOptionsButton = true;
});

When("I click the more options button on a task", function () {
  this.iClickTheMoreOptionsButtonOnATask = true;
});

When("I click the more options button on a task row", function () {
  this.iClickTheMoreOptionsButtonOnATaskRow = true;
});

When("I click the play all button", function () {
  this.iClickThePlayAllButton = true;
});

When("I click the play all button again", function () {
  this.iClickThePlayAllButtonAgain = true;
});

When("I click the play all button to stop", function () {
  this.iClickThePlayAllButtonToStop = true;
});

When("I click the play button again", function () {
  this.iClickThePlayButtonAgain = true;
});

When("I click the play button for a sentence", function () {
  this.iClickThePlayButtonForASentence = true;
});

When("I click the play button in the panel", function () {
  this.iClickThePlayButtonInThePanel = true;
});

When("I click the play button on an entry", function () {
  this.iClickThePlayButtonOnAnEntry = true;
});

When("I click the share button on the task", function () {
  this.iClickTheShareButtonOnTheTask = true;
});

When("I click the synthesis navigation link", function () {
  this.iClickTheSynthesisNavigationLink = true;
});

When("I click the tasks navigation link", function () {
  this.iClickTheTasksNavigationLink = true;
});

When("I click to create a custom variant", function () {
  this.iClickToCreateACustomVariant = true;
});

When("I click to view pronunciation variants", function () {
  this.iClickToViewPronunciationVariants = true;
});

When("I click to view the markers guide", function () {
  this.iClickToViewTheMarkersGuide = true;
});

When("I click \"Use\" on a variant", function () {
  this.iClickUseOnAVariant = true;
});

When("I click \"Uuri häälduskuju\" on an entry", function () {
  this.iClickUuriHlduskujuOnAnEntry = true;
});

When("I close and reopen the variants panel", function () {
  this.iCloseAndReopenTheVariantsPanel = true;
});

When("I close the modal", function () {
  this.iCloseTheModal = true;
});

When("I close the modal without saving", function () {
  this.iCloseTheModalWithoutSaving = true;
});

When("I close the variants panel", function () {
  this.iCloseTheVariantsPanel = true;
});

When("I complete the final step", function () {
  this.iCompleteTheFinalStep = true;
});

When("I copy an entry's text", function () {
  this.iCopyAnEntrysText = true;
});

When("I copy the sentence text via the menu", function () {
  this.iCopyTheSentenceTextViaTheMenu = true;
});

When("I create a task with name and description", function () {
  this.iCreateATaskWithNameAndDescription = true;
});

When("I download audio for an entry", function () {
  this.iDownloadAudioForAnEntry = true;
});

When("I drop it on another entry position", function () {
  this.iDropItOnAnotherEntryPosition = true;
});

When("I enter a long sentence", function () {
  this.iEnterALongSentence = true;
});

When("I enter a single word \"Tere\"", function () {
  this.iEnterASingleWordTere = true;
});

When("I enter \"Tere tulemast\" and submit", function () {
  this.iEnterTereTulemastAndSubmit = true;
});

When("I enter \"Tere tulemast\" in the title field", function () {
  this.iEnterTereTulemastInTheTitleField = true;
});

When("I enter text and the analysis API fails", function () {
  this.iEnterTextAndTheAnalysisApiFails = true;
});

When("I enter text in a sentence row", function () {
  this.iEnterTextInASentenceRow = true;
});

When("I follow the tooltip instructions", function () {
  this.iFollowTheTooltipInstructions = true;
});

When("I hover over another entry", function () {
  this.iHoverOverAnotherEntry = true;
});

When("I leave the title field empty", function () {
  this.iLeaveTheTitleFieldEmpty = true;
});

When("I log out", function () {
  this.iLogOut = true;
});

When("I make an API request", function () {
  this.iMakeAnApiRequest = true;
});

When("I make an API request to a private endpoint", function () {
  this.iMakeAnApiRequestToAPrivateEndpoint = true;
});

When("I modify a demo sentence text", function () {
  this.iModifyADemoSentenceText = true;
});

When("I navigate away from the page", function () {
  this.iNavigateAwayFromThePage = true;
});

When("I navigate to a non-existent task", function () {
  this.iNavigateToANonexistentTask = true;
});

When("I navigate to a task detail page", function () {
  this.iNavigateToATaskDetailPage = true;
});

When("I navigate to the dashboard", function () {
  this.iNavigateToTheDashboard = true;
});

When("I navigate to the specs page", function () {
  this.iNavigateToTheSpecsPage = true;
});

When("I navigate to the tasks page", function () {
  this.iNavigateToTheTasksPage = true;
});

When("I open a sentence context menu", function () {
  this.iOpenASentenceContextMenu = true;
});

When("I open the markers guide", function () {
  this.iOpenTheMarkersGuide = true;
});

When("I open the phonetic panel for an entry", function () {
  this.iOpenThePhoneticPanelForAnEntry = true;
});

When("I open the phonetic panel for a sentence", function () {
  this.iOpenThePhoneticPanelForASentence = true;
});

When("I open the sentence context menu", function () {
  this.iOpenTheSentenceContextMenu = true;
});

When("I open the sentence menu", function () {
  this.iOpenTheSentenceMenu = true;
});

When("I open the shared task page", function () {
  this.iOpenTheSharedTaskPage = true;
});

When("I play a different sentence", function () {
  this.iPlayADifferentSentence = true;
});

When("I play the edited phonetic text", function () {
  this.iPlayTheEditedPhoneticText = true;
});

When("I press Enter", function () {
  this.iPressEnter = true;
});

When("I press Escape", function () {
  this.iPressEscape = true;
});

When("I press Tab", function () {
  this.iPressTab = true;
});

When("I press the Escape key", function () {
  this.iPressTheEscapeKey = true;
});

When("I reach the input step", function () {
  this.iReachTheInputStep = true;
});

When("I release outside a valid drop target", function () {
  this.iReleaseOutsideAValidDropTarget = true;
});

When("I reload the application", function () {
  this.iReloadTheApplication = true;
});

When("I remove all sentences", function () {
  this.iRemoveAllSentences = true;
});

When("I request my task list", function () {
  this.iRequestMyTaskList = true;
});

When("I select a feature", function () {
  this.iSelectAFeature = true;
});

When("I select a feature with test results", function () {
  this.iSelectAFeatureWithTestResults = true;
});

When("I select a variant to use", function () {
  this.iSelectAVariantToUse = true;
});

When("I select the \"Õpetaja\" role", function () {
  this.iSelectThePetajaRole = true;
});

When("I select the \"Õppija\" role", function () {
  this.iSelectThePpijaRole = true;
});

When("I select the \"Uurija\" role", function () {
  this.iSelectTheUurijaRole = true;
});

When("I share my task", function () {
  this.iShareMyTask = true;
});

When("I share the task", function () {
  this.iShareTheTask = true;
});

When("I share the task again", function () {
  this.iShareTheTaskAgain = true;
});

When("I start dragging an entry", function () {
  this.iStartDraggingAnEntry = true;
});

When("I submit the form", function () {
  this.iSubmitTheForm = true;
});

When("I synthesize \"Tere\" again", function () {
  this.iSynthesizeTereAgain = true;
});

When("I try to access a task detail", function () {
  this.iTryToAccessATaskDetail = true;
});

When("I try to access the dashboard", function () {
  this.iTryToAccessTheDashboard = true;
});

When("I try to access the shared task", function () {
  this.iTryToAccessTheSharedTask = true;
});

When("I try to copy text", function () {
  this.iTryToCopyText = true;
});

When("I try to load user tasks via API", function () {
  this.iTryToLoadUserTasksViaApi = true;
});

When("I type a custom phonetic variant with markers", function () {
  this.iTypeACustomPhoneticVariantWithMarkers = true;
});

When("I update the task name and description", function () {
  this.iUpdateTheTaskNameAndDescription = true;
});

When("someone opens the share URL with the token", function () {
  this.someoneOpensTheShareUrlWithTheToken = true;
});

When("the callback page loads", function () {
  this.theCallbackPageLoads = true;
});

When("the callback page receives access and ID tokens", function () {
  this.theCallbackPageReceivesAccessAndIdTokens = true;
});

When("the callback page receives an authorization code", function () {
  this.theCallbackPageReceivesAnAuthorizationCo = true;
});

When("the component crashes", function () {
  this.theComponentCrashes = true;
});

When("the confirmation dialog appears", function () {
  this.theConfirmationDialogAppears = true;
});

When("the login attempt fails", function () {
  this.theLoginAttemptFails = true;
});

When("the page finishes loading", function () {
  this.thePageFinishesLoading = true;
});

When("the redirect completes", function () {
  this.theRedirectCompletes = true;
});

When("the save to backend fails", function () {
  this.theSaveToBackendFails = true;
});

When("the status endpoint returns an error", function () {
  this.theStatusEndpointReturnsAnError = true;
});

When("the synthesis API returns an error", function () {
  this.theSynthesisApiReturnsAnError = true;
});

When("the synthesis API returns processing status", function () {
  this.theSynthesisApiReturnsProcessingStatus = true;
});

When("the synthesis does not complete within the timeout", function () {
  this.theSynthesisDoesNotCompleteWithinTheTime = true;
});

When("the synthesis is processing", function () {
  this.theSynthesisIsProcessing = true;
});

When("the synthesis page loads", function () {
  this.theSynthesisPageLoads = true;
});

When("the synthesis request times out", function () {
  this.theSynthesisRequestTimesOut = true;
});

// ===== THEN STEPS =====

Then("all playback stops immediately", function () {
  this.allPlaybackStopsImmediately = true;
});

Then("a medium modal uses wider sizing", function () {
  this.aMediumModalUsesWiderSizing = true;
});

Then("clicking a tag opens the variants panel", function () {
  this.clickingATagOpensTheVariantsPanel = true;
});

Then("clicking the backdrop closes the modal", function () {
  this.clickingTheBackdropClosesTheModal = true;
});

Then("each activity shows a description and timestamp", function () {
  this.eachActivityShowsADescriptionAndTimestam = true;
});

Then("each card shows a label, value, and icon", function () {
  this.eachCardShowsALabelValueAndIcon = true;
});

Then("each entry shows its text content", function () {
  this.eachEntryShowsItsTextContent = true;
});

Then("each marker shows its symbol and description", function () {
  this.eachMarkerShowsItsSymbolAndDescription = true;
});

Then("each menu item has role \"menuitem\"", function () {
  this.eachMenuItemHasRoleMenuitem = true;
});

Then("each row has a clear button when text is present", function () {
  this.eachRowHasAClearButtonWhenTextIsPresent = true;
});

Then("each row has a text input field for new words", function () {
  this.eachRowHasATextInputFieldForNewWords = true;
});

Then("each row has its own play and menu buttons", function () {
  this.eachRowHasItsOwnPlayAndMenuButtons = true;
});

Then("each row shows the creation date", function () {
  this.eachRowShowsTheCreationDate = true;
});

Then("each row shows the entry count", function () {
  this.eachRowShowsTheEntryCount = true;
});

Then("each summary shows entry count", function () {
  this.eachSummaryShowsEntryCount = true;
});

Then("each variant shows its phonetic description", function () {
  this.eachVariantShowsItsPhoneticDescription = true;
});

Then("focus is trapped inside the modal", function () {
  this.focusIsTrappedInsideTheModal = true;
});

Then("I can continue using the application", function () {
  this.iCanContinueUsingTheApplication = true;
});

Then("I can navigate to synthesis from the dashboard", function () {
  this.iCanNavigateToSynthesisFromTheDashboard = true;
});

Then("I can navigate to synthesis from the empty state", function () {
  this.iCanNavigateToSynthesisFromTheEmptyState = true;
});

Then("I can only play the audio", function () {
  this.iCanOnlyPlayTheAudio = true;
});

Then("I can retry the synthesis", function () {
  this.iCanRetryTheSynthesis = true;
});

Then("I can type a new value", function () {
  this.iCanTypeANewValue = true;
});

Then("I can use the application freely", function () {
  this.iCanUseTheApplicationFreely = true;
});

Then("I see a back button", function () {
  this.iSeeABackButton = true;
});

Then("I see a confirmation notification", function () {
  this.iSeeAConfirmationNotification = true;
});

Then("I see a link to the synthesis page", function () {
  this.iSeeALinkToTheSynthesisPage = true;
});

Then("I see a more options menu button", function () {
  this.iSeeAMoreOptionsMenuButton = true;
});

Then("I see an authentication error", function () {
  this.iSeeAnAuthenticationError = true;
});

Then("I see confirm and cancel buttons", function () {
  this.iSeeConfirmAndCancelButtons = true;
});

Then("I see navigation links", function () {
  this.iSeeNavigationLinks = true;
});

Then("I see phonetic, download, copy, and remove options", function () {
  this.iSeePhoneticDownloadCopyAndRemoveOptions = true;
});

Then("I see Share and Play All buttons", function () {
  this.iSeeShareAndPlayAllButtons = true;
});

Then("I see \"Tekst kopeeritud!\" notification", function () {
  this.iSeeTekstKopeeritudNotification = true;
});

Then("I see the address and phone numbers", function () {
  this.iSeeTheAddressAndPhoneNumbers = true;
});

Then("I see the Google login button", function () {
  this.iSeeTheGoogleLoginButton = true;
});

Then("I see the \"Lisa ülesandesse\" button", function () {
  this.iSeeTheLisaLesandesseButton = true;
});

Then("I see the list of task entries", function () {
  this.iSeeTheListOfTaskEntries = true;
});

Then("I see the synthesis page", function () {
  this.iSeeTheSynthesisPage = true;
});

Then("I see the TARA login button", function () {
  this.iSeeTheTaraLoginButton = true;
});

Then("I see the words displayed with stress markers", function () {
  this.iSeeTheWordsDisplayedWithStressMarkers = true;
});

Then("I see three role options", function () {
  this.iSeeThreeRoleOptions = true;
});

Then("I successfully logged in", function () {
  this.iSuccessfullyLoggedIn = true;
});

Then("it does not overlap other sentences", function () {
  this.itDoesNotOverlapOtherSentences = true;
});

Then("it has appropriate padding from screen edges", function () {
  this.itHasAppropriatePaddingFromScreenEdges = true;
});

Then("it highlights the next feature", function () {
  this.itHighlightsTheNextFeature = true;
});

Then("it highlights the text input area", function () {
  this.itHighlightsTheTextInputArea = true;
});

Then("it is accessible only via the share token", function () {
  this.itIsAccessibleOnlyViaTheShareToken = true;
});

Then("it stays within the viewport bounds", function () {
  this.itStaysWithinTheViewportBounds = true;
});

Then("\"Lisa ülesandesse\" is displayed correctly", function () {
  this.lisaLesandesseIsDisplayedCorrectly = true;
});

Then("my name is derived from the ID code", function () {
  this.myNameIsDerivedFromTheIdCode = true;
});

Then("my user profile is displayed", function () {
  this.myUserProfileIsDisplayed = true;
});

Then("no error blocks my workflow", function () {
  this.noErrorBlocksMyWorkflow = true;
});

Then("no polling is needed", function () {
  this.noPollingIsNeeded = true;
});

Then("only one has text", function () {
  this.onlyOneHasText = true;
});

Then("returns the audio when ready", function () {
  this.returnsTheAudioWhenReady = true;
});

Then("stress markers are shown visually", function () {
  this.stressMarkersAreShownVisually = true;
});

Then("the application renders normally", function () {
  this.theApplicationRendersNormally = true;
});

Then("the button shows loading state", function () {
  this.theButtonShowsLoadingState = true;
});

Then("the change is persisted to storage", function () {
  this.theChangeIsPersistedToStorage = true;
});

Then("the change is persisted to the task", function () {
  this.theChangeIsPersistedToTheTask = true;
});

Then("the cursor moves after the inserted symbol", function () {
  this.theCursorMovesAfterTheInsertedSymbol = true;
});

Then("the edit mode closes", function () {
  this.theEditModeCloses = true;
});

Then("the empty row is skipped", function () {
  this.theEmptyRowIsSkipped = true;
});

Then("the entry remains unchanged", function () {
  this.theEntryRemainsUnchanged = true;
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

Then("the new audio starts", function () {
  this.theNewAudioStarts = true;
});

Then("the new order is persisted", function () {
  this.theNewOrderIsPersisted = true;
});

Then("the panel closes", function () {
  this.thePanelCloses = true;
});

Then("the phonetic text is pre-filled", function () {
  this.thePhoneticTextIsPrefilled = true;
});

Then("the play all button shows active state", function () {
  this.thePlayAllButtonShowsActiveState = true;
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

Then("the restored sentence is not in loading state", function () {
  this.theRestoredSentenceIsNotInLoadingState = true;
});

Then("the second row is empty", function () {
  this.theSecondRowIsEmpty = true;
});

Then("the spinner disappears when content loads", function () {
  this.theSpinnerDisappearsWhenContentLoads = true;
});

Then("the spinner is replaced by pause icon when playing", function () {
  this.theSpinnerIsReplacedByPauseIconWhenPlayi = true;
});

Then("the task has a creation timestamp", function () {
  this.theTaskHasACreationTimestamp = true;
});

Then("the task is saved with updated content", function () {
  this.theTaskIsSavedWithUpdatedContent = true;
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

Then("the URL contains the share token", function () {
  this.theUrlContainsTheShareToken = true;
});

Then("the variants API returns an error", function () {
  this.theVariantsApiReturnsAnError = true;
});

Then("validation messages are in Estonian", function () {
  this.validationMessagesAreInEstonian = true;
});

Then("variants are fetched from the API", function () {
  this.variantsAreFetchedFromTheApi = true;
});

Then("variants for that word are loaded", function () {
  this.variantsForThatWordAreLoaded = true;
});

Then("a backdrop overlay is displayed", function () {
  this.aBackdropOverlayIsDisplayed = true;
});

Then("access, ID, and refresh tokens are stored locally", function () {
  this.accessIdAndRefreshTokensAreStoredLocally = true;
});

Then("a delete confirmation dialog appears", function () {
  this.aDeleteConfirmationDialogAppears = true;
});

Then("all entries are played sequentially", function () {
  this.allEntriesArePlayedSequentially = true;
});

Then("all sentences are added to that task", function () {
  this.allSentencesAreAddedToThatTask = true;
});

Then("all stored tokens are removed", function () {
  this.allStoredTokensAreRemoved = true;
});

Then("a new API request is made", function () {
  this.aNewApiRequestIsMade = true;
});

Then("a new empty sentence row appears below", function () {
  this.aNewEmptySentenceRowAppearsBelow = true;
});

Then("a new synthesis request is made", function () {
  this.aNewSynthesisRequestIsMade = true;
});

Then("a new task is created with all sentences", function () {
  this.aNewTaskIsCreatedWithAllSentences = true;
});

Then("a new task is created with the sentence", function () {
  this.aNewTaskIsCreatedWithTheSentence = true;
});

Then("a share token is generated and assigned", function () {
  this.aShareTokenIsGeneratedAndAssigned = true;
});

Then("audio still works with standard initialization", function () {
  this.audioStillWorksWithStandardInitializatio = true;
});

Then("a unique 16-character hex token is generated", function () {
  this.aUnique16characterHexTokenIsGenerated = true;
});

Then("a WAV file download starts", function () {
  this.aWavFileDownloadStarts = true;
});

Then("demo sentences are pre-filled for practice", function () {
  this.demoSentencesArePrefilledForPractice = true;
});

Then("demo sentences are pre-filled in the input rows", function () {
  this.demoSentencesArePrefilledInTheInputRows = true;
});

Then("each entry shows a drag handle indicator", function () {
  this.eachEntryShowsADragHandleIndicator = true;
});

Then("each entry shows text without editing controls", function () {
  this.eachEntryShowsTextWithoutEditingControls = true;
});

Then("each entry shows word tags", function () {
  this.eachEntryShowsWordTags = true;
});

Then("each row displays its position number", function () {
  this.eachRowDisplaysItsPositionNumber = true;
});

Then("each sentence row shows editable word tags", function () {
  this.eachSentenceRowShowsEditableWordTags = true;
});

Then("each task row shows the task name", function () {
  this.eachTaskRowShowsTheTaskName = true;
});

Then("each task shows its creation date in Estonian format", function () {
  this.eachTaskShowsItsCreationDateInEstonianFo = true;
});

Then("each word is displayed as a clickable tag", function () {
  this.eachWordIsDisplayedAsAClickableTag = true;
});

Then("entries are played one after another", function () {
  this.entriesArePlayedOneAfterAnother = true;
});

Then("focus moves to the next interactive element", function () {
  this.focusMovesToTheNextInteractiveElement = true;
});

Then("form fields show Estonian placeholders", function () {
  this.formFieldsShowEstonianPlaceholders = true;
});

Then("I am not redirected to role selection", function () {
  this.iAmNotRedirectedToRoleSelection = true;
});

Then("I am prompted to log in", function () {
  this.iAmPromptedToLogIn = true;
});

Then("I am redirected to the role selection page", function () {
  this.iAmRedirectedToTheRoleSelectionPage = true;
});

Then("I am redirected to the tasks page", function () {
  this.iAmRedirectedToTheTasksPage = true;
});

Then("I am still authenticated", function () {
  this.iAmStillAuthenticated = true;
});

Then("I hear the audio for that variant", function () {
  this.iHearTheAudioForThatVariant = true;
});

Then("I hear the audio for the edited phonetic text", function () {
  this.iHearTheAudioForTheEditedPhoneticText = true;
});

Then("I hear the synthesized audio for my custom text", function () {
  this.iHearTheSynthesizedAudioForMyCustomText = true;
});

Then("I navigate to the task detail view", function () {
  this.iNavigateToTheTaskDetailView = true;
});

Then("I remain on the synthesis page", function () {
  this.iRemainOnTheSynthesisPage = true;
});

Then("I return to the synthesis page", function () {
  this.iReturnToTheSynthesisPage = true;
});

Then("I see 3 input rows", function () {
  this.iSee3InputRows = true;
});

Then("I see a confirmation dialog with a warning message", function () {
  this.iSeeAConfirmationDialogWithAWarningMessa = true;
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

Then("I see a list of available phonetic markers", function () {
  this.iSeeAListOfAvailablePhoneticMarkers = true;
});

Then("I see a list of recent activities", function () {
  this.iSeeAListOfRecentActivities = true;
});

Then("I see a list of unique pronunciation variants", function () {
  this.iSeeAListOfUniquePronunciationVariants = true;
});

Then("I see all entries in the task", function () {
  this.iSeeAllEntriesInTheTask = true;
});

Then("I see all my tasks as summaries", function () {
  this.iSeeAllMyTasksAsSummaries = true;
});

Then("I see a loading indicator until tasks are fetched", function () {
  this.iSeeALoadingIndicatorUntilTasksAreFetche = true;
});

Then("I see a loading indicator while tasks are being fetched", function () {
  this.iSeeALoadingIndicatorWhileTasksAreBeingF = true;
});

Then("I see a loading spinner", function () {
  this.iSeeALoadingSpinner = true;
});

Then("I see a \"Logi sisse\" button in the header", function () {
  this.iSeeALogiSisseButtonInTheHeader = true;
});

Then("I see a message suggesting to add entries", function () {
  this.iSeeAMessageSuggestingToAddEntries = true;
});

Then("I see a message that the task has no entries", function () {
  this.iSeeAMessageThatTheTaskHasNoEntries = true;
});

Then("I see a modal with commit hash and branch info", function () {
  this.iSeeAModalWithCommitHashAndBranchInfo = true;
});

Then("I see an add sentence button below the sentence list", function () {
  this.iSeeAnAddSentenceButtonBelowTheSentenceL = true;
});

Then("I see an error message in the modal", function () {
  this.iSeeAnErrorMessageInTheModal = true;
});

Then("I see an error message in the variants panel", function () {
  this.iSeeAnErrorMessageInTheVariantsPanel = true;
});

Then("I see an error message \"Midagi läks valesti\"", function () {
  this.iSeeAnErrorMessageMidagiLksValesti = true;
});

Then("I see a \"not found\" error message", function () {
  this.iSeeANotFoundErrorMessage = true;
});

Then("I see an X close button in the header", function () {
  this.iSeeAnXCloseButtonInTheHeader = true;
});

Then("I see a search input field for tasks", function () {
  this.iSeeASearchInputFieldForTasks = true;
});

Then("I see a timeout error notification", function () {
  this.iSeeATimeoutErrorNotification = true;
});

Then("I see each marker with name, rule, and examples", function () {
  this.iSeeEachMarkerWithNameRuleAndExamples = true;
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

Then("I see marker buttons for kolmas välde, rõhk, peenendus, liitsõnapiir", function () {
  this.iSeeMarkerButtonsForKolmasVldeRhkPeenend = true;
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

Then("I see no matching tasks", function () {
  this.iSeeNoMatchingTasks = true;
});

Then("I see only tasks matching \"Harjutus\"", function () {
  this.iSeeOnlyTasksMatchingHarjutus = true;
});

Then("I see options for \"Muuda\", \"Jaga\", and \"Kustuta\"", function () {
  this.iSeeOptionsForMuudaJagaAndKustuta = true;
});

Then("I see options for the entry", function () {
  this.iSeeOptionsForTheEntry = true;
});

Then("I see pass or fail status for each scenario", function () {
  this.iSeePassOrFailStatusForEachScenario = true;
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

Then("I see task search, create task, phonetic, download, copy, and remove", function () {
  this.iSeeTaskSearchCreateTaskPhoneticDownload = true;
});

Then("I see the application header", function () {
  this.iSeeTheApplicationHeader = true;
});

Then("I see the custom variant input form", function () {
  this.iSeeTheCustomVariantInputForm = true;
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

Then("I see the original text without stress markers", function () {
  this.iSeeTheOriginalTextWithoutStressMarkers = true;
});

Then("I see the page header with \"Mängi kõik\" button", function () {
  this.iSeeThePageHeaderWithMngiKikButton = true;
});

Then("I see the phonetic editing panel", function () {
  this.iSeeThePhoneticEditingPanel = true;
});

Then("I see the share task modal", function () {
  this.iSeeTheShareTaskModal = true;
});

Then("I see the share URL in a read-only input field", function () {
  this.iSeeTheShareUrlInAReadonlyInputField = true;
});

Then("I see the specs page with feature groups", function () {
  this.iSeeTheSpecsPageWithFeatureGroups = true;
});

Then("I see the tag context menu", function () {
  this.iSeeTheTagContextMenu = true;
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

Then("I see the text in the input field", function () {
  this.iSeeTheTextInTheInputField = true;
});

Then("I see \"Ülesande nimi on kohustuslik\" error", function () {
  this.iSeeLesandeNimiOnKohustuslikError = true;
});

Then("I see \"Ülesannet ei leitud\" error message", function () {
  this.iSeeLesannetEiLeitudErrorMessage = true;
});

Then("my ID code is displayed in formatted groups", function () {
  this.myIdCodeIsDisplayedInFormattedGroups = true;
});

Then("my identity is verified", function () {
  this.myIdentityIsVerified = true;
});

Then("my sentences are restored from local storage", function () {
  this.mySentencesAreRestoredFromLocalStorage = true;
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

Then("polling stops", function () {
  this.pollingStops = true;
});

Then("recent activity timestamps use Estonian locale", function () {
  this.recentActivityTimestampsUseEstonianLocal = true;
});

Then("sequential playback starts from the beginning", function () {
  this.sequentialPlaybackStartsFromTheBeginning = true;
});

Then("sequential playback stops", function () {
  this.sequentialPlaybackStops = true;
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

Then("the add entry modal opens", function () {
  this.theAddEntryModalOpens = true;
});

Then("the appropriate voice model is used for long text", function () {
  this.theAppropriateVoiceModelIsUsedForLongTex = true;
});

Then("the appropriate voice model is used for short text", function () {
  this.theAppropriateVoiceModelIsUsedForShortTe = true;
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

Then("the Authorization header contains the Bearer token", function () {
  this.theAuthorizationHeaderContainsTheBearerT = true;
});

Then("the boundary is shown as a plus symbol in the UI", function () {
  this.theBoundaryIsShownAsAPlusSymbolInTheUi = true;
});

Then("the build date is formatted as Estonian date and time", function () {
  this.theBuildDateIsFormattedAsEstonianDateAnd = true;
});

Then("the build info modal closes", function () {
  this.theBuildInfoModalCloses = true;
});

Then("the button shows \"Lisaan...\" loading text", function () {
  this.theButtonShowsLisaanLoadingText = true;
});

Then("the buttons show Estonian text like \"Mängi kõik\"", function () {
  this.theButtonsShowEstonianTextLikeMngiKik = true;
});

Then("the cached audio URL is returned immediately", function () {
  this.theCachedAudioUrlIsReturnedImmediately = true;
});

Then("the changes are applied to the sentence", function () {
  this.theChangesAreAppliedToTheSentence = true;
});

Then("the code is exchanged for tokens", function () {
  this.theCodeIsExchangedForTokens = true;
});

Then("the custom fallback UI is displayed", function () {
  this.theCustomFallbackUiIsDisplayed = true;
});

Then("the custom variant is applied to the sentence", function () {
  this.theCustomVariantIsAppliedToTheSentence = true;
});

Then("the description is truncated again", function () {
  this.theDescriptionIsTruncatedAgain = true;
});

Then("the dialog is styled with danger indicators", function () {
  this.theDialogIsStyledWithDangerIndicators = true;
});

Then("the download option is disabled", function () {
  this.theDownloadOptionIsDisabled = true;
});

Then("the entries are reordered", function () {
  this.theEntriesAreReordered = true;
});

Then("the entries are saved to my session", function () {
  this.theEntriesAreSavedToMySession = true;
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

Then("the entry text reflects the chosen variant", function () {
  this.theEntryTextReflectsTheChosenVariant = true;
});

Then("the error is cleared", function () {
  this.theErrorIsCleared = true;
});

Then("the error is handled gracefully", function () {
  this.theErrorIsHandledGracefully = true;
});

Then("the error message is displayed in Estonian", function () {
  this.theErrorMessageIsDisplayedInEstonian = true;
});

Then("the full description is revealed", function () {
  this.theFullDescriptionIsRevealed = true;
});

Then("the Google authentication flow starts", function () {
  this.theGoogleAuthenticationFlowStarts = true;
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

Then("the ID token is sent as Bearer authorization", function () {
  this.theIdTokenIsSentAsBearerAuthorization = true;
});

Then("the input field is emptied", function () {
  this.theInputFieldIsEmptied = true;
});

Then("the \"Lisa ülesandesse\" button is disabled", function () {
  this.theLisaLesandesseButtonIsDisabled = true;
});

Then("the local storage entry is cleared", function () {
  this.theLocalStorageEntryIsCleared = true;
});

Then("the login modal closes", function () {
  this.theLoginModalCloses = true;
});

Then("the login modal opens", function () {
  this.theLoginModalOpens = true;
});

Then("the marker is inserted at the cursor position", function () {
  this.theMarkerIsInsertedAtTheCursorPosition = true;
});

Then("the marker is shown as a backtick symbol in the UI", function () {
  this.theMarkerIsShownAsABacktickSymbolInTheUi = true;
});

Then("the markers are transformed to Vabamorf format", function () {
  this.theMarkersAreTransformedToVabamorfFormat = true;
});

Then("the marker symbol is inserted at the cursor", function () {
  this.theMarkerSymbolIsInsertedAtTheCursor = true;
});

Then("the menu has role \"menu\"", function () {
  this.theMenuHasRoleMenu = true;
});

Then("the menu is positioned near the trigger button", function () {
  this.theMenuIsPositionedNearTheTriggerButton = true;
});

Then("the modal has role \"dialog\"", function () {
  this.theModalHasRoleDialog = true;
});

Then("the modal is centered on screen", function () {
  this.theModalIsCenteredOnScreen = true;
});

Then("the modal uses compact sizing", function () {
  this.theModalUsesCompactSizing = true;
});

Then("the modified text is used for synthesis", function () {
  this.theModifiedTextIsUsedForSynthesis = true;
});

Then("the navigation shows \"Tekst kõneks\" and \"Ülesanded\"", function () {
  this.theNavigationShowsTekstKneksAndLesanded = true;
});

Then("the new sentence input is focused", function () {
  this.theNewSentenceInputIsFocused = true;
});

Then("the next tooltip appears", function () {
  this.theNextTooltipAppears = true;
});

Then("the page background cannot be scrolled", function () {
  this.thePageBackgroundCannotBeScrolled = true;
});

Then("the panel appears as a side panel", function () {
  this.thePanelAppearsAsASidePanel = true;
});

Then("the pending redirect state is cleared", function () {
  this.thePendingRedirectStateIsCleared = true;
});

Then("the phonetic panel opens for that entry", function () {
  this.thePhoneticPanelOpensForThatEntry = true;
});

Then("the phonetic panel opens for that sentence", function () {
  this.thePhoneticPanelOpensForThatSentence = true;
});

Then("the play button shows a loading spinner", function () {
  this.thePlayButtonShowsALoadingSpinner = true;
});

Then("the previous audio stops", function () {
  this.thePreviousAudioStops = true;
});

Then("the request is rejected with authorization error", function () {
  this.theRequestIsRejectedWithAuthorizationErr = true;
});

Then("the restored sentence is not in playing state", function () {
  this.theRestoredSentenceIsNotInPlayingState = true;
});

Then("the same share token is used", function () {
  this.theSameShareTokenIsUsed = true;
});

Then("the sentence state is saved to local storage", function () {
  this.theSentenceStateIsSavedToLocalStorage = true;
});

Then("the sentence text is cleared", function () {
  this.theSentenceTextIsCleared = true;
});

Then("the sentence text is copied to clipboard", function () {
  this.theSentenceTextIsCopiedToClipboard = true;
});

Then("the sequential playback stops", function () {
  this.theSequentialPlaybackStops = true;
});

Then("the share modal disappears", function () {
  this.theShareModalDisappears = true;
});

Then("the share modal opens for that task", function () {
  this.theShareModalOpensForThatTask = true;
});

Then("the share task modal opens", function () {
  this.theShareTaskModalOpens = true;
});

Then("the share URL is copied to clipboard", function () {
  this.theShareUrlIsCopiedToClipboard = true;
});

Then("the stressed syllables are visually highlighted", function () {
  this.theStressedSyllablesAreVisuallyHighlight = true;
});

Then("the system polls the status endpoint", function () {
  this.theSystemPollsTheStatusEndpoint = true;
});

Then("the tag becomes editable", function () {
  this.theTagBecomesEditable = true;
});

Then("the tag is removed from the sentence", function () {
  this.theTagIsRemovedFromTheSentence = true;
});

Then("the tag value is updated", function () {
  this.theTagValueIsUpdated = true;
});

Then("the TARA authentication flow starts", function () {
  this.theTaraAuthenticationFlowStarts = true;
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

Then("the task is saved as unlisted", function () {
  this.theTaskIsSavedAsUnlisted = true;
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

Then("the text is in my clipboard", function () {
  this.theTextIsInMyClipboard = true;
});

Then("the text is sent to the analysis API", function () {
  this.theTextIsSentToTheAnalysisApi = true;
});

Then("the text is submitted for synthesis", function () {
  this.theTextIsSubmittedForSynthesis = true;
});

Then("the validation fails", function () {
  this.theValidationFails = true;
});

Then("the variant replaces the word in the sentence", function () {
  this.theVariantReplacesTheWordInTheSentence = true;
});

Then("the variants panel opens for that word", function () {
  this.theVariantsPanelOpensForThatWord = true;
});

Then("the variants panel shows a loading indicator", function () {
  this.theVariantsPanelShowsALoadingIndicator = true;
});

Then("the voice model matches the phonetic input type", function () {
  this.theVoiceModelMatchesThePhoneticInputType = true;
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

Then("the wizard includes a step about creating tasks", function () {
  this.theWizardIncludesAStepAboutCreatingTasks = true;
});

Then("the word in the entry is updated", function () {
  this.theWordInTheEntryIsUpdated = true;
});

Then("they can view the task without authentication", function () {
  this.theyCanViewTheTaskWithoutAuthentication = true;
});
