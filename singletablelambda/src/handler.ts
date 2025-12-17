import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Store } from './store';
import { DynamoDBAdapter } from './dynamoClient';
import { ServerContext } from './types';
import { config } from './config';
import { HTTP_ERRORS, createResponse } from './response';
import { getUserIdFromEvent } from './auth';
import { handleSave, handleGet, handleDelete, handleQuery } from './handlers';

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

export async function handler(event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> {
  const userId = getUserIdFromEvent(event);
  if (!userId) return createResponse(401, { error: HTTP_ERRORS.UNAUTHORIZED });

  const route = findRoute(event.httpMethod, event.path);
  if (!route) return createResponse(404, { error: HTTP_ERRORS.NOT_FOUND });

  try {
    return await route.handler(event, createStore(userId));
  } catch {
    return createResponse(500, { error: HTTP_ERRORS.INTERNAL });
  }
}
