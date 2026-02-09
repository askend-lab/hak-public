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
};
