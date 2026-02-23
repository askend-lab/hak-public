// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { createLogger, logger } from "./logger";

describe("logger", () => {
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

  describe("createLogger", () => {
    it("logs info messages by default", () => {
      const log = createLogger();
      log.info("test message");
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining("[INFO] test message"),
      );
    });

    it("respects minLevel - filters debug when minLevel is info", () => {
      const log = createLogger("info");
      log.debug("debug message");
      log.info("info message");
      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalled();
    });

    it("logs all levels when minLevel is debug", () => {
      const log = createLogger("debug");
      log.debug("debug");
      log.info("info");
      log.warn("warn");
      log.error("error");
      expect(mockConsole.debug).toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it("only logs error when minLevel is error", () => {
      const log = createLogger("error");
      log.debug("debug");
      log.info("info");
      log.warn("warn");
      log.error("error");
      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it("includes timestamp in log message", () => {
      const log = createLogger("info");
      log.info("test");
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
      );
    });

    it("passes additional arguments to console", () => {
      const log = createLogger("info");
      const extra = { key: "value" };
      log.info("test", extra);
      expect(mockConsole.info).toHaveBeenCalledWith(expect.any(String), extra);
    });
  });

  describe("default logger", () => {
    it("is exported and functional", () => {
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe("function");
    });
  });

  describe("log level filtering", () => {
    it("logs warn at warn level", () => {
      const log = createLogger("warn");
      log.warn("warning");
      expect(mockConsole.warn).toHaveBeenCalledWith(expect.stringContaining("[WARN] warning"));
    });

    it("error always logs at error level", () => {
      const log = createLogger("error");
      log.error("error msg");
      expect(mockConsole.error).toHaveBeenCalledWith(expect.stringContaining("[ERROR] error msg"));
    });

    it("debug includes DEBUG in message", () => {
      const log = createLogger("debug");
      log.debug("debug msg");
      expect(mockConsole.debug).toHaveBeenCalledWith(expect.stringContaining("[DEBUG]"));
    });
  });

  describe("withContext", () => {
    it("returns a new logger that includes context fields in plain text mode", () => {
      const log = createLogger("info").withContext({ requestId: "req-123" });
      log.info("test");
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining("[INFO] test"),
        expect.objectContaining({ requestId: "req-123" }),
      );
    });

    it("merges context fields from multiple withContext calls", () => {
      const log = createLogger("info")
        .withContext({ requestId: "req-1" })
        .withContext({ userId: "user-1" });
      log.info("test");
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ requestId: "req-1", userId: "user-1" }),
      );
    });

    it("preserves log level filtering", () => {
      const log = createLogger("warn").withContext({ pkg: "test" });
      log.info("should-not-appear");
      log.warn("should-appear");
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalled();
    });

    it("does not mutate the parent logger", () => {
      const parent = createLogger("info");
      parent.withContext({ extra: true });
      parent.info("parent-test");
      // Parent should not include context — only 1 arg (the formatted string)
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining("[INFO] parent-test"),
      );
    });
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
