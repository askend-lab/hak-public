// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import JSZip from "jszip";
import { logger } from "@hak/shared";
import { Task, TaskEntry, hasAudioSource } from "@/types/task";
import { formatDateTime } from "@/utils/formatDate";
import { synthesizeAuto } from "@/features/synthesis/utils/synthesize";

function sanitizeFilename(text: string): string {
  return [...text.replace(/[<>:"/\\|?*\x00-\x1f]/g, "").replace(/\s+/g, "_")]
    .slice(0, 80)
    .join("");
}

async function resolveAudioUrl(entry: TaskEntry): Promise<string | null> {
  if (entry.audioBlob && entry.audioBlob.size > 0) {return null;} // handled separately
  const existing = hasAudioSource(entry) ? entry.audioUrl : null;
  if (existing) {return existing;}
  try { return await synthesizeAuto(entry.stressedText || entry.text); }
  catch (err) { logger.warn("[ZIP] Synthesis failed for entry, skipping:", err); return null; }
}

async function fetchUrlAsBlob(audioUrl: string): Promise<Blob | null> {
  const response = await fetch(audioUrl);
  if (!response.ok) { logger.warn(`[ZIP] Skipping audio (HTTP ${response.status}): ${audioUrl.slice(0, 80)}`); return null; }
  const contentLength = response.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 50 * 1024 * 1024) { logger.warn("[ZIP] Skipping audio > 50MB"); return null; }
  return response.blob();
}

async function fetchAudioBlob(entry: TaskEntry): Promise<Blob | null> {
  if (entry.audioBlob && entry.audioBlob.size > 0) {return entry.audioBlob;}
  const audioUrl = await resolveAudioUrl(entry);
  if (!audioUrl) {return null;}
  try { return await fetchUrlAsBlob(audioUrl); }
  catch (err) { logger.warn("[ZIP] Failed to fetch audio:", err); return null; }
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface ZipProgress {
  current: number;
  total: number;
}

const BATCH_SIZE = 4;
const MAX_TOTAL_ZIP_BYTES = 500 * 1024 * 1024;

function createZipFolder(zip: JSZip, task: Task): { folder: JSZip; audioFolder: JSZip; folderName: string } {
  const folderName = sanitizeFilename(task.name) || "task";
  const folder = zip.folder(folderName);
  if (!folder) {throw new Error("Failed to create ZIP folder");}
  const audioFolder = folder.folder("audio");
  if (!audioFolder) {throw new Error("Failed to create audio folder");}
  folder.file("manifest.json", JSON.stringify({
    name: task.name, description: task.description ?? null,
    createdAt: task.createdAt, exportedAt: new Date().toISOString(), entryCount: task.entries.length,
  }, null, 2));
  const textsContent = task.entries.map((e, i) => `${String(i + 1).padStart(3, "0")}. ${e.text}`).join("\n");
  folder.file("texts.txt", textsContent);
  return { folder, audioFolder, folderName };
}

async function addAudioToZip(
  entries: TaskEntry[], audioFolder: JSZip, onProgress?: (p: ZipProgress) => void,
): Promise<void> {
  const total = entries.length;
  let completed = 0;
  let totalBytes = 0;
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(fetchAudioBlob)); // eslint-disable-line no-await-in-loop -- batched sequential processing
    results.forEach((blob, j) => {
      completed++;
      onProgress?.({ current: completed, total });
      if (!blob) {return;}
      totalBytes += blob.size;
      if (totalBytes > MAX_TOTAL_ZIP_BYTES) {throw new Error("ZIP size limit exceeded (500MB)");}
      const index = String(i + j + 1).padStart(3, "0");
      audioFolder.file(`${index}-${sanitizeFilename(batch[j]?.text ?? "") || "audio"}.wav`, blob);
    });
  }
}

export async function downloadTaskAsZip(
  task: Task, onProgress?: (progress: ZipProgress) => void,
): Promise<void> {
  const zip = new JSZip();
  const { audioFolder, folderName } = createZipFolder(zip, task);
  await addAudioToZip(task.entries, audioFolder, onProgress);
  const zipBlob = await zip.generateAsync({ type: "blob" });
  triggerBlobDownload(zipBlob, `${folderName}_${formatDateTime(new Date()).replace(/[,\s:]/g, "-")}.zip`);
}
