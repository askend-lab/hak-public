/**
 * Cucumber Test Setup
 *
 * Provides:
 * - JSDOM environment for React rendering
 * - TestWorld class with rendering helpers
 * - Before/After hooks for test isolation
 * - InMemoryStore adapter for each scenario
 */

import { setWorldConstructor, World, Before, After } from "@cucumber/cucumber";
import { JSDOM } from "jsdom";
import { InMemoryAdapter, setAdapter } from "simplestore";
import {
  render,
  cleanup,
  fireEvent,
  waitFor,
  RenderResult,
} from "@testing-library/react";
import { createElement } from "react";
import { MemoryRouter } from "react-router-dom";
import App from "../../App";
import { AuthProvider } from "../../services/auth";
import { NotificationProvider } from "../../contexts/NotificationContext";
import { OnboardingProvider } from "../../contexts/OnboardingContext";

// Setup jsdom
(global as unknown as Record<string, unknown>).import = {
  meta: { env: { PROD: false, DEV: true } },
};

const dom = new JSDOM(
  '<!DOCTYPE html><html><body><div id="root"></div></body></html>',
  {
    url: "http://localhost:3000",
    pretendToBeVisual: true,
  },
);

// Polyfill requestAnimationFrame for BaseModal and other components
const rafPolyfill = (callback: FrameRequestCallback): number => {
  return setTimeout(() => callback(Date.now()), 16) as unknown as number;
};
const cafPolyfill = (id: number): void => {
  clearTimeout(id);
};

if (!dom.window.requestAnimationFrame) {
  dom.window.requestAnimationFrame = rafPolyfill;
}
if (!dom.window.cancelAnimationFrame) {
  dom.window.cancelAnimationFrame = cafPolyfill;
}

// Set globals
Object.assign(global, {
  localStorage: dom.window.localStorage,
  sessionStorage: dom.window.sessionStorage,
  window: dom.window,
  document: dom.window.document,
  navigator: dom.window.navigator,
  HTMLElement: dom.window.HTMLElement,
  Element: dom.window.Element,
  Node: dom.window.Node,
  Text: dom.window.Text,
  DocumentFragment: dom.window.DocumentFragment,
  KeyboardEvent: dom.window.KeyboardEvent,
  MouseEvent: dom.window.MouseEvent,
  Event: dom.window.Event,
  requestAnimationFrame: rafPolyfill,
  cancelAnimationFrame: cafPolyfill,
});

// Polyfill attachEvent/detachEvent for React DOM compatibility
const htmlProto = global.window.HTMLElement.prototype as HTMLElement & {
  attachEvent?: unknown;
  detachEvent?: unknown;
};
if (!htmlProto.attachEvent) {
  htmlProto.attachEvent = function (
    event: string,
    handler: EventListener,
  ): void {
    this.addEventListener(event.replace(/^on/, ""), handler);
  };
}
if (!htmlProto.detachEvent) {
  htmlProto.detachEvent = function (
    event: string,
    handler: EventListener,
  ): void {
    this.removeEventListener(event.replace(/^on/, ""), handler);
  };
}

// Mock matchMedia
Object.defineProperty(global.window, "matchMedia", {
  writable: true,
  value: (): MediaQueryList => ({
    matches: false,
    media: "",
    onchange: null,
    addListener: (): void => {},
    removeListener: (): void => {},
    addEventListener: (): void => {},
    removeEventListener: (): void => {},
    dispatchEvent: (): boolean => false,
  }),
});

// Mock fetch for API calls
global.fetch = async (
  input: RequestInfo | URL,
  _init?: RequestInit,
): Promise<Response> => {
  let url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

  if (url.startsWith("/")) {
    url = `http://localhost:3000${url}`;
  }

  // Return mock response for API calls
  if (url.includes("/api/")) {
    return new Response(JSON.stringify({ items: [], tasks: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("{}", { status: 200 });
};

/**
 * Custom World for Cucumber tests with React rendering
 */
export class TestWorld extends World {
  private _renderResult: RenderResult | null = null;

  get container(): Element | undefined {
    return this._renderResult?.container;
  }

  renderApp(): void {
    const element = createElement(
      NotificationProvider,
      null,
      createElement(
        AuthProvider,
        null,
        createElement(
          OnboardingProvider,
          null,
          createElement(
            MemoryRouter,
            { initialEntries: ["/synthesis"] },
            createElement(App),
          ),
        ),
      ),
    );

    this._renderResult = render(element);
  }

  click(element: Element): void {
    (element as HTMLElement).focus?.();
    fireEvent.click(element);
  }

  type(element: Element, text: string): void {
    const input = element as HTMLInputElement;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value",
    )?.set;

    if (element.tagName === "TEXTAREA" && nativeTextAreaValueSetter) {
      nativeTextAreaValueSetter.call(element, text);
    } else if (nativeInputValueSetter) {
      nativeInputValueSetter.call(element, text);
    } else {
      input.value = text;
    }

    fireEvent.input(element, { target: { value: text }, bubbles: true });
    fireEvent.change(element, { target: { value: text }, bubbles: true });
  }

  async waitFor<T>(callback: () => T): Promise<T> {
    return waitFor(callback);
  }

  getByText(text: string): Element | null {
    try {
      return this._renderResult?.getByText(text) || null;
    } catch {
      // Multiple elements found - return first one
      const elements = this._renderResult?.queryAllByText(text);
      return elements?.[0] || null;
    }
  }

  queryByText(text: string): Element | null {
    try {
      return this._renderResult?.queryByText(text) || null;
    } catch {
      // Multiple elements found - return first one
      const elements = this._renderResult?.queryAllByText(text);
      return elements?.[0] || null;
    }
  }

  getByPlaceholder(placeholder: string): Element | null {
    try {
      return this._renderResult?.getByPlaceholderText(placeholder) || null;
    } catch {
      // Element not found - return null instead of throwing
      return (
        this.container?.querySelector(
          `[placeholder*="${placeholder.substring(0, 10)}"]`,
        ) || null
      );
    }
  }

  getByTestId(testId: string): Element | null {
    return this._renderResult?.getByTestId(testId) || null;
  }

  queryByTestId(testId: string): Element | null {
    return this._renderResult?.queryByTestId(testId) || null;
  }
}

setWorldConstructor(TestWorld);

// Setup isolated InMemoryStore before each scenario
Before(async function (): Promise<void> {
  setAdapter(new InMemoryAdapter());
  localStorage.clear();
  sessionStorage.clear();
});

// Cleanup after each scenario
After(async function (): Promise<void> {
  cleanup();
  setAdapter(null);
});
