// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { vi } from "vitest";
import { TaskEntry } from "@/types/task";

export interface MockAudio {
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  src: string;
  onloadeddata: (() => void) | null;
  onended: (() => void) | null;
  onerror: (() => void) | null;
  addEventListener: ReturnType<typeof vi.fn>;
}

let audioInstances: MockAudio[] = [];
let nextPlayBehavior: "resolve" | "reject" = "resolve";

export class FakeAudio {
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  src: string;
  onloadeddata: (() => void) | null = null;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  addEventListener: ReturnType<typeof vi.fn>;

  constructor(url?: string) {
    this.src = url ?? "";
    this.pause = vi.fn();
    this.addEventListener = vi.fn();
    if (nextPlayBehavior === "reject") {
      this.play = vi.fn().mockRejectedValue(new Error("play fail"));
      nextPlayBehavior = "resolve";
    } else {
      this.play = vi.fn().mockResolvedValue(undefined);
    }
    audioInstances.push(this);
  }
}

export function resetAudioMocks(): void {
  audioInstances = [];
  nextPlayBehavior = "resolve";
}

export function setNextPlayReject(): void {
  nextPlayBehavior = "reject";
}

export function getAudioInstances(): MockAudio[] {
  return audioInstances;
}

export function audioAt(index: number): MockAudio {
  const a = audioInstances[index];
  if (!a) throw new Error(`No audio at index ${index}`);
  return a;
}

export function lastAudio(): MockAudio {
  return audioAt(audioInstances.length - 1);
}

export const makeEntry = (
  id: string,
  overrides: Partial<TaskEntry> = {},
): TaskEntry => ({
  id,
  taskId: "t1",
  text: `text-${id}`,
  stressedText: `stressed-${id}`,
  audioUrl: null,
  audioBlob: null,
  order: 0,
  createdAt: new Date(),
  ...overrides,
});

export const makeBlob = (size = 100): Blob => {
  const b = new Blob(["audio"], { type: "audio/mp3" });
  Object.defineProperty(b, "size", { value: size });
  return b;
};
