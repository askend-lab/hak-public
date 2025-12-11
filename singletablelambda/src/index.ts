/**
 * Single Table Lambda - Universal Backend
 * @module single-table-lambda
 */

// Core store functionality
export { Store, DynamoDBClient, ERRORS } from './store';
export { DynamoDBAdapter } from './dynamoClient';

// Lambda handler
export { handler } from './handler';

// Key building utilities
export { buildKeys, buildPartitionKey, buildSortKey, validateTtl, KeyPair, TtlValidationResult } from './keyBuilder';

// Validation
export { validateStoreRequest, validateGetRequest, validateQueryRequest, ValidationResult } from './validation';

// Configuration
export { config, Config, loadConfig } from './config';

// Types
export { DataType, ServerContext, StoreRequest, StoreItem, StoreResult } from './types';
