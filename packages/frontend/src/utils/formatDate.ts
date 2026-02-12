// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export const LOCALE_ET = "et-EE";

const toDateObj = (date: string | Date): Date =>
  typeof date === "string" ? new Date(date) : date;

/**
 * Format a date to Estonian locale format (dd.mm.yyyy)
 * Accepts Date objects or ISO date strings
 */
export const formatDate = (date: string | Date): string => {
  return toDateObj(date).toLocaleDateString(LOCALE_ET, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Format a date to Estonian locale with time
 * Accepts Date objects or ISO date strings
 */
export const formatDateTime = (date: string | Date): string => {
  return toDateObj(date).toLocaleDateString(LOCALE_ET, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
