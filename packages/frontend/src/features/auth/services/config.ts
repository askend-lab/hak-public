// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { generateCodeVerifier, generateCodeChallenge } from "./pkce";
import { logger } from "@hak/shared";

const LOCAL_PORT = import.meta.env?.VITE_PORT ?? "5181";

export const CONTENT_TYPE_FORM = "application/x-www-form-urlencoded";
export const TARA_LOGIN_URL = import.meta.env?.VITE_TARA_LOGIN_URL ?? "";
export const AUTH_API_URL = import.meta.env?.VITE_AUTH_API_URL ?? "";
export const PKCE_STORAGE_KEY = "pkce_code_verifier";
export const OAUTH2_TOKEN_PATH = "/oauth2/token";
export const AUTH_CALLBACK_PATH = "/auth/callback";

export function getHostname(): string {
  return typeof window !== "undefined"
    ? window.location.hostname
    : "localhost";
}

export function getBaseUrl(hostname: string = getHostname()): string {
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `http://localhost:${LOCAL_PORT}`;
  }
  return `https://${hostname}`;
}

export function getRedirectUri(hostname: string = getHostname()): string {
  return `${getBaseUrl(hostname)}${AUTH_CALLBACK_PATH}`;
}

export function getLogoutUri(hostname: string = getHostname()): string {
  return getBaseUrl(hostname);
}

/**
 * PUBLIC OAuth Configuration
 *
 * These values are intentionally public (like OAuth client_id).
 * Security is ensured by:
 * - Cognito redirect URI whitelist
 * - PKCE flow (code_verifier never leaves client)
 * - No client_secret on frontend
 *
 * @see https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-idp-settings.html
 */
export const cognitoConfig = {
  region: import.meta.env?.VITE_COGNITO_REGION ?? "",
  userPoolId: import.meta.env?.VITE_COGNITO_USER_POOL_ID ?? "",
  clientId: import.meta.env?.VITE_COGNITO_CLIENT_ID ?? "",
  domain: import.meta.env?.VITE_COGNITO_DOMAIN ?? "",

  get redirectUri(): string {
    return getRedirectUri();
  },

  get logoutUri(): string {
    return getLogoutUri();
  },

  scopes: ["email", "openid", "profile"],
};

export async function getLoginUrl(): Promise<string> {
  const codeVerifier = generateCodeVerifier();
  sessionStorage.setItem(PKCE_STORAGE_KEY, codeVerifier);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const params = new URLSearchParams({
    client_id: cognitoConfig.clientId,
    response_type: "code",
    scope: cognitoConfig.scopes.join(" "),
    redirect_uri: cognitoConfig.redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `https://${cognitoConfig.domain}/login?${params.toString()}`;
}

export function getLogoutUrl(): string {
  const params = new URLSearchParams({
    client_id: cognitoConfig.clientId,
    logout_uri: cognitoConfig.logoutUri,
  });
  return `https://${cognitoConfig.domain}/logout?${params.toString()}`;
}

export function getTaraLoginUrl(): string {
  return TARA_LOGIN_URL;
}

export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  idToken: string;
  expiresIn: number;
} | null> {
  const codeVerifier = sessionStorage.getItem(PKCE_STORAGE_KEY);
  if (!codeVerifier) {
    logger.error("[Auth] Missing PKCE code verifier");
    return null;
  }

  try {
    // Exchange code via backend — refresh token is set as httpOnly cookie
    const response = await fetch(
      `${AUTH_API_URL}/tara/exchange-code`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code,
          code_verifier: codeVerifier,
          redirect_uri: cognitoConfig.redirectUri,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.text();
      logger.error(
        "[Auth] Token exchange failed:",
        response.status,
        errorData,
      );
      return null;
    }

    const data = await response.json();
    sessionStorage.removeItem(PKCE_STORAGE_KEY);

    return {
      accessToken: data.access_token,
      idToken: data.id_token,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    logger.error("[Auth] Token exchange error:", error);
    return null;
  }
}
