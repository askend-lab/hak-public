# Prototype vs Production Comparison - Bug Report

**Date**: 2026-01-06
**Analyst**: Kate
**Prototype**: http://localhost:3000/
**Production (HAK)**: http://localhost:5180/

## Analysis Method
Visual comparison via MCP browser screenshots ONLY. No HTML analysis.

## Screenshots
- Prototype: `prototype_exp2_2026-01-06T15-04-50-993Z.png`
- Production: `prod_fresh_2026-01-06T15-05-53-407Z.png`

---

## Bug List

- [x] **Bug #1: Extra icons in navigation menu items** - WONT FIX
  
  **Page/Location:** Main page (http://localhost:5180/), header navigation bar
  
  **Decision:** WONT FIX - Icons are an improvement over prototype. Keep them.
  
  **Verification:**
  - [x] Reviewed and decided not to fix

---

- [x] **Bug #2: Extra "Tests" menu item in navigation** - WONT FIX
  
  **Page/Location:** Main page (http://localhost:5180/), header navigation bar
  
  **Decision:** WONT FIX - "Tests" is new functionality that improves on prototype. Keep it.
  
  **Verification:**
  - [x] Reviewed and decided not to fix

---

- [x] **Bug #3: Play button style different**
  
  **Page/Location:** Main page (http://localhost:5180/), text input section (input row)
  
  **Steps to Reproduce:**
  1. Open http://localhost:5180/
  2. Look at text input row
  3. Look at Play button to the right of input field
  
  **What is WRONG (Production):**
  Play button is dark (filled), high contrast - uses `$color-success` (#2E7D32) for active state
  Screenshot: `prod_fresh_2026-01-06T15-05-53-407Z.png`
  
  **What SHOULD BE (Prototype):**
  Play button should be gray, less contrast - should use gray color for active state
  Screenshot: `prototype_exp2_2026-01-06T15-04-50-993Z.png`
  
  **Analysis:**
  - File: `packages/frontend/src/styles/components/_sentence-row.scss` lines 72-94
  - `.play-button--active` uses `background: $color-success` (dark green)
  - Should use a lighter/gray color to match prototype
  
  **Fix Plan:**
  - Change `.play-button--active` background from `$color-success` to `$color-gray`
  
  **Verification:**
  - [x] Bug is fixed according to bugfixingProcess.md

---

---

## User Menu Bugs (2026-01-06)

- [x] **Bug #4: Missing Isikukood in user dropdown menu**
  
  **Page/Location:** Main page, user dropdown menu (click on user name in header)
  
  **Steps to Reproduce:**
  1. Open http://localhost:5180/
  2. Click on user name in header
  3. Look at dropdown menu content
  
  **What is WRONG (Production):**
  Dropdown shows only: Name, Email, menu buttons
  Screenshot: `hak_user_menu_2026-01-06T15-56-01-314Z.png`
  
  **What SHOULD BE (Prototype):**
  Dropdown should show: Name, Email, **Isikukood: XXXXXXXXX**, menu buttons
  Screenshot: `prototype_user_menu_2026-01-06T15-55-22-914Z.png`
  
  **Verification:**
  - [x] Bug is fixed according to bugfixingProcess.md

---

- [x] **Bug #5: Wrong text for reset button in user dropdown**
  
  **Page/Location:** Main page, user dropdown menu
  
  **Steps to Reproduce:**
  1. Open http://localhost:5180/
  2. Click on user name in header
  3. Look at first menu button text
  
  **What is WRONG (Production):**
  Button text: "Taasta rakendus algsesse olekusse"
  
  **What SHOULD BE (Prototype):**
  Button text: "Kustuta kohalikud andmed"
  Screenshot: `prototype_user_menu_2026-01-06T15-55-22-914Z.png`
  
  **Verification:**
  - [x] Bug is fixed according to bugfixingProcess.md

---

- [x] **Bug #6: Missing icons in user dropdown menu buttons**
  
  **Page/Location:** Main page, user dropdown menu
  
  **Steps to Reproduce:**
  1. Open http://localhost:5180/
  2. Click on user name in header
  3. Look at menu button icons
  
  **What is WRONG (Production):**
  Menu buttons have no icons
  
  **What SHOULD BE (Prototype):**
  - "Kustuta kohalikud andmed" has trash icon
  - "Logi välja" has exit/arrow icon
  Screenshot: `prototype_user_menu_2026-01-06T15-55-22-914Z.png`
  
  **Verification:**
  - [x] Bug is fixed according to bugfixingProcess.md

---

## Summary

**Total bugs found on first page: 3**
**User menu bugs: 3**

| # | Bug | Status |
|---|-----|--------|
| 1 | Extra icons in menu | WONT FIX |
| 2 | Extra "Tests" item | WONT FIX |
| 3 | Play button style | FIXED |
| 4 | Missing Isikukood | FIXED |
| 5 | Wrong reset button text | FIXED |
| 6 | Missing menu icons | FIXED |
| 7 | Missing avatar in dropdown | FIXED |
