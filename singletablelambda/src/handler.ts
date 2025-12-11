import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Store, ERRORS } from './store';
import { DynamoDBAdapter } from './dynamoClient';
import { DataType, StoreResult, ServerContext } from './types';
import { validateStoreRequest, validateGetRequest, validateQueryRequest } from './validation';
import { config } from './config';

/** HTTP error messages (DRY - single source) */
const HTTP_ERRORS = {
  UNAUTHORIZED: 'Unauthorized',
  NOT_FOUND: 'Not found',
  INTERNAL: 'Internal server error',
  INVALID_JSON: 'Invalid JSON body'
} as const;

/** Error messages to HTTP status code mapping (uses ERRORS constants) */
const ERROR_STATUS_MAP: Record<string, number> = {
  [ERRORS.NOT_FOUND]: 404,
  [ERRORS.ACCESS_DENIED]: 403
};

/**
 * Maps store error to appropriate HTTP status code
 */
function getErrorStatusCode(error: string | undefined, defaultStatus = 500): number {
  if (!error) return defaultStatus;
  return ERROR_STATUS_MAP[error] ?? defaultStatus;
}

/**
 * Creates error response from StoreResult
 */
function createErrorResponse(result: StoreResult, defaultStatus = 500): APIGatewayProxyResult {
  return createResponse(getErrorStatusCode(result.error, defaultStatus), { error: result.error });
}

/**
 * Request body structure for save operations
 */
interface RequestBody {
  pk?: string;
  sk?: string;
  type?: DataType;
  ttl?: number;
  data?: Record<string, unknown>;
}

/**
 * Extracts user ID from Cognito JWT claims
 */
function getUserIdFromEvent(event: APIGatewayProxyEvent): string | null {
  return event.requestContext?.authorizer?.claims?.sub as string ?? null;
}

/**
 * Creates standardized API Gateway response with CORS headers
 */
function createResponse(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(body)
  };
}

/**
 * Safely parses JSON request body
 */
function parseBody(event: APIGatewayProxyEvent): RequestBody | null {
  if (!event.body) return null;
  try {
    return JSON.parse(event.body);
  } catch {
    return null;
  }
}

/**
 * Creates server context from config and authenticated user
 */
function createServerContext(userId: string): ServerContext {
  return {
    app: config.appName,
    tenant: config.tenant,
    env: config.environment,
    userId
  };
}

/**
 * Route definition for cleaner routing
 */
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
 * Finds matching route for the request
 */
function findRoute(method: string, path: string): Route | undefined {
  return routes.find(r => r.method === method && r.path === path);
}

/**
 * Factory function for creating Store (enables DI)
 */
export function createStore(userId: string): Store {
  return new Store(new DynamoDBAdapter(), createServerContext(userId));
}

/**
 * Main Lambda handler
 */
export async function handler(
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> {
  const userId = getUserIdFromEvent(event);
  if (!userId) {
    return createResponse(401, { error: HTTP_ERRORS.UNAUTHORIZED });
  }

  const route = findRoute(event.httpMethod, event.path);
  if (!route) {
    return createResponse(404, { error: HTTP_ERRORS.NOT_FOUND });
  }

  try {
    return await route.handler(event, createStore(userId));
  } catch {
    return createResponse(500, { error: HTTP_ERRORS.INTERNAL });
  }
}

async function handleSave(
  event: APIGatewayProxyEvent,
  store: Store
): Promise<APIGatewayProxyResult> {
  const body = parseBody(event);
  if (!body) {
    return createResponse(400, { error: HTTP_ERRORS.INVALID_JSON });
  }

  const validation = validateStoreRequest(body);
  if (!validation.valid) {
    return createResponse(400, { errors: validation.errors });
  }

  const result = await store.save({
    pk: body.pk!,
    sk: body.sk!,
    type: body.type!,
    ttl: body.ttl!,
    data: body.data
  });

  return result.success
    ? createResponse(200, { item: result.item })
    : createErrorResponse(result, 400);
}

/**
 * Extracts and validates key parameters from query string (DRY helper)
 */
function extractKeyParams(event: APIGatewayProxyEvent): { pk: string; sk: string; type: DataType } | APIGatewayProxyResult {
  const { pk, sk, type } = event.queryStringParameters || {};
  
  const validation = validateGetRequest(pk, sk, type);
  if (!validation.valid) {
    return createResponse(400, { errors: validation.errors });
  }
  
  return { pk: pk!, sk: sk!, type: type as DataType };
}

function isResponse(result: unknown): result is APIGatewayProxyResult {
  return typeof result === 'object' && result !== null && 'statusCode' in result;
}

async function handleGet(
  event: APIGatewayProxyEvent,
  store: Store
): Promise<APIGatewayProxyResult> {
  const params = extractKeyParams(event);
  if (isResponse(params)) return params;

  const result = await store.get(params.pk, params.sk, params.type);
  return result.success
    ? createResponse(200, { item: result.item })
    : createErrorResponse(result, 404);
}

async function handleDelete(
  event: APIGatewayProxyEvent,
  store: Store
): Promise<APIGatewayProxyResult> {
  const params = extractKeyParams(event);
  if (isResponse(params)) return params;

  const result = await store.delete(params.pk, params.sk, params.type);
  return result.success
    ? createResponse(200, { success: true })
    : createErrorResponse(result, 404);
}

async function handleQuery(
  event: APIGatewayProxyEvent,
  store: Store
): Promise<APIGatewayProxyResult> {
  const { prefix, type } = event.queryStringParameters || {};

  const validation = validateQueryRequest(prefix, type);
  if (!validation.valid) {
    return createResponse(400, { errors: validation.errors });
  }

  const result = await store.query(prefix!, type as DataType);

  return result.success
    ? createResponse(200, { items: result.items })
    : createErrorResponse(result, 500);
}
