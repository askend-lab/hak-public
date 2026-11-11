// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export function buildTagKeys(tags: string[]): string[] {
  const seen: Record<string, number> = {};
  return tags.map((tag) => {
    seen[tag] = (seen[tag] ?? 0) + 1;
    return `${tag}-${seen[tag]}`;
  });
}
