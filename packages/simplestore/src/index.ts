/**
 * Single Table Lambda - Universal Backend
 * @module single-table-lambda
 */

// Core store functionality
export { Store, ERRORS } from './store';
export type { DynamoDBClient } from './store';
export { DynamoDBAdapter } from './dynamoClient';
export { InMemoryStore } from './inMemoryAdapter';

// Lambda handler
export { handler, createStore, setAdapter, getAdapter } from './handler';

// Key building utilities
export { buildKeys, buildPartitionKey, buildSortKey, parseTtl } from './keyBuilder';
export type { KeyPair, TtlResult } from './keyBuilder';

// Validation
export { validateStoreRequest, validateGetRequest, validateQueryRequest } from './validation';
export type { ValidationResult } from './validation';

// Configuration
export { config, loadConfig } from './config';
export type { Config } from './config';

// Types
export type { DataType, ServerContext, StoreRequest, StoreItem, StoreResult } from './types';
