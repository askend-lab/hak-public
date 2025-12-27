import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { HTTP_STATUS, HTTP_ERRORS, createResponse, createErrorResponse, isResponse } from './response';
import { Store } from './store';
import { DataType, StoreRequest } from './types';
import { validateStoreRequest, validateGetRequest, validateQueryRequest } from './validation';

interface RequestBody {
  pk?: string;
  sk?: string;
  type?: DataType;
  ttl?: number;
  data?: Record<string, unknown>;
}

function parseBody(event: APIGatewayProxyEvent): RequestBody | null {
  if (event.body === null) return null;
   
  try { return JSON.parse(event.body); } catch { return null; }
}

function extractKeyParams(event: APIGatewayProxyEvent): { pk: string; sk: string; type: DataType } | APIGatewayProxyResult {
  const { pk, sk, type } = event.queryStringParameters ?? {};
  const validation = validateGetRequest(pk, sk, type);
  if (!validation.valid) return createResponse(HTTP_STATUS.BAD_REQUEST, { errors: validation.errors });
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- validated by validateGetRequest
  return { pk: pk!, sk: sk!, type: type as DataType };
}

export async function handleSave(event: APIGatewayProxyEvent, store: Store): Promise<APIGatewayProxyResult> {
  const body = parseBody(event);
  if (!body) return createResponse(HTTP_STATUS.BAD_REQUEST, { error: HTTP_ERRORS.INVALID_JSON });

  const validation = validateStoreRequest(body);
  if (!validation.valid) return createResponse(HTTP_STATUS.BAD_REQUEST, { errors: validation.errors });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- validated by validateStoreRequest
  const request: StoreRequest = { pk: body.pk!, sk: body.sk!, type: body.type!, ttl: body.ttl!, ...(body.data !== undefined && { data: body.data }) };
  const result = await store.save(request);
  return result.success ? createResponse(HTTP_STATUS.OK, { item: result.item }) : createErrorResponse(result, HTTP_STATUS.BAD_REQUEST);
}

export async function handleGet(event: APIGatewayProxyEvent, store: Store): Promise<APIGatewayProxyResult> {
  const params = extractKeyParams(event);
  if (isResponse(params)) return params;
  const result = await store.get(params.pk, params.sk, params.type);
  return result.success ? createResponse(HTTP_STATUS.OK, { item: result.item }) : createErrorResponse(result, HTTP_STATUS.NOT_FOUND);
}

export async function handleDelete(event: APIGatewayProxyEvent, store: Store): Promise<APIGatewayProxyResult> {
  const params = extractKeyParams(event);
  if (isResponse(params)) return params;
  const result = await store.delete(params.pk, params.sk, params.type);
  return result.success ? createResponse(HTTP_STATUS.OK, { success: true }) : createErrorResponse(result, HTTP_STATUS.NOT_FOUND);
}

export async function handleQuery(event: APIGatewayProxyEvent, store: Store): Promise<APIGatewayProxyResult> {
  const { prefix, type } = event.queryStringParameters ?? {};
  const validation = validateQueryRequest(prefix, type);
  if (!validation.valid) return createResponse(HTTP_STATUS.BAD_REQUEST, { errors: validation.errors });
   
  if (prefix == null) return createResponse(HTTP_STATUS.BAD_REQUEST, { error: 'Missing prefix parameter' });
  const result = await store.query(prefix, type as DataType);
  return result.success ? createResponse(HTTP_STATUS.OK, { items: result.items }) : createErrorResponse(result, HTTP_STATUS.INTERNAL_ERROR);
}
