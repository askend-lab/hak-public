// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { cognitoConfig, getLogoutUrl } from "./config";

describe("getLogoutUrl", () => {
  it("should return a URL to Cognito logout", () => {
    const url = getLogoutUrl();
    expect(url).toContain("/logout");
    expect(url).toContain(`https://${cognitoConfig.domain}`);
  });

  it("should include client_id and logout_uri", () => {
    const url = getLogoutUrl();
    expect(url).toContain("client_id=");
    expect(url).toContain("logout_uri=");
  });

});
