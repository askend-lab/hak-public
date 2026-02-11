@ready @synthesis @onboarding @US-093
Feature: Demo sentences for new users (US-093)
  As a new user going through onboarding
  I want to see pre-filled demo sentences
  So that I can immediately try the synthesis features

  Scenario: Demo sentences appear during onboarding
    Given I have selected a role
    And the onboarding wizard is active
    Then demo sentences are pre-filled in the input rows

  Scenario: Demo sentences are playable
    Given demo sentences are pre-filled
    When I click play on a demo sentence
    Then I hear the synthesized audio

  Scenario: Demo sentences can be edited
    Given demo sentences are pre-filled
    When I modify a demo sentence text
    Then the modified text is used for synthesis
