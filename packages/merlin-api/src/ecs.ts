// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  ECSClient,
  UpdateServiceCommand,
  DescribeServicesCommand,
} from "@aws-sdk/client-ecs";
import { getAwsRegion, getEcsCluster, getEcsService } from "./env";

let _ecsClient: ECSClient | undefined;
function getEcsClient(): ECSClient {
  if (!_ecsClient) {
    _ecsClient = new ECSClient({ region: getAwsRegion() });
  }
  return _ecsClient;
}

export function isEcsConfigured(): boolean {
  return getEcsCluster() !== "" && getEcsService() !== "";
}

export interface EcsServiceState {
  desired: number;
  running: number;
}

export async function describeService(): Promise<EcsServiceState> {
  const result = await getEcsClient().send(
    new DescribeServicesCommand({
      cluster: getEcsCluster(),
      services: [getEcsService()],
    }),
  );

  return {
    desired: result.services?.[0]?.desiredCount ?? 0,
    running: result.services?.[0]?.runningCount ?? 0,
  };
}

export async function scaleService(desiredCount: number): Promise<void> {
  await getEcsClient().send(
    new UpdateServiceCommand({
      cluster: getEcsCluster(),
      service: getEcsService(),
      desiredCount,
    }),
  );
}
