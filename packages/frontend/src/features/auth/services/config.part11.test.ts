// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { cognitoConfig, getLoginUrl, getLogoutUrl } from "./config";

describe("PKCE code verifier format", () => {
  it("should store base64url-safe verifier without +, /, or = chars", async () => {
    sessionStorage.clear();
    await getLoginUrl();
    const verifier = sessionStorage.getItem("pkce_code_verifier");
    expect(verifier).not.toBeNull();
    expect(verifier).not.toContain("+");
    expect(verifier).not.toContain("/");
    expect(verifier).not.toContain("=");
  });

  it("should generate login URL starting with https and containing /login", async () => {
    const url = await getLoginUrl();
    expect(url.startsWith(`https://${cognitoConfig.domain}/login?`)).toBe(true);
  });

  it("should generate logout URL starting with https and containing /logout", () => {
    const url = getLogoutUrl();
    expect(url.startsWith(`https://${cognitoConfig.domain}/logout?`)).toBe(true);
    expect(url).toContain(`client_id=${cognitoConfig.clientId}`);
  });

});
