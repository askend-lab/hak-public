@auth @US-025
Feature: Login with eID (US-025)
  As a registered user
  I want to log in using Estonian eID via Cognito
  So that I can access task management and personalized features

  Scenario: Login button is visible
    Given I am not authenticated
    When I visit the application
    Then I see a login button

  Scenario: Successful login
    Given I am not authenticated
    When I click the login button
    Then I am logged in successfully
    And I see my profile information
