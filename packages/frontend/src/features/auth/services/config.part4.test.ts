// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { cognitoConfig, getLoginUrl } from "./config";

describe("getLoginUrl", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("should return a URL to Cognito hosted UI", async () => {
    const url = await getLoginUrl();
    expect(url).toContain("/login");
    expect(url).toContain(`https://${cognitoConfig.domain}`);
  });

  it("should include required OAuth parameters", async () => {
    const url = await getLoginUrl();
    expect(url).toContain("client_id=");
    expect(url).toContain("response_type=code");
    expect(url).toContain("redirect_uri=");
    expect(url).toContain("code_challenge=");
    expect(url).toContain("code_challenge_method=S256");
    expect(url).toContain("scope=email+openid+profile");
  });

  it("should store PKCE code verifier in sessionStorage", async () => {
    await getLoginUrl();
    expect(sessionStorage.getItem("pkce_code_verifier")).not.toBeNull();
  });

});
