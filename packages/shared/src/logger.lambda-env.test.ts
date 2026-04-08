// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


describe("logger: Lambda and env", () => {
  const mockConsole = {
    debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
    info: vi.spyOn(console, "info").mockImplementation(() => {}),
    warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
    error: vi.spyOn(console, "error").mockImplementation(() => {}),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe("JSON output in Lambda environment", () => {
    const originalLambda = process.env.AWS_LAMBDA_FUNCTION_NAME;

    afterEach(() => {
      if (originalLambda === undefined) {
        delete process.env.AWS_LAMBDA_FUNCTION_NAME;
      } else {
        process.env.AWS_LAMBDA_FUNCTION_NAME = originalLambda;
      }
      vi.resetModules();
    });

    it("outputs JSON when AWS_LAMBDA_FUNCTION_NAME is set", async () => {
      process.env.AWS_LAMBDA_FUNCTION_NAME = "my-function";
      vi.resetModules();
      const mod = await import("./logger");
      const log = mod.createLogger("info");
      log.info("json-test");

      const output = mockConsole.info.mock.calls[0]?.[0] as string;
      const parsed = JSON.parse(output);
      expect(parsed).toMatchObject({
        level: "info",
        message: "json-test",
      });
      expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("includes context fields in JSON output", async () => {
      process.env.AWS_LAMBDA_FUNCTION_NAME = "my-function";
      vi.resetModules();
      const mod = await import("./logger");
      const log = mod.createLogger("info").withContext({ requestId: "req-abc" });
      log.info("ctx-test");

      const parsed = JSON.parse(mockConsole.info.mock.calls[0]?.[0] as string);
      expect(parsed).toMatchObject({
        level: "info",
        message: "ctx-test",
        requestId: "req-abc",
      });
    });

    it("includes extra args as data field in JSON output", async () => {
      process.env.AWS_LAMBDA_FUNCTION_NAME = "my-function";
      vi.resetModules();
      const mod = await import("./logger");
      const log = mod.createLogger("info");
      log.error("fail", "extra-detail");

      const parsed = JSON.parse(mockConsole.error.mock.calls[0]?.[0] as string);
      expect(parsed).toMatchObject({
        level: "error",
        message: "fail",
        data: "extra-detail",
      });
    });

    it("outputs plain text when AWS_LAMBDA_FUNCTION_NAME is not set", async () => {
      delete process.env.AWS_LAMBDA_FUNCTION_NAME;
      vi.resetModules();
      const mod = await import("./logger");
      const log = mod.createLogger("info");
      log.info("plain-test");

      const output = mockConsole.info.mock.calls[0]?.[0] as string;
      expect(output).toContain("[INFO] plain-test");
      // Should NOT be valid JSON
      expect(() => JSON.parse(output)).toThrow();
    });
  });

  describe("LOG_LEVEL env detection", () => {
    const originalLogLevel = process.env.LOG_LEVEL;

    afterEach(() => {
      if (originalLogLevel === undefined) {
        delete process.env.LOG_LEVEL;
      } else {
        process.env.LOG_LEVEL = originalLogLevel;
      }
      vi.resetModules();
    });

    it("uses LOG_LEVEL env when set to valid level", async () => {
      process.env.LOG_LEVEL = "debug";
      vi.resetModules();
      const mod = await import("./logger");
      const log = mod.logger;
      log.debug("env-test");
      expect(mockConsole.debug).toHaveBeenCalled();
    });

    it("falls back to info when LOG_LEVEL is invalid", async () => {
      process.env.LOG_LEVEL = "verbose";
      vi.resetModules();
      const mod = await import("./logger");
      const log = mod.logger;
      log.debug("should-not-appear");
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    it("uses warn level from env", async () => {
      process.env.LOG_LEVEL = "warn";
      vi.resetModules();
      const mod = await import("./logger");
      mod.logger.info("should-not-appear");
      mod.logger.warn("should-appear");
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalled();
    });

    it("uses error level from env", async () => {
      process.env.LOG_LEVEL = "error";
      vi.resetModules();
      const mod = await import("./logger");
      mod.logger.warn("should-not-appear");
      mod.logger.error("should-appear");
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalled();
    });
  });

});
