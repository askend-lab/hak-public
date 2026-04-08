// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { cognitoConfig } from "./config";

describe("cognitoConfig", () => {
  it("should have required Cognito properties", () => {
    expect(cognitoConfig.region).toBeDefined();
    expect(typeof cognitoConfig.userPoolId).toBe("string");
    expect(typeof cognitoConfig.clientId).toBe("string");
    expect(typeof cognitoConfig.domain).toBe("string");
  });

  it("should use dev defaults on localhost when env vars are not set", () => {
    expect(cognitoConfig.region).toBe("eu-west-1");
    expect(cognitoConfig.userPoolId).toBe("eu-west-1_wlRtuLkG2");
    expect(cognitoConfig.clientId).toBe("64tf6nf61n6sgftqif6q975hka");
    expect(cognitoConfig.domain).toBe("askend-lab-auth.auth.eu-west-1.amazoncognito.com");
  });

  it("should have exact OAuth scopes", () => {
    expect(cognitoConfig.scopes).toStrictEqual(["email", "openid", "profile"]);
  });

  it("should have redirect URIs configured", () => {
    expect(cognitoConfig.redirectUri).toBeDefined();
    expect(cognitoConfig.logoutUri).toBeDefined();
  });

});
