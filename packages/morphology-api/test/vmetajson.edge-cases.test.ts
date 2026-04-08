// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { spawn } from "child_process";
import { EventEmitter } from "events";

import { initVmetajson, analyze, closeVmetajson } from "../src/vmetajson";
import type { ChildProcess } from "child_process";

jest.mock("child_process");

const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

interface MockProcess extends EventEmitter {
  stdin: EventEmitter & { write: jest.Mock };
  stdout: EventEmitter;
  stderr: EventEmitter;
  kill: jest.Mock;
}

function createMockProcess(): MockProcess {
  const stdin = Object.assign(new EventEmitter(), { write: jest.fn() });
  const stdout = new EventEmitter();
  const stderr = new EventEmitter();
  return Object.assign(new EventEmitter(), {
    stdin,
    stdout,
    stderr,
    kill: jest.fn(),
  }) as MockProcess;
}

describe("vmetajson: edge cases", () => {
  let mockProcess: MockProcess;

  beforeEach(() => {
    jest.clearAllMocks();
    closeVmetajson();
    mockProcess = createMockProcess();
    mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);
  });

  afterEach(() => {
    closeVmetajson();
  });

  describe("edge cases", () => {
    it("should handle empty line in buffer", async () => {
      initVmetajson("./vmetajson", ".");

      const analyzePromise = analyze("test");

      setTimeout(() => {
        mockProcess.stdout.emit("data", Buffer.from('\n{"annotations":{}}\n'));
      }, 10);

      const result = await analyzePromise;
      expect(result.annotations).toStrictEqual({});
    });

    it("should use default paths", () => {
      initVmetajson();

      expect(mockSpawn).toHaveBeenCalledWith(
        "./vmetajson",
        ["--path=."],
        expect.any(Object),
      );
    });

    it("should handle stderr output", () => {
      const { logger } = require("../src/logger");
      const loggerSpy = jest.spyOn(logger, "error").mockImplementation();
      initVmetajson("./vmetajson", ".");

      mockProcess.stderr.emit("data", Buffer.from("warning message"));

      expect(loggerSpy).toHaveBeenCalledWith(
        "[vmetajson stderr]",
        "warning message",
      );
      loggerSpy.mockRestore();
    });

    it("should handle timeout for queued and current requests", async () => {
      jest.useFakeTimers();
      initVmetajson("./vmetajson", ".");

      // First request becomes currentRequest, second stays in queue
      const first = analyze("first");
      const second = analyze("second");

      // Both timeouts fire
      jest.advanceTimersByTime(6000);

      await expect(first).rejects.toThrow("vmetajson timeout");
      await expect(second).rejects.toThrow("vmetajson timeout");

      jest.useRealTimers();
    });
  });

});
