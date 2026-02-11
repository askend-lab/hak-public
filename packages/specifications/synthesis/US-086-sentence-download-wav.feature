@synthesis @download @US-086
Feature: Download sentence audio as WAV file (US-086)
  As a language learner
  I want to download synthesized audio as a WAV file
  So that I can listen offline or use the audio in other tools

  Scenario: Download audio from sentence menu
    Given I am on the synthesis page
    And I have synthesized audio for "Tere"
    When I click "Lae alla .wav fail" in the sentence menu
    Then a WAV file download starts

  Scenario: Download button disabled without text
    Given I have an empty sentence
    When I open the sentence menu
    Then the download option is disabled

  Scenario: Download audio from task detail
    Given I am viewing a task with audio entries
    When I download audio for an entry
    Then the WAV file is saved to my device
