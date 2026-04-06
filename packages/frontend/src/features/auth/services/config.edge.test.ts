// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { vi } from "vitest";

describe("fail-fast config validation", () => {
  it("should throw when required env var is missing in non-localhost", async () => {
    vi.stubGlobal("location", { hostname: "app.example.com", href: "" });
    vi.resetModules();
    await expect(() => import("./config")).rejects.toThrow("Missing required env var");
    vi.unstubAllGlobals();
  });

});
