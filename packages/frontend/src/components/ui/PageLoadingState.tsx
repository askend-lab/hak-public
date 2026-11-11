// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * PageLoadingState - Standardized full-page loading indicator
 * 
 * Usage:
 *   <PageLoadingState message="Loading..." />
 *   <PageLoadingState /> // Uses default message
 */

interface PageLoadingStateProps {
  message?: string;
}

export function PageLoadingState({ 
  message = "Laadimine..." 
}: PageLoadingStateProps) {
  return (
    <div 
      className="page-loading-state" 
      role="status" 
      aria-live="polite"
    >
      <div className="page-loading-state__spinner" aria-hidden="true" />
      <p className="page-loading-state__message">{message}</p>
    </div>
  );
}
