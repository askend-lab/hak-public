// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { parseFeatureContent } from './index';

describe('feature-parser', () => {
  describe('parseFeatureContent', () => {
    it('should parse a simple feature', () => {
      const content = `
Feature: User Login
  Scenario: Successful login
    Given user is on login page
    When user enters valid credentials
    Then user is logged in
`;
      const result = parseFeatureContent(content);
      expect(result).not.toBeNull();
      expect(result?.name).toBe('User Login');
      expect(result?.scenarios).toHaveLength(1);
      expect(result?.scenarios[0].name).toBe('Successful login');
      expect(result?.scenarios[0].steps).toHaveLength(3);
    });

    it('should parse feature with tags', () => {
      const content = `
@login @smoke
Feature: User Login
  @critical
  Scenario: Successful login
    Given user is on login page
`;
      const result = parseFeatureContent(content);
      expect(result?.tags).toContain('@login');
      expect(result?.tags).toContain('@smoke');
      expect(result?.scenarios[0].tags).toContain('@critical');
    });

    it('should parse multiple scenarios', () => {
      const content = `
Feature: Auth
  Scenario: Login
    Given user is logged out
  Scenario: Logout
    Given user is logged in
`;
      const result = parseFeatureContent(content);
      expect(result?.scenarios).toHaveLength(2);
      expect(result?.scenarios[0].name).toBe('Login');
      expect(result?.scenarios[1].name).toBe('Logout');
    });

    it('should skip Background steps', () => {
      const content = `
Feature: Auth
  Background:
    Given common setup
  Scenario: Test
    Given specific setup
`;
      const result = parseFeatureContent(content);
      expect(result?.scenarios[0].steps).toHaveLength(1);
      expect(result?.scenarios[0].steps[0]).toBe('Given specific setup');
    });

    it('should return null for empty content', () => {
      const result = parseFeatureContent('');
      expect(result).toBeNull();
    });

    it('should parse And/But steps', () => {
      const content = `
Feature: Test
  Scenario: Complex
    Given setup
    And more setup
    When action
    But not this
    Then result
`;
      const result = parseFeatureContent(content);
      expect(result?.scenarios[0].steps).toHaveLength(5);
    });
  });
});
