/**
 * Step Definitions Index
 * 
 * This file documents the organization of Cucumber step definitions.
 * Step definitions are automatically loaded by Cucumber via the config.
 * 
 * File Organization:
 * - setup.ts          - Test world setup, hooks, and rendering
 * - helpers.ts        - Shared utilities for finding elements
 * - preload.ts        - Environment setup for Vite compatibility
 * 
 * Feature Step Definitions:
 * - auth.steps.ts         - US-025, US-026, US-027, US-028 (authentication)
 * - synthesis.steps.ts    - US-001, US-003, US-004, US-007, US-008 (core synthesis)
 * - playback.steps.ts     - US-010, US-011, US-031 (audio playback & caching)
 * - variants.steps.ts     - US-005, US-034 (pronunciation variants)
 * - inline-edit.steps.ts  - US-014 (inline sentence editing)
 * - tasks.steps.ts        - US-015, US-016, US-017 (task list/details)
 * - task-crud.steps.ts    - US-018, US-019 (edit/delete tasks)
 * - task-entries.steps.ts - US-020, US-021 (adding entries to tasks)
 * - baseline.steps.ts     - US-033 (baseline tasks)
 * - sharing.steps.ts      - US-022, US-023, US-032 (sharing features)
 * - feedback.steps.ts     - US-029, US-030 (feedback & notifications)
 * - phonetic-guide.steps.ts - US-024 (phonetic guide)
 * - download.steps.ts     - US-003 (download audio)
 * - delete.steps.ts       - US-012 (delete entries)
 * - reorder.steps.ts      - US-013 (reorder entries)
 * 
 * Running Tests:
 * - All tests: npm run test:cucumber
 * - By tag: npm run test:cucumber -- --tags @auth
 * - Single feature: npm run test:cucumber -- --tags @US-025
 */

export * from './helpers';
export * from './setup';
