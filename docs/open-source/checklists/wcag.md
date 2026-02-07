# WCAG 2.2 AA — Checklist

> https://www.w3.org/TR/WCAG22/
> Web Content Accessibility Guidelines — Level AA compliance.

## 1. Perceivable

### 1.1 Text Alternatives
- [ ] All images have meaningful `alt` text (or `alt=""` for decorative)
- [ ] Icon-only buttons have accessible labels (`aria-label`)
- [ ] SVG icons in `TaskDetailHeader.tsx` and elsewhere have `aria-hidden="true"` or labels

### 1.2 Time-based Media
- [ ] Audio playback controls are keyboard accessible
- [ ] Audio content has text transcript available (TTS output matches input text)

### 1.3 Adaptable
- [ ] Semantic HTML used throughout (headings, lists, landmarks, nav, main, aside)
- [ ] Reading order is logical when CSS is disabled
- [ ] Form inputs have associated `<label>` elements

### 1.4 Distinguishable
- [ ] Text color contrast ratio ≥ 4.5:1 (normal text) and ≥ 3:1 (large text)
- [ ] UI component contrast ratio ≥ 3:1 against adjacent colors
- [ ] Text can be resized to 200% without loss of content
- [ ] Content reflows at 320px viewport width (no horizontal scroll)
- [ ] Non-text contrast: focus indicators, form borders ≥ 3:1

## 2. Operable

### 2.1 Keyboard Accessible
- [ ] All interactive elements reachable via Tab key
- [ ] No keyboard traps (can Tab out of every component)
- [ ] Custom keyboard shortcuts (if any) are documented and configurable
- [ ] Task completion exercises fully operable by keyboard

### 2.2 Enough Time
- [ ] No time limits on task completion (or adjustable if present)
- [ ] Audio playback can be paused, stopped, and replayed

### 2.4 Navigable
- [ ] Skip navigation link to main content
- [ ] Page titles are descriptive and unique per route
- [ ] Focus order follows visual/logical order
- [ ] Link purpose clear from link text (no "click here")
- [ ] Multiple ways to find pages (nav, search, sitemap)

### 2.5 Input Modalities
- [ ] Target size minimum 24x24 CSS pixels (WCAG 2.2 new criterion)
- [ ] Dragging actions have non-dragging alternatives
- [ ] No motion-dependent interactions (or alternatives provided)

## 3. Understandable

### 3.1 Readable
- [ ] Page language declared (`<html lang="et">` for Estonian)
- [ ] Language changes within content marked with `lang` attribute

### 3.2 Predictable
- [ ] Navigation is consistent across pages
- [ ] Components behave consistently across the application
- [ ] No unexpected context changes on focus or input

### 3.3 Input Assistance
- [ ] Form errors identified and described in text
- [ ] Error messages suggest corrections
- [ ] Labels or instructions provided for user input
- [ ] Error prevention: confirm before destructive actions

## 4. Robust

### 4.1 Compatible
- [ ] Valid HTML (no duplicate IDs, proper nesting)
- [ ] ARIA roles, states, properties used correctly
- [ ] Status messages use `aria-live` regions (audio playback status, save confirmations)
- [ ] Custom components have proper ARIA roles and keyboard patterns
