import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { getUserIdFromEvent } from './auth';
import { config } from './config';
import { DynamoDBAdapter } from './dynamoClient';
import { handleSave, handleGet, handleDelete, handleQuery } from './routes';
import { HTTP_ERRORS, HTTP_UNAUTHORIZED, HTTP_NOT_FOUND, HTTP_INTERNAL_ERROR, createResponse } from './response';
import { Store, DynamoDBClient } from './store';
import { ServerContext } from './types';

function createServerContext(userId: string): ServerContext {
  return { app: config.appName, tenant: config.tenant, env: config.environment, userId };
}

/** Default adapter - can be overridden for testing */
let defaultAdapter: DynamoDBClient | null = null;

/** Set custom adapter (for testing with InMemoryStore) */
export function setAdapter(adapter: DynamoDBClient | null): void {
  defaultAdapter = adapter;
}

/** Get current adapter */
export function getAdapter(): DynamoDBClient {
  return defaultAdapter ?? new DynamoDBAdapter();
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

function findRoute(method: string, path: string): Route | undefined {
  return routes.find(r => r.method === method && r.path === path);
}

export function createStore(userId: string): Store {
  return new Store(getAdapter(), createServerContext(userId));
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = getUserIdFromEvent(event);
   
  if (userId === null) return createResponse(HTTP_UNAUTHORIZED, { error: HTTP_ERRORS.UNAUTHORIZED });

  const route = findRoute(event.httpMethod, event.path);
   
  if (!route) return createResponse(HTTP_NOT_FOUND, { error: HTTP_ERRORS.NOT_FOUND });

  try {
    return await route.handler(event, createStore(userId));
  } catch {
     
    return createResponse(HTTP_INTERNAL_ERROR, { error: HTTP_ERRORS.INTERNAL });
  }
}
