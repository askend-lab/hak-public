// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import * as http from "http";
import { analyzeHandler, variantsHandler, healthHandler } from "./handler";
import { APIGatewayProxyEvent } from "aws-lambda";

const PORT = process.env.PORT || 8080;

function createEvent(
  body: string,
  path: string,
  method: string,
): APIGatewayProxyEvent {
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
    requestContext: {} as APIGatewayProxyEvent["requestContext"],
    resource: "",
  };
}

const server = http.createServer(
  async (req: http.IncomingMessage, res: http.ServerResponse) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Parse URL to get path without query string
    const url = new URL(req.url || "/", `http://localhost:${PORT}`);
    const path = url.pathname;

    console.info(`[REQUEST] ${req.method} ${path} (raw: ${req.url})`);

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    let body = "";
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      const event = createEvent(body, path, req.method || "GET");
      let result;

      try {
        // Flexible path matching (handles with/without trailing slash, stage prefixes)
        if (path.endsWith("/analyze") && req.method === "POST") {
          result = await analyzeHandler(event);
        } else if (path.endsWith("/variants") && req.method === "POST") {
          result = await variantsHandler(event);
        } else if (path.endsWith("/health") || path === "/") {
          result = healthHandler();
        } else {
          console.warn(`[404] Path not found: ${path}`);
          result = {
            statusCode: 404,
            body: JSON.stringify({
              error: "Not found",
              path,
              method: req.method,
            }),
          };
        }
      } catch (error) {
        console.error(`[ERROR] ${error}`);
        result = {
          statusCode: 500,
          body: JSON.stringify({ error: String(error) }),
        };
      }

      res.writeHead(result.statusCode);
      res.end(result.body);
    });
  },
);

server.listen(PORT, () => {
  console.info(`Vabamorf API running on http://localhost:${PORT}`);
  console.info("Endpoints: POST /analyze, POST /variants, GET /health");
});
