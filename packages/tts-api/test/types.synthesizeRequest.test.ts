// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import type { SynthesizeRequest } from "../src/handler";
import { setupTestEnv } from "./setup";

beforeEach(() => {
  setupTestEnv();
});

describe("SynthesizeRequest type", () => {
  it("should allow minimal request with just text", () => {
    const req: SynthesizeRequest = { text: "hello" };
    expect(req.text).toBe("hello");
    expect(req.voice).toBeUndefined();
  });

  it("should allow full request with all fields", () => {
    const req: SynthesizeRequest = {
      text: "hello",
      voice: "efm_l",
      speed: 1.5,
      pitch: 2,
    };
    expect(req.voice).toBe("efm_l");
    expect(req.speed).toBe(1.5);
  });

});
