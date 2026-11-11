@synthesis @US-007
Feature: Edit phonetic text manually (US-007)
  As a language teacher
  I want to manually edit the phonetic text with stress markers
  So that I can correct or customize the pronunciation for specific teaching purposes

  Background:
    Given I have synthesized text

  Scenario: Activate edit mode
    When I click the edit button on phonetic text
    Then the phonetic text becomes editable

  Scenario: Insert phonetic marker
    Given edit mode is active
    When I click a phonetic marker button
    Then the marker is inserted at cursor position

  Scenario: Save edited phonetic text
    Given I have edited the phonetic text
    When I click save
    Then the edited text is saved

  Scenario: Re-synthesize with edited phonetic
    Given I have saved edited phonetic text
    When I trigger synthesis
    Then the audio uses the edited phonetic form
