// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { ParsedFeature } from "@hak/specifications";
import { TestSuite } from "../../services/specs";

interface SpecsContentProps {
  feature: ParsedFeature | null;
  testSuites: TestSuite[];
}

function getBadgeClass(
  status: "passed" | "failed" | "skipped" | "pending",
): string {
  return `specs-badge specs-badge--${status}`;
}

function getTestResult(testSuites: TestSuite[], scenarioName: string) {
  for (const suite of testSuites) {
    const test = suite.tests.find(
      (t) => t.name.includes(scenarioName) || t.fullName.includes(scenarioName),
    );
    if (test) return test;
  }
  return null;
}

export default function SpecsContent({
  feature,
  testSuites,
}: SpecsContentProps) {
  if (!feature) {
    return (
      <p className="specs-page__empty">Vali feature, et näha üksikasju.</p>
    );
  }

  return (
    <>
      <h2 className="specs-page__feature-title">{feature.name}</h2>
      {feature.description && (
        <p className="specs-page__feature-desc">{feature.description}</p>
      )}

      {feature.scenarios.map((scenario, sIdx) => {
        const result = getTestResult(testSuites, scenario.name);
        const status = feature.tags.includes("@skip")
          ? "skipped"
          : result?.status === "passed"
            ? "passed"
            : "pending";
        return (
          <div key={sIdx} className="specs-scenario__card">
            <div className="specs-scenario__header">
              <strong className="specs-scenario__title">{scenario.name}</strong>
              <span className={getBadgeClass(status)}>
                {status === "passed"
                  ? "✓ passed"
                  : status === "skipped"
                    ? "○ skipped"
                    : "○ pending"}
                {result && ` ${result.duration.toFixed(0)}ms`}
              </span>
            </div>
            {scenario.steps.map((step, stepIdx) => {
              const match = step.match(/^(Given|When|Then|And|But)\s+(.*)$/);
              return (
                <div key={stepIdx} className="specs-step">
                  <span className="specs-step__keyword">
                    {match?.[1] ?? ""}
                  </span>
                  {match?.[2] ?? step}
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
