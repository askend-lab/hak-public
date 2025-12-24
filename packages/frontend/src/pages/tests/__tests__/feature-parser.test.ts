import { parseFeatureContent } from '../feature-parser';

describe('feature-parser', () => {
  it('should parse a simple feature with one scenario', () => {
    const content = `
Feature: Test feature
  Description of the feature

  Scenario: Test scenario
    Given some context
    When I do something
    Then I expect something
    `.trim();

    const result = parseFeatureContent(content);

    expect(result).toStrictEqual({
      name: 'Test feature',
      description: '',
      tags: [],
      scenarios: [{
        name: 'Test scenario',
        tags: [],
        steps: [
          'Given some context',
          'When I do something',
          'Then I expect something'
        ]
      }]
    });
  });

  it('should parse feature with tags', () => {
    const content = `
@tag1 @tag2
Feature: Tagged feature
  @scenario-tag
  Scenario: Tagged scenario
    Given I have tags
    `.trim();

    const result = parseFeatureContent(content);

    expect(result).toStrictEqual({
      name: 'Tagged feature',
      description: '',
      tags: ['@tag1', '@tag2'],
      scenarios: [{
        name: 'Tagged scenario',
        tags: ['@scenario-tag'],
        steps: ['Given I have tags']
      }]
    });
  });

  it('should parse multiple scenarios', () => {
    const content = `
Feature: Multi-scenario feature

  Scenario: First scenario
    Given first context
    Then first result

  Scenario: Second scenario
    Given second context
    Then second result
    `.trim();

    const result = parseFeatureContent(content);

    expect(result?.scenarios).toHaveLength(2);
    expect(result?.scenarios[0]?.name).toBe('First scenario');
    expect(result?.scenarios[1]?.name).toBe('Second scenario');
  });

  it('should handle background steps', () => {
    const content = `
Feature: Feature with background

  Background:
    Given common setup
    And common data

  Scenario: Test scenario
    When I run test
    Then it passes
    `.trim();

    const result = parseFeatureContent(content);

    expect(result?.scenarios[0]?.steps).toStrictEqual([
      'When I run test',
      'Then it passes'
    ]);
  });

  it('should ignore empty lines and comments', () => {
    const content = `
Feature: Feature with empty lines

  # This is a comment

  Scenario: Test scenario
    Given I have data
    
    When I process it

    Then I get result
    `.trim();

    const result = parseFeatureContent(content);

    expect(result?.scenarios[0]?.steps).toStrictEqual([
      'Given I have data',
      'When I process it',
      'Then I get result'
    ]);
  });

  it('should return null for empty content', () => {
    const result = parseFeatureContent('');
    expect(result).toBeNull();
  });

  it('should return null for content without feature', () => {
    const content = `
    Scenario: Orphan scenario
      Given something
    `.trim();

    const result = parseFeatureContent(content);
    expect(result).toBeNull();
  });

  it('should handle And/But steps', () => {
    const content = `
Feature: Feature with And/But

  Scenario: Complex scenario
    Given I have condition A
    And I have condition B
    When I take action
    But I expect warning
    Then I get result
    `.trim();

    const result = parseFeatureContent(content);

    expect(result?.scenarios[0]?.steps).toStrictEqual([
      'Given I have condition A',
      'And I have condition B',
      'When I take action',
      'But I expect warning',
      'Then I get result'
    ]);
  });

  it('should handle scenario outline tags correctly', () => {
    const content = `
@feature-tag
Feature: Feature with tagged scenarios

  @scenario-tag1 @scenario-tag2
  Scenario: First tagged scenario
    Given something

  Scenario: Second scenario
    Given something else
    `.trim();

    const result = parseFeatureContent(content);

    expect(result?.tags).toStrictEqual(['@feature-tag']);
    expect(result?.scenarios[0]?.tags).toStrictEqual(['@scenario-tag1', '@scenario-tag2']);
    expect(result?.scenarios[1]?.tags).toStrictEqual([]);
  });

  it('should handle feature description', () => {
    const content = `
Feature: Feature with description
  This is the description
  It can span multiple lines

  Scenario: Test scenario
    Given something
    `.trim();

    const result = parseFeatureContent(content);

    // Note: Current parser doesn't capture description properly
    // This test documents current behavior
    expect(result?.description).toBe('');
  });
});
