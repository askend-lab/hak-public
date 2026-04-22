#!/usr/bin/env node
/**
 * Syncs FEATURES constant in specs service with actual .feature files
 * Auto-detects directory structure for grouping
 * Run: node scripts/sync-features.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPECS_DIR = path.resolve(__dirname, "../../specifications");
const OUTPUT_DIR = path.resolve(__dirname, "../src/services/specs/features");

function isValidDir(entry) {
  return (
    entry.isDirectory() &&
    !entry.name.startsWith(".") &&
    entry.name !== "node_modules"
  );
}

function loadFeaturesFromDir(dir, groupName = null) {
  const features = {};
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (isValidDir(entry)) {
      Object.assign(features, loadFeaturesFromDir(fullPath, entry.name));
    } else if (entry.isFile() && entry.name.endsWith(".feature")) {
      const group = groupName || "root";
      if (!features[group]) {
        features[group] = {};
      }
      features[group][entry.name.replace(".feature", "")] = fs.readFileSync(
        fullPath,
        "utf-8",
      );
    }
  }

  return features;
}

function generateGroupCode(features, groupName) {
  const entries = Object.entries(features)
    .map(([name, content]) => {
      const escaped = content
        .replace(/\\/g, "\\\\")
        .replace(/`/g, "\\`")
        .replace(/\$/g, "\\$");
      return `  '${name}': \`${escaped}\``;
    })
    .join(",\n\n");

  return `// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab
//
// AUTO-GENERATED - DO NOT EDIT
// Run: pnpm --filter @hak/frontend sync-features
// Group: ${groupName}

export const FEATURES_${groupName.toUpperCase()}: Record<string, string> = {
${entries},
};
`;
}

function generateIndexCode(groups) {
  const imports = groups
    .map(
      (g) =>
        `import { FEATURES_${g.toUpperCase()} } from './${g}.generated.js';`,
    )
    .join("\n");

  const spread = groups
    .map((g) => `  ...FEATURES_${g.toUpperCase()}`)
    .join(",\n");

  return `// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab
//
// AUTO-GENERATED - DO NOT EDIT
// Run: pnpm --filter @hak/frontend sync-features
// Source: packages/specifications/*/*.feature

${imports}

export const FEATURES: Record<string, string> = {
${spread},
};

export const FEATURE_GROUPS: Record<string, Record<string, string>> = {
${groups.map((g) => `  ${g}: FEATURES_${g.toUpperCase()}`).join(",\n")},
};
`;
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Load features from directory structure
const groupedFeatures = loadFeaturesFromDir(SPECS_DIR);

// Generate group files
const groups = Object.keys(groupedFeatures).sort();
let totalFeatures = 0;

for (const group of groups) {
  const code = generateGroupCode(groupedFeatures[group], group);
  const file = path.join(OUTPUT_DIR, `${group}.generated.ts`);
  fs.writeFileSync(file, code);
  const count = Object.keys(groupedFeatures[group]).length;
  totalFeatures += count;
  console.log(`✓ Generated ${file} (${count} features)`);
}

// Generate index file
const indexCode = generateIndexCode(groups);
const indexFile = path.join(OUTPUT_DIR, "index.ts");
fs.writeFileSync(indexFile, indexCode);
console.log(`✓ Generated ${indexFile}`);

console.log(`  Total: ${totalFeatures} features in ${groups.length} groups`);
