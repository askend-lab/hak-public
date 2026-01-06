# How to Find Differences Between Prototype and Production

## CRITICALLY IMPORTANT
**NO ASSUMPTIONS! ONLY FACTS FROM THE SCREEN!**

Every claim about a difference MUST be confirmed with a screenshot. If an element is not on the screenshot, it DOES NOT EXIST for analysis.

## Purpose
Systematic methodology for identifying design and functionality differences between prototype and production applications.

## Prerequisites
- MCP Browser configured and working
- Both applications running:
  - **Prototype**: http://localhost:3000/
  - **Production (HAK)**: http://localhost:5180/

## Step-by-Step Process

### 1. Visual Comparison via MCP (MANDATORY!)

**Step 1.1: Prototype Screenshot**
1. Open http://localhost:3000/ via `chrome_navigate`
2. Take screenshot via `chrome_screenshot` with `savePng: true`
3. Record screenshot filename

**Step 1.2: HAK Screenshot**
1. Open http://localhost:5180/ via `chrome_navigate`
2. Take screenshot via `chrome_screenshot` with `savePng: true`
3. Record screenshot filename

**Step 1.3: DETAILED analysis of EVERY element**
Go through EVERY area of the screen top to bottom, left to right:

#### Universal Checklist for ANY page:

**A. Header/Navigation:**
- [ ] Logo - presence, size, position
- [ ] Navigation elements - type (links vs buttons), count, text of each
- [ ] Auth buttons - presence, text, position
- [ ] Icons - presence, type, position

**B. Main Content (top to bottom):**
- [ ] Headings - text, size, style
- [ ] Subheadings - text, size, style
- [ ] Action buttons - text, icons, states (enabled/disabled)
- [ ] Input forms:
  - [ ] Placeholder text
  - [ ] Labels
  - [ ] Buttons inside forms
  - [ ] Validation
- [ ] Lists/cards - structure, content
- [ ] Modal windows - content, buttons

**C. Context Menus (open EACH and compare!):**
- [ ] Number of options
- [ ] Text of EACH option (character by character!)
- [ ] Option icons
- [ ] Separators

**D. Additional Elements:**
- [ ] Hints/tooltips
- [ ] Helper buttons
- [ ] Notifications/alerts
- [ ] Loading states

**E. Footer:**
- [ ] Number of links
- [ ] Text of each link
- [ ] Icons (graphic vs text)
- [ ] Contact buttons

**F. General Style:**
- [ ] Background colors
- [ ] Spacing between elements
- [ ] Borders/shadows

### 2. Interactive Element Testing (via screenshots only!)
1. For each interactive element visible on screenshot:
   - Click it
   - Take screenshot of result
   - Document behavior based on screenshot
2. Repeat for both prototype and production
3. Compare screenshots side by side

### 3. Document Differences (Professional Bug Report Format)

Each bug in `bug.md` MUST follow this format. This is a professional bug report that will be used for fixing. Without proper details, you won't be able to fix it later!

```markdown
## Bug List

- [ ] **Bug #1: [Short descriptive title]**
  
  **Page/Location:** [Which page? What URL? What section of the page?]
  
  **Steps to Reproduce:**
  1. Open [URL]
  2. Navigate to [section]
  3. Look at [element]
  
  **What is WRONG (Production):**
  [Exact description of what you SEE in production]
  Screenshot: [production_screenshot_filename.png]
  
  **What SHOULD BE (Prototype):**
  [Exact description of what you SEE in prototype]
  Screenshot: [prototype_screenshot_filename.png]
  
  **Verification:**
  - [ ] Bug is fixed according to bugfixingProcess.md
```

**REQUIRED fields for every bug:**
1. **Title** - Short but descriptive (not just "button wrong")
2. **Page/Location** - URL and exact location on page (if on 15th screen, how to get there?)
3. **Steps to Reproduce** - Exact steps someone else can follow
4. **What is WRONG** - Current behavior with screenshot
5. **What SHOULD BE** - Expected behavior with screenshot
6. **Verification** - Single checkbox: `- [ ] Bug is fixed according to bugfixingProcess.md`

See `bugfixingProcess.md` for the full bug fixing workflow.

### 5. Verification

**MANDATORY: ALL bugs MUST be confirmed with screenshots!**

For EACH bug required:
1. Screenshot of prototype showing expected behavior
2. Screenshot of HAK showing actual behavior
3. Both screenshots must be attached to bug description

Without screenshots, a bug is NOT considered confirmed and CANNOT be added to the list.

- Each bug must be verified by actually reproducing it via MCP
- No assumptions based on code reading alone
- Screenshot evidence required for ALL bugs (not just visual ones)

## Anti-Patterns to Avoid (FORBIDDEN!)
1. **Making assumptions without MCP screenshot verification** - FORBIDDEN
2. **Copying text from code without visual confirmation** - FORBIDDEN
3. **Proceeding when screens don't match expectations** - PROTOCOL VIOLATION
4. **Creating bugs based on memory from previous sessions** - FORBIDDEN
5. **Adding elements to HAK that are NOT on prototype screenshot** - CRITICAL ERROR
6. **Skipping details saying "approximately similar"** - FORBIDDEN, need FULL analysis
7. **Using HTML/aria-labels from `chrome_read_page` as text source** - FORBIDDEN, contains garbage (aria-labels, data-attributes, etc.)
8. **Trusting memory or code** - FORBIDDEN, ONLY screenshots are the source of truth

## Correct Approach
1. ALWAYS screenshots of both applications first
2. Analysis of EACH element per checklist above (based on screenshots only)
3. Documentation of ALL differences, even minor ones
4. Confirmation of each difference with screenshot

## Key Lessons (from previous analysis sessions)

These lessons were learned from actual mistakes made during prototype vs HAK comparison:

1. **DO NOT use chrome_read_page for text content**
   - It returns aria-labels, data-attributes, and other HTML attributes that are NOT visible
   - Example: A button with `aria-label="Phonetic symbols help"` appears as "Phonetic symbols help" in chrome_read_page, but visually it's just a "?" button
   - Use ONLY screenshots to determine what text is visible

2. **Memory from previous sessions is UNRELIABLE**
   - Example: "Lae alla .wav fail" was claimed as prototype text, but this was from memory without visual verification
   - ALWAYS take fresh screenshots and verify claims

3. **ONLY what you see on the screenshot exists**
   - Do not read source code to find differences
   - Do not trust HTML output from any tool
   - If it's not visible on screenshot, it does not exist for analysis

4. **CRITICAL: How to take screenshots correctly** (added 2026-01-06)
   - MUST use `savePng: true` parameter - otherwise the file is NOT saved!
   - MUST use `chrome_switch_tab` to switch to the correct tab BEFORE taking screenshot
   - MUST copy the saved file from Downloads to /tmp before viewing
   - MUST use `read_file` on the PNG to actually SEE the image content
   - Example correct sequence:
     ```
     1. chrome_switch_tab(tabId: <prototype_tab_id>)
     2. chrome_screenshot(savePng: true, name: "prototype_page", tabId: <prototype_tab_id>)
     3. cp "/mnt/c/Users/.../Downloads/<filename>.png" /tmp/proto.png
     4. read_file("/tmp/proto.png")  # This shows the actual image!
     ```
   - WITHOUT this sequence, you may see cached/wrong screenshots!

5. **Verify tab URLs before screenshots**
   - Use `get_windows_and_tabs` to confirm which tabId corresponds to which URL
   - localhost:3000 = Prototype
   - localhost:5180 = Production (HAK)
