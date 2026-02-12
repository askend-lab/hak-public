// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export type LogLevel = "debug" | "info" | "warn" | "error";

type LogMethod = (message: string, ...args: unknown[]) => void;
export type Logger = Record<LogLevel, LogMethod>;

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const DEFAULT_LEVEL: LogLevel = "info";

// Derived from LOG_LEVELS — single source of truth for level names
const LEVEL_TAGS = Object.fromEntries(
  Object.keys(LOG_LEVELS).map((k) => [k, `[${k.toUpperCase()}]`]),
) as Record<LogLevel, string>;

function formatMessage(level: LogLevel, message: string): string {
  return `[${new Date().toISOString()}] ${LEVEL_TAGS[level]} ${message}`;
}

// Pre-evaluates level check at creation — returns no-op for filtered levels
function createLogMethod(level: LogLevel, minLevel: LogLevel): LogMethod {
  if (LOG_LEVELS[level] < LOG_LEVELS[minLevel]) {
    return (): void => { /* filtered out */ };
  }
  const consoleFn = console[level].bind(console);
  return (message: string, ...args: unknown[]): void => {
    consoleFn(formatMessage(level, message), ...args);
  };
}

// Builds logger from LOG_LEVELS keys via Object.fromEntries — type-safe, no cast
export function createLogger(minLevel: LogLevel = DEFAULT_LEVEL): Logger {
  return Object.fromEntries(
    (Object.keys(LOG_LEVELS) as LogLevel[]).map((level) => [
      level,
      createLogMethod(level, minLevel),
    ]),
  ) as Logger;
}

function isValidLogLevel(level: string): level is LogLevel {
  return level in LOG_LEVELS;
}

function getLogLevel(): LogLevel {
  try {
    /* eslint-disable no-restricted-globals */
    if (typeof process !== "undefined" && process.env?.LOG_LEVEL) {
      const envLevel = process.env.LOG_LEVEL;
      if (isValidLogLevel(envLevel)) {
        return envLevel;
      }
    }
    /* eslint-enable no-restricted-globals */
  } catch {
    // Ignore errors in environment detection
  }
  return DEFAULT_LEVEL;
}

export const logger = createLogger(getLogLevel());
