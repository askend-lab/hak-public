// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import { createLogger } from "@hak/shared";

import { loadConfig, validateConfig } from "./env";
import { runWorker } from "./worker";

const logger = createLogger("info");

const config = loadConfig();
const missing = validateConfig(config);

if (missing.length > 0) {
  logger.error("Missing required environment variables:");
  for (const name of missing) {
    logger.error(`  ${name}: MISSING`);
  }
  process.exit(1);
}

const sqsClient = new SQSClient({});
const s3Client = new S3Client({});

const abortController = new AbortController();

process.on("SIGTERM", () => {
  logger.info("Received SIGTERM, shutting down...");
  abortController.abort();
});

process.on("SIGINT", () => {
  logger.info("Received SIGINT, shutting down...");
  abortController.abort();
});

runWorker(sqsClient, s3Client, config, abortController.signal)
  .then(() => {
    logger.info("Worker finished");
    process.exit(0);
  })
  .catch((error: unknown) => {
    logger.error("Worker failed:", error);
    process.exit(1);
  });
