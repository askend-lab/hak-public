// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab
//
// AUTO-GENERATED - DO NOT EDIT
// Run: pnpm --filter @hak/frontend sync-features
// Source: packages/specifications/*/*.feature

import { FEATURES_AUTH } from './auth.generated.js';
import { FEATURES_MISC } from './misc.generated.js';
import { FEATURES_PLAYLIST } from './playlist.generated.js';
import { FEATURES_SHARING } from './sharing.generated.js';
import { FEATURES_SYNTHESIS } from './synthesis.generated.js';
import { FEATURES_TASKS } from './tasks.generated.js';

export const FEATURES: Record<string, string> = {
  ...FEATURES_AUTH,
  ...FEATURES_MISC,
  ...FEATURES_PLAYLIST,
  ...FEATURES_SHARING,
  ...FEATURES_SYNTHESIS,
  ...FEATURES_TASKS,
};

export const FEATURE_GROUPS: Record<string, Record<string, string>> = {
  auth: FEATURES_AUTH,
  misc: FEATURES_MISC,
  playlist: FEATURES_PLAYLIST,
  sharing: FEATURES_SHARING,
  synthesis: FEATURES_SYNTHESIS,
  tasks: FEATURES_TASKS,
};
