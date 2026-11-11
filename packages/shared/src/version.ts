// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Loads package version from package.json.
 * Tries ./package.json first (Docker/bundled), then ../package.json (dev/src/).
 */
export function loadVersion(): string {
  try {
    return require("./package.json").version;
  } catch {
    try {
      return require("../package.json").version;
    } catch {
      return "0.0.0";
    }
  }
}
