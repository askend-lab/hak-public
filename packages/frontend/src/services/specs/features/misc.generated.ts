// AUTO-GENERATED - DO NOT EDIT
// Run: pnpm --filter @hak/frontend sync-features
// Group: misc

export const FEATURES_MISC: Record<string, string> = {
  'US-022-generate-share-link': `Feature: Generate shareable link for task (US-022)
  As a language teacher
  I want to generate a shareable link for my task
  So that I can distribute exercises to students

  Scenario: Share button visible on task
    Given I am viewing task details
    When the page loads
    Then I see a Share button

  Scenario: Generate unique share link
    Given I am viewing a task
    When I click the Share button
    Then a unique shareable URL is generated
    And the link is displayed in a dialog

  Scenario: Copy link to clipboard
    Given the share link dialog is open
    When I click "Copy link"
    Then the URL is copied to my clipboard
    And I see a confirmation message
`,

  'US-024-view-phonetic-guide': `Feature: View phonetic symbols reference guide (US-024)
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

  'US-029-submit-feedback': `Feature: Submit feedback (US-029)
  As a user of the application
  I want to submit feedback about the platform
  So that I can report issues or suggest improvements

  Scenario: Feedback button is visible
    Given I am using the application
    When I view the footer area
    Then I see a feedback button or link

  Scenario: Open feedback form
    Given I am on the main page
    When I click the feedback button
    Then the feedback modal opens
    And I see a message input field
    And I see an optional email field

  Scenario: Submit feedback successfully
    Given the feedback form is open
    And I have entered "Great app!" in the message field
    When I click the submit button
    Then my feedback is submitted
    And I see a thank you confirmation message

  Scenario: Email field is optional
    Given the feedback form is open
    When I view the email field
    Then it is clearly marked as optional
    And I can submit without entering an email
`,
};
