// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogMethod = (message: string, ...args: unknown[]) => void;

export interface LogContext {
  [key: string]: unknown;
}

export interface Logger extends Record<LogLevel, LogMethod> {
  withContext(fields: LogContext): Logger;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const DEFAULT_LEVEL: LogLevel = "info";
const LOG_LEVEL_ENV = "LOG_LEVEL";
const LAMBDA_ENV = "AWS_LAMBDA_FUNCTION_NAME";

// Derived once — avoids repeated Object.keys cast
const LOG_LEVEL_KEYS = Object.keys(LOG_LEVELS) as LogLevel[];

const LEVEL_TAGS = Object.fromEntries(
  LOG_LEVEL_KEYS.map((k) => [k, `[${k.toUpperCase()}]`]),
) as Record<LogLevel, string>;

// Shared no-op — one instance for all filtered-out log methods
const NO_OP: LogMethod = (): void => {};

function isNodeEnv(): boolean {
  // eslint-disable-next-line no-restricted-globals -- env detection needs process global
  return typeof process !== "undefined";
}

function isLambdaEnv(): boolean {
  try {
    // eslint-disable-next-line no-restricted-globals -- env detection needs process global
    return isNodeEnv() && !!process.env?.[LAMBDA_ENV];
  } catch {
    return false;
  }
}

function formatPlainText(level: LogLevel, message: string): string {
  return `[${new Date().toISOString()}] ${LEVEL_TAGS[level]} ${message}`;
}

interface FormatJsonInput {
  readonly level: LogLevel;
  readonly message: string;
  readonly context: LogContext;
  readonly args: unknown[];
}

function formatJson(input: FormatJsonInput): string {
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level: input.level,
    message: input.message,
    ...input.context,
  };
  if (input.args.length > 0) {
    entry.data = input.args.length === 1 ? input.args[0] : input.args;
  }
  return JSON.stringify(entry);
}

interface LogMethodConfig {
  readonly level: LogLevel;
  readonly minLevel: LogLevel;
  readonly context: LogContext;
  readonly json: boolean;
}

function createLogMethod(config: LogMethodConfig): LogMethod {
  if (LOG_LEVELS[config.level] < LOG_LEVELS[config.minLevel]) {
    return NO_OP;
  }
  const consoleFn = console[config.level].bind(console); // eslint-disable-line no-console -- logger implementation binds to console
  if (config.json) {
    return (message: string, ...args: unknown[]): void => {
      consoleFn(formatJson({ level: config.level, message, context: config.context, args }));
    };
  }
  if (Object.keys(config.context).length > 0) {
    return (message: string, ...args: unknown[]): void => {
      consoleFn(formatPlainText(config.level, message), config.context, ...args);
    };
  }
  return (message: string, ...args: unknown[]): void => {
    consoleFn(formatPlainText(config.level, message), ...args);
  };
}

export function createLogger(
  minLevel: LogLevel = DEFAULT_LEVEL,
  context: LogContext = {},
): Logger {
  const json = isLambdaEnv();
  const methods = Object.fromEntries(
    LOG_LEVEL_KEYS.map((level) => [level, createLogMethod({ level, minLevel, context, json })]),
  ) as Record<LogLevel, LogMethod>;

  return {
    ...methods,
    withContext(fields: LogContext): Logger {
      return createLogger(minLevel, { ...context, ...fields });
    },
  };
}

function isValidLogLevel(level: string): level is LogLevel {
  return level in LOG_LEVELS;
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
