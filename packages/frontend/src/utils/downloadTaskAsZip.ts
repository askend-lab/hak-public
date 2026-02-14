// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import JSZip from "jszip";
import { Task, TaskEntry, hasAudioSource } from "@/types/task";
import { formatDateTime } from "@/utils/formatDate";
import { synthesizeAuto } from "@/features/synthesis/utils/synthesize";

function sanitizeFilename(text: string): string {
  return text
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")
    .replace(/\s+/g, "_")
    .split("")
    .slice(0, 80)
    .join("");
}

async function fetchAudioBlob(entry: TaskEntry): Promise<Blob | null> {
  if (entry.audioBlob && entry.audioBlob.size > 0) {
    return entry.audioBlob;
  }

  let audioUrl = hasAudioSource(entry) ? entry.audioUrl : null;

  // Synthesize audio if not available
  if (!audioUrl) {
    try {
      audioUrl = await synthesizeAuto(entry.stressedText || entry.text);
    } catch {
      return null;
    }
  }

  if (!audioUrl) return null;

  try {
    const response = await fetch(audioUrl);
    if (!response.ok) return null;
    return await response.blob();
  } catch {
    return null;
  }
}

export interface ZipProgress {
  current: number;
  total: number;
}

export async function downloadTaskAsZip(
  task: Task,
  onProgress?: (progress: ZipProgress) => void,
): Promise<void> {
  const zip = new JSZip();
  const folderName = sanitizeFilename(task.name) || "task";
  const folder = zip.folder(folderName);
  if (!folder) throw new Error("Failed to create ZIP folder");

  const audioFolder = folder.folder("audio");
  if (!audioFolder) throw new Error("Failed to create audio folder");

  // manifest.json
  folder.file(
    "manifest.json",
    JSON.stringify(
      {
        name: task.name,
        description: task.description ?? null,
        createdAt: task.createdAt,
        exportedAt: new Date().toISOString(),
        entryCount: task.entries.length,
      },
      null,
      2,
    ),
  );

  // texts.txt
  const textsContent = task.entries
    .map((e, i) => `${String(i + 1).padStart(3, "0")}. ${e.text}`)
    .join("\n");
  folder.file("texts.txt", textsContent);

  // Audio files
  const total = task.entries.length;
  let current = 0;

  for (const entry of task.entries) {
    current++;
    onProgress?.({ current, total });

    const blob = await fetchAudioBlob(entry);
    if (blob) {
      const index = String(current).padStart(3, "0");
      const name = sanitizeFilename(entry.text) || "audio";
      audioFolder.file(`${index}-${name}.wav`, blob);
    }
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });

  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${folderName}_${formatDateTime(new Date()).replace(/[,\s:]/g, "-")}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
