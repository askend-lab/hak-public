// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { spawn } from "child_process";
import { EventEmitter } from "events";

import { VmetajsonProcess } from "../src/vmetajson";
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

describe("vmetajson coverage — edge cases", () => {
  let mockProcess: MockProcess;
  let vmetajson: VmetajsonProcess;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProcess = createMockProcess();
    mockSpawn.mockReturnValue(mockProcess as unknown as ChildProcess);
    vmetajson = new VmetajsonProcess();
  });

  afterEach(() => {
    vmetajson.close();
  });

  it("process exit with null code uses 'unknown' (line 69)", async () => {
    vmetajson.init("./vmetajson", ".");
    const promise = vmetajson.analyze("test").catch((e: Error) => e);
    mockProcess.emit("exit", null);
    const error = await promise;
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain("exited with code unknown");
  });

  it("process exit drains queued requests (lines 71-76)", async () => {
    jest.useFakeTimers();
    vmetajson.init("./vmetajson", ".");

    // Need 4 requests: 1st=currentRequest, 2nd/3rd/4th=queue.
    // On exit: failCurrentRequest(1st) → processNextRequest moves 2nd to currentRequest.
    // While loop drains 3rd and 4th (lines 71-76). 2nd is stuck until timeout.
    const p1 = vmetajson.analyze("a").catch((e: Error) => e);
    const p2 = vmetajson.analyze("b").catch((e: Error) => e);
    const p3 = vmetajson.analyze("c").catch((e: Error) => e);
    const p4 = vmetajson.analyze("d").catch((e: Error) => e);

    mockProcess.emit("exit", 1);

    // p1, p3, p4 are rejected by exit. p2 is stuck as currentRequest — fire its timeout.
    jest.advanceTimersByTime(6000);

    const errors = await Promise.all([p1, p2, p3, p4]);
    expect(errors).toHaveLength(4);
    for (const e of errors) {
      expect(e).toBeInstanceOf(Error);
    }
    jest.useRealTimers();
  });

  it("process exit with no current request (line 82 false branch)", async () => {
    vmetajson.init("./vmetajson", ".");

    // Exit without any pending requests
    mockProcess.emit("exit", 0);

    expect(vmetajson.initialized).toBe(false);
  });

  it("queue full throws at MAX_QUEUE_SIZE (line 127-128)", async () => {
    jest.useFakeTimers();
    vmetajson.init("./vmetajson", ".");

    // Fill queue: 1 becomes currentRequest, 50 stay in queue
    for (let i = 0; i < 51; i++) {
      vmetajson.analyze(`text-${i}`).catch(() => {});
    }

    // 52nd rejects because queue is full (50 items = MAX_QUEUE_SIZE)
    let error: Error | null = null;
    try { await vmetajson.analyze("overflow"); } catch (e) { error = e as Error; }
    expect(error?.message).toContain("queue full");

    // Cleanup: exit rejects all pending and clears their timers
    mockProcess.emit("exit", 1);
    jest.runAllTimers();
    jest.useRealTimers();
  });
});
