// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Given, When } from "@cucumber/cucumber";

// ===== UI STEPS =====

Given("I am a new user visiting for the first time", function () {
  this.iAmANewUserVisitingForTheFirstTime = true;
});

Given("I am loading the application", function () {
  this.iAmLoadingTheApplication = true;
});

Given("I am on a desktop screen", function () {
  this.iAmOnADesktopScreen = true;
});

Given("I am on the dashboard", function () {
  this.iAmOnTheDashboard = true;
});

Given("I am on the last wizard step", function () {
  this.iAmOnTheLastWizardStep = true;
});

Given("I attempt to log in with an invalid ID code", function () {
  this.iAttemptToLogInWithAnInvalidIdCode = true;
});

Given("I enter new text that requires processing", function () {
  this.iEnterNewTextThatRequiresProcessing = true;
});

Given("I have completed the onboarding wizard", function () {
  this.iHaveCompletedTheOnboardingWizard = true;
});

Given("I have selected a role", function () {
  this.iHaveSelectedARole = true;
});

Given("I have selected the \"Õppija\" role", function () {
  this.iHaveSelectedThePpijaRole = true;
});

Given("I log in with a valid Estonian ID code", function () {
  this.iLogInWithAValidEstonianIdCode = true;
});

Given("I selected the \"Õpetaja\" role", function () {
  this.iSelectedThePetajaRole = true;
});

Given("the analysis returned stressed text", function () {
  this.theAnalysisReturnedStressedText = true;
});

Given("the text contains a compound word boundary", function () {
  this.theTextContainsACompoundWordBoundary = true;
});

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

When("I enter a description", function () {
  this.iEnterADescription = true;
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

When("I click on a word tag", function () {
  this.iClickOnAWordTag = true;
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

When("I click the confirm button", function () {
  this.iClickTheConfirmButton = true;
});

When("I click the delete button", function () {
  this.iClickTheDeleteButton = true;
});

When("I click the delete option", function () {
  this.iClickTheDeleteOption = true;
});

When("I click the edit option", function () {
  this.iClickTheEditOption = true;
});

When("I click the help button in the header", function () {
  this.iClickTheHelpButtonInTheHeader = true;
});

When("I click the more options button", function () {
  this.iClickTheMoreOptionsButton = true;
});

When("I click \"Use\" on a variant", function () {
  this.iClickUseOnAVariant = true;
});

When("I click \"Uuri häälduskuju\" on an entry", function () {
  this.iClickUuriHlduskujuOnAnEntry = true;
});

When("I complete the final step", function () {
  this.iCompleteTheFinalStep = true;
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

When("I follow the tooltip instructions", function () {
  this.iFollowTheTooltipInstructions = true;
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
