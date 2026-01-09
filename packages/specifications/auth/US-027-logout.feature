@auth @US-027 @ready
Feature: Logout from system (US-027)
  As an authenticated user
  I want to log out of the application
  So that I can secure my account when done

  Scenario: Logout button visible when authenticated
    Given I am logged in
    When I view the navigation menu
    Then I see a logout button

  Scenario: Logout action terminates session
    Given I am logged in
    When I click the logout button
    Then my session is terminated
    And I am redirected to the home page

  Scenario: Protected features require re-login
    Given I have logged out
    When I try to access a protected feature
    Then I am prompted to log in again
