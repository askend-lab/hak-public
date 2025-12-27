Feature: Download synthesized audio (US-003)
  As a language learner
  I want to download the synthesized audio file
  So that I can listen to it offline or use it in other applications

  Scenario: Download audio via menu
    Given I have entered "Tere" in the text input
    And the audio has been synthesized
    When I click the more options menu (⋮)
    And I click "Download" option
    Then the audio file downloads to my device
    And the filename contains the text "Tere"

  Scenario: Download generates audio if not cached
    Given I have entered "Päike paistab" in the text input
    And the audio has not been synthesized yet
    When I click the more options menu (⋮)
    And I click "Download" option
    Then the system synthesizes the audio first
    And the audio file downloads to my device

  Scenario: Downloaded file is playable
    Given I have downloaded the audio for "Tere"
    When I open the downloaded file
    Then the audio plays correctly in a standard audio player
    And the format is WAV
