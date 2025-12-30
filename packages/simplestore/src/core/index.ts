/**
 * Core module - pure business logic exports
 */

export { Store, ERRORS, buildPartitionKey, buildSortKey, buildKeys } from './store';
export { 
  validateStoreRequest, 
  validateGetRequest, 
  validateQueryRequest, 
  validateServerContext,
  parseTtl,
  isValidType,
  getValidTypes
} from './validation';
export type { ValidationResult, TtlResult } from './validation';
export type { 
  DataType, 
  ServerContext, 
  StoreRequest, 
  StoreItem, 
  StoreResult, 
  StoreConfig,
  StorageAdapter 
} from './types';
