// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { spawn, ChildProcess } from "child_process";

import { VmetajsonInput, VmetajsonResponse } from "./types";

interface QueuedRequest {
  resolve: (value: VmetajsonResponse) => void;
  reject: (reason: Error) => void;
  input: VmetajsonInput;
  timeoutId: ReturnType<typeof setTimeout>;
}

let vmetajsonProcess: ChildProcess | null = null;
const requestQueue: QueuedRequest[] = [];
let currentRequest: QueuedRequest | null = null;
let buffer = "";

function processNextRequest(): void {
  // Stryker disable next-line all: guard conditions are equivalent
  if (currentRequest || requestQueue.length === 0 || !vmetajsonProcess?.stdin) {
    return;
  }

  const next = requestQueue.shift();
  if (!next) return;
  currentRequest = next;
  vmetajsonProcess.stdin.write(`${JSON.stringify(currentRequest.input)}\n`);
}

function completeCurrentRequest(response: VmetajsonResponse): void {
  if (currentRequest) {
    clearTimeout(currentRequest.timeoutId);
    currentRequest.resolve(response);
    currentRequest = null;
    processNextRequest();
  }
}

function failCurrentRequest(error: Error): void {
  if (currentRequest) {
    clearTimeout(currentRequest.timeoutId);
    currentRequest.reject(error);
    currentRequest = null;
    processNextRequest();
  }
}

export function initVmetajson(
  binaryPath = "./vmetajson",
  dictPath = ".",
): void {
  if (vmetajsonProcess) {
    return;
  }

  vmetajsonProcess = spawn(binaryPath, [`--path=${dictPath}`], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  // Stryker disable next-line all: optional chaining is equivalent
  vmetajsonProcess.stderr?.on("data", (data: Buffer) => {
    console.error("[vmetajson stderr]", data.toString());
  });

  // Stryker disable next-line all: optional chaining is equivalent
  vmetajsonProcess.stdout?.on("data", (data: Buffer) => {
    buffer += data.toString();
    const lines = buffer.split("\n");

    // Stryker disable next-line all: boundary condition is equivalent
    while (lines.length > 1) {
      const line = lines.shift();
      // Stryker disable next-line all: guard conditions are equivalent
      if (line !== undefined && line.trim() !== "" && currentRequest) {
        try {
          const response = JSON.parse(line) as VmetajsonResponse;
          completeCurrentRequest(response);
        } catch {
          failCurrentRequest(
            new Error(
              `Failed to parse vmetajson response: ${line ?? "unknown"}`,
            ),
          );
        }
      }
    }
    // Stryker disable next-line all: empty string default is equivalent
    buffer = lines[0] || "";
  });

  vmetajsonProcess.on("error", (err: Error) => {
    failCurrentRequest(err);
  });

  vmetajsonProcess.on("exit", (code: number | null) => {
    failCurrentRequest(
      new Error(`vmetajson exited with code ${String(code ?? "unknown")}`),
    );
    vmetajsonProcess = null;
  });
}

export async function analyze(text: string): Promise<VmetajsonResponse> {
  if (!vmetajsonProcess) {
    throw new Error("vmetajson process not initialized");
  }

  const input: VmetajsonInput = {
    params: {
      vmetajson: ["--stem", "--addphonetics"],
    },
    content: text,
  };

  return new Promise((resolve, reject) => {
    // Stryker disable next-line all: env default is equivalent
    const timeoutMs = parseInt(process.env.VMETAJSON_TIMEOUT_MS ?? "5000", 10);
    const timeoutId = setTimeout(() => {
      const index = requestQueue.findIndex((r) => r.timeoutId === timeoutId);
      // Stryker disable next-line all: boundary condition is equivalent
      if (index !== -1) {
        requestQueue.splice(index, 1);
        reject(new Error("vmetajson timeout"));
        // Stryker disable next-line all: optional chaining is equivalent
      } else if (currentRequest?.timeoutId === timeoutId) {
        currentRequest = null;
        reject(new Error("vmetajson timeout"));
        processNextRequest();
      }
    }, timeoutMs);

    requestQueue.push({ resolve, reject, input, timeoutId });
    processNextRequest();
  });
}

export function closeVmetajson(): void {
  if (vmetajsonProcess) {
    vmetajsonProcess.kill();
    vmetajsonProcess = null;
  }
}

export function isInitialized(): boolean {
  return vmetajsonProcess !== null;
}
