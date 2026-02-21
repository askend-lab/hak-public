// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import * as http from "http";
import { analyzeHandler, variantsHandler, healthHandler } from "./handler";
import { createResponse } from "./validation";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const PORT = process.env.PORT || 8080;

const LOCAL_ROUTES = [
  { match: (p: string, m: string): boolean => p.endsWith("/analyze") && m === "POST", handler: analyzeHandler },
  { match: (p: string, m: string): boolean => p.endsWith("/variants") && m === "POST", handler: variantsHandler },
  { match: (p: string, _m: string): boolean => p.endsWith("/health") || p === "/", handler: (_e: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => Promise.resolve(healthHandler()) },
];

function createEvent(
  body: string,
  path: string,
  method: string,
): APIGatewayProxyEvent {
  const identity: APIGatewayProxyEvent["requestContext"]["identity"] = {
    accessKey: null, accountId: null, apiKey: null, apiKeyId: null,
    caller: null, clientCert: null, cognitoAuthenticationProvider: null,
    cognitoAuthenticationType: null, cognitoIdentityId: null,
    cognitoIdentityPoolId: null, principalOrgId: null,
    sourceIp: "127.0.0.1", user: null, userAgent: "local-server", userArn: null,
  };
  const requestContext: APIGatewayProxyEvent["requestContext"] = {
    accountId: "", apiId: "", authorizer: null,
    httpMethod: method, identity,
    path, protocol: "HTTP/1.1", requestId: "local",
    requestTimeEpoch: Date.now(), resourceId: "", resourcePath: path, stage: "local",
  };
  return {
    body,
    headers: {},
    multiValueHeaders: {},
    httpMethod: method,
    isBase64Encoded: false,
    path,
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext,
    resource: "",
  };
}

const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse): void => { void (async (): Promise<void> => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Parse URL to get path without query string
    const url = new URL(req.url || "/", `http://localhost:${PORT}`);
    const path = url.pathname;

    const method = req.method || "GET";
    console.log(`[REQUEST] ${method} ${path} (raw: ${req.url})`);

    if (method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }
    let body = "";
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on("end", (): void => { void (async (): Promise<void> => {
      const event = createEvent(body, path, method);
      let result;

      try {
        const route = LOCAL_ROUTES.find((r) => r.match(path, method));
        if (route) {
          result = await route.handler(event);
        } else {
          console.log(`[404] Path not found: ${path}`);
          result = createResponse(404, { error: "Not found", path, method: req.method });
        }
      } catch (error) {
        console.error(`[ERROR] ${error}`);
        result = createResponse(500, { error: String(error) });
      }

      res.writeHead(result.statusCode);
      res.end(result.body);
    })(); });
  })(); },
);

server.listen(PORT, () => {
  console.info(`Vabamorf API running on http://localhost:${PORT}`);
  console.info("Endpoints: POST /analyze, POST /variants, GET /health");
});
