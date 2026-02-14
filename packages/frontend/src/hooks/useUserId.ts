// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useAuth } from "@/features/auth/services";

/**
 * Get the current user ID.
 * Throws if user is not authenticated — callers must ensure auth before use.
 */
export function useUserId(): string {
  const { user } = useAuth();
  if (!user?.id) {
    throw new Error("useUserId: user is not authenticated");
  }
  return user.id;
}
