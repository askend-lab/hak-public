// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export type LogLevel = "debug" | "info" | "warn" | "error";

// #4 Logger as mapped type — derived from LogLevel, no manual listing
type LogMethod = (message: string, ...args: unknown[]) => void;
export type Logger = Record<LogLevel, LogMethod>;

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// #6 Pre-computed level tags — avoids toUpperCase() on every log call
const LEVEL_TAGS: Record<LogLevel, string> = {
  debug: "[DEBUG]",
  info: "[INFO]",
  warn: "[WARN]",
  error: "[ERROR]",
};

function formatMessage(level: LogLevel, message: string): string {
  return `[${new Date().toISOString()}] ${LEVEL_TAGS[level]} ${message}`;
}

// #7 + #8 Pre-evaluate level at creation — returns no-op if filtered
function createLogMethod(level: LogLevel, minLevel: LogLevel): LogMethod {
  if (LOG_LEVELS[level] < LOG_LEVELS[minLevel]) {
    return (): void => { /* filtered out */ };
  }
  const consoleFn = console[level].bind(console);
  return (message: string, ...args: unknown[]): void => {
    consoleFn(formatMessage(level, message), ...args);
  };
}

// #9 Generate all methods from LOG_LEVELS keys
const ALL_LEVELS = Object.keys(LOG_LEVELS) as LogLevel[];

export function createLogger(minLevel: LogLevel = "info"): Logger {
  const logger = {} as Logger;
  for (const level of ALL_LEVELS) {
    logger[level] = createLogMethod(level, minLevel);
  }
  return logger;
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
