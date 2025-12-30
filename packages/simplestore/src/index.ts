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
  buildKeys,
  buildPartitionKey,
  buildSortKey,
  validateStoreRequest,
  validateGetRequest,
  validateQueryRequest,
  validateServerContext,
  parseTtl,
  isValidType,
  getValidTypes
} from './core';

export type { 
  DataType, 
  ServerContext, 
  StoreRequest, 
  StoreItem, 
  StoreResult,
  StoreConfig,
  StorageAdapter,
  ValidationResult,
  TtlResult
} from './core';

// Adapters - storage implementations
export { InMemoryAdapter, DynamoDBAdapter } from './adapters';

// Lambda - HTTP layer (use this for AWS Lambda deployment)
export { handler, setAdapter, handleSave, handleGet, handleDelete, handleQuery, createResponse, HTTP_STATUS, HTTP_ERRORS } from './lambda';

// Legacy exports for backward compatibility (deprecated)
export { Store as default } from './core';
