// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Shared environment utilities used by merlin-api.
 */

export function getAwsRegion(): string {
  /* eslint-disable no-restricted-globals -- env detection needs process global */
  return process.env.AWS_REGION ?? "eu-west-1";
  /* eslint-enable no-restricted-globals -- end process global access */
}
