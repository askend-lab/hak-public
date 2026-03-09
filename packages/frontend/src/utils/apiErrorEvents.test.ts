// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, afterEach } from "vitest";
import { dispatchApiError, getApiErrorDetail, checkApiErrorStatus, API_ERROR_EVENT } from "./apiErrorEvents";

describe("apiErrorEvents", () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it("dispatches rate-limit event with correct detail", () => {
    const handler = vi.fn();
    window.addEventListener(API_ERROR_EVENT, handler);
    dispatchApiError("rate-limit");
    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0]?.[0] as Event;
    const detail = getApiErrorDetail(event);
    expect(detail).toEqual({
      type: "rate-limit",
      message: "Liiga palju päringuid",
      description: "Proovi mõne hetke pärast uuesti.",
    });
    window.removeEventListener(API_ERROR_EVENT, handler);
  });

  it("dispatches service-busy event with correct detail", () => {
    const handler = vi.fn();
    window.addEventListener(API_ERROR_EVENT, handler);
    dispatchApiError("service-busy");
    const event = handler.mock.calls[0]?.[0] as Event;
    const detail = getApiErrorDetail(event);
    expect(detail).toEqual({
      type: "service-busy",
      message: "Teenus on ajutiselt ülekoormatud",
      description: "Proovi mõne hetke pärast uuesti.",
    });
    window.removeEventListener(API_ERROR_EVENT, handler);
  });

  it("dispatches synthesis-failed event with correct detail", () => {
    const handler = vi.fn();
    window.addEventListener(API_ERROR_EVENT, handler);
    dispatchApiError("synthesis-failed");
    const event = handler.mock.calls[0]?.[0] as Event;
    const detail = getApiErrorDetail(event);
    expect(detail).toEqual({
      type: "synthesis-failed",
      message: "Kõnesüntees ebaõnnestus",
      description: "Proovi uuesti.",
    });
    window.removeEventListener(API_ERROR_EVENT, handler);
  });

  it("dispatches blocked event with correct detail", () => {
    const handler = vi.fn();
    window.addEventListener(API_ERROR_EVENT, handler);
    dispatchApiError("blocked");
    const event = handler.mock.calls[0]?.[0] as Event;
    const detail = getApiErrorDetail(event);
    expect(detail).toEqual({
      type: "blocked",
      message: "Ligipääs keelatud",
      description: "Päring blokeeriti.",
    });
    window.removeEventListener(API_ERROR_EVENT, handler);
  });

  it("getApiErrorDetail returns null for non-CustomEvent", () => {
    expect(getApiErrorDetail(new Event("click"))).toBeNull();
  });
});

describe("checkApiErrorStatus", () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it("throws and dispatches blocked event on 403", () => {
    const handler = vi.fn();
    window.addEventListener(API_ERROR_EVENT, handler);
    expect(() => checkApiErrorStatus(403)).toThrow("Request blocked");
    const detail = getApiErrorDetail(handler.mock.calls[0]?.[0] as Event);
    expect(detail?.type).toBe("blocked");
    window.removeEventListener(API_ERROR_EVENT, handler);
  });

  it("throws and dispatches rate-limit event on 429", () => {
    const handler = vi.fn();
    window.addEventListener(API_ERROR_EVENT, handler);
    expect(() => checkApiErrorStatus(429)).toThrow("Rate limit exceeded");
    const detail = getApiErrorDetail(handler.mock.calls[0]?.[0] as Event);
    expect(detail?.type).toBe("rate-limit");
    window.removeEventListener(API_ERROR_EVENT, handler);
  });

  it("throws and dispatches service-busy event on 503", () => {
    const handler = vi.fn();
    window.addEventListener(API_ERROR_EVENT, handler);
    expect(() => checkApiErrorStatus(503)).toThrow("Service unavailable");
    const detail = getApiErrorDetail(handler.mock.calls[0]?.[0] as Event);
    expect(detail?.type).toBe("service-busy");
    window.removeEventListener(API_ERROR_EVENT, handler);
  });

  it("does not throw on 200", () => {
    expect(() => checkApiErrorStatus(200)).not.toThrow();
  });

  it("does not throw on 401 (handled separately)", () => {
    expect(() => checkApiErrorStatus(401)).not.toThrow();
  });
});
