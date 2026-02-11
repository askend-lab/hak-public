@auth @redirect @US-092
Feature: Post-login redirect to intended page (US-092)
  As a user who was redirected to login
  I want to be taken back to my intended destination after login
  So that my workflow is not interrupted by authentication

  Scenario: Redirect to tasks after login from tasks link
    Given I am not authenticated
    And I clicked the tasks navigation link
    When I successfully log in
    Then I am redirected to the tasks page

  Scenario: Stay on synthesis after direct login
    Given I am on the synthesis page
    When I click login and authenticate
    Then I remain on the synthesis page

  Scenario: Pending redirect is cleared after navigation
    Given I was redirected to login from tasks
    And I successfully logged in
    When the redirect completes
    Then the pending redirect state is cleared
