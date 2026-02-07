/**
 * Accessibility Testing Helpers
 *
 * Provides utilities for running accessibility tests with jest-axe
 * following WCAG 2.1 AA guidelines.
 */

import { axe, toHaveNoViolations, JestAxeConfigureOptions } from "jest-axe";
import { RenderResult } from "@testing-library/react";

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

/**
 * Default axe configuration for WCAG 2.1 AA compliance
 */
export const wcagAAConfig: JestAxeConfigureOptions = {
  rules: {
    // WCAG 2.1 AA rules
    "color-contrast": { enabled: true },
    "valid-lang": { enabled: true },
    "html-has-lang": { enabled: true },
    "document-title": { enabled: true },
    "link-name": { enabled: true },
    "button-name": { enabled: true },
    "image-alt": { enabled: true },
    label: { enabled: true },
    "aria-roles": { enabled: true },
    "aria-valid-attr": { enabled: true },
    "aria-valid-attr-value": { enabled: true },
    "focus-order-semantics": { enabled: true },
    tabindex: { enabled: true },
  },
};

/**
 * Run accessibility audit on a rendered component
 *
 * @param container - The DOM container from render result
 * @param options - Optional axe configuration overrides
 * @returns Promise resolving to axe results
 *
 * @example
 * ```tsx
 * it('should have no accessibility violations', async () => {
 *   const { container } = render(<MyComponent />);
 *   await expectNoA11yViolations(container);
 * });
 * ```
 */
export async function runA11yAudit(
  container: HTMLElement,
  options?: JestAxeConfigureOptions,
): Promise<Awaited<ReturnType<typeof axe>>> {
  const config = { ...wcagAAConfig, ...options };
  return axe(container, config);
}

/**
 * Assert that a component has no accessibility violations
 *
 * @param container - The DOM container from render result
 * @param options - Optional axe configuration overrides
 *
 * @example
 * ```tsx
 * it('should be accessible', async () => {
 *   const { container } = render(<Button>Click me</Button>);
 *   await expectNoA11yViolations(container);
 * });
 * ```
 */
export async function expectNoA11yViolations(
  container: HTMLElement,
  options?: JestAxeConfigureOptions,
): Promise<void> {
  const results = await runA11yAudit(container, options);
  expect(results).toHaveNoViolations();
}

/**
 * Run accessibility audit on a render result
 * Convenience wrapper for Testing Library render results
 */
export async function checkA11y(
  renderResult: RenderResult,
  options?: JestAxeConfigureOptions,
): Promise<void> {
  await expectNoA11yViolations(renderResult.container, options);
}

/**
 * Get a summary of accessibility violations for debugging
 */
export function formatA11yViolations(
  results: Awaited<ReturnType<typeof axe>>,
): string {
  if (results.violations.length === 0) {
    return "No accessibility violations found.";
  }

  return results.violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => `  - ${node.html}\n    Fix: ${node.failureSummary}`)
        .join("\n");

      return `
[${violation.impact?.toUpperCase()}] ${violation.id}: ${violation.description}
Help: ${violation.helpUrl}
Affected elements:
${nodes}
`;
    })
    .join("\n");
}
