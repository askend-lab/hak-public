@ready @sharing @audio @US-094
Feature: Audio playback on shared task page (US-094)
  As a student accessing a shared task
  I want to play audio for entries on the shared page
  So that I can practice pronunciation from the teacher's materials

  Background:
    Given I am viewing a shared task with entries

  Scenario: Play individual entry audio
    When I click play on a shared entry
    Then the audio is synthesized and played
    And the play button shows playing state

  Scenario: Play all entries sequentially
    When I click the play all button
    Then entries are played one after another
    And the play all button shows active state

  Scenario: Stop playback on shared page
    Given audio is playing on the shared page
    When I click the play all button again
    Then playback stops
