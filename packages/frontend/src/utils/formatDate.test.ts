// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect } from "vitest";
import { formatDate, formatDateTime } from "./formatDate";

describe("formatDate", () => {
  it("formats a date string to Estonian locale", () => {
    const result = formatDate("2024-03-15");
    expect(result).toMatch(/15.*03.*2024/);
  });

  it("formats a Date object to Estonian locale", () => {
    const date = new Date("2024-03-15");
    const result = formatDate(date);
    expect(result).toMatch(/15.*03.*2024/);
  });

  it("handles ISO date strings with time", () => {
    const result = formatDate("2024-03-15T10:30:00Z");
    expect(result).toMatch(/15.*03.*2024/);
  });
});

describe("formatDateTime", () => {
  it("formats a date string with time to Estonian locale", () => {
    const result = formatDateTime("2024-03-15T10:30:00");
    expect(result).toMatch(/15.*03.*2024/);
    expect(result).toMatch(/10.*30/);
  });

  it("formats a Date object with time to Estonian locale", () => {
    const date = new Date("2024-03-15T10:30:00");
    const result = formatDateTime(date);
    expect(result).toMatch(/15.*03.*2024/);
    expect(result).toMatch(/10.*30/);
  });

  it("string and Date produce identical results", () => {
    const dateStr = "2024-03-15T10:30:00";
    const dateObj = new Date(dateStr);
    expect(formatDateTime(dateStr)).toBe(formatDateTime(dateObj));
    expect(formatDate(dateStr)).toBe(formatDate(dateObj));
  });
});
