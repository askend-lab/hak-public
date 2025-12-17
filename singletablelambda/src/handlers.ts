import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Store } from './store';
import { DataType } from './types';
import { validateStoreRequest, validateGetRequest, validateQueryRequest } from './validation';
import { HTTP_ERRORS, createResponse, createErrorResponse, isResponse } from './response';

interface RequestBody {
  pk?: string;
  sk?: string;
  type?: DataType;
  ttl?: number;
  data?: Record<string, unknown>;
}

function parseBody(event: APIGatewayProxyEvent): RequestBody | null {
  if (!event.body) return null;
  try { return JSON.parse(event.body); } catch { return null; }
}

function extractKeyParams(event: APIGatewayProxyEvent): { pk: string; sk: string; type: DataType } | APIGatewayProxyResult {
  const { pk, sk, type } = event.queryStringParameters || {};
  const validation = validateGetRequest(pk, sk, type);
  if (!validation.valid) return createResponse(400, { errors: validation.errors });
  return { pk: pk!, sk: sk!, type: type as DataType };
}

export async function handleSave(event: APIGatewayProxyEvent, store: Store): Promise<APIGatewayProxyResult> {
  const body = parseBody(event);
  if (!body) return createResponse(400, { error: HTTP_ERRORS.INVALID_JSON });

  const validation = validateStoreRequest(body);
  if (!validation.valid) return createResponse(400, { errors: validation.errors });

  const result = await store.save({ pk: body.pk!, sk: body.sk!, type: body.type!, ttl: body.ttl!, data: body.data });
  return result.success ? createResponse(200, { item: result.item }) : createErrorResponse(result, 400);
}

export async function handleGet(event: APIGatewayProxyEvent, store: Store): Promise<APIGatewayProxyResult> {
  const params = extractKeyParams(event);
  if (isResponse(params)) return params;
  const result = await store.get(params.pk, params.sk, params.type);
  return result.success ? createResponse(200, { item: result.item }) : createErrorResponse(result, 404);
}

export async function handleDelete(event: APIGatewayProxyEvent, store: Store): Promise<APIGatewayProxyResult> {
  const params = extractKeyParams(event);
  if (isResponse(params)) return params;
  const result = await store.delete(params.pk, params.sk, params.type);
  return result.success ? createResponse(200, { success: true }) : createErrorResponse(result, 404);
}

export async function handleQuery(event: APIGatewayProxyEvent, store: Store): Promise<APIGatewayProxyResult> {
  const { prefix, type } = event.queryStringParameters || {};
  const validation = validateQueryRequest(prefix, type);
  if (!validation.valid) return createResponse(400, { errors: validation.errors });
  const result = await store.query(prefix!, type as DataType);
  return result.success ? createResponse(200, { items: result.items }) : createErrorResponse(result, 500);
}
