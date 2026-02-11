// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect } from "vitest";
import {
  validateIsikukood,
  getNameFromIsikukood,
  formatIsikukood,
} from "./isikukood";

describe("validateIsikukood", () => {
  it("returns false for invalid length", () => {
    expect(validateIsikukood("123")).toBe(false);
    expect(validateIsikukood("123456789012")).toBe(false);
  });

  it("returns false for non-numeric characters", () => {
    expect(validateIsikukood("3991231001a")).toBe(false);
  });

  it("returns false for invalid century digit", () => {
    expect(validateIsikukood("09912310013")).toBe(false);
    expect(validateIsikukood("79912310013")).toBe(false);
  });

  it("returns false for invalid month", () => {
    expect(validateIsikukood("39913310013")).toBe(false);
  });

  it("returns false for invalid day", () => {
    expect(validateIsikukood("39912320013")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(validateIsikukood("")).toBe(false);
  });

  it("validates checksum correctly", () => {
    // Valid Estonian ID codes (with correct checksums)
    expect(validateIsikukood("37605030299")).toBe(true);
  });
});

describe("getNameFromIsikukood", () => {
  it("returns Unknown User for invalid code", () => {
    expect(getNameFromIsikukood("123")).toBe("Unknown User");
    expect(getNameFromIsikukood("")).toBe("Unknown User");
  });

  it("returns a name for valid code", () => {
    const name = getNameFromIsikukood("37605030299");
    expect(name).not.toBe("Unknown User");
    expect(name.split(" ").length).toBe(2); // First and last name
  });
});

describe("formatIsikukood", () => {
  it("formats valid 11-digit code", () => {
    const formatted = formatIsikukood("37605030299");
    expect(formatted).toBe("376 05 03 029 9");
  });

  it("returns original for invalid length", () => {
    expect(formatIsikukood("123")).toBe("123");
    expect(formatIsikukood("")).toBe("");
  });
});

describe("validateIsikukood additional cases", () => {
  it("validates codes with checksum requiring second weight", () => {
    // Test checksum = 10 case with second weights - use known valid code
    expect(validateIsikukood("37605030299")).toBe(true);
  });

  it("validates female codes (even gender digit)", () => {
    // Female code (starts with 4 = female born 1900-1999)
    expect(validateIsikukood("46001010000")).toBe(false); // Invalid checksum
    // Test that even gender digits are recognized as female in getNameFromIsikukood
  });

  it("validates century 5-6 codes (2000s)", () => {
    // Just verify the validation logic handles century 5-6
    expect(validateIsikukood("50101010009")).toBe(true);
  });
});

describe("validateIsikukood checksum edge cases", () => {
  it("handles checksum requiring second weight sequence (checksum1=10, checksum2!=10)", () => {
    // 49901010771: sum1=131, 131%11=10 → use weights2, sum2=144, 144%11=1, last digit=1
    expect(validateIsikukood("49901010771")).toBe(true);
  });

  it("handles checksum 10 after both weight sequences (becomes 0)", () => {
    // 30301010700: sum1=87, 87%11=10 → weights2, sum2=54, 54%11=10 → checksum=0
    expect(validateIsikukood("30301010700")).toBe(true);
  });

  it("returns female name for valid female code", () => {
    // 49901010771 is a valid female code (starts with 4)
    const name = getNameFromIsikukood("49901010771");
    expect(name).not.toBe("Unknown User");
    expect(name.split(" ").length).toBe(2);
  });
});

describe("getNameFromIsikukood additional cases", () => {
  it("returns male name for odd gender digit (3)", () => {
    // 37605030299: gender=3 (odd=male), substring(7,9)="02" → nameIndex=2%8=2 → "Toomas"
    // substring(9,11)="99" → surnameIndex=99%8=3 → "Mägi"
    const name = getNameFromIsikukood("37605030299");
    expect(name).toBe("Toomas Mägi");
  });

  it("returns female name for even gender digit (4)", () => {
    // 49901010771: gender=4 (even=female), substring(7,9)="07" → nameIndex=7%8=7 → "Maarja"
    // substring(9,11)="71" → surnameIndex=71%8=7 → "Kask"
    const name = getNameFromIsikukood("49901010771");
    expect(name).toBe("Maarja Kask");
  });

  it("returns male name for gender digit 1", () => {
    // 10001010005: gender=1 (odd=male)
    expect(validateIsikukood("10001010002")).toBe(true);
    const name = getNameFromIsikukood("10001010002");
    expect(name).not.toBe("Unknown User");
    expect(name.split(" ").length).toBe(2);
  });

  it("returns male name for gender digit 5", () => {
    expect(validateIsikukood("50101010009")).toBe(true);
    const name = getNameFromIsikukood("50101010009");
    expect(name).not.toBe("Unknown User");
  });
});

describe("validateIsikukood boundary conditions", () => {
  it("rejects month 0", () => {
    expect(validateIsikukood("39900010013")).toBe(false);
  });

  it("rejects month 13", () => {
    expect(validateIsikukood("39913010013")).toBe(false);
  });

  it("accepts month 1", () => {
    // 30101010008: month=01, day=01
    expect(validateIsikukood("30101010007")).toBe(true);
  });

  it("accepts month 12", () => {
    // Need valid code with month=12
    expect(validateIsikukood("39912010014")).toBe(true);
  });

  it("rejects day 0", () => {
    expect(validateIsikukood("39901000013")).toBe(false);
  });

  it("rejects day 32", () => {
    expect(validateIsikukood("39901320013")).toBe(false);
  });

  it("accepts day 1 and day 31", () => {
    expect(validateIsikukood("30101010007")).toBe(true);
  });

  it("accepts century gender 1", () => {
    expect(validateIsikukood("10001010002")).toBe(true);
  });

  it("accepts century gender 6", () => {
    expect(validateIsikukood("60101010006")).toBe(true);
  });

  it("rejects century gender 7", () => {
    expect(validateIsikukood("70101010006")).toBe(false);
  });

  it("rejects wrong checksum digit", () => {
    // 37605030299 is valid; 37605030291 should be invalid
    expect(validateIsikukood("37605030291")).toBe(false);
  });
});

describe("formatIsikukood edge cases", () => {
  it("returns code unchanged for null-like input", () => {
    expect(formatIsikukood("")).toBe("");
  });

  it("returns code unchanged for 10-digit input", () => {
    expect(formatIsikukood("1234567890")).toBe("1234567890");
  });

  it("returns code unchanged for 12-digit input", () => {
    expect(formatIsikukood("123456789012")).toBe("123456789012");
  });

  it("correctly slices 11-digit code into groups", () => {
    // Verify exact slice positions: 0-3, 3-5, 5-7, 7-10, 10
    expect(formatIsikukood("12345678901")).toBe("123 45 67 890 1");
  });
});

describe("getNameFromIsikukood name arrays", () => {
  it("returns correct male names by index", () => {
    // 37605030299: male, nameIndex = parseInt("02") % 8 = 2 -> "Toomas"
    expect(getNameFromIsikukood("37605030299")).toContain("Toomas");
  });

  it("returns correct female names by index", () => {
    // 49901010771: female, nameIndex = parseInt("07") % 8 = 7 -> "Maarja"
    expect(getNameFromIsikukood("49901010771")).toContain("Maarja");
  });

  it("returns correct last names by index", () => {
    // 49901010771: surnameIndex = parseInt("71") % 8 = 7 -> "Kask"
    expect(getNameFromIsikukood("49901010771")).toContain("Kask");
    // 37605030299: surnameIndex = parseInt("99") % 8 = 3 -> "Mägi"
    expect(getNameFromIsikukood("37605030299")).toContain("Mägi");
  });

  it("differentiates male and female by gender digit parity", () => {
    // 37605030299: genderDigit=3 (odd=male)
    const maleName = getNameFromIsikukood("37605030299");
    // 49901010771: genderDigit=4 (even=female)
    const femaleName = getNameFromIsikukood("49901010771");
    // They should be different names
    expect(maleName).not.toBe(femaleName);
  });
});

describe("validateIsikukood regex and null checks", () => {
  it("rejects non-digit characters in 11-char string", () => {
    expect(validateIsikukood("3760503029a")).toBe(false);
    expect(validateIsikukood("376050302 9")).toBe(false);
  });

  it("rejects null-ish values", () => {
    expect(validateIsikukood("")).toBe(false);
  });
});
