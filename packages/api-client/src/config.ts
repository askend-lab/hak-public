// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export type Environment = "dev" | "prod";

export interface ApiUrls {
  merlin: string;
  vabamorf: string;
  simplestore: string;
  frontend: string;
}

const URLS: Record<Environment, ApiUrls> = {
  dev: {
    merlin: "https://merlin-dev.askend-lab.com",
    vabamorf: "https://vabamorf-dev.askend-lab.com",
    simplestore: "https://hak-api-dev.askend-lab.com",
    frontend: "https://hak-dev.askend-lab.com",
  },
  prod: {
    merlin: "https://merlin-prod.askend-lab.com",
    vabamorf: "https://vabamorf.askend-lab.com",
    simplestore: "https://hak-api.askend-lab.com",
    frontend: "https://hak.askend-lab.com",
  },
};

export function getUrls(env: Environment = "dev"): ApiUrls {
  return URLS[env];
}
