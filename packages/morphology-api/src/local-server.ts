// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab
/* eslint-disable no-console -- local dev server uses console for startup/request logging */

import * as http from "http";
import { analyzeHandler, variantsHandler, healthHandler } from "./handler";
import { logger } from "./logger";
import { createResponse } from "./validation";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const PORT = process.env.PORT || 8080;

const LOCAL_ROUTES = [
  { match: (p: string, m: string): boolean => p.endsWith("/analyze") && m === "POST", handler: analyzeHandler },
  { match: (p: string, m: string): boolean => p.endsWith("/variants") && m === "POST", handler: variantsHandler },
  { match: (p: string, _m: string): boolean => p.endsWith("/health") || p === "/", handler: (_e: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => Promise.resolve(healthHandler()) },
];

function createIdentity(): APIGatewayProxyEvent["requestContext"]["identity"] {
  return {
    accessKey: null, accountId: null, apiKey: null, apiKeyId: null,
    caller: null, clientCert: null, cognitoAuthenticationProvider: null,
    cognitoAuthenticationType: null, cognitoIdentityId: null,
    cognitoIdentityPoolId: null, principalOrgId: null,
    sourceIp: "127.0.0.1", user: null, userAgent: "local-server", userArn: null,
  };
}

function createRequestContext(path: string, method: string): APIGatewayProxyEvent["requestContext"] {
  return {
    accountId: "", apiId: "", authorizer: null,
    httpMethod: method, identity: createIdentity(),
    path, protocol: "HTTP/1.1", requestId: "local",
    requestTimeEpoch: Date.now(), resourceId: "", resourcePath: path, stage: "local",
  };
}

function createEvent(body: string, path: string, method: string): APIGatewayProxyEvent {
  return {
    body, headers: {}, multiValueHeaders: {},
    httpMethod: method, isBase64Encoded: false, path,
    pathParameters: null, queryStringParameters: null,
    multiValueQueryStringParameters: null, stageVariables: null,
    requestContext: createRequestContext(path, method), resource: "",
  };
}

function setCorsHeaders(res: http.ServerResponse): void {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
    req.on("end", () => { resolve(body); });
  });
}

async function routeRequest(path: string, method: string, body: string): Promise<APIGatewayProxyResult> {
  const event = createEvent(body, path, method);
  const route = LOCAL_ROUTES.find((r) => r.match(path, method));
  if (route) {return route.handler(event);}
  console.log(`[404] Path not found: ${path}`);
  return createResponse(404, { error: "Not found", path, method });
}

function sendResult(res: http.ServerResponse, result: APIGatewayProxyResult): void {
  res.writeHead(result.statusCode);
  res.end(result.body);
}

async function processRequest(req: http.IncomingMessage, res: http.ServerResponse, route: { path: string; method: string }): Promise<void> {
  try {
    const body = await readBody(req);
    sendResult(res, await routeRequest(route.path, route.method, body));
  } catch (error) {
    logger.error(`${error}`);
    sendResult(res, createResponse(500, { error: String(error) }));
  }
}

async function handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  setCorsHeaders(res);
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  const method = req.method || "GET";
  console.log(`[REQUEST] ${method} ${url.pathname} (raw: ${req.url})`);
  if (method === "OPTIONS") { res.writeHead(200); res.end(); return; }
  return processRequest(req, res, { path: url.pathname, method });
}

const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse): void => { void handleRequest(req, res); },
);

server.listen(PORT, () => {
  console.info(`Vabamorf API running on http://localhost:${PORT}`);
  console.info("Endpoints: POST /analyze, POST /variants, GET /health");
});
/* eslint-enable no-console -- end local dev server */
