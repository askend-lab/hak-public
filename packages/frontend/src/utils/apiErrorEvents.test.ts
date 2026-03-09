// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, afterEach } from "vitest";
import { dispatchApiError, getApiErrorDetail, API_ERROR_EVENT } from "./apiErrorEvents";

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
