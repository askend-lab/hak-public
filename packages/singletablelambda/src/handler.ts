import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { getUserIdFromEvent } from './auth';
import { config } from './config';
import { DynamoDBAdapter } from './dynamoClient';
import { handleSave, handleGet, handleDelete, handleQuery } from './handlers';
import { HTTP_ERRORS, createResponse } from './response';
import { Store } from './store';
import { ServerContext } from './types';

function createServerContext(userId: string): ServerContext {
  return { app: config.appName, tenant: config.tenant, env: config.environment, userId };
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
  return new Store(new DynamoDBAdapter(), createServerContext(userId));
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
