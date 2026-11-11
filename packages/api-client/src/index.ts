// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export { MerlinClient } from "./clients/merlin";
export { VabamorfClient } from "./clients/vabamorf";
export { getUrls } from "./config";
export type { Environment, ApiUrls } from "./config";
export type {
  SynthesizeRequest,
  SynthesizeResponse,
  StatusResponse,
} from "./clients/merlin";
export type {
  AnalyzeRequest,
  AnalyzeResponse,
  VariantsRequest,
  VariantsResponse,
} from "./clients/vabamorf";
