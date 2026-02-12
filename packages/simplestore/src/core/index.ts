// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Core module - pure business logic exports
 */

export {
  Store,
  ERRORS,
  buildPartitionKey,
  buildSortKey,
  buildKeys,
} from "./store";
export {
  validateStoreRequest,
  validateGetRequest,
  validateQueryRequest,
  validateServerContext,
  parseTtl,
  isValidType,
  getValidTypes,
} from "./validation";
export type { ValidationResult, TtlResult } from "./validation";
export { VALID_DATA_TYPES, DEFAULT_CONFIG } from "./types";
export type {
  DataType,
  ServerContext,
  StoreRequest,
  StoreItem,
  StoreResult,
  StoreConfig,
  StorageAdapter,
} from "./types";
