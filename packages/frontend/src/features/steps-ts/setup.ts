/**
 * Cucumber setup - jsdom environment for React rendering
 * Each scenario gets isolated InMemoryStore for test independence
 */

import { setWorldConstructor, World, Before, After } from '@cucumber/cucumber';
import { JSDOM } from 'jsdom';
import { InMemoryStore, setAdapter } from 'simplestore';
import { render, cleanup, fireEvent, waitFor, RenderResult } from '@testing-library/react';
import { createElement } from 'react';
import { BrowserRouter } from 'react-router-dom';

// Setup jsdom
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:3000',
  pretendToBeVisual: true,
});

// Set globals
Object.assign(global, {
  window: dom.window,
  document: dom.window.document,
  navigator: dom.window.navigator,
  HTMLElement: dom.window.HTMLElement,
  Element: dom.window.Element,
  Node: dom.window.Node,
  Text: dom.window.Text,
  DocumentFragment: dom.window.DocumentFragment,
});

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


/**
 * Custom World for Cucumber tests with React rendering
 */
export class TestWorld extends World {
  private _renderResult: RenderResult | null = null;

  /** Get the rendered container element */
  get container(): Element | undefined {
    return this._renderResult?.container;
  }

  async renderApp(): Promise<void> {
    const { default: App } = await import('../../App');
    const { AuthProvider } = await import('../../services/auth');
    
    const element = createElement(
      BrowserRouter,
      null,
      createElement(
        AuthProvider,
        null,
        createElement(App)
      )
    );
    
    this._renderResult = render(element);
  }

  click(element: Element): void {
    fireEvent.click(element);
  }

  type(element: Element, text: string): void {
    const input = element as HTMLInputElement;
    // Clear existing value first
    input.value = '';
    fireEvent.change(element, { target: { value: text } });
    // Also dispatch input event for React controlled components
    fireEvent.input(element, { target: { value: text } });
  }

  async waitFor<T>(callback: () => T): Promise<T> {
    return waitFor(callback);
  }
}

setWorldConstructor(TestWorld);

// Setup isolated InMemoryStore before each scenario
Before(async function (): Promise<void> {
  setAdapter(new InMemoryStore());
  // Clear auth storage to ensure tests start unauthenticated
  const { AuthStorage } = await import('../../services/auth/storage');
  AuthStorage.clear();
});

// Cleanup after each scenario
After(async function (): Promise<void> {
  cleanup();
  setAdapter(null); // Reset adapter
});
