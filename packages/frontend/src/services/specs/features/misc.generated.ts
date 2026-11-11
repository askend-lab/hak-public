// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab
//
// AUTO-GENERATED - DO NOT EDIT
// Run: pnpm --filter @hak/frontend sync-features
// Group: misc

export const FEATURES_MISC: Record<string, string> = {
  'US-024-view-phonetic-guide': `@misc @US-024
Feature: View phonetic symbols reference guide (US-024)
  As a language learner
  I want to view an explanation of phonetic markers
  So that I can understand the stress and pronunciation symbols

  Scenario: Open phonetic guide via help icon
    Given I am viewing the synthesis page
    When I click the help icon (?) near the phonetic text
    Then the phonetic guide modal opens
    And I see explanations for phonetic symbols

  Scenario: View symbol explanations
    Given the phonetic guide is open
    When I read through the content
    Then I see explanation for \` (third degree length)
    And I see explanation for ´ (stress marker)
    And I see explanation for ' (palatalization)
    And I see explanation for + (compound word boundary)

  Scenario: Examples provided for each symbol
    Given the phonetic guide is open
    When I view a symbol's explanation
    Then I see example words using that symbol
    And the examples show correct usage in context

  Scenario: Close phonetic guide
    Given the phonetic guide modal is open
    When I click the close button
    Then the modal closes
    And I return to the main synthesis view
`,

  'US-030-notifications': `@misc @US-030
Feature: Display and dismiss notifications (US-030)
  As a user of the application
  I want to see notifications for system messages
  So that I am informed about successes, errors, and important information

  Scenario: Show success notification
    Given a successful action occurs
    Then I see a success notification
    And it is colored green

  Scenario: Show error notification
    Given an error occurs
    Then I see an error notification
    And it is colored red

  Scenario: Dismiss notification manually
    Given a notification is visible
    When I click the notification close button
    Then the notification disappears

  Scenario: Auto-dismiss notification
    Given a notification is visible
    When 5 seconds pass
    Then the notification automatically disappears

  Scenario: Multiple notifications stack
    Given multiple events occur
    Then notifications stack without overlapping
`,

  'US-036-role-selection 2': `@ready @misc @onboarding @US-036
Feature: Select user role on first visit (US-036)
  As a first-time user
  I want to select my role (learner, teacher, or researcher)
  So that the application can tailor the experience to my needs

  Scenario: Redirect to role selection on first visit
    Given I am a new user visiting for the first time
    When I visit the application
    Then I am redirected to the role selection page
    And I see three role options

  Scenario: Select learner role
    Given I am on the role selection page
    When I select the "Õppija" role
    Then I am redirected to the synthesis page
    And the onboarding wizard starts

  Scenario: Select teacher role
    Given I am on the role selection page
    When I select the "Õpetaja" role
    Then I am redirected to the synthesis page
    And the onboarding wizard starts

  Scenario: Select researcher role
    Given I am on the role selection page
    When I select the "Uurija" role
    Then I am redirected to the synthesis page
    And the onboarding wizard starts

  Scenario: Role selection persists across sessions
    Given I have selected the "Õppija" role
    When I refresh the page
    Then I am not redirected to role selection
    And I see the synthesis page

  Scenario: Skip role selection with shared task link
    Given I have a shared task link
    When I open the shared link
    Then I am not redirected to role selection
`,

  'US-036-role-selection': `@ready @misc @onboarding @US-036
Feature: Select user role on first visit (US-036)
  As a first-time user
  I want to select my role (learner, teacher, or researcher)
  So that the application can tailor the experience to my needs

  Scenario: Redirect to role selection on first visit
    Given I am a new user visiting for the first time
    When I visit the application
    Then I am redirected to the role selection page
    And I see three role options

  Scenario: Select learner role
    Given I am on the role selection page
    When I select the "Õppija" role
    Then I am redirected to the synthesis page
    And the onboarding wizard starts

  Scenario: Select teacher role
    Given I am on the role selection page
    When I select the "Õpetaja" role
    Then I am redirected to the synthesis page
    And the onboarding wizard starts

  Scenario: Select researcher role
    Given I am on the role selection page
    When I select the "Uurija" role
    Then I am redirected to the synthesis page
    And the onboarding wizard starts

  Scenario: Role selection persists across sessions
    Given I have selected the "Õppija" role
    When I refresh the page
    Then I am not redirected to role selection
    And I see the synthesis page

  Scenario: Skip role selection with shared task link
    Given I have a shared task link
    When I open the shared link
    Then I am not redirected to role selection
`,

  'US-037-onboarding-wizard 2': `@ready @misc @onboarding @US-037
Feature: Onboarding wizard guides new users (US-037)
  As a new user who has selected a role
  I want to see guided tooltips highlighting key features
  So that I can quickly learn how to use the application

  Scenario: Wizard starts after role selection
    Given I have selected a role
    When the synthesis page loads
    Then I see the first wizard tooltip
    And it highlights the text input area

  Scenario: Navigate through wizard steps
    Given the onboarding wizard is active
    When I follow the tooltip instructions
    Then the next tooltip appears
    And it highlights the next feature

  Scenario: Wizard shows role-specific steps
    Given I selected the "Õpetaja" role
    When the onboarding wizard starts
    Then the wizard includes a step about creating tasks

  Scenario: Complete the wizard
    Given I am on the last wizard step
    When I complete the final step
    Then the wizard closes
    And I can use the application freely

  Scenario: Wizard does not repeat after completion
    Given I have completed the onboarding wizard
    When I refresh the page
    Then the wizard does not appear again

  Scenario: Demo sentences appear during wizard
    Given the onboarding wizard is active
    When I reach the input step
    Then demo sentences are pre-filled for practice
`,

  'US-037-onboarding-wizard': `@ready @misc @onboarding @US-037
Feature: Onboarding wizard guides new users (US-037)
  As a new user who has selected a role
  I want to see guided tooltips highlighting key features
  So that I can quickly learn how to use the application

  Scenario: Wizard starts after role selection
    Given I have selected a role
    When the synthesis page loads
    Then I see the first wizard tooltip
    And it highlights the text input area

  Scenario: Navigate through wizard steps
    Given the onboarding wizard is active
    When I follow the tooltip instructions
    Then the next tooltip appears
    And it highlights the next feature

  Scenario: Wizard shows role-specific steps
    Given I selected the "Õpetaja" role
    When the onboarding wizard starts
    Then the wizard includes a step about creating tasks

  Scenario: Complete the wizard
    Given I am on the last wizard step
    When I complete the final step
    Then the wizard closes
    And I can use the application freely

  Scenario: Wizard does not repeat after completion
    Given I have completed the onboarding wizard
    When I refresh the page
    Then the wizard does not appear again

  Scenario: Demo sentences appear during wizard
    Given the onboarding wizard is active
    When I reach the input step
    Then demo sentences are pre-filled for practice
`,

  'US-038-dashboard 2': `@ready @misc @dashboard @US-038
Feature: View activity dashboard (US-038)
  As an authenticated user
  I want to see a dashboard with my activity summary
  So that I can track my learning progress and quickly access features

  Background:
    Given I am authenticated

  Scenario: See activity metrics
    When I navigate to the dashboard
    Then I see activity metric cards
    And each card shows a label, value, and icon

  Scenario: See recent activity
    When I navigate to the dashboard
    Then I see a list of recent activities
    And each activity shows a description and timestamp

  Scenario: Access quick links
    When I navigate to the dashboard
    Then I see quick links to key features
    And I can navigate to synthesis from the dashboard

  Scenario: Dashboard requires authentication
    Given I am not authenticated
    When I try to access the dashboard
    Then I am prompted to log in
`,

  'US-038-dashboard': `@ready @misc @dashboard @US-038
Feature: View activity dashboard (US-038)
  As an authenticated user
  I want to see a dashboard with my activity summary
  So that I can track my learning progress and quickly access features

  Background:
    Given I am authenticated

  Scenario: See activity metrics
    When I navigate to the dashboard
    Then I see activity metric cards
    And each card shows a label, value, and icon

  Scenario: See recent activity
    When I navigate to the dashboard
    Then I see a list of recent activities
    And each activity shows a description and timestamp

  Scenario: Access quick links
    When I navigate to the dashboard
    Then I see quick links to key features
    And I can navigate to synthesis from the dashboard

  Scenario: Dashboard requires authentication
    Given I am not authenticated
    When I try to access the dashboard
    Then I am prompted to log in
`,

  'US-040-error-recovery 2': `@ready @misc @error-handling @US-040
Feature: Graceful error recovery (US-040)
  As a user of the application
  I want the application to handle errors gracefully
  So that I can recover from unexpected issues without losing my work

  Scenario: Show error boundary on component crash
    Given I am using the application
    When a component error occurs
    Then I see an error message "Midagi läks valesti"
    And I see a "Proovi uuesti" button

  Scenario: Recover from error via retry button
    Given I see an error boundary message
    When I click the "Proovi uuesti" button
    Then the error is cleared
    And the application renders normally

  Scenario: Show fallback UI when provided
    Given a component has a custom error fallback
    When the component crashes
    Then the custom fallback UI is displayed

  Scenario: API error shows notification
    Given I am on the synthesis page
    When an API request fails
    Then I see an error notification
    And I can continue using the application
`,

  'US-040-error-recovery': `@ready @misc @error-handling @US-040
Feature: Graceful error recovery (US-040)
  As a user of the application
  I want the application to handle errors gracefully
  So that I can recover from unexpected issues without losing my work

  Scenario: Show error boundary on component crash
    Given I am using the application
    When a component error occurs
    Then I see an error message "Midagi läks valesti"
    And I see a "Proovi uuesti" button

  Scenario: Recover from error via retry button
    Given I see an error boundary message
    When I click the "Proovi uuesti" button
    Then the error is cleared
    And the application renders normally

  Scenario: Show fallback UI when provided
    Given a component has a custom error fallback
    When the component crashes
    Then the custom fallback UI is displayed

  Scenario: API error shows notification
    Given I am on the synthesis page
    When an API request fails
    Then I see an error notification
    And I can continue using the application
`,

  'US-041-app-navigation 2': `@ready @misc @navigation @US-041
Feature: Navigate between application views (US-041)
  As a user of the application
  I want to navigate between synthesis, tasks, and other views
  So that I can access different features of the application

  Scenario: See navigation header
    Given I am on the synthesis page
    Then I see the application header
    And I see navigation links

  Scenario: Navigate to tasks view
    Given I am authenticated
    And I am on the synthesis page
    When I click the tasks navigation link
    Then I see the tasks view

  Scenario: Navigate back to synthesis
    Given I am authenticated
    And I am on the tasks page
    When I click the synthesis navigation link
    Then I see the synthesis page

  Scenario: Unauthenticated user sees login prompt for tasks
    Given I am not authenticated
    And I am on the synthesis page
    When I click the tasks navigation link
    Then I see a login prompt

  Scenario: Access help from header
    Given I am on the synthesis page
    When I click the help button in the header
    Then I am redirected to the role selection page
`,

  'US-041-app-navigation': `@ready @misc @navigation @US-041
Feature: Navigate between application views (US-041)
  As a user of the application
  I want to navigate between synthesis, tasks, and other views
  So that I can access different features of the application

  Scenario: See navigation header
    Given I am on the synthesis page
    Then I see the application header
    And I see navigation links

  Scenario: Navigate to tasks view
    Given I am authenticated
    And I am on the synthesis page
    When I click the tasks navigation link
    Then I see the tasks view

  Scenario: Navigate back to synthesis
    Given I am authenticated
    And I am on the tasks page
    When I click the synthesis navigation link
    Then I see the synthesis page

  Scenario: Unauthenticated user sees login prompt for tasks
    Given I am not authenticated
    And I am on the synthesis page
    When I click the tasks navigation link
    Then I see a login prompt

  Scenario: Access help from header
    Given I am on the synthesis page
    When I click the help button in the header
    Then I am redirected to the role selection page
`,

  'US-045-footer-info 2': `@ready @misc @footer @US-045
Feature: Footer with contact info and build details (US-045)
  As a user of the application
  I want to see footer information including contact details and build info
  So that I can find help and verify the application version

  Scenario: See footer contact information
    Given I am on any page
    Then I see the footer with EKI contact details
    And I see the address and phone numbers

  Scenario: See footer links
    Given I am on any page
    Then I see links to about, changelog, and terms

  Scenario: See social media links
    Given I am on any page
    Then I see social media links for Facebook, YouTube, and LinkedIn

  Scenario: See feedback section
    Given I am on any page
    Then I see a feedback email link in the footer

  Scenario: View build info
    Given I am on any page
    When I click the build info button in the footer
    Then I see a modal with commit hash and branch info

  Scenario: Close build info modal
    Given the build info modal is open
    When I click the close button
    Then the build info modal closes
`,

  'US-045-footer-info': `@ready @misc @footer @US-045
Feature: Footer with contact info and build details (US-045)
  As a user of the application
  I want to see footer information including contact details and build info
  So that I can find help and verify the application version

  Scenario: See footer contact information
    Given I am on any page
    Then I see the footer with EKI contact details
    And I see the address and phone numbers

  Scenario: See footer links
    Given I am on any page
    Then I see links to about, changelog, and terms

  Scenario: See social media links
    Given I am on any page
    Then I see social media links for Facebook, YouTube, and LinkedIn

  Scenario: See feedback section
    Given I am on any page
    Then I see a feedback email link in the footer

  Scenario: View build info
    Given I am on any page
    When I click the build info button in the footer
    Then I see a modal with commit hash and branch info

  Scenario: Close build info modal
    Given the build info modal is open
    When I click the close button
    Then the build info modal closes
`,

  'US-046-confirmation-dialogs 2': `@ready @misc @modal @US-046
Feature: Confirmation dialogs for destructive actions (US-046)
  As a user performing a destructive action
  I want to see a confirmation dialog before proceeding
  So that I can avoid accidental data loss

  Scenario: See confirmation dialog before deleting
    Given I am about to delete a task
    When I click the delete button
    Then I see a confirmation dialog with a warning message
    And I see confirm and cancel buttons

  Scenario: Confirm destructive action
    Given I see a confirmation dialog
    When I click the confirm button
    Then the action is executed
    And the dialog closes

  Scenario: Cancel destructive action
    Given I see a confirmation dialog
    When I click the cancel button
    Then the action is not executed
    And the dialog closes

  Scenario: Danger variant styling
    Given a destructive action requires confirmation
    When the confirmation dialog appears
    Then the dialog is styled with danger indicators
`,

  'US-046-confirmation-dialogs': `@ready @misc @modal @US-046
Feature: Confirmation dialogs for destructive actions (US-046)
  As a user performing a destructive action
  I want to see a confirmation dialog before proceeding
  So that I can avoid accidental data loss

  Scenario: See confirmation dialog before deleting
    Given I am about to delete a task
    When I click the delete button
    Then I see a confirmation dialog with a warning message
    And I see confirm and cancel buttons

  Scenario: Confirm destructive action
    Given I see a confirmation dialog
    When I click the confirm button
    Then the action is executed
    And the dialog closes

  Scenario: Cancel destructive action
    Given I see a confirmation dialog
    When I click the cancel button
    Then the action is not executed
    And the dialog closes

  Scenario: Danger variant styling
    Given a destructive action requires confirmation
    When the confirmation dialog appears
    Then the dialog is styled with danger indicators
`,

  'US-051-specs-page 2': `@ready @misc @specs @US-051
Feature: View feature specifications and test results (US-051)
  As a developer or stakeholder
  I want to view Gherkin specifications with test status
  So that I can track feature coverage and test results

  Scenario: Navigate to specs page
    Given I am on the synthesis page
    When I navigate to the specs page
    Then I see the specs page with feature groups

  Scenario: Expand feature group
    Given I am on the specs page
    When I click on a feature group
    Then the group expands showing individual features

  Scenario: View feature details
    Given I am on the specs page
    When I select a feature
    Then I see the feature scenarios and their descriptions

  Scenario: See test status for scenarios
    Given I am on the specs page
    When I select a feature with test results
    Then I see pass or fail status for each scenario

  Scenario: Navigate back from specs
    Given I am on the specs page
    When I click the back button
    Then I return to the synthesis page
`,

  'US-051-specs-page': `@ready @misc @specs @US-051
Feature: View feature specifications and test results (US-051)
  As a developer or stakeholder
  I want to view Gherkin specifications with test status
  So that I can track feature coverage and test results

  Scenario: Navigate to specs page
    Given I am on the synthesis page
    When I navigate to the specs page
    Then I see the specs page with feature groups

  Scenario: Expand feature group
    Given I am on the specs page
    When I click on a feature group
    Then the group expands showing individual features

  Scenario: View feature details
    Given I am on the specs page
    When I select a feature
    Then I see the feature scenarios and their descriptions

  Scenario: See test status for scenarios
    Given I am on the specs page
    When I select a feature with test results
    Then I see pass or fail status for each scenario

  Scenario: Navigate back from specs
    Given I am on the specs page
    When I click the back button
    Then I return to the synthesis page
`,

  'US-058-accessibility 2': `@ready @misc @a11y @US-058
Feature: Accessibility support for screen readers (US-058)
  As a user with assistive technology
  I want the application to have proper ARIA labels and roles
  So that I can navigate and use all features with a screen reader

  Scenario: Navigation has ARIA landmarks
    Given I am on the synthesis page
    Then the header has a navigation landmark
    And the main content has a main landmark

  Scenario: Buttons have accessible labels
    Given I am on the synthesis page
    Then the help button has an aria-label
    And the play buttons have descriptive labels

  Scenario: Modals have dialog role
    Given a modal is open
    Then the modal has role "dialog"
    And focus is trapped inside the modal

  Scenario: Menu has proper ARIA roles
    Given the sentence context menu is open
    Then the menu has role "menu"
    And each menu item has role "menuitem"

  Scenario: Close menu with Escape key
    Given the sentence context menu is open
    When I press the Escape key
    Then the menu closes
`,

  'US-058-accessibility': `@ready @misc @a11y @US-058
Feature: Accessibility support for screen readers (US-058)
  As a user with assistive technology
  I want the application to have proper ARIA labels and roles
  So that I can navigate and use all features with a screen reader

  Scenario: Navigation has ARIA landmarks
    Given I am on the synthesis page
    Then the header has a navigation landmark
    And the main content has a main landmark

  Scenario: Buttons have accessible labels
    Given I am on the synthesis page
    Then the help button has an aria-label
    And the play buttons have descriptive labels

  Scenario: Modals have dialog role
    Given a modal is open
    Then the modal has role "dialog"
    And focus is trapped inside the modal

  Scenario: Menu has proper ARIA roles
    Given the sentence context menu is open
    Then the menu has role "menu"
    And each menu item has role "menuitem"

  Scenario: Close menu with Escape key
    Given the sentence context menu is open
    When I press the Escape key
    Then the menu closes
`,

  'US-059-keyboard-navigation 2': `@ready @misc @keyboard @US-059
Feature: Keyboard navigation and shortcuts (US-059)
  As a power user
  I want to use keyboard shortcuts for common actions
  So that I can work more efficiently without using the mouse

  Background:
    Given I am on the synthesis page

  Scenario: Submit text with Enter key
    Given I am typing in the input field
    When I press Enter
    Then the text is submitted for synthesis

  Scenario: Navigate between sentence rows with Tab
    Given I have multiple sentence rows
    When I press Tab
    Then focus moves to the next interactive element

  Scenario: Close modal with Escape
    Given a modal is open
    When I press Escape
    Then the modal closes

  Scenario: Delete tag with Backspace
    Given I have existing tags and empty input
    When I press Backspace
    Then the last tag is removed
`,

  'US-059-keyboard-navigation': `@ready @misc @keyboard @US-059
Feature: Keyboard navigation and shortcuts (US-059)
  As a power user
  I want to use keyboard shortcuts for common actions
  So that I can work more efficiently without using the mouse

  Background:
    Given I am on the synthesis page

  Scenario: Submit text with Enter key
    Given I am typing in the input field
    When I press Enter
    Then the text is submitted for synthesis

  Scenario: Navigate between sentence rows with Tab
    Given I have multiple sentence rows
    When I press Tab
    Then focus moves to the next interactive element

  Scenario: Close modal with Escape
    Given a modal is open
    When I press Escape
    Then the modal closes

  Scenario: Delete tag with Backspace
    Given I have existing tags and empty input
    When I press Backspace
    Then the last tag is removed
`,

  'US-069-loading-states 2': `@ready @misc @ux @US-069
Feature: Loading states and spinners (US-069)
  As a user of the application
  I want to see loading indicators during async operations
  So that I know the application is working and not frozen

  Scenario: Show spinner during page load
    Given I am loading the application
    Then I see a loading spinner
    And the spinner disappears when content loads

  Scenario: Show loading state during synthesis
    Given I have entered text for synthesis
    When the synthesis is processing
    Then the play button shows a loading spinner

  Scenario: Show loading state for task list
    Given I am authenticated
    When I navigate to the tasks page
    Then I see a loading indicator until tasks are fetched

  Scenario: Show loading state in shared task page
    Given I open a shared task link
    Then I see "Laadimine..." while the task loads
`,

  'US-069-loading-states': `@ready @misc @ux @US-069
Feature: Loading states and spinners (US-069)
  As a user of the application
  I want to see loading indicators during async operations
  So that I know the application is working and not frozen

  Scenario: Show spinner during page load
    Given I am loading the application
    Then I see a loading spinner
    And the spinner disappears when content loads

  Scenario: Show loading state during synthesis
    Given I have entered text for synthesis
    When the synthesis is processing
    Then the play button shows a loading spinner

  Scenario: Show loading state for task list
    Given I am authenticated
    When I navigate to the tasks page
    Then I see a loading indicator until tasks are fetched

  Scenario: Show loading state in shared task page
    Given I open a shared task link
    Then I see "Laadimine..." while the task loads
`,

  'US-078-date-formatting 2': `@ready @misc @formatting @US-078
Feature: Estonian date and time formatting (US-078)
  As a user of the application
  I want dates and times to be displayed in Estonian format
  So that I can read temporal information naturally

  Scenario: Display task creation date in Estonian
    Given I am viewing the task list
    Then each task shows its creation date in Estonian format

  Scenario: Display activity timestamp in Estonian
    Given I am on the dashboard
    Then recent activity timestamps use Estonian locale

  Scenario: Display build date in Estonian format
    Given the build info modal is open
    Then the build date is formatted as Estonian date and time
`,

  'US-078-date-formatting': `@ready @misc @formatting @US-078
Feature: Estonian date and time formatting (US-078)
  As a user of the application
  I want dates and times to be displayed in Estonian format
  So that I can read temporal information naturally

  Scenario: Display task creation date in Estonian
    Given I am viewing the task list
    Then each task shows its creation date in Estonian format

  Scenario: Display activity timestamp in Estonian
    Given I am on the dashboard
    Then recent activity timestamps use Estonian locale

  Scenario: Display build date in Estonian format
    Given the build info modal is open
    Then the build date is formatted as Estonian date and time
`,

  'US-084-data-privacy 2': `@ready @misc @privacy @US-084
Feature: Data privacy and API authorization (US-084)
  As a user of the application
  I want my data to be protected by proper authorization
  So that only I can access my private tasks and content

  Scenario: Private tasks require authentication
    Given I am not authenticated
    When I try to load user tasks via API
    Then the request is rejected with authorization error

  Scenario: Shared tasks are accessible without login
    Given a task is shared as unlisted
    When an unauthenticated user accesses the share link
    Then the task content is returned

  Scenario: Private data uses Bearer token
    Given I am authenticated
    When I make an API request to a private endpoint
    Then the Authorization header contains the Bearer token

  Scenario: Privacy notice is shown on login
    Given I see the login modal
    Then I see privacy terms notice at the bottom
`,

  'US-084-data-privacy': `@ready @misc @privacy @US-084
Feature: Data privacy and API authorization (US-084)
  As a user of the application
  I want my data to be protected by proper authorization
  So that only I can access my private tasks and content

  Scenario: Private tasks require authentication
    Given I am not authenticated
    When I try to load user tasks via API
    Then the request is rejected with authorization error

  Scenario: Shared tasks are accessible without login
    Given a task is shared as unlisted
    When an unauthenticated user accesses the share link
    Then the task content is returned

  Scenario: Private data uses Bearer token
    Given I am authenticated
    When I make an API request to a private endpoint
    Then the Authorization header contains the Bearer token

  Scenario: Privacy notice is shown on login
    Given I see the login modal
    Then I see privacy terms notice at the bottom
`,

  'US-088-estonian-localization 2': `@ready @misc @i18n @US-088
Feature: Estonian language localization (US-088)
  As an Estonian-speaking user
  I want the entire UI to be in Estonian
  So that I can use the application in my native language

  Scenario: Navigation labels are in Estonian
    Given I am on the synthesis page
    Then the navigation shows "Tekst kõneks" and "Ülesanded"

  Scenario: Button labels are in Estonian
    Given I am on the synthesis page
    Then the buttons show Estonian text like "Mängi kõik"
    And "Lisa ülesandesse" is displayed correctly

  Scenario: Error messages are in Estonian
    Given an error occurs in the application
    Then the error message is displayed in Estonian

  Scenario: Form labels and placeholders in Estonian
    Given I am creating a new task
    Then form fields show Estonian placeholders
    And validation messages are in Estonian
`,

  'US-088-estonian-localization': `@ready @misc @i18n @US-088
Feature: Estonian language localization (US-088)
  As an Estonian-speaking user
  I want the entire UI to be in Estonian
  So that I can use the application in my native language

  Scenario: Navigation labels are in Estonian
    Given I am on the synthesis page
    Then the navigation shows "Tekst kõneks" and "Ülesanded"

  Scenario: Button labels are in Estonian
    Given I am on the synthesis page
    Then the buttons show Estonian text like "Mängi kõik"
    And "Lisa ülesandesse" is displayed correctly

  Scenario: Error messages are in Estonian
    Given an error occurs in the application
    Then the error message is displayed in Estonian

  Scenario: Form labels and placeholders in Estonian
    Given I am creating a new task
    Then form fields show Estonian placeholders
    And validation messages are in Estonian
`,

  'US-090-responsive-layout 2': `@ready @misc @responsive @US-090
Feature: Responsive page layout (US-090)
  As a user on different devices
  I want the application layout to adapt to my screen size
  So that I can use the app comfortably on mobile and desktop

  Scenario: Desktop layout shows full header
    Given I am on a desktop screen
    Then the header shows logo, navigation, and user controls
    And the footer shows all sections side by side

  Scenario: Sentence menu positions correctly
    Given I am on the synthesis page
    When I open a sentence context menu
    Then the menu is positioned near the trigger button
    And it stays within the viewport bounds

  Scenario: Modal adapts to screen size
    Given I open a modal dialog
    Then the modal is centered on screen
    And it has appropriate padding from screen edges
`,

  'US-090-responsive-layout': `@ready @misc @responsive @US-090
Feature: Responsive page layout (US-090)
  As a user on different devices
  I want the application layout to adapt to my screen size
  So that I can use the app comfortably on mobile and desktop

  Scenario: Desktop layout shows full header
    Given I am on a desktop screen
    Then the header shows logo, navigation, and user controls
    And the footer shows all sections side by side

  Scenario: Sentence menu positions correctly
    Given I am on the synthesis page
    When I open a sentence context menu
    Then the menu is positioned near the trigger button
    And it stays within the viewport bounds

  Scenario: Modal adapts to screen size
    Given I open a modal dialog
    Then the modal is centered on screen
    And it has appropriate padding from screen edges
`,

  'US-095-base-modal-behavior 2': `@ready @misc @modal @US-095
Feature: Base modal common behavior (US-095)
  As a user of the application
  I want all modals to behave consistently
  So that I have a predictable and accessible experience

  Scenario: Modal overlay blocks background interaction
    Given a modal is open
    Then a backdrop overlay is displayed
    And clicking the backdrop closes the modal

  Scenario: Modal shows close button when configured
    Given a modal with close button is open
    Then I see an X close button in the header

  Scenario: Modal sizes adapt to content
    Given a small modal is open
    Then the modal uses compact sizing
    And a medium modal uses wider sizing

  Scenario: Modal prevents scroll on body
    Given a modal is open
    Then the page background cannot be scrolled
`,

  'US-095-base-modal-behavior': `@ready @misc @modal @US-095
Feature: Base modal common behavior (US-095)
  As a user of the application
  I want all modals to behave consistently
  So that I have a predictable and accessible experience

  Scenario: Modal overlay blocks background interaction
    Given a modal is open
    Then a backdrop overlay is displayed
    And clicking the backdrop closes the modal

  Scenario: Modal shows close button when configured
    Given a modal with close button is open
    Then I see an X close button in the header

  Scenario: Modal sizes adapt to content
    Given a small modal is open
    Then the modal uses compact sizing
    And a medium modal uses wider sizing

  Scenario: Modal prevents scroll on body
    Given a modal is open
    Then the page background cannot be scrolled
`,

  'US-100-user-profile-display 2': `@ready @misc @profile @US-100
Feature: User profile display in header (US-100)
  As an authenticated user
  I want to see my profile information in the header
  So that I know which account I am logged in with

  Scenario: Show user avatar or initials in header
    Given I am authenticated
    Then I see my user profile in the header

  Scenario: Unauthenticated user sees login button
    Given I am not authenticated
    Then I see a "Logi sisse" button in the header

  Scenario: Profile shows user name
    Given I am authenticated with a display name
    Then I see my name in the profile area
`,

  'US-100-user-profile-display': `@ready @misc @profile @US-100
Feature: User profile display in header (US-100)
  As an authenticated user
  I want to see my profile information in the header
  So that I know which account I am logged in with

  Scenario: Show user avatar or initials in header
    Given I am authenticated
    Then I see my user profile in the header

  Scenario: Unauthenticated user sees login button
    Given I am not authenticated
    Then I see a "Logi sisse" button in the header

  Scenario: Profile shows user name
    Given I am authenticated with a display name
    Then I see my name in the profile area
`,
};
