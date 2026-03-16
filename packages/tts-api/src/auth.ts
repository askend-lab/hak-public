// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { logger } from "@hak/shared";

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getCognitoConfig(): { userPoolId: string; clientId: string; region: string } {
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.COGNITO_CLIENT_ID;
  const region = process.env.AWS_REGION ?? "eu-west-1";
  if (!userPoolId || !clientId) {
    throw new Error("Missing COGNITO_USER_POOL_ID or COGNITO_CLIENT_ID");
  }
  return { userPoolId, clientId, region };
}

function getJWKS(): ReturnType<typeof createRemoteJWKSet> {
  if (!jwks) {
    const { userPoolId, region } = getCognitoConfig();
    const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
    jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
  }
  return jwks;
}

function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader?.startsWith("Bearer ")) {return null;}
  return authHeader.slice(7);
}

export async function verifyAuthToken(authorizationHeader?: string): Promise<JWTPayload | null> {
  const token = extractBearerToken(authorizationHeader);
  if (!token) {return null;}

  try {
    const { userPoolId, clientId, region } = getCognitoConfig();
    const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
    const { payload } = await jwtVerify(token, getJWKS(), {
      issuer,
      audience: clientId,
    });
    return payload;
  } catch (error) {
    logger.warn("JWT verification failed", error);
    return null;
  }
}
