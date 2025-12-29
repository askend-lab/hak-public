# Bugs to Fix

**TDD Process**: For each bug, mark both:
- [ ] Failing test written
- [ ] Test passes (bug fixed)

## Main page - Header

- [x] Header background colors don't match prototype
- [x] Login button "Logi sisse" border/weight differs from prototype
- [x] Nav tab underline thickness differs from prototype

## Footer

- [x] Logo is inverted (should be black on white, currently white on black)

## Main content area

- [x] "Foneetiline tekst:" section looks wrong/ugly (hidden visually)
- [x] "Lisa lause" button design doesn't match prototype
- [x] Play button: cursor should show "not-allowed" when disabled
- [x] Top buttons (Lisa ülesandesse, Mängi kõik) should be disabled when no text entered
- [x] Top buttons are too tall with two-line text (should be single line, lower height)
- [x] Top buttons colors don't match prototype
- [x] Top buttons design doesn't match prototype

## Feedback modal (Kirjuta meile)

- [x] Missing explanatory texts in feedback modal (add Estonian + other languages)
- [x] "Lisa lause" button should be white with border (currently blue)
- [x] Context menu should have 3 items: Lisa ülesandesse, Lae alla, Eemalda (currently only 1)
- [x] Pressing Enter in text input should activate Play button (currently does nothing)

## Functional bugs

- [x] "Mängi kõik" button should play all sentences (currently just switches to Peata mode)
- [x] /tasks page has no design (missing header, footer)
- [x] "Lisa ülesandesse" button does nothing (should show login dialog or task creation dialog)

## Critical bugs

- [x] Text input blocks after typing one character (cursor disappears)

## Context menu (three dots "...")

- [ ] Menu dropdown styling may differ from prototype (position, shadow, border-radius) - prototype menu not interactive for comparison
- [x] Menu trigger button ("...") should be more contrasted and larger (match prototype)
- [x] Context menu items should be black text, not red
- [x] Context menu should close when clicking outside 
