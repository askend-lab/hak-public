// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogMethod = (message: string, ...args: unknown[]) => void;
export type Logger = Record<LogLevel, LogMethod>;

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const DEFAULT_LEVEL: LogLevel = "info";
const LOG_LEVEL_ENV = "LOG_LEVEL";

// Derived once — avoids repeated Object.keys cast
const LOG_LEVEL_KEYS = Object.keys(LOG_LEVELS) as LogLevel[];

const LEVEL_TAGS = Object.fromEntries(
  LOG_LEVEL_KEYS.map((k) => [k, `[${k.toUpperCase()}]`]),
) as Record<LogLevel, string>;

// Shared no-op — one instance for all filtered-out log methods
const NO_OP: LogMethod = (): void => {};

function formatMessage(level: LogLevel, message: string): string {
  return `[${new Date().toISOString()}] ${LEVEL_TAGS[level]} ${message}`;
}

function createLogMethod(level: LogLevel, minLevel: LogLevel): LogMethod {
  if (LOG_LEVELS[level] < LOG_LEVELS[minLevel]) {
    return NO_OP;
  }
  const consoleFn = console[level].bind(console); // eslint-disable-line no-console -- logger implementation binds to console
  return (message: string, ...args: unknown[]): void => {
    consoleFn(formatMessage(level, message), ...args);
  };
}

export function createLogger(minLevel: LogLevel = DEFAULT_LEVEL): Logger {
  return Object.fromEntries(
    LOG_LEVEL_KEYS.map((level) => [level, createLogMethod(level, minLevel)]),
  ) as Logger;
}

function isValidLogLevel(level: string): level is LogLevel {
  return level in LOG_LEVELS;
}

function isNodeEnv(): boolean {
  // eslint-disable-next-line no-restricted-globals -- env detection needs process global
  return typeof process !== "undefined";
}

function getLogLevel(): LogLevel {
  try {
    /* eslint-disable no-restricted-globals -- reading LOG_LEVEL from process.env */
    if (isNodeEnv() && process.env?.[LOG_LEVEL_ENV]) {
      const envLevel = process.env[LOG_LEVEL_ENV];
      if (envLevel && isValidLogLevel(envLevel)) {
        return envLevel;
      }
    }
    /* eslint-enable no-restricted-globals -- end process.env access */
  } catch {
    // Ignore errors in environment detection
  }
  return DEFAULT_LEVEL;
}

export const logger = createLogger(getLogLevel());
