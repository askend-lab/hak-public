// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { isEcsConfigured } from "../src/ecs";
import { setupTestEnv } from "./setup";

beforeEach(() => {
  setupTestEnv();
});

describe("handler.test", () => {
  it("should return false when both unset", () => {
    expect(isEcsConfigured()).toBe(false);
  });

  it("should return false when only cluster set", () => {
    process.env.ECS_CLUSTER = "my-cluster";
    expect(isEcsConfigured()).toBe(false);
  });

  it("should return false when only service set", () => {
    process.env.ECS_SERVICE = "my-service";
    expect(isEcsConfigured()).toBe(false);
  });

  it("should return true when both set", () => {
    process.env.ECS_CLUSTER = "my-cluster";
    process.env.ECS_SERVICE = "my-service";
    expect(isEcsConfigured()).toBe(true);
  });

});
