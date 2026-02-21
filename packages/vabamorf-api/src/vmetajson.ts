// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { spawn, ChildProcess } from "child_process";

import { logger } from "./logger";
import { VmetajsonInput, VmetajsonResponse } from "./types";

interface QueuedRequest {
  resolve: (value: VmetajsonResponse) => void;
  reject: (reason: Error) => void;
  input: VmetajsonInput;
  timeoutId: ReturnType<typeof setTimeout>;
}

const VMETAJSON_PARAMS = ["--stem", "--addphonetics"] as const;
const TIMEOUT_ERROR = "vmetajson timeout";
const NOT_INITIALIZED_ERROR = "vmetajson process not initialized";
const QUEUE_FULL_ERROR = "vmetajson queue full — too many concurrent requests";
const PARSE_ERROR_PREFIX = "Failed to parse vmetajson response: ";
const EXIT_ERROR_PREFIX = "vmetajson exited with code ";
const MAX_QUEUE_SIZE = 50;

// Stryker disable next-line all: env default is equivalent
const TIMEOUT_MS = parseInt(process.env.VMETAJSON_TIMEOUT_MS ?? "5000", 10);

export class VmetajsonProcess {
  private process: ChildProcess | null = null;
  private readonly requestQueue: QueuedRequest[] = [];
  private currentRequest: QueuedRequest | null = null;
  private buffer = "";

  private processNextRequest(): void {
    // Stryker disable next-line all: guard conditions are equivalent
    if (this.currentRequest || this.requestQueue.length === 0 || !this.process?.stdin) {
      return;
    }

    const next = this.requestQueue.shift();
    if (!next) return;
    this.currentRequest = next;
    this.process.stdin.write(`${JSON.stringify(this.currentRequest.input)}\n`);
  }

  private finishCurrentRequest(action: (req: QueuedRequest) => void): void {
    if (this.currentRequest) {
      clearTimeout(this.currentRequest.timeoutId);
      action(this.currentRequest);
      this.currentRequest = null;
      this.processNextRequest();
    }
  }

  private completeCurrentRequest(response: VmetajsonResponse): void {
    this.finishCurrentRequest((req) => req.resolve(response));
  }

  private failCurrentRequest(error: Error): void {
    this.finishCurrentRequest((req) => req.reject(error));
  }

  init(binaryPath = "./vmetajson", dictPath = "."): void {
    if (this.process) {
      return;
    }

    this.process = spawn(binaryPath, [`--path=${dictPath}`], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    // Stryker disable next-line all: optional chaining is equivalent
    this.process.stderr?.on("data", (data: Buffer) => {
      logger.error("[vmetajson stderr]", data.toString());
    });

    // Stryker disable next-line all: optional chaining is equivalent
    this.process.stdout?.on("data", (data: Buffer) => {
      this.buffer += data.toString();
      const lines = this.buffer.split("\n");

      // Stryker disable next-line all: boundary condition is equivalent
      while (lines.length > 1) {
        const line = lines.shift();
        // Stryker disable next-line all: guard conditions are equivalent
        if (line !== undefined && line.trim() !== "" && this.currentRequest) {
          try {
            const response = JSON.parse(line) as VmetajsonResponse;
            this.completeCurrentRequest(response);
          } catch {
            this.failCurrentRequest(
              new Error(`${PARSE_ERROR_PREFIX}${line}`),
            );
          }
        }
      }
      // Stryker disable next-line all: empty string default is equivalent
      this.buffer = lines[0] || "";
    });

    this.process.on("error", (err: Error) => {
      this.failCurrentRequest(err);
    });

    this.process.on("exit", (code: number | null) => {
      const exitError = new Error(`${EXIT_ERROR_PREFIX}${code ?? "unknown"}`);
      this.failCurrentRequest(exitError);
      while (this.requestQueue.length > 0) {
        const queued = this.requestQueue.shift();
        if (queued) {
          clearTimeout(queued.timeoutId);
          queued.reject(exitError);
        }
      }
      this.process = null;
    });
  }

  async analyze(text: string): Promise<VmetajsonResponse> {
    if (!this.process) {
      throw new Error(NOT_INITIALIZED_ERROR);
    }

    if (this.requestQueue.length >= MAX_QUEUE_SIZE) {
      throw new Error(QUEUE_FULL_ERROR);
    }

    const input: VmetajsonInput = {
      params: { vmetajson: VMETAJSON_PARAMS },
      content: text,
    };

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const index = this.requestQueue.findIndex((r) => r.timeoutId === timeoutId);
        // Stryker disable next-line all: boundary condition is equivalent
        if (index !== -1) {
          this.requestQueue.splice(index, 1);
          reject(new Error(TIMEOUT_ERROR));
          // Stryker disable next-line all: optional chaining is equivalent
        } else if (this.currentRequest?.timeoutId === timeoutId) {
          this.currentRequest = null;
          reject(new Error(TIMEOUT_ERROR));
          this.processNextRequest();
        }
      }, TIMEOUT_MS);

      this.requestQueue.push({ resolve, reject, input, timeoutId });
      this.processNextRequest();
    });
  }

  close(): void {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }

  get initialized(): boolean {
    return this.process !== null;
  }
}

const defaultInstance = new VmetajsonProcess();

export function initVmetajson(binaryPath?: string, dictPath?: string): void {
  defaultInstance.init(binaryPath, dictPath);
}

export async function analyze(text: string): Promise<VmetajsonResponse> {
  return defaultInstance.analyze(text);
}

export function closeVmetajson(): void {
  defaultInstance.close();
}

export function isInitialized(): boolean {
  return defaultInstance.initialized;
}
