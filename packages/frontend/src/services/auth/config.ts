// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

const LOCAL_PORT = import.meta.env.VITE_PORT ?? "5181";

function getBaseUrl(
  hostname: string = typeof window !== "undefined"
    ? window.location.hostname
    : "localhost",
): string {
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `http://localhost:${LOCAL_PORT}`;
  }
  return `https://${hostname}`;
}

export function getRedirectUri(
  hostname: string = typeof window !== "undefined"
    ? window.location.hostname
    : "localhost",
): string {
  return `${getBaseUrl(hostname)}/auth/callback`;
}

export function getLogoutUri(
  hostname: string = typeof window !== "undefined"
    ? window.location.hostname
    : "localhost",
): string {
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
  region: import.meta.env.VITE_COGNITO_REGION ?? "eu-west-1",
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID ?? "eu-west-1_wlRtuLkG2",
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID ?? "64tf6nf61n6sgftqif6q975hka",
  domain: import.meta.env.VITE_COGNITO_DOMAIN ?? "askend-lab-auth.auth.eu-west-1.amazoncognito.com",

  get redirectUri(): string {
    return getRedirectUri();
  },

  get logoutUri(): string {
    return getLogoutUri();
  },

  scopes: ["email", "openid", "profile"],
};

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function getLoginUrl(): Promise<string> {
  const codeVerifier = generateCodeVerifier();
  sessionStorage.setItem("pkce_code_verifier", codeVerifier);
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
  return "/auth/tara/start";
}

export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
} | null> {
  const codeVerifier = sessionStorage.getItem("pkce_code_verifier");
  if (!codeVerifier) {
    console.error("[Auth] Missing PKCE code verifier");
    return null;
  }

  const requestBody = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: cognitoConfig.clientId,
    code,
    redirect_uri: cognitoConfig.redirectUri,
    code_verifier: codeVerifier,
  });

  try {
    const response = await fetch(
      `https://${cognitoConfig.domain}/oauth2/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: requestBody,
      },
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error(
        "[Auth] Token exchange failed:",
        response.status,
        errorData,
      );
      return null;
    }

    const data = await response.json();
    sessionStorage.removeItem("pkce_code_verifier");

    return {
      accessToken: data.access_token,
      idToken: data.id_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    console.error("[Auth] Token exchange error:", error);
    return null;
  }
}
