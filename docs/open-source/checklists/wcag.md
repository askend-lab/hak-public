# WCAG 2.2 AA — Checklist

> https://www.w3.org/TR/WCAG22/
> Format: [ ] **check** = verification exists · [ ] **done** = requirement satisfied

## 1. Perceivable

### 1.1 Text Alternatives
- [ ] check · [ ] done — All images have meaningful `alt` text (`axe-core` in Playwright)
- [ ] check · [ ] done — Icon-only buttons have `aria-label` (`axe-core`)
- [ ] check · [ ] done — SVGs have `aria-hidden` or labels (`axe-core`)

### 1.2 Time-based Media
- [ ] check · [ ] done — Audio controls keyboard accessible (`Playwright keyboard tests`)
- [ ] check · [ ] done — Audio has text transcript (`manual review`)

### 1.3 Adaptable
- [ ] check · [ ] done — Semantic HTML: headings, landmarks, nav (`axe-core`)
- [ ] check · [ ] done — Logical reading order without CSS (`manual review`)
- [ ] check · [ ] done — Form inputs have `<label>` elements (`axe-core`)

### 1.4 Distinguishable
- [ ] check · [ ] done — Text contrast ≥ 4.5:1 / large ≥ 3:1 (`axe-core`)
- [ ] check · [ ] done — UI component contrast ≥ 3:1 (`axe-core`)
- [ ] check · [ ] done — Text resizable to 200% without loss (`Playwright viewport test`)
- [ ] check · [ ] done — Content reflows at 320px (`Playwright viewport test`)
- [ ] check · [ ] done — Focus indicators ≥ 3:1 contrast (`axe-core`)

## 2. Operable

### 2.1 Keyboard Accessible
- [ ] check · [ ] done — All interactive elements reachable via Tab (`Playwright keyboard`)
- [ ] check · [ ] done — No keyboard traps (`Playwright keyboard`)
- [ ] check · [ ] done — Task exercises fully keyboard-operable (`Playwright keyboard`)

### 2.2 Enough Time
- [ ] check · [ ] done — No time limits on tasks (`manual review`)
- [ ] check · [ ] done — Audio can be paused/stopped/replayed (`Playwright tests`)

### 2.4 Navigable
- [ ] check · [ ] done — Skip navigation link (`axe-core`)
- [ ] check · [ ] done — Descriptive page titles per route (`Playwright title assertions`)
- [ ] check · [ ] done — Focus order follows visual order (`Playwright keyboard`)
- [ ] check · [ ] done — Link purpose clear from text (`axe-core`)

### 2.5 Input Modalities
- [ ] check · [ ] done — Target size ≥ 24x24 CSS pixels (`axe-core` WCAG 2.2)
- [ ] check · [ ] done — Dragging has non-dragging alternatives (`manual review`)

## 3. Understandable

### 3.1 Readable
- [ ] check · [ ] done — `<html lang="et">` declared (`axe-core`)
- [ ] check · [ ] done — Language changes marked with `lang` attr (`axe-core`)

### 3.2 Predictable
- [ ] check · [ ] done — Consistent navigation across pages (`Playwright tests`)
- [ ] check · [ ] done — No unexpected context changes (`Playwright tests`)

### 3.3 Input Assistance
- [ ] check · [ ] done — Form errors identified in text (`axe-core`)
- [ ] check · [ ] done — Labels/instructions for user input (`axe-core`)
- [ ] check · [ ] done — Confirm before destructive actions (`Playwright tests`)

## 4. Robust

### 4.1 Compatible
- [ ] check · [ ] done — Valid HTML (no duplicate IDs) (`axe-core`)
- [ ] check · [ ] done — ARIA roles/states used correctly (`axe-core`)
- [ ] check · [ ] done — Status messages use `aria-live` (`axe-core`)
