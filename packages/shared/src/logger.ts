export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

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

export function createLogger(minLevel: LogLevel = 'info'): Logger {
  return {
    debug(message: string, ...args: unknown[]): void {
      if (shouldLog('debug', minLevel)) {
        console.debug(formatMessage('debug', message), ...args);
      }
    },
    info(message: string, ...args: unknown[]): void {
      if (shouldLog('info', minLevel)) {
        console.info(formatMessage('info', message), ...args);
      }
    },
    warn(message: string, ...args: unknown[]): void {
      if (shouldLog('warn', minLevel)) {
        console.warn(formatMessage('warn', message), ...args);
      }
    },
    error(message: string, ...args: unknown[]): void {
      if (shouldLog('error', minLevel)) {
        console.error(formatMessage('error', message), ...args);
      }
    },
  };
}

export const logger = createLogger(
  (process.env.LOG_LEVEL as LogLevel | undefined) ?? 'info'
);
