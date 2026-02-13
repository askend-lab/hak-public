// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Shared environment utilities.
 * Eliminates duplication across audio-api, merlin-api.
 */

export function getAwsRegion(): string {
  /* eslint-disable no-restricted-globals */
  return process.env.AWS_REGION ?? "eu-west-1";
  /* eslint-enable no-restricted-globals */
}
