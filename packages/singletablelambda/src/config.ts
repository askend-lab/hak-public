/* eslint-disable @typescript-eslint/no-unsafe-member-access -- process.env access */
/**
 * Centralized configuration management
 * Single source of truth for all configuration values
 */

export interface Config {
  readonly tableName: string;
  readonly appName: string;
  readonly tenant: string;
  readonly environment: string;
  readonly maxTtlSeconds: number;
  readonly keyDelimiter: string;
}

const DEFAULT_CONFIG: Config = {
  tableName: 'single-table-store',
  appName: 'default',
  tenant: 'default',
  environment: 'dev',
  maxTtlSeconds: 31536000, // 1 year
  keyDelimiter: '#'
};

export function loadConfig(): Config {
  return {
    tableName: (process.env.TABLE_NAME as string | undefined) ?? DEFAULT_CONFIG.tableName,
    appName: (process.env.APP_NAME as string | undefined) ?? DEFAULT_CONFIG.appName,
    tenant: (process.env.TENANT as string | undefined) ?? DEFAULT_CONFIG.tenant,
    environment: (process.env.ENVIRONMENT as string | undefined) ?? DEFAULT_CONFIG.environment,
    maxTtlSeconds: DEFAULT_CONFIG.maxTtlSeconds,
    keyDelimiter: DEFAULT_CONFIG.keyDelimiter
  };
}

export const config = loadConfig();
