// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Regression guard: ensures serverless.yml IAM role includes all DynamoDB
 * actions required by the DynamoDBAdapter.
 *
 * The adapter uses PutCommand, GetCommand, DeleteCommand, QueryCommand, and
 * UpdateCommand.  Each needs a matching `dynamodb:<Action>` IAM permission.
 * A missing permission (e.g. UpdateItem) causes AccessDeniedException at
 * runtime, which is hard to catch without this check.
 */

import * as fs from "fs";
import * as path from "path";

const SERVERLESS_PATH = path.resolve(__dirname, "..", "serverless.yml");

// Every DynamoDB action the adapter relies on
const REQUIRED_ACTIONS = [
  "dynamodb:PutItem",
  "dynamodb:GetItem",
  "dynamodb:DeleteItem",
  "dynamodb:Query",
  "dynamodb:UpdateItem",
] as const;

describe("serverless.yml IAM permissions", () => {
  const content = fs.readFileSync(SERVERLESS_PATH, "utf8");

  it.each(REQUIRED_ACTIONS)(
    "grants %s to the Lambda role",
    (action) => {
      expect(content).toContain(action);
    },
  );
});
