// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useAuth } from "@/services/auth";

/**
 * Get the current user ID or fallback to test user
 * Simplifies the repeated pattern: user?.id ?? 'test-user'
 */
export function useUserId(): string {
  const { user } = useAuth();
  return user?.id ?? "test-user";
}
