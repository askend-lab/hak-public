#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab
//
// Strip Cognito dev defaults from frontend auth files for public repo.
// Called by scripts/sync-to-public.sh during open-source sync.

const fs = require('fs');
const path = require('path');

const authDir = 'packages/frontend/src/features/auth/services';

// 1. config.ts — strip hardcoded Cognito dev defaults
const configPath = path.join(authDir, 'config.ts');
if (fs.existsSync(configPath)) {
  let c = fs.readFileSync(configPath, 'utf8');
  // Pattern A: isLocalDev() ternary — (isLocalDev() ? "value" : "")
  c = c.replace(/\(isLocalDev\(\) \? "[^"]*" : ""\)/g, '""');
  // Pattern B: requireEnv() with localDefault — requireEnv("KEY", "value")
  c = c.replace(/requireEnv\("([^"]+)",\s*"[^"]+"\)/g, 'requireEnv("$1", "")');
  fs.writeFileSync(configPath, c);
  console.log('  Stripped Cognito dev defaults from config.ts');
}

// 2. config.test.ts — fix test expectations for empty defaults
const testPath = path.join(authDir, 'config.test.ts');
if (fs.existsSync(testPath)) {
  let t = fs.readFileSync(testPath, 'utf8');
  t = t.replace(
    'it("should use dev defaults on localhost when env vars are not set"',
    'it("should default to empty strings when env vars are not set"'
  );
  t = t.replace(/expect\(cognitoConfig\.region\)\.toBe\("eu-west-1"\)/, 'expect(cognitoConfig.region).toBe("")');
  t = t.replace(/expect\(cognitoConfig\.userPoolId\)\.toBe\("eu-west-1_wlRtuLkG2"\)/, 'expect(cognitoConfig.userPoolId).toBe("")');
  t = t.replace(/expect\(cognitoConfig\.clientId\)\.toBe\("64tf6nf61n6sgftqif6q975hka"\)/, 'expect(cognitoConfig.clientId).toBe("")');
  t = t.replace(/expect\(cognitoConfig\.domain\)\.toBe\("askend-lab-auth\.auth\.eu-west-1\.amazoncognito\.com"\)/, 'expect(cognitoConfig.domain).toBe("")');
  fs.writeFileSync(testPath, t);
  console.log('  Fixed config.test.ts expectations');
}

// 3. context test files — remove DEV_ISS/DEV_AUD, revert createJwt to plain payload
const contextTests = [
  'context.callbacks.test.tsx',
  'context.returns.test.tsx',
  'context.state.test.tsx',
  'context.edge.test.tsx',
];
for (const file of contextTests) {
  const fp = path.join(authDir, file);
  if (!fs.existsSync(fp)) continue;
  let c = fs.readFileSync(fp, 'utf8');
  c = c.replace(/\nconst DEV_ISS = "[^"]*";\nconst DEV_AUD = "[^"]*";\n/g, '\n');
  c = c.replace(
    /const b = btoa\(JSON\.stringify\(\{ iss: DEV_ISS, aud: DEV_AUD, \.\.\.payload \}\)\);/g,
    'const b = btoa(JSON.stringify(payload));'
  );
  c = c.replace(/\{ iss: DEV_ISS, aud: DEV_AUD, (sub:)/g, '{ $1');
  fs.writeFileSync(fp, c);
  console.log('  Cleaned ' + file);
}

// 4. vite.config.ts — strip Cognito domain fallback from /oauth2/token proxy
const vitePath = 'packages/frontend/vite.config.ts';
if (fs.existsSync(vitePath)) {
  let v = fs.readFileSync(vitePath, 'utf8');
  v = v.replace(
    /\?\? "askend-lab-auth\.auth\.eu-west-1\.amazoncognito\.com"\}/,
    '}'
  );
  fs.writeFileSync(vitePath, v);
  console.log('  Stripped Cognito domain fallback from vite.config.ts');
}
