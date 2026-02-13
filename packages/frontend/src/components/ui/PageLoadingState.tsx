// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

interface PageLoadingStateProps {
  message?: string;
  role?: string;
  "aria-live"?: "polite" | "assertive" | "off";
}

/**
 * Full-page loading indicator shown while async data is being fetched.
 */
export function PageLoadingState({
  message = "Laadimine…",
  role = "status",
  "aria-live": ariaLive = "polite",
}: PageLoadingStateProps) {
  return (
    <main
      className="page-loading-state"
      role={role}
      aria-live={ariaLive}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      <p>{message}</p>
    </main>
  );
}
