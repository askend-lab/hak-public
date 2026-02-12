// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Lambda module exports
 */

export { handler, setAdapter } from "./handler";
export {
  handleSave,
  handleGet,
  handleGetPublic,
  handleDelete,
  handleQuery,
  handleDebugError,
  createResponse,
  HTTP_STATUS,
  HTTP_ERRORS,
} from "./routes";
