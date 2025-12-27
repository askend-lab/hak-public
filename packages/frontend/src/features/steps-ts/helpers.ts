/**
 * Shared helpers for cucumber step definitions
 */

/** Button text variants: Estonian text, English fallback, i18n key */
export const BUTTON_TEXTS = {
  login: ['logi sisse', 'login', 'buttons.login'],
  logout: ['logi välja', 'logout', 'buttons.logout'],
  addSentence: ['lisa lause', 'buttons.addSentence'],
  playAll: ['mängi kõik', 'buttons.playAll'],
  stop: ['peata', 'stop'],
  addToTask: ['lisa ülesandesse', 'buttons.addToTask'],
  feedback: ['kirjuta meile', 'feedback', 'tagasiside'],
} as const;

export type ButtonTextKey = keyof typeof BUTTON_TEXTS;

/** Get button text variants by display text (for dynamic Gherkin parameters) */
export function getButtonVariants(buttonText: string): readonly string[] {
  const mapping: Record<string, readonly string[]> = {
    'Lisa lause': BUTTON_TEXTS.addSentence,
    'Mängi kõik': BUTTON_TEXTS.playAll,
    'Lisa ülesandesse': BUTTON_TEXTS.addToTask,
  };
  return mapping[buttonText] ?? [buttonText.toLowerCase()];
}

// UI element selectors
export const SELECTORS = {
  textInput: 'input[type="text"]',
  button: 'button',
} as const;

// Play button symbols
export const PLAY_SYMBOLS = ['▶', '⏳'] as const;

/**
 * Find button by text variants (supports Estonian + English + i18n keys)
 */
export function findButtonByText(
  buttons: NodeListOf<HTMLButtonElement> | null | undefined,
  textVariants: readonly string[]
): HTMLButtonElement | undefined {
  return Array.from(buttons ?? []).find(btn =>
    textVariants.some(text => btn.textContent?.toLowerCase().includes(text.toLowerCase()))
  );
}

/**
 * Find button containing any of the given symbols
 */
export function findButtonBySymbol(
  buttons: NodeListOf<HTMLButtonElement> | null | undefined,
  symbols: readonly string[]
): HTMLButtonElement | undefined {
  return Array.from(buttons ?? []).find(btn =>
    symbols.some(symbol => btn.textContent?.includes(symbol))
  );
}

/**
 * Get all text inputs from container
 */
export function getTextInputs(container: Element | null | undefined): NodeListOf<HTMLInputElement> | null {
  return container?.querySelectorAll(SELECTORS.textInput) ?? null;
}

/**
 * Get all buttons from container
 */
export function getButtons(container: Element | null | undefined): NodeListOf<HTMLButtonElement> | null {
  return container?.querySelectorAll(SELECTORS.button) ?? null;
}

/**
 * Get play buttons (buttons with play symbols)
 */
export function getPlayButtons(container: Element | null | undefined): HTMLButtonElement[] {
  return Array.from(getButtons(container) ?? []).filter(
    btn => PLAY_SYMBOLS.some(symbol => btn.textContent?.includes(symbol))
  );
}

/**
 * Count sentence rows by counting text inputs
 */
export function getSentenceCount(container: Element | null | undefined): number {
  return getTextInputs(container)?.length ?? 0;
}

/**
 * Find and click a button by text variants
 * Returns the button if found, throws if not found
 */
export function clickButton(
  container: Element | null | undefined,
  textVariants: readonly string[],
  click: (el: Element) => void
): HTMLButtonElement {
  const button = findButtonByText(getButtons(container), textVariants);
  if (!button) {
    throw new Error(`Button not found with texts: ${textVariants.join(', ')}`);
  }
  click(button);
  return button;
}

/**
 * Add sentence rows by clicking "Lisa lause" button
 */
export function addSentenceRows(
  container: Element | null | undefined,
  count: number,
  click: (el: Element) => void
): void {
  for (let i = 1; i < count; i++) {
    const addButton = findButtonByText(getButtons(container), BUTTON_TEXTS.addSentence);
    if (addButton) click(addButton);
  }
}

/**
 * Type text into sentence inputs
 */
export function typeSentences(
  container: Element | null | undefined,
  texts: string[],
  type: (el: Element, text: string) => void
): void {
  const inputs = getTextInputs(container);
  if (!inputs) return;
  texts.forEach((text, i) => {
    const input = inputs[i];
    if (input && text) type(input, text);
  });
}

// Menu constants
export const MENU_SYMBOLS = {
  moreMenu: '⋯',
} as const;

/**
 * Find menu buttons (three-dots ⋯)
 */
export function getMenuButtons(container: Element | null | undefined): HTMLButtonElement[] {
  return Array.from(getButtons(container) ?? []).filter(
    btn => btn.textContent?.includes(MENU_SYMBOLS.moreMenu)
  );
}

/**
 * Find menu item by text in dropdown
 */
export function findMenuItem(
  container: Element | null | undefined,
  text: string
): Element | undefined {
  return Array.from(container?.querySelectorAll('button, [role="menuitem"]') ?? [])
    .find(el => el.textContent?.toLowerCase().includes(text.toLowerCase()));
}

/**
 * Click menu button at index
 */
export function clickMenuButton(
  container: Element | null | undefined,
  menuIndex: number,
  click: (el: Element) => void
): void {
  const menuButtons = getMenuButtons(container);
  const menuButton = menuButtons[menuIndex];
  if (!menuButton) throw new Error(`Menu button at index ${menuIndex} not found`);
  click(menuButton);
}

/**
 * Get first text input and assert it exists
 */
export function getFirstInput(container: Element | null | undefined): HTMLInputElement {
  const inputs = getTextInputs(container);
  const first = inputs?.[0];
  if (!first) throw new Error('No text input found');
  return first;
}

/**
 * Setup app with text input - common pattern for Given steps
 */
export async function setupWithText(
  renderApp: () => Promise<void>,
  container: Element | null | undefined,
  text: string,
  type: (el: Element, text: string) => void
): Promise<void> {
  await renderApp();
  const input = getFirstInput(container);
  type(input, text);
}

/**
 * Setup sentences - add rows and type text
 */
export function setupSentences(
  container: Element | null | undefined,
  count: number,
  texts: string[],
  click: (el: Element) => void,
  type: (el: Element, text: string) => void
): void {
  addSentenceRows(container, count, click);
  typeSentences(container, texts, type);
}
