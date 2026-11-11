// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export type Environment = "dev" | "prod";

export interface ApiUrls {
  merlin: string;
  vabamorf: string;
  simplestore: string;
  auth: string;
  frontend: string;
}

const CF_DEV = "https://hak-dev.askend-lab.com";
const CF_PROD = "https://hak.askend-lab.com";

const URLS: Record<Environment, ApiUrls> = {
  dev: {
    merlin: `${CF_DEV}/api`,
    vabamorf: CF_DEV,
    simplestore: CF_DEV,
    auth: CF_DEV,
    frontend: CF_DEV,
  },
  prod: {
    merlin: `${CF_PROD}/api`,
    vabamorf: CF_PROD,
    simplestore: CF_PROD,
    auth: CF_PROD,
    frontend: CF_PROD,
  },
};

export function getUrls(env?: Environment): ApiUrls {
  const resolved = env ?? (process.env.SMOKE_ENV as Environment) ?? "dev";
  return URLS[resolved];
}
