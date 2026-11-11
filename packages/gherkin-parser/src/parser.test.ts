// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { parseFeatureContent } from "./index";

describe("basic parsing", () => {
  it("should parse a simple feature", () => {
    const content = `
Feature: User Login
  Scenario: Successful login
    Given user is on login page
    When user enters valid credentials
    Then user is logged in
`;
    const result = parseFeatureContent(content);
    expect(result).not.toBeNull();
    expect(result?.name).toBe("User Login");
    expect(result?.scenarios).toHaveLength(1);
    expect(result?.scenarios[0]?.name).toBe("Successful login");
    expect(result?.scenarios[0]?.steps).toHaveLength(3);
  });

  it("should parse feature with tags", () => {
    const content = `
@login @smoke
Feature: User Login
  @critical
  Scenario: Successful login
    Given user is on login page
`;
    const result = parseFeatureContent(content);
    expect(result?.tags).toContain("@login");
    expect(result?.tags).toContain("@smoke");
    expect(result?.scenarios[0]?.tags).toContain("@critical");
  });

  it("should parse multiple scenarios", () => {
    const content = `
Feature: Auth
  Scenario: Login
    Given user is logged out
  Scenario: Logout
    Given user is logged in
`;
    const result = parseFeatureContent(content);
    expect(result?.scenarios).toHaveLength(2);
    expect(result?.scenarios[0]?.name).toBe("Login");
    expect(result?.scenarios[1]?.name).toBe("Logout");
  });

  it("should return null for empty content", () => {
    const result = parseFeatureContent("");
    expect(result).toBeNull();
  });

  it("should parse And/But steps", () => {
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
    expect(result?.scenarios[0]?.steps).toHaveLength(5);
  });
});

describe("background steps (#4)", () => {
  const backgroundContent = `
Feature: Auth
  Background:
    Given common setup
  Scenario: Test
    Given specific setup
`;

  it("should store Background steps in feature", () => {
    const result = parseFeatureContent(backgroundContent);
    expect(result?.background).toBeDefined();
    expect(result?.background?.steps).toHaveLength(1);
    expect(result?.background?.steps[0]?.keyword).toBe("Given");
    expect(result?.background?.steps[0]?.text).toBe("common setup");
  });

  it("should not mix Background steps into scenario steps", () => {
    const result = parseFeatureContent(backgroundContent);
    expect(result?.scenarios[0]?.steps).toHaveLength(1);
    expect(result?.scenarios[0]?.steps[0]?.keyword).toBe("Given");
    expect(result?.scenarios[0]?.steps[0]?.text).toBe("specific setup");
  });
});

describe("structured steps (#1)", () => {
  it("should parse steps into keyword and text", () => {
    const content = `
Feature: Steps
  Scenario: Test
    Given user is on login page
    When user clicks submit
    Then user sees dashboard
`;
    const result = parseFeatureContent(content);
    const steps = result?.scenarios[0]?.steps;
    expect(steps?.[0]).toStrictEqual({ keyword: "Given", text: "user is on login page" });
    expect(steps?.[1]).toStrictEqual({ keyword: "When", text: "user clicks submit" });
    expect(steps?.[2]).toStrictEqual({ keyword: "Then", text: "user sees dashboard" });
  });

  it("should parse And/But step keywords", () => {
    const content = `
Feature: Test
  Scenario: Test
    Given a
    And b
    But c
`;
    const result = parseFeatureContent(content);
    expect(result?.scenarios[0]?.steps?.[1]?.keyword).toBe("And");
    expect(result?.scenarios[0]?.steps?.[2]?.keyword).toBe("But");
  });
});

describe("description parsing (#9)", () => {
  it("should parse feature description", () => {
    const content = `
Feature: Login
  As a user
  I want to log in
  So that I can use the app

  Scenario: Test
    Given setup
`;
    const result = parseFeatureContent(content);
    expect(result?.description).toBe(
      "As a user\nI want to log in\nSo that I can use the app",
    );
  });

  it("should return empty description when none exists", () => {
    const content = `
Feature: Login
  Scenario: Test
    Given setup
`;
    const result = parseFeatureContent(content);
    expect(result?.description).toBe("");
  });
});

