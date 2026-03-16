// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { APIGatewayProxyEvent } from 'aws-lambda';
import { CORS_HEADERS, getCorsOrigin } from '@hak/shared';
import * as crypto from 'crypto';
import { getFrontendUrl } from './cookies';

export const AUTH_CALLBACK_PATH = '/auth/callback';
export const RANDOM_STRING_LENGTH = 32;
export const MAX_BODY_SIZE = 4096; // 4KB — auth requests are small JSON payloads

export function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString('base64url').substring(0, length);
}

export function corsResponseHeaders(): Record<string, string> {
  return {
    ...CORS_HEADERS,
    'Access-Control-Allow-Origin': getCorsOrigin(),
    'Access-Control-Allow-Credentials': 'true',
  };
}

export function validateCsrfOrigin(event: APIGatewayProxyEvent): boolean {
  const origin = event.headers.Origin || event.headers.origin;
  if (!origin) return false;
  const expected = getFrontendUrl();
  return origin === expected;
}

export function requireCognitoConfig(): { cognitoDomain: string; clientId: string } {
  const cognitoDomain = process.env.COGNITO_DOMAIN;
  const clientId = process.env.COGNITO_CLIENT_ID;
  if (!cognitoDomain || !clientId) {
    throw new Error('COGNITO_DOMAIN and COGNITO_CLIENT_ID must be set');
  }
  return { cognitoDomain, clientId };
}
