/**
 * Cucumber Test Setup
 * 
 * Provides:
 * - JSDOM environment for React rendering
 * - TestWorld class with rendering helpers
 * - Before/After hooks for test isolation
 * - InMemoryStore adapter for each scenario
 * 
 * @module setup
 */

import { setWorldConstructor, World, Before, After } from '@cucumber/cucumber';
import { JSDOM } from 'jsdom';
import { InMemoryAdapter, setAdapter } from 'simplestore';
import { render, cleanup, fireEvent, waitFor, RenderResult } from '@testing-library/react';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

// Setup jsdom
// Mock import.meta.env for Vite compatibility
(global as unknown as Record<string, unknown>).import = { meta: { env: { PROD: false, DEV: true } } };

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:3000',
  pretendToBeVisual: true,
});

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
});

// Polyfill attachEvent/detachEvent for React DOM compatibility in JSDOM
// These are old IE methods that React's focus management code may reference
const htmlProto = global.window.HTMLElement.prototype as HTMLElement & { attachEvent?: unknown; detachEvent?: unknown };
if (!htmlProto.attachEvent) {
  htmlProto.attachEvent = function(event: string, handler: EventListener): void {
    this.addEventListener(event.replace(/^on/, ''), handler);
  };
}
if (!htmlProto.detachEvent) {
  htmlProto.detachEvent = function(event: string, handler: EventListener): void {
    this.removeEventListener(event.replace(/^on/, ''), handler);
  };
}

// Mock matchMedia
Object.defineProperty(global.window, 'matchMedia', {
  writable: true,
  value: (): MediaQueryList => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: (): void => {},
    removeListener: (): void => {},
    addEventListener: (): void => {},
    removeEventListener: (): void => {},
    dispatchEvent: (): boolean => false,
  }),
});

// Mock fetch to handle relative URLs in JSDOM environment
const originalFetch = global.fetch;
global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  
  // Convert relative URLs to absolute for JSDOM
  if (url.startsWith('/')) {
    url = `http://localhost:3000${url}`;
  }
  
  // Return mock response for API calls to avoid actual network requests
  if (url.includes('/api/')) {
    return new Response(JSON.stringify({ items: [], tasks: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  return originalFetch(url, init);
};


/**
 * Custom World for Cucumber tests with React rendering
 */
export class TestWorld extends World {
  private _renderResult: RenderResult | null = null;

  /** Get the rendered container element */
  get container(): Element | undefined {
    return this._renderResult?.container;
  }

  async renderApp(initialPath = '/'): Promise<void> {
    const { default: App } = await import('../../App');
    const { AuthProvider } = await import('../../services/auth');
    const { TasksPage } = await import('../../pages/TasksPage');
    const { Routes, Route } = await import('react-router-dom');
    
    const element = createElement(
      MemoryRouter,
      { initialEntries: [initialPath] },
      createElement(
        AuthProvider,
        null,
        createElement(
          Routes,
          null,
          createElement(Route, { path: '/', element: createElement(App) }),
          createElement(Route, { path: '/tasks', element: createElement(TasksPage) })
        )
      )
    );
    
    this._renderResult = render(element);
  }

  click(element: Element): void {
    (element as HTMLElement).focus?.();
    fireEvent.click(element);
  }

  type(element: Element, text: string): void {
    const input = element as HTMLInputElement;
    // Set value directly and trigger change for React controlled components
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    )?.set;
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value'
    )?.set;
    
    if (element.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
      nativeTextAreaValueSetter.call(element, text);
    } else if (nativeInputValueSetter) {
      nativeInputValueSetter.call(element, text);
    } else {
      input.value = text;
    }
    
    // Pass target.value for React controlled components
    fireEvent.input(element, { target: { value: text }, bubbles: true });
    fireEvent.change(element, { target: { value: text }, bubbles: true });
  }

  async waitFor<T>(callback: () => T): Promise<T> {
    return waitFor(callback);
  }
}

setWorldConstructor(TestWorld);

// Setup isolated InMemoryStore before each scenario
Before(async function (): Promise<void> {
  setAdapter(new InMemoryAdapter());
  // Clear auth storage to ensure tests start unauthenticated
  const { AuthStorage } = await import('../../services/auth/storage');
  AuthStorage.clear();
});

// Cleanup after each scenario
After(async function (): Promise<void> {
  cleanup();
  setAdapter(null); // Reset adapter
});
