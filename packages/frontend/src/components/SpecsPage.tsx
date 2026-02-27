// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useEffect } from "react";
import { logger } from "@hak/shared";
import { parseFeatureContent, ParsedFeature } from "@hak/specifications";
import {
  loadCucumberResults,
  getFeatureGroups,
  parseCucumberResults,
  TestSuite,
} from "../services/specs";
import { SpecsNav, SpecsContent } from "./specs";

interface FeatureGroup {
  name: string;
  features: ParsedFeature[];
}
interface SpecsPageProps {
  onBack: () => void;
}

function useSpecsData() {
  const [groups, setGroups] = useState<FeatureGroup[]>([]);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadSpecs();
  }, []);

  async function loadSpecs() {
    try {
      const featureGroups = getFeatureGroups();
      const parsedGroups = parseGroups(featureGroups);
      setGroups(parsedGroups);
      const cucumberResults = await loadCucumberResults();
      if (cucumberResults) {setTestSuites(parseCucumberResults(cucumberResults));}
    } catch (error) {
      logger.warn("Failed to load specs:", error);
    } finally {
      setLoading(false);
    }
  }

  function parseGroups(featureGroups: Record<string, Record<string, string>>) {
    const result: FeatureGroup[] = [];
    for (const [groupName, featureFiles] of Object.entries(featureGroups)) {
      const features: ParsedFeature[] = [];
      for (const [, content] of Object.entries(featureFiles)) {
        const parsed = parseFeatureContent(content);
        if (parsed) {features.push(parsed);}
      }
      if (features.length > 0) {result.push({ name: groupName, features });}
    }
    return result;
  }

  return { groups, testSuites, loading };
}

function toggleSet(set: Set<string>, name: string): Set<string> {
  const next = new Set(set);
  if (next.has(name)) {next.delete(name);}
  else {next.add(name);}
  return next;
}

export default function SpecsPage({ onBack }: SpecsPageProps) {
  const { groups, testSuites, loading } = useSpecsData();
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (groups.length > 0 && !selectedFeature) {
      const first = groups[0];
      if (first?.features[0]) {
        setExpandedGroups(new Set([first.name]));
        setSelectedFeature(first.features[0].name);
        setExpandedFeatures(new Set([first.features[0].name]));
      }
    }
  }, [groups, selectedFeature]);

  const allFeatures = groups.flatMap((g) => g.features);
  const selectedFeatureData =
    allFeatures.find((f) => f.name === selectedFeature) ?? null;

  if (loading) {
    return (
      <div className="specs-page">
        <div className="specs-page__header">
          <button className="specs-page__back" onClick={onBack}>
            ← Tagasi
          </button>
          <h1>Testid</h1>
        </div>
        <p className="specs-page__loading-text">Laen spetsifikatsioone...</p>
      </div>
    );
  }

  return (
    <div className="specs-page">
      <div className="specs-page__header">
        <button className="specs-page__back" onClick={onBack}>
          ← Tagasi
        </button>
        <h1>Testid</h1>
      </div>
      <div className="specs-page__layout">
        <SpecsNav
          groups={groups}
          testSuites={testSuites}
          selectedFeature={selectedFeature}
          expandedGroups={expandedGroups}
          expandedFeatures={expandedFeatures}
          onToggleGroup={(n) => setExpandedGroups(toggleSet(expandedGroups, n))}
          onToggleFeature={(n) =>
            setExpandedFeatures(toggleSet(expandedFeatures, n))
          }
          onSelectFeature={setSelectedFeature}
        />
        <section className="specs-page__content" tabIndex={0}>
          <SpecsContent feature={selectedFeatureData} testSuites={testSuites} />
        </section>
      </div>
    </div>
  );
}
