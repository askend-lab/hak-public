@tasks @drag-drop @US-072
Feature: Reorder task entries via drag and drop (US-072)
  As a language teacher
  I want to reorder entries in a task by dragging them
  So that I can arrange exercises in the optimal learning order

  Background:
    Given I am authenticated
    And I am viewing a task with entries

  Scenario: Start dragging an entry
    When I start dragging an entry
    Then the entry shows a dragging visual indicator

  Scenario: See drop target while dragging
    Given I am dragging an entry
    When I hover over another entry
    Then the target entry shows a drop indicator

  Scenario: Drop entry to reorder
    Given I am dragging an entry
    When I drop it on another entry position
    Then the entries are reordered
    And the new order is persisted

  Scenario: Cancel drag operation
    Given I am dragging an entry
    When I release outside a valid drop target
    Then the entries return to their original order
