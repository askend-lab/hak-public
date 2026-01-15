/**
 * DataService - Split from 640-line monolith for SOLID compliance
 * 
 * Modules:
 * - storage.ts: localStorage operations
 * - queries.ts: Task query operations
 * - mutations.ts: Task mutation operations
 */
export * from './storage';
export * from './queries';
export * from './mutations';
