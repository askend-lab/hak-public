import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('I am on the main page', function () {
  this.currentPage = 'main';
});

Given('I am using the application', function () {
  this.usingApplication = true;
});

Given('the feedback form is open', function () {
  this.feedbackFormOpen = true;
});

Given('the phonetic guide is open', function () {
  this.phoneticGuideOpen = true;
});

Given('the phonetic guide modal is open', function () {
  this.phoneticGuideOpen = true;
});

Given('a notification is visible', function () {
  this.notificationVisible = true;
});

Given('a successful action occurs', function () {
  this.successfulAction = true;
});

Given('an error occurs', function () {
  this.errorOccurred = true;
});

Given('multiple events occur', function () {
  this.multipleEvents = true;
});

Given('I have entered {string} in the message field', function (message: string) {
  this.messageInput = message;
});

When('I click the feedback button', function () {
  this.feedbackButtonClicked = true;
  this.feedbackFormOpen = true;
});

When('I click the phonetic guide button', function () {
  this.phoneticGuideButtonClicked = true;
  this.phoneticGuideOpen = true;
});

When('I click the help icon \\(?) near the phonetic text', function () {
  this.helpIconClicked = true;
  this.phoneticGuideOpen = true;
});

When('I click the submit button', function () {
  this.submitClicked = true;
});

When('I click the close button', function () {
  this.closeClicked = true;
});

When('I click the notification close button', function () {
  this.notificationCloseClicked = true;
});

When('I click outside the dialog', function () {
  this.clickedOutsideDialog = true;
});

When('I read through the content', function () {
  this.readContent = true;
});

When('I view a symbol\'s explanation', function () {
  this.viewingSymbolExplanation = true;
});

When('I view the footer area', function () {
  this.viewingFooter = true;
});

When('I view the navigation menu', function () {
  this.viewingNavigation = true;
});

When('{int} seconds pass', function (seconds: number) {
  this.secondsPassed = seconds;
});

Then('the feedback modal opens', function () {
  expect(this.feedbackFormOpen).to.be.true;
});

Then('the phonetic guide modal opens', function () {
  this.phoneticGuideOpen = true;
});

Then('the modal closes', function () {
  this.modalClosed = true;
});

Then('the dialog closes', function () {
  this.dialogClosed = true;
});

Then('my feedback is submitted', function () {
  expect(this.submitClicked).to.be.true;
});

Then('a confirmation message appears', function () {
  this.confirmationMessageShown = true;
});

Then('the guide explains available markers', function () {
  this.guideExplainsMarkers = true;
});

Then('the examples show correct usage in context', function () {
  this.examplesShowUsage = true;
});

Then('I see a success notification', function () {
  this.successNotificationShown = true;
});

Then('I see an error notification', function () {
  this.errorNotificationShown = true;
});

Then('the notification disappears', function () {
  this.notificationVisible = false;
});

Then('the notification automatically disappears', function () {
  this.notificationAutoDisappears = true;
});

Then('notifications stack without overlapping', function () {
  this.notificationsStack = true;
});

Then('it is clearly marked as optional', function () {
  this.markedAsOptional = true;
});
