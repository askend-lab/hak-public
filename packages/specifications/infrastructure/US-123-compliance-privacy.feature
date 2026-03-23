@ready
Feature: Compliance — Data Privacy and TARA (US-123)

  GDPR obligations, Estonian eID requirements,
  and data handling for the HAK platform.

  Scenario: 1.1 Personal data is minimized
    Given user authentication via TARA provides PII
    When user data is stored in Cognito and DynamoDB
    Then only minimum necessary data is retained
    And no unnecessary PII is collected or stored

  Scenario: 1.2 Auth data is handled securely
    Given users authenticate with Estonian eID via TARA
    When the authentication flow completes
    Then TARA tokens are exchanged server-side in Lambda
    And session cookies use Secure and HttpOnly attributes

  Scenario: 1.3 TARA follows RIA requirements
    Given the TARA client registration with RIA
    When the authentication flow is inspected
    Then the redirect_uri matches the registered URL
    And the outbound IP is fixed via NAT Gateway

  Scenario: 1.4 TARA callback handles edge cases
    Given users may trigger duplicate callbacks
    When a second callback arrives with invalid state
    Then the user is silently redirected to home page
    And the event is logged as a warning

  Scenario: 1.5 All three eID methods are supported
    Given Estonian citizens use different auth methods
    When a user initiates TARA login
    Then ID-card, Mobile-ID, and Smart-ID are available

  Scenario: 1.6 Privacy policy is accessible
    Given the application has a privacy page
    When a user navigates to /privacy
    Then the privacy policy is displayed
    And the page is accessible without authentication
