@ready @misc @dashboard @US-038
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
