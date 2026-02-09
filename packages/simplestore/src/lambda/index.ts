// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Lambda module exports
 */

export { handler, setAdapter } from "./handler";
export {
  handleSave,
  handleGet,
  handleDelete,
  handleQuery,
  createResponse,
  HTTP_STATUS,
  HTTP_ERRORS,
} from "./routes";
