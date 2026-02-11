@misc @footer @US-045
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
