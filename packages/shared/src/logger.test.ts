// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { createLogger, logger } from "./logger";

describe("logger", () => {
  const mockConsole = {
    debug: jest.spyOn(console, "debug").mockImplementation(),
    info: jest.spyOn(console, "info").mockImplementation(),
    warn: jest.spyOn(console, "warn").mockImplementation(),
    error: jest.spyOn(console, "error").mockImplementation(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
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

  describe("LOG_LEVEL env detection", () => {
    const originalLogLevel = process.env.LOG_LEVEL;

    afterEach(() => {
      if (originalLogLevel === undefined) {
        delete process.env.LOG_LEVEL;
      } else {
        process.env.LOG_LEVEL = originalLogLevel;
      }
      jest.resetModules();
    });

    it("uses LOG_LEVEL env when set to valid level", async () => {
      process.env.LOG_LEVEL = "debug";
      jest.resetModules();
      const mod = await import("./logger");
      const log = mod.logger;
      log.debug("env-test");
      expect(mockConsole.debug).toHaveBeenCalled();
    });

    it("falls back to info when LOG_LEVEL is invalid", async () => {
      process.env.LOG_LEVEL = "verbose";
      jest.resetModules();
      const mod = await import("./logger");
      const log = mod.logger;
      log.debug("should-not-appear");
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    it("uses warn level from env", async () => {
      process.env.LOG_LEVEL = "warn";
      jest.resetModules();
      const mod = await import("./logger");
      mod.logger.info("should-not-appear");
      mod.logger.warn("should-appear");
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalled();
    });

    it("uses error level from env", async () => {
      process.env.LOG_LEVEL = "error";
      jest.resetModules();
      const mod = await import("./logger");
      mod.logger.warn("should-not-appear");
      mod.logger.error("should-appear");
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalled();
    });
  });
});
