// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { ParsedFeature } from "@hak/specifications";
import { TestSuite } from "../../services/specs";

interface FeatureGroup {
  name: string;
  features: ParsedFeature[];
}

interface SpecsNavProps {
  groups: FeatureGroup[];
  testSuites: TestSuite[];
  selectedFeature: string | null;
  expandedGroups: Set<string>;
  expandedFeatures: Set<string>;
  onToggleGroup: (name: string) => void;
  onToggleFeature: (name: string) => void;
  onSelectFeature: (name: string) => void;
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
    if (test) {return test;}
  }
  return null;
}

function getFeatureStats(feature: ParsedFeature, testSuites: TestSuite[]) {
  let passed = 0;
    let total = 0;
  for (const scenario of feature.scenarios) {
    total++;
    const result = getTestResult(testSuites, scenario.name);
    if (result?.status === "passed") {passed++;}
  }
  return { passed, total };
}

function getGroupStats(features: ParsedFeature[], testSuites: TestSuite[]) {
  return features.reduce((acc, f) => { const s = getFeatureStats(f, testSuites); return { passed: acc.passed + s.passed, total: acc.total + s.total }; }, { passed: 0, total: 0 });
}

function ScenarioList({ feature, testSuites, isSkipped, onSelectFeature }: { feature: ParsedFeature; testSuites: TestSuite[]; isSkipped: boolean; onSelectFeature: (n: string) => void }) {
  return (
    <>{feature.scenarios.map((scenario) => {
      const result = getTestResult(testSuites, scenario.name);
      const status = isSkipped ? "skipped" : result?.status === "passed" ? "passed" : "pending";
      return (
        <div key={scenario.name} className="specs-scenario__item" onClick={() => onSelectFeature(feature.name)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") {onSelectFeature(feature.name);} }} role="button" tabIndex={0}>
          <span className={getBadgeClass(status)}>{status === "passed" ? "✓" : "○"}</span>
          <span className="specs-scenario__name">{scenario.name}</span>
        </div>
      );
    })}</>
  );
}

function FeatureRow({ feature, testSuites, isSelected, isExpanded, onToggle, onSelect }: {
  feature: ParsedFeature; testSuites: TestSuite[]; isSelected: boolean; isExpanded: boolean;
  onToggle: (n: string) => void; onSelect: (n: string) => void;
}) {
  const isSkipped = feature.tags.includes("@skip");
  const stats = getFeatureStats(feature, testSuites);
  const cls = `specs-feature__item ${isSelected ? "specs-feature__item--selected" : ""} ${isSkipped ? "specs-feature__item--skipped" : ""}`;
  return (
    <div key={feature.name}>
      <div className={cls} onClick={() => { onToggle(feature.name); onSelect(feature.name); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { onToggle(feature.name); onSelect(feature.name); } }} role="button" tabIndex={0}>
        <span className="specs-feature__name">{isExpanded ? "▼" : "▶"} {feature.name.replace(/\s*\(US-\d+\)/, "")}</span>
        {isSkipped ? <span className={getBadgeClass("skipped")}>skip</span>
          : <span className={getBadgeClass(stats.passed === stats.total ? "passed" : "pending")}>{stats.passed}/{stats.total}</span>}
      </div>
      {isExpanded && <ScenarioList feature={feature} testSuites={testSuites} isSkipped={isSkipped} onSelectFeature={onSelect} />}
    </div>
  );
}

export default function SpecsNav({ groups, testSuites, selectedFeature, expandedGroups, expandedFeatures, onToggleGroup, onToggleFeature, onSelectFeature }: SpecsNavProps) {
  const totalFeatures = groups.flatMap((g) => g.features).length;
  return (
    <nav className="specs-page__nav">
      <div className="specs-page__nav-header">
        <strong className="specs-page__nav-title">📋 Features</strong>
        <span className="specs-page__nav-count">{totalFeatures} total</span>
      </div>
      {groups.map((group) => {
        const isExp = expandedGroups.has(group.name);
        const gs = getGroupStats(group.features, testSuites);
        return (
          <div key={group.name}>
            <div className={`specs-group__header ${isExp ? "specs-group__header--expanded" : ""}`}
              onClick={() => onToggleGroup(group.name)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") {onToggleGroup(group.name);} }} role="button" tabIndex={0}>
              <span>{isExp ? "📂" : "📁"} {group.name}</span>
              <span className={getBadgeClass(gs.passed === gs.total ? "passed" : "pending")}>{gs.passed}/{gs.total}</span>
            </div>
            {isExp && group.features.map((f) => (
              <FeatureRow key={f.name} feature={f} testSuites={testSuites} isSelected={selectedFeature === f.name}
                isExpanded={expandedFeatures.has(f.name)} onToggle={onToggleFeature} onSelect={onSelectFeature} />
            ))}
          </div>
        );
      })}
    </nav>
  );
}
