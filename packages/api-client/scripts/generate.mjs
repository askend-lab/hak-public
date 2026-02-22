#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Generates TypeScript types from OpenAPI specs and client wrappers.
 * Usage:
 *   node scripts/generate.mjs          # generate types
 *   node scripts/generate.mjs --check  # verify generated files match
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MONO_ROOT = resolve(ROOT, "../..");

const checkMode = process.argv.includes("--check");

const DOCS_DIR = resolve(MONO_ROOT, "docs");

const SPECS = [
  {
    name: "merlin",
    source: resolve(MONO_ROOT, "packages/merlin-api/openapi.yaml"),
    output: resolve(ROOT, "src/generated/merlin.ts"),
    docsCopy: resolve(DOCS_DIR, "merlin-api.openapi.yaml"),
  },
  {
    name: "vabamorf",
    source: resolve(MONO_ROOT, "packages/vabamorf-api/openapi.yaml"),
    output: resolve(ROOT, "src/generated/vabamorf.ts"),
    docsCopy: resolve(DOCS_DIR, "vabamorf-api.openapi.yaml"),
  },
];

let dirty = false;

for (const spec of SPECS) {
  if (!existsSync(spec.source)) {
    process.stderr.write(`❌ OpenAPI spec not found: ${spec.source}\n`);
    process.exitCode = 1;
    throw new Error(`Spec not found: ${spec.source}`);
  }

  process.stdout.write(`Generating ${spec.name} types from ${spec.source}...\n`);

  const cmd = `npx openapi-typescript "${spec.source}"`;
  const generated = execSync(cmd, { encoding: "utf-8", cwd: MONO_ROOT });

  if (checkMode) {
    if (!existsSync(spec.output)) {
      process.stderr.write(`❌ Generated file missing: ${spec.output}\n`);
      dirty = true;
      continue;
    }
    const existing = readFileSync(spec.output, "utf-8");
    if (existing !== generated) {
      process.stderr.write(`❌ ${spec.name} types are out of date. Run: npm run generate\n`);
      dirty = true;
    } else {
      process.stdout.write(`✅ ${spec.name} types are up to date\n`);
    }
  } else {
    writeFileSync(spec.output, generated, "utf-8");
    process.stdout.write(`✅ ${spec.name} → ${spec.output}\n`);

    copyFileSync(spec.source, spec.docsCopy);
    process.stdout.write(`📄 ${spec.name} spec → ${spec.docsCopy}\n`);
  }
}

if (checkMode && dirty) {
  process.stderr.write("\n❌ Generated files are out of date. Run: npm run generate\n");
  process.exitCode = 1;
} else if (!checkMode) {
  process.stdout.write("\n✅ All types generated successfully\n");
}
