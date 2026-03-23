@ready
Feature: Compliance — Accessibility and Localization (US-124)

  WCAG accessibility, Estonian localization, and content
  security policies for the HAK platform.

  Scenario: 1.1 Application is navigable by keyboard
    Given the synthesis, tasks, and playlist views
    When a user navigates using only the keyboard
    Then all interactive elements are reachable via Tab
    And focus indicators are clearly visible

  Scenario: 1.2 Application supports screen readers
    Given the application UI with ARIA attributes
    When a screen reader reads the page
    Then headings and landmarks are announced correctly
    And dynamic content uses ARIA live regions

  Scenario: 1.3 Accessibility page is publicly available
    Given the application has an /accessibility route
    When a user navigates to the accessibility page
    Then accessibility information is displayed
    And the page is accessible without authentication

  Scenario: 1.4 Content Security Policy is configured
    Given the frontend HTML meta tags
    When the CSP header is inspected
    Then script-src allows only self
    And connect-src allows only known API domains

  Scenario: 1.5 Application UI is in Estonian
    Given the target audience is Estonian professionals
    When the application is loaded
    Then the UI language is Estonian
    And the HTML lang attribute is set to et

  Scenario: 1.6 Date formatting follows Estonian conventions
    Given dates and times displayed in the application
    When formatting is applied
    Then dates follow Estonian format conventions
    And time formatting uses 24-hour format
