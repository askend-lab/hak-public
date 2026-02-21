// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

// Inlined from @hak/shared — merlin-api is a standalone Lambda without workspace packages

type LogLevel = "debug" | "info" | "warn" | "error";
type LogMethod = (message: string, ...args: unknown[]) => void;
type Logger = Record<LogLevel, LogMethod>;

function fmt(level: string, message: string): string {
  return `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
}

export const logger: Logger = {
  debug: (msg, ...args) => console.debug(fmt("debug", msg), ...args),
  info: (msg, ...args) => console.info(fmt("info", msg), ...args),
  warn: (msg, ...args) => console.warn(fmt("warn", msg), ...args),
  error: (msg, ...args) => console.error(fmt("error", msg), ...args),
};
