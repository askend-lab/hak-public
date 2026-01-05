/**
 * Lambda handler - thin as paper
 * Only HTTP concerns, delegates everything to core
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { Store, ServerContext, StorageAdapter } from '../core';
import { InMemoryAdapter } from '../adapters';
import { handleSave, handleGet, handleDelete, handleQuery, createResponse, HTTP_STATUS, HTTP_ERRORS } from './routes';

/** Shared adapter instance for persistence across calls */
let sharedAdapter: StorageAdapter | null = null;

/** Set adapter (for testing or custom adapters) */
export function setAdapter(adapter: StorageAdapter | null): void {
  sharedAdapter = adapter;
}

/** Get or create adapter */
function getAdapter(): StorageAdapter {
  if (!sharedAdapter) {
    sharedAdapter = new InMemoryAdapter();
  }
  return sharedAdapter;
}

/**
 * Get user ID from Cognito claims or local header
 */
function getUserId(event: APIGatewayProxyEvent): string | null {
  const cognitoId = event.requestContext.authorizer?.claims?.sub as string | undefined;
  if (cognitoId !== undefined && cognitoId !== '') return cognitoId;
  
  // In offline/test mode, allow X-User-Id header for testing
  if (process.env.IS_OFFLINE === 'true') {
    const localUserId = event.headers['X-User-Id'] ?? event.headers['x-user-id'];
    if (localUserId) return localUserId;
  }
  
  return null;
}

/**
 * Get required env variable or default
 */
function getEnv(name: string, defaultValue: string): string {
  const value = process.env[name];
  return (value && value.trim() !== '') ? value : defaultValue;
}

/**
 * Create server context from environment
 */
function createContext(userId: string): ServerContext {
  return {
    app: getEnv('APP_NAME', 'default'),
    tenant: getEnv('TENANT', 'default'),
    env: getEnv('ENVIRONMENT', 'dev'),
    userId
  };
}

/**
 * Create store instance
 */
function createStore(userId: string): Store {
  return new Store(getAdapter(), createContext(userId));
}

interface Route {
  method: string;
  path: string;
  handler: (event: APIGatewayProxyEvent, store: Store) => Promise<APIGatewayProxyResult>;
}

const routes: Route[] = [
  { method: 'POST', path: '/save', handler: handleSave },
  { method: 'GET', path: '/get', handler: handleGet },
  { method: 'DELETE', path: '/delete', handler: handleDelete },
  { method: 'GET', path: '/query', handler: handleQuery }
];

/**
 * Main Lambda handler
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Request:', { method: event.httpMethod, path: event.path, resource: event.resource });
  
  const userId = getUserId(event);
  if (!userId) {
    return createResponse(HTTP_STATUS.UNAUTHORIZED, { error: HTTP_ERRORS.UNAUTHORIZED });
  }

  const route = routes.find(r => r.method === event.httpMethod && r.path === event.path);
  if (!route) {
    console.log('Route not found. Available:', routes.map(r => `${r.method} ${r.path}`));
    return createResponse(HTTP_STATUS.NOT_FOUND, { error: HTTP_ERRORS.NOT_FOUND });
  }

  try {
    return await route.handler(event, createStore(userId));
  } catch {
    return createResponse(HTTP_STATUS.INTERNAL_ERROR, { error: HTTP_ERRORS.INTERNAL });
  }
}
