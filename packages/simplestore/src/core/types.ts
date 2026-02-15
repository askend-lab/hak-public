// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Core types for SimpleStore - no external dependencies
 */

/** Single source of truth for valid data types */
export const VALID_DATA_TYPES = [
  "private",
  "unlisted",
  "public",
  "shared",
] as const;

/**
 * Data access type determining visibility and access rules
 * - private: only owner sees and modifies
 * - unlisted: owner modifies, anyone with key can read
 * - public: everyone sees/searches, owner modifies
 * - shared: everyone sees, everyone can modify
 */
export type DataType = (typeof VALID_DATA_TYPES)[number];

/**
 * Server-side context extracted from authentication and configuration
 * These values are never provided by the client
 */
export interface ServerContext {
  readonly app: string;
  readonly tenant: string;
  readonly env: string;
  readonly userId: string;
}

/**
 * Client request for store operations
 */
export interface StoreRequest {
  readonly pk: string;
  readonly sk: string;
  readonly type: DataType;
  readonly ttl: number;
  readonly data?: Record<string, unknown>;
}

/**
 * DynamoDB item structure
 */
export interface StoreItem {
  readonly PK: string;
  readonly SK: string;
  readonly data: Record<string, unknown>;
  readonly owner: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
  readonly ttl?: number;
}

/**
 * Result of store operations
 */
export interface StoreResult {
  readonly success: boolean;
  readonly item?: StoreItem;
  readonly items?: StoreItem[];
  readonly error?: string;
}

/**
 * Configuration for SimpleStore
 */
export interface StoreConfig {
  readonly maxTtlSeconds: number;
  readonly maxDataSizeBytes: number;
  readonly keyDelimiter: string;
}

/** One year in seconds — default max TTL */
export const MAX_TTL_SECONDS = 31_536_000;

/** Shared default configuration — used by store and validation */
/** 350KB — safe limit below DynamoDB's 400KB item size cap */
export const MAX_DATA_SIZE_BYTES = 350_000;

/** Maximum items returned by a single query */
export const MAX_QUERY_ITEMS = 100;

export const DEFAULT_CONFIG: StoreConfig = {
  maxTtlSeconds: MAX_TTL_SECONDS,
  maxDataSizeBytes: MAX_DATA_SIZE_BYTES,
  keyDelimiter: "#",
};

/**
 * Storage adapter interface - dependency injection point
 */
export interface StorageAdapter {
  put(item: StoreItem, expectedVersion?: number): Promise<void>;
  get(pk: string, sk: string): Promise<StoreItem | null>;
  delete(pk: string, sk: string): Promise<void>;
  queryBySortKeyPrefix(pk: string, skPrefix: string, maxItems?: number): Promise<StoreItem[]>;
}
