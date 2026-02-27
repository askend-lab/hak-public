// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { VERSION } from "../src/handler";
import { setupTestEnv } from "./setup";

beforeEach(() => {
  setupTestEnv();
});

describe("handler.test", () => {
  it("should be a valid semver string", () => {
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

});
