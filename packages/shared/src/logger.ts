// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function shouldLog(level: LogLevel, minLevel: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[minLevel];
}

function formatMessage(level: LogLevel, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
}

// #3 Single factory for log methods — eliminates 4 identical method bodies
function createLogMethod(
  level: LogLevel,
  minLevel: LogLevel,
): (message: string, ...args: unknown[]) => void {
  const consoleFn = console[level].bind(console);
  return (message: string, ...args: unknown[]): void => {
    if (shouldLog(level, minLevel)) {
      consoleFn(formatMessage(level, message), ...args);
    }
  };
}

export function createLogger(minLevel: LogLevel = "info"): Logger {
  return {
    debug: createLogMethod("debug", minLevel),
    info: createLogMethod("info", minLevel),
    warn: createLogMethod("warn", minLevel),
    error: createLogMethod("error", minLevel),
  };
}

// #4 + #5 Derived from LOG_LEVELS — no separate array, uses `in` operator
function isValidLogLevel(level: string): level is LogLevel {
  return level in LOG_LEVELS;
}

// #6 Consistent function declaration style
function getLogLevel(): LogLevel {
  try {
    // eslint-disable-next-line no-restricted-globals
    if (typeof process !== "undefined" && process.env?.LOG_LEVEL) {
      // eslint-disable-next-line no-restricted-globals
      const envLevel = process.env.LOG_LEVEL;
      if (isValidLogLevel(envLevel)) {
        return envLevel;
      }
    }
  } catch {
    // Ignore errors in environment detection
  }
  return "info";
}

export const logger = createLogger(getLogLevel());
