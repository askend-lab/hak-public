// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * SimpleStore - Universal Key-Value Backend
 *
 * Clean Architecture:
 * - core/     Pure business logic, no external dependencies
 * - adapters/ Storage implementations (DynamoDB, Memory)
 * - lambda/   Thin HTTP layer for AWS Lambda
 */

// Core - pure business logic (use this for library usage)
export {
  Store,
  ERRORS,
  VALID_DATA_TYPES,
  DEFAULT_CONFIG,
  buildKeys,
  buildPartitionKey,
  buildSortKey,
  validateStoreRequest,
  validateGetRequest,
  validateQueryRequest,
  validateServerContext,
  parseTtl,
  isValidType,
} from "./core";

export type {
  DataType,
  ServerContext,
  StoreRequest,
  StoreItem,
  StoreResult,
  StoreConfig,
  StorageAdapter,
  ValidationResult,
  TtlResult,
} from "./core";

// Adapters - storage implementations
export { InMemoryAdapter, DynamoDBAdapter } from "./adapters";

// Lambda - HTTP layer (use this for AWS Lambda deployment)
export {
  handler,
  setAdapter,
  handleSave,
  handleGet,
  handleGetPublic,
  handleDelete,
  handleQuery,
  createResponse,
  HTTP_STATUS,
  HTTP_ERRORS,
} from "./lambda";
