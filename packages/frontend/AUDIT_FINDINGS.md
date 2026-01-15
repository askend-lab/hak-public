# Frontend Architecture Audit Findings

**Audit Date:** January 2026  
**Auditor:** Automated Audit  
**Reference:** Design System Documentation in `docs/02-DESIGN-SYSTEM/`

---

## Phase 1: Token Compliance Audit (SCSS)

### Phase 1.1: Core UI Components

**Files Audited:** 6 files (`_panel.scss`, `_paper.scss`, `_modal-base.scss`, `_input.scss`, `_textarea.scss`, `_button.scss`)

#### Summary

| File | Token Imports | Hardcoded Values | Severity |
|------|---------------|------------------|----------|
| `_panel.scss` | Complete | 15+ instances | Medium |
| `_paper.scss` | Complete | 20+ instances | Medium |
| `_modal-base.scss` | Complete | 15+ instances | Medium |
| `_input.scss` | Complete | 10+ instances | Medium |
| `_textarea.scss` | Missing spacing | 12+ instances | High |
| `_button.scss` | Missing spacing, typography | 20+ instances | High |

---

#### Issue 1.1.1: Missing Token Imports

**Severity:** High  
**Effort:** Low (5 min)

**Files:**
- `_textarea.scss` - Missing `@import '../tokens/spacing';`
- `_button.scss` - Missing `@import '../tokens/spacing';` and `@import '../tokens/typography';`

**Recommendation:** Add missing imports at the top of each file.

---

#### Issue 1.1.2: Hardcoded RGBA Values in Shadows/Backdrops

**Severity:** Medium  
**Effort:** Medium (1-2 hours)

**Files and Locations:**
- `_panel.scss`:
  - Line 30: `rgba(0, 0, 0, 0.3)` in backdrop
  - Lines 47, 53, 59: `rgba(0, 0, 0, 0.25)` in box-shadow
- `_paper.scss`:
  - Line 34: `rgba(0, 0, 0, 0.12)` in box-shadow
  - Line 72: `rgba(23, 49, 72, 0.12)` in elevated shadow
  - Line 93: `rgba(0, 0, 0, 0.08)` in active state
  - Line 248: `rgba(23, 49, 72, 0.16)` in raised shadow
- `_modal-base.scss`:
  - Line 22: `rgba(0, 0, 0, 0.45)` in backdrop
  - Line 35: `rgba(23, 49, 72, 0.2)` in box-shadow
- `_textarea.scss`:
  - Line 51: `rgba(21, 21, 21, 0.08)` in box-shadow

**Recommendation:** Create shadow tokens in `_colors.scss`:
```scss
// Shadow colors
--color-shadow-backdrop: rgba(0, 0, 0, 0.3);
--color-shadow-panel: rgba(0, 0, 0, 0.25);
--color-shadow-dropdown: rgba(0, 0, 0, 0.12);
--color-shadow-elevated: rgba(23, 49, 72, 0.12);
--color-shadow-modal: rgba(23, 49, 72, 0.2);
```

---

#### Issue 1.1.3: Hardcoded Spacing Values

**Severity:** Medium  
**Effort:** High (2-3 hours)

**Examples:**
- `_panel.scss`: `28px`, `36px`, `320px`, `550px`, `720px`
- `_paper.scss`: `6px`, `4px`, `120px`, `144px`, `250px`, `320px`, `480px`, `240px`
- `_modal-base.scss`: `28px`, `29px`, `60px`, `400px`, `559px`, `700px`
- `_input.scss`: `32px`, `40px`, `48px`, `36px`, `45px`
- `_textarea.scss`: `6px`, `12px`, `16px`
- `_button.scss`: `8px`, `24px`, `36px`, `48px`, `32px`, `50px`, `20px`

**Recommendation:** 
1. Use existing spacing tokens where applicable (`$spacing-1` through `$spacing-16`)
2. Create semantic tokens for component-specific sizes:
```scss
// Component sizes
--size-button-height-sm: 32px;
--size-button-height-md: 36px;
--size-button-height-lg: 48px;
--size-modal-width-sm: 400px;
--size-modal-width-md: 559px;
--size-modal-width-lg: 700px;
--size-panel-width-sm: 320px;
--size-panel-width-md: 550px;
--size-panel-width-lg: 720px;
```

---

#### Issue 1.1.4: Hardcoded Typography Values

**Severity:** Medium  
**Effort:** Medium (1 hour)

**Examples:**
- `_panel.scss`: Line 88-89: `font-size: 18px`, `line-height: 28px`
- `_paper.scss`: Lines 105-108: `font-size: 14px`, `line-height: 150%`, `letter-spacing: 0.15px`
- `_modal-base.scss`: Line 69: `font-size: 28px`
- `_input.scss`: Line 116: `font-size: 12px`
- `_button.scss`: Lines 99-101: `font-size: 14px`, `font-weight: 500`, `letter-spacing: .175px`

**Recommendation:** Replace with typography tokens:
- `18px` → `$font-size-lg`
- `14px` → `$font-size-sm`
- `12px` → `$font-size-xs`
- `28px` → `$font-size-3xl` (needs to be added)
- `500` → `$font-weight-medium`

---

#### Issue 1.1.5: Hardcoded Breakpoints

**Severity:** Low  
**Effort:** Low (15 min)

**Files:**
- `_panel.scss`: Line 252: `@media (max-width: 640px)`
- `_modal-base.scss`: Line 137: `@media (max-width: 640px)`

**Recommendation:** Use breakpoint mixin or variable:
```scss
// Instead of:
@media (max-width: 640px) { }

// Use:
@include respond-below($breakpoint-sm) { }
// or
@media (max-width: $breakpoint-sm) { }
```

---

#### Issue 1.1.6: Hardcoded Colors in Text

**Severity:** Medium  
**Effort:** Low (30 min)

**Files:**
- `_paper.scss`: Line 108: `color: rgba(0, 0, 0, 0.87)` - should use `$color-text-primary` or create `$color-text-subtle`

**Recommendation:** Use existing color tokens or create semantic ones.

---

#### Issue 1.1.7: Inconsistent Border Radius Values

**Severity:** Low  
**Effort:** Low (30 min)

**Examples:**
- `_textarea.scss`: Line 50: `.5rem` instead of `$border-radius`
- `_panel.scss`: Lines 136, 145: `3px` for scrollbar radius
- `_paper.scss`: Line 167: `2px` for scrollbar radius
- `_button.scss`: Line 150: `50px` for pill button

**Recommendation:** Standardize using border tokens or create scrollbar-specific tokens.

---

#### Issue 1.1.8: Hardcoded Opacity Values

**Severity:** Low  
**Effort:** Low (15 min)

**Files:**
- `_textarea.scss`: Line 18: `opacity: 0.64` - should use `$opacity-placeholder`
- `_input.scss`: Line 156: `opacity: .25` - should use opacity token

**Recommendation:** Use opacity tokens from `_opacity.scss`.

---

### Phase 1.1 Summary

**Total Issues Found:** 8 categories  
**Critical:** 0  
**High:** 2 (missing imports)  
**Medium:** 5 (hardcoded values)  
**Low:** 4 (minor inconsistencies)

**Estimated Total Effort:** 6-8 hours to fully remediate

**Quick Wins:**
1. Add missing token imports (5 min)
2. Replace hardcoded breakpoints with mixins (15 min)
3. Replace hardcoded opacity values (15 min)

---

### Phase 1.2: Layout Components

**Files Audited:** 4 files (`_page-layouts.scss`, `_header.scss`, `_footer.scss`, `_icons.scss`)

#### Summary

| File | Token Imports | Hardcoded Values | Responsive Mixins | Severity |
|------|---------------|------------------|-------------------|----------|
| `_page-layouts.scss` | Complete | 30+ instances | Excellent | Low |
| `_header.scss` | Complete | 15+ instances | Good | Low |
| `_footer.scss` | Complete | 12+ instances | Good | Low |
| `_icons.scss` | Missing typography | 0 instances | N/A | Medium |

**Overall Assessment:** Layout components demonstrate good design system compliance with excellent use of responsive mixins. Main issues are scattered hardcoded pixel values.

---

#### Issue 1.2.1: Missing Token Import in Icons

**Severity:** Medium  
**Effort:** Low (2 min)

**File:** `_icons.scss`
- Uses `$font-size-*` tokens without importing `../tokens/typography`

**Recommendation:** Add `@import '../tokens/typography';` at top of file.

---

#### Issue 1.2.2: Hardcoded RGBA Border Colors

**Severity:** Low  
**Effort:** Low (10 min)

**Files:**
- `_page-layouts.scss`: Lines 34, 534: `rgba(23, 49, 72, 0.1)` for borders

**Recommendation:** Create border color token:
```scss
--color-border-subtle: rgba(23, 49, 72, 0.1);
```

---

#### Issue 1.2.3: Hardcoded Spacing in Layout Components

**Severity:** Low  
**Effort:** Medium (1 hour)

**Pattern:** Many hardcoded spacing values exist, but they follow a consistent mobile-first pattern and are well-documented.

**Examples:**
- `_page-layouts.scss`: `16px`, `20px`, `24px`, `32px`, `36px` for padding
- `_header.scss`: `32px`, `40px` for gaps; `36px` for heights
- `_footer.scss`: `8px` for gaps; `48px` for button height

**Recommendation:** Replace with spacing tokens where applicable:
- `8px` → `$spacing-2`
- `16px` → `$spacing-4`
- `20px` → `$spacing-5`
- `24px` → `$spacing-6`
- `32px` → `$spacing-8`
- `36px` → Create `$spacing-9` or use `$spacing-8 + $spacing-1`

**Note:** Some hardcoded values are intentional for responsive design fine-tuning. Document which values are deliberately hardcoded vs which should use tokens.

---

#### Issue 1.2.4: Hardcoded Component Dimensions

**Severity:** Low  
**Effort:** Low (30 min)

**Examples:**
- `_header.scss`: Lines 82-83: `width: 83px` for tab underline
- `_footer.scss`: Lines 22, 33: `width: 305px` for sections
- `_footer.scss`: Lines 26-27: `116px x 36px` for logo
- `_page-layouts.scss`: Lines 223, 246-251: `max-width: 400px`, `600px`, `661px`

**Recommendation:** These are intentional design values. Consider creating semantic size tokens if reused:
```scss
--size-footer-section-width: 305px;
--size-logo-width: 116px;
--size-logo-height: 36px;
```

---

#### Issue 1.2.5: Hardcoded Typography Values in Header

**Severity:** Low  
**Effort:** Low (15 min)

**File:** `_header.scss`
- Lines 65-67: `font-size: 14px`, `line-height: 100%`, `letter-spacing: 0.15px`

**Recommendation:** Replace with typography tokens:
- `14px` → `$font-size-sm`
- `100%` → `$line-height-none`
- `0.15px` → `$letter-spacing-normal`

---

### Phase 1.2 Positive Findings

1. **Excellent Responsive Design:** `_page-layouts.scss` demonstrates best-practice mobile-first responsive design with proper use of breakpoint mixins.

2. **Good Token Usage in Footer:** `_footer.scss` uses typography tokens extensively (`$font-size-sm`, `$font-weight-medium`, `$line-height-normal`, `$letter-spacing-normal`).

3. **Opacity Tokens Used:** Footer correctly uses `$opacity-hover` and `$opacity-active`.

4. **Mixin Reuse:** Header uses `@include menu-button` mixin from button component.

5. **Icon Component Well-Structured:** Uses typography size tokens for icon sizes with proper BEM modifiers.

---

### Phase 1.2 Summary

**Total Issues Found:** 5 categories  
**Critical:** 0  
**High:** 0  
**Medium:** 1 (missing import)  
**Low:** 4 (hardcoded values)

**Estimated Total Effort:** 2-3 hours to fully remediate

**Quick Wins:**
1. Add missing typography import to `_icons.scss` (2 min)
2. Create `$color-border-subtle` token (10 min)
3. Replace header typography hardcoded values (15 min)

---

### Phase 1.3: Audio/Media Components

**Files Audited:** 3 files (`_audio-player.scss`, `_playlist.scss`, `_playlist-audio-player.scss`)

#### Summary

| File | Token Imports | Hardcoded Values | BEM Compliance | Severity |
|------|---------------|------------------|----------------|----------|
| `_audio-player.scss` | **None** | 40+ instances | Partial | **Critical** |
| `_playlist.scss` | Complete | 10+ instances | Excellent | Low |
| `_playlist-audio-player.scss` | **None** | 50+ instances | Mixed | **Critical** |

**Overall Assessment:** Two of three audio components are missing ALL token imports, representing a critical design system violation. `_playlist.scss` shows good compliance.

---

#### Issue 1.3.1: Missing ALL Token Imports (Critical)

**Severity:** Critical  
**Effort:** Low (10 min)

**Files:**
- `_audio-player.scss` - Missing ALL imports, uses `$color-*` tokens without importing
- `_playlist-audio-player.scss` - Missing ALL imports, uses `$color-*` tokens without importing

**Recommendation:** Add required imports at top of each file:
```scss
@import '../tokens/colors';
@import '../tokens/typography';
@import '../tokens/spacing';
@import '../tokens/borders';
```

---

#### Issue 1.3.2: Extensive Use of rem Units Instead of Tokens

**Severity:** High  
**Effort:** High (2-3 hours)

**Pattern:** Audio components use rem units directly instead of spacing tokens.

**Examples from `_audio-player.scss`:**
- `padding: 2rem` → should use `$spacing-8`
- `gap: 1rem` → should use `$spacing-4`
- `gap: 0.75rem` → should use `$spacing-3`
- `gap: 0.5rem` → should use `$spacing-2`
- `font-size: 0.875rem` → should use `$font-size-sm`

**Examples from `_playlist-audio-player.scss`:**
- `padding: 1rem` → should use `$spacing-4`
- `margin-bottom: 0.75rem` → should use `$spacing-3`
- `gap: 0.5rem` → should use `$spacing-2`

**Recommendation:** Create a mapping and replace systematically:
- `0.25rem` (4px) → `$spacing-1`
- `0.5rem` (8px) → `$spacing-2`
- `0.75rem` (12px) → `$spacing-3`
- `1rem` (16px) → `$spacing-4`
- `1.5rem` (24px) → `$spacing-6`
- `2rem` (32px) → `$spacing-8`

---

#### Issue 1.3.3: Hardcoded Color Values

**Severity:** High  
**Effort:** Low (30 min)

**Files:**
- `_audio-player.scss`: Line 42: `color: white` → should use `$color-white`
- `_playlist-audio-player.scss`: 
  - Line 3: `background: white` → should use `$color-white`
  - Line 117: `color: white` → should use `$color-white`
  - Lines 9, 21, 27, 124, 193, 208: Hardcoded `rgba(23, 49, 72, ...)` shadows

**Recommendation:** Replace `white` with `$color-white` and create shadow tokens.

---

#### Issue 1.3.4: Hardcoded Breakpoints

**Severity:** Medium  
**Effort:** Low (20 min)

**Files:**
- `_audio-player.scss`: Lines 30, 59, 77, 88, 184, 209: `@media (max-width: 768px)` and `480px`
- `_playlist.scss`: Lines 27, 79, 128: `@media (max-width: 768px)`
- `_playlist-audio-player.scss`: Line 319: `@media (max-width: 768px)`

**Recommendation:** Use breakpoint mixins:
```scss
// Instead of:
@media (max-width: 768px) { }

// Use:
@include respond-below($breakpoint-md) { }
```

---

#### Issue 1.3.5: Hardcoded Typography Values

**Severity:** Medium  
**Effort:** Medium (1 hour)

**Examples:**
- `font-size: 0.875rem` (14px) → `$font-size-sm`
- `font-size: 1rem` (16px) → `$font-size-md`
- `font-size: 1.125rem` (18px) → `$font-size-lg`
- `font-size: 0.75rem` (12px) → `$font-size-xs`
- `font-weight: 600` → `$font-weight-semibold`
- `font-weight: 500` → `$font-weight-medium`
- `line-height: 1.4` → `$line-height-normal`

---

#### Issue 1.3.6: Hardcoded Component Dimensions

**Severity:** Low  
**Effort:** Medium (1 hour)

**Examples:**
- Play button sizes: `48px`, `44px`, `40px`
- Slider thumb: `16px`
- Border radius: `6px`, `8px`, `12px`
- Progress bar height: `6px`

**Recommendation:** Create size tokens or use existing border-radius tokens:
- `6px` → `$border-radius-sm`
- `8px` → `$border-radius`
- `12px` → `$border-radius-lg`

---

### Phase 1.3 Positive Findings

1. **`_playlist.scss` Shows Good Compliance:**
   - Imports all required tokens
   - Uses spacing tokens extensively (`$spacing-2` through `$spacing-12`)
   - Good BEM naming convention
   - Uses color tokens properly

2. **Consistent Component Structure:** All files follow a logical structure for audio players.

3. **Shadow Token Usage:** `_playlist.scss` uses `$color-shadow-primary-xs` token.

---

### Phase 1.3 Summary

**Total Issues Found:** 6 categories  
**Critical:** 2 (missing imports)  
**High:** 2 (rem units, hardcoded colors)  
**Medium:** 2 (breakpoints, typography)  
**Low:** 1 (dimensions)

**Estimated Total Effort:** 5-7 hours to fully remediate

**Immediate Actions Required:**
1. Add missing token imports to `_audio-player.scss` and `_playlist-audio-player.scss` (10 min)
2. Replace hardcoded `white` with `$color-white` (15 min)
3. Replace hardcoded breakpoints with mixins (20 min)

---

### Phase 1.4: Phonetic/Text Components

**Files Audited:** 6 files (`_stressed-text.scss`, `_synthesis-results.scss`, `_synthesis-components.scss`, `_sentence-synthesis-item.scss`, `_pronunciation-variants.scss`, `_sentence-phonetic-panel.scss`)

#### Summary

| File | Token Imports | Hardcoded Values | Mixin Usage | Severity |
|------|---------------|------------------|-------------|----------|
| `_stressed-text.scss` | Complete | 20+ instances | Minimal | Medium |
| `_synthesis-results.scss` | **None (relies on cascade)** | 100+ instances | Partial | **Critical** |
| `_synthesis-components.scss` | Complete | 30+ instances | Good | Medium |
| `_sentence-synthesis-item.scss` | Complete | 25+ instances | Excellent | Low |
| `_pronunciation-variants.scss` | Complete + mixins | 40+ instances | Excellent | Medium |
| `_sentence-phonetic-panel.scss` | Complete + mixins | 30+ instances | Excellent | Medium |

**Overall Assessment:** `_synthesis-results.scss` is the worst offending file with no imports and 100+ hardcoded values. Other files show good structure but have scattered hardcoded values. Panel components (`_pronunciation-variants.scss`, `_sentence-phonetic-panel.scss`) correctly use panel mixins.

---

#### Issue 1.4.1: `_synthesis-results.scss` Relies on Import Cascade (Critical)

**Severity:** Critical  
**Effort:** High (3-4 hours to fix entire file)

**File:** `_synthesis-results.scss`
- Line 1-2: Comment states "Token imports removed - using global imports from main.scss"
- This is fragile - the file uses tokens but doesn't import them
- Contains 100+ hardcoded values including:
  - `white` instead of `$color-white`
  - `16px`, `12px` border-radius instead of tokens
  - `rgba(...)` shadows throughout
  - rem values (`1rem`, `0.875rem`, etc.) instead of spacing tokens
  - Hardcoded breakpoint `768px`

**Recommendation:** 
1. Add proper token imports at top
2. Replace all hardcoded values with tokens
3. Replace rem with spacing tokens
4. Use breakpoint mixins

---

#### Issue 1.4.2: Hardcoded Width Values

**Severity:** Medium  
**Effort:** Low (30 min)

**Pattern:** Fixed width values for panel content areas.

**Files:**
- `_pronunciation-variants.scss`: Lines 25, 43: `width: 518px`
- `_sentence-phonetic-panel.scss`: Lines 25, 63, 96: `width: 518px`
- `_synthesis-results.scss`: Various fixed widths

**Recommendation:** Create size token or use percentage/max-width pattern:
```scss
--size-panel-content-width: 518px;
// Or use: max-width: calc(100% - $spacing-8);
```

---

#### Issue 1.4.3: Hardcoded Typography Throughout

**Severity:** Medium  
**Effort:** High (2-3 hours)

**Pattern:** Direct pixel/rem values for font-size, font-weight, line-height.

**Examples:**
- `font-size: 16px` → `$font-size-md`
- `font-size: 14px` → `$font-size-sm`
- `font-size: 0.875rem` → `$font-size-sm`
- `font-size: 1.125rem` → `$font-size-lg`
- `font-weight: 600` → `$font-weight-semibold`
- `font-weight: 500` → `$font-weight-medium`
- `line-height: 140%` → `$line-height-normal`

---

#### Issue 1.4.4: Hardcoded Spacing Values

**Severity:** Medium  
**Effort:** High (2-3 hours)

**Pattern:** Direct pixel values for padding, margin, gap.

**Examples from `_sentence-synthesis-item.scss`:**
- `min-height: 72px` - component-specific
- `padding: 10px 36px 10px 12px` - should use spacing tokens
- `height: 22px`, `height: 42px` - component-specific sizes
- `gap: 4px` → `$spacing-1`

**Recommendation:** Use spacing tokens where possible, document component-specific sizes.

---

#### Issue 1.4.5: Hardcoded RGBA Shadows

**Severity:** Low  
**Effort:** Medium (1 hour)

**Files:**
- `_stressed-text.scss`: Line 170, 202: `rgba(0, 51, 153, 0.25)`
- `_synthesis-results.scss`: Multiple rgba shadows
- `_synthesis-components.scss`: Line 87, 233, 276
- `_pronunciation-variants.scss`: Line 478
- `_sentence-phonetic-panel.scss`: Lines 114, 270

**Recommendation:** Create shadow tokens.

---

#### Issue 1.4.6: Hardcoded Breakpoints

**Severity:** Low  
**Effort:** Low (20 min)

**Files:**
- `_stressed-text.scss`: Lines 39, 52: `@media (min-width: 768px)`
- `_synthesis-results.scss`: Multiple `@media (max-width: 768px)`
- `_sentence-synthesis-item.scss`: Lines 422, 433: `768px`, `480px`

**Recommendation:** Use breakpoint mixins.

---

#### Issue 1.4.7: Legacy Class Aliases Using @extend

**Severity:** Low  
**Effort:** Low (refactor when updating components)

**File:** `_stressed-text.scss` Lines 230-245

**Pattern:** Uses `@extend` for backwards compatibility:
```scss
.stressed-text-display { @extend .stressed-text; }
.text-comparison { @extend .stressed-text__comparison; }
```

**Recommendation:** These are fine for migration but should be removed once all components use BEM names directly.

---

### Phase 1.4 Positive Findings

1. **Excellent Mixin Usage:** `_pronunciation-variants.scss` and `_sentence-phonetic-panel.scss` correctly use panel mixins for consistent panel styling.

2. **Good BEM Structure:** `_sentence-synthesis-item.scss` has excellent BEM naming with proper use of modifiers.

3. **Consistent Component Pattern:** All phonetic components follow similar structure patterns.

4. **Good Color Token Usage:** Most files use color tokens correctly (except `_synthesis-results.scss`).

---

### Phase 1.4 Summary

**Total Issues Found:** 7 categories  
**Critical:** 1 (`_synthesis-results.scss` no imports)  
**High:** 0  
**Medium:** 4 (typography, spacing, widths, shadows)  
**Low:** 3 (breakpoints, legacy aliases, minor issues)

**Estimated Total Effort:** 10-12 hours to fully remediate (majority in `_synthesis-results.scss`)

**Priority Actions:**
1. Add token imports to `_synthesis-results.scss` and begin refactoring (critical)
2. Create shadow tokens for common rgba patterns (medium)
3. Replace hardcoded breakpoints with mixins (low effort, good practice)

---

### Phase 1.5: Task Management Components

**Files Audited:** 8 files (`_task-manager.scss`, `_task-list.scss`, `_task-modal.scss`, `_task-edit-modal.scss`, `_task-detail.scss`, `_add-entry-modal.scss`, `_add-to-task-dropdown.scss`, `_share-task-modal.scss`)

#### Summary

| File | Token Imports | Hardcoded Colors | RGBA Shadows | Breakpoints | Severity |
|------|---------------|------------------|--------------|-------------|----------|
| `_task-manager.scss` | Complete | 0 | 0 | 1 | Low |
| `_task-list.scss` | Complete | 0 | 0 | 0 | Low |
| `_task-modal.scss` | Complete | 0 | 2 | 1 | Low |
| `_task-edit-modal.scss` | Complete | 0 | 0 | 1 | Low |
| `_task-detail.scss` | Complete | 0 | 2 | 1 | Low |
| `_add-entry-modal.scss` | Complete | 0 | 0 | 0 | Low |
| `_add-to-task-dropdown.scss` | Complete | 0 | 0 | 0 | Low |
| `_share-task-modal.scss` | Complete | 0 | 1 | 1 | Low |

**Overall Assessment:** Task management components demonstrate **excellent design system compliance**. All files import required tokens. Only minor issues with hardcoded rgba shadows and breakpoints.

---

#### Issue 1.5.1: Hardcoded RGBA Shadow Values

**Severity:** Low  
**Effort:** Low (15 min)

**Files and Locations:**
- `_task-modal.scss`: Lines 179, 317: `rgba(23, 49, 72, 0.1)` focus shadow
- `_task-detail.scss`: Lines 363, 486: `rgba(23, 49, 72, 0.08)`, `rgba(23, 49, 72, 0.15)`
- `_share-task-modal.scss`: Line 59: `rgba(23, 49, 72, 0.1)` focus shadow

**Recommendation:** Use `$color-shadow-focus` token (or create if not exists).

---

#### Issue 1.5.2: Hardcoded Breakpoints

**Severity:** Low  
**Effort:** Low (10 min)

**Files:**
- `_task-edit-modal.scss`: Line 66: `@media (max-width: 640px)`
- `_task-modal.scss`: Line 359: `@media (max-width: 640px)`
- `_task-manager.scss`: Line 175: `@media (max-width: 768px)`
- `_task-detail.scss`: Line 492: `@media (max-width: 768px)`
- `_share-task-modal.scss`: Line 73: `@media (max-width: 640px)`

**Recommendation:** Use `@include respond-below($breakpoint-sm)` or `@include respond-below($breakpoint-md)`.

---

#### Issue 1.5.3: `_shared-task.scss` Minor Issues

**Severity:** Low  
**Effort:** Low (10 min)

**File:** `_shared-task.scss`
- Line 324: `color: white` → should use `$color-white`
- Lines 9-10: Hardcoded rgba in gradient/border

**Recommendation:** Replace with color tokens.

---

### Phase 1.5 Positive Findings

1. **All Files Have Complete Token Imports:** Every task component properly imports colors, typography, spacing, and borders tokens.

2. **No Hardcoded Hex Colors:** Zero instances of `#HEX` colors found.

3. **Good Input Component Reuse:** Several files import `_input.scss` for consistent input styling.

4. **Breakpoint Token Import:** `_task-list.scss` imports breakpoints token (Line 9).

---

### Phase 1.5 Summary

**Total Issues Found:** 3 categories  
**Critical:** 0  
**High:** 0  
**Medium:** 0  
**Low:** 3 (shadows, breakpoints, one `white` keyword)

**Estimated Total Effort:** 30-45 minutes to fully remediate

**This is the best-compliant component category so far.**

---

### Phase 1.6: Remaining Components

**Files Audited:** 16 files (User/Auth, Feedback, Onboarding, Other)

#### Summary

| Category | Files | Token Imports | Hardcoded Colors | Severity |
|----------|-------|---------------|------------------|----------|
| User/Auth | `_login-modal.scss`, `_user-profile.scss` | Complete | 0 | Low |
| Feedback | `_notification.scss`, `_confirm-dialog.scss`, `_confirmation-modal.scss`, `_feedback-modal.scss` | Partial/None | Some | Medium |
| Onboarding | `_role-selection.scss`, `_onboarding-wizard.scss` | None | 1 (#A8C4DDBF) | Medium |
| Other | `_dashboard.scss`, `_specs-page.scss`, `_eki-app.scss`, `_page.scss`, `_simple-layout.scss`, `_phonetic-guide-modal.scss` | Varies | Many | High |

---

#### Issue 1.6.1: Files Missing Token Imports (Critical)

**Severity:** Critical  
**Effort:** Low (15 min)

**Files with NO @import statements:**
- `_notification.scss` - Uses tokens without importing
- `_confirm-dialog.scss` - Uses tokens without importing
- `_role-selection.scss` - Uses tokens without importing
- `_eki-app.scss` - Uses tokens without importing

**Recommendation:** Add standard token imports to each file.

---

#### Issue 1.6.2: `_simple-layout.scss` Extensive Hardcoded Colors (Critical)

**Severity:** Critical  
**Effort:** High (3-4 hours)

**File:** `_simple-layout.scss` (850+ lines)

Contains **50+ hardcoded hex colors** including:
- `#A8C4DDBF`, `#E0E0E0`, `#173148`, `#747676`
- `#BED3E5`, `#F6FBFF`, `#00339940`, `#E3F2FF`
- `#4A90E2`, `#D0E8FF`, `#1a3a52`, `#E8EFF5`
- `#FAFCFE`, `#CCC`, `#D6E9F7`, `#C5CBD1`
- `#999999`, `#C74848DE`, `#F2D9D7`, `#000000`
- `#666`, `#E8EAED`

**Also contains:**
- `darken(#D7E5F2, 8%)` - Using deprecated SCSS function with hardcoded color
- Many hardcoded spacing values
- Hardcoded breakpoints

**Recommendation:** This file needs comprehensive refactoring to use design tokens. Consider if this file is still needed or should be deprecated.

---

#### Issue 1.6.3: `_eki-app.scss` Hardcoded Values

**Severity:** Medium  
**Effort:** Medium (1 hour)

**File:** `_eki-app.scss`

Contains:
- Line 4: Hardcoded gradient `linear-gradient(to bottom, #E3EFFB 0%, #F0F4F8 100%)`
- Line 208: Hardcoded gradient with `#f8fbff`
- Multiple `color: white` instances (10 occurrences)

**Recommendation:** Create gradient tokens or use existing color tokens.

---

#### Issue 1.6.4: `_role-selection.scss` Hardcoded Border

**Severity:** Low  
**Effort:** Low (5 min)

**File:** `_role-selection.scss`
- Line 48: `border: 1px solid #A8C4DDBF`

**Recommendation:** Use `$color-outlined-neutral` or create token.

---

#### Issue 1.6.5: `_confirm-dialog.scss` Uses `white` Keyword

**Severity:** Low  
**Effort:** Low (5 min)

**File:** `_confirm-dialog.scss`
- Line 19: `background: white`
- Line 81: `color: white`

**Recommendation:** Replace with `$color-white`.

---

### Phase 1.6 Summary

**Total Issues Found:** 5 categories  
**Critical:** 2 (missing imports, `_simple-layout.scss`)  
**High:** 0  
**Medium:** 2 (`_eki-app.scss`, feedback files)  
**Low:** 2 (minor hardcoded values)

**Estimated Total Effort:** 5-6 hours (majority in `_simple-layout.scss`)

**Priority Actions:**
1. Add token imports to files missing them (15 min, critical)
2. Evaluate if `_simple-layout.scss` should be deprecated or refactored (decision needed)
3. Fix `_eki-app.scss` gradient tokens (1 hour)

---

## Phase 1 Overall Summary

### Token Compliance by Category

| Category | Files | Critical | High | Medium | Low |
|----------|-------|----------|------|--------|-----|
| Core UI | 6 | 0 | 2 | 5 | 4 |
| Layout | 4 | 0 | 0 | 1 | 4 |
| Audio/Media | 3 | 2 | 2 | 2 | 1 |
| Phonetic/Text | 6 | 1 | 0 | 4 | 3 |
| Task Management | 8 | 0 | 0 | 0 | 3 |
| Remaining | 16 | 2 | 0 | 2 | 2 |
| **Total** | **43** | **5** | **4** | **14** | **17** |

### Most Problematic Files (Require Immediate Attention)

1. **`_synthesis-results.scss`** - No imports, 100+ hardcoded values
2. **`_simple-layout.scss`** - 50+ hardcoded hex colors
3. **`_audio-player.scss`** - No imports, extensive rem usage
4. **`_playlist-audio-player.scss`** - No imports, extensive rem usage
5. **`_eki-app.scss`** - No imports, hardcoded gradients

### Files With Excellent Compliance

1. All task management files (`_task-*.scss`)
2. `_page-layouts.scss`
3. `_footer.scss`
4. `_pronunciation-variants.scss` (uses mixins well)
5. `_sentence-phonetic-panel.scss` (uses mixins well)

---

## Phase 2: BEM Naming Convention Audit

### Phase 2.1: Block Naming

**Check:** All block names should use lowercase with hyphens (`.task-manager`, not `.taskManager`)

**Results:**
- **PascalCase blocks:** 0 found
- **camelCase blocks:** 0 found
- **Correct lowercase-hyphen blocks:** All component files

**Verdict:** PASS - All block names follow BEM conventions.

---

### Phase 2.2: Element and Modifier Naming

**Check:** Elements use `__`, modifiers use `--`, no deep nesting

**Results:**
- **Proper `__element` classes:** 330 instances across 23 files
- **Proper `--modifier` classes:** 26 instances across 5 files
- **Deep nesting (`__element__subelement`):** 0 found
- **Wrong single underscore patterns:** 0 found

**BEM Usage by File (Top 10):**

| File | `__element` Count | Status |
|------|-------------------|--------|
| `_pronunciation-variants.scss` | 40 | Excellent |
| `_task-detail.scss` | 35 | Excellent |
| `_sentence-phonetic-panel.scss` | 26 | Excellent |
| `_task-modal.scss` | 26 | Excellent |
| `_login-modal.scss` | 23 | Excellent |
| `_sentence-synthesis-item.scss` | 20 | Excellent |
| `_user-profile.scss` | 18 | Excellent |
| `_task-manager.scss` | 17 | Excellent |
| `_phonetic-guide-modal.scss` | 16 | Excellent |
| `_paper.scss` | 14 | Excellent |

**Verdict:** PASS - BEM naming is consistently applied across all component files.

---

### Phase 2 Summary

**BEM Compliance: EXCELLENT**

- No naming convention violations found
- All components use proper `.block`, `.block__element`, `.block--modifier` patterns
- No deep nesting patterns detected
- Consistent use of lowercase-hyphen naming

**No remediation required for BEM naming.**

---

## Phase 3: React Component Architecture Audit

### Component Size Analysis

**Files by Line Count (Top 10 excluding tests):**

| File | Lines | useState Hooks | Status |
|------|-------|----------------|--------|
| `TaskDetailView.tsx` | 781 | **23** | **GOD COMPONENT** |
| `PronunciationVariants.tsx` | 539 | 10 | Large, acceptable |
| `SentenceSynthesisItem.tsx` | 334 | 2 | Good |
| `TaskManager.tsx` | 266 | ~5 | Moderate, has inline TaskRow |
| `SynthesisView.tsx` | 165 | N/A | Good |

---

### Phase 3.1: Modal Components

**Files:** `BaseModal.tsx`, `LoginModal.tsx`, `ConfirmationModal.tsx`, `ConfirmDialog.tsx`, `TaskCreationModal.tsx`, `TaskEditModal.tsx`, `ShareTaskModal.tsx`, `FeedbackModal.tsx`, `AddEntryModal.tsx`

**Findings:**

#### Issue 3.1.1: BaseModal is Well-Designed

**Severity:** N/A (Positive)

`BaseModal.tsx` is a clean, reusable component (47 lines) with:
- Proper TypeScript interface
- Size variants (`small`, `medium`, `large`)
- Keyboard handling (Escape to close)
- Body scroll lock
- Configurable close behavior

**Verdict:** PASS - Good base component pattern.

---

### Phase 3.2-3.6: Combined Component Architecture Findings

#### Issue 3.2.1: TaskDetailView is a GOD Component (Critical)

**Severity:** Critical  
**Effort:** High (4-6 hours)

**File:** `TaskDetailView.tsx` (781 lines)

**Problems:**
1. **23 useState hooks** - extreme state explosion
2. **Multiple responsibilities:**
   - Task loading/display
   - Entry management (CRUD)
   - Audio playback (individual + play all)
   - Drag and drop reordering
   - Pronunciation variants panel
   - Sentence phonetic panel
   - Header menu
   - Entry menu
   - Share modal
3. **ESLint disabled:** Line 1 disables `max-lines-per-function, max-lines, complexity, max-depth`

**State Groups That Should Be Extracted:**
```typescript
// Audio playback state → custom hook
const [currentPlayingId, setCurrentPlayingId] = useState();
const [currentLoadingId, setCurrentLoadingId] = useState();
const [isPlayingAll, setIsPlayingAll] = useState();
const [isLoadingPlayAll, setIsLoadingPlayAll] = useState();
const [playAllAbortController, setPlayAllAbortController] = useState();
const [currentAudio, setCurrentAudio] = useState();

// Pronunciation variants state → custom hook
const [variantsWord, setVariantsWord] = useState();
const [variantsCustomPhonetic, setVariantsCustomPhonetic] = useState();
const [isVariantsPanelOpen, setIsVariantsPanelOpen] = useState();
const [selectedEntryId, setSelectedEntryId] = useState();
const [selectedTagIndex, setSelectedTagIndex] = useState();

// Drag and drop state → custom hook (useDragAndDrop exists!)
const [draggedId, setDraggedId] = useState();
const [dragOverId, setDragOverId] = useState();
```

**Recommendation:** Split into:
1. `useTaskDetailPlayback` hook for audio state
2. `useVariantsPanel` hook (already exists in hooks/)
3. Use existing `useDragAndDrop` hook
4. Extract `TaskDetailHeader` component
5. Extract `TaskDetailEntryList` component

---

#### Issue 3.2.2: Inline Component Definition in TaskManager

**Severity:** Medium  
**Effort:** Low (30 min)

**File:** `TaskManager.tsx`

**Problem:** `TaskRow` component is defined inside `TaskManager.tsx` (lines 10-170)

**Recommendation:** Move to separate file `TaskRow.tsx`

---

#### Issue 3.2.3: Inline Styles (Acceptable)

**Severity:** Low  
**Effort:** N/A

**Found:** 5 instances of `style={` across components

**Analysis:**
- `WizardTooltip.tsx`: Dynamic tooltip positioning - **Acceptable**
- `PlaylistAudioPlayer.tsx`: DnD library transform - **Acceptable**
- `SentenceSynthesisItem.tsx`: Dynamic dropdown position - **Acceptable**
- `SpecsPage.tsx`: Loading text centering - **Should use class**
- `Dashboard.tsx`: Loader spinner size - **Should use class**

**Recommendation:** Only 2 minor fixes needed (SpecsPage, Dashboard).

---

#### Issue 3.2.4: Good Component Patterns Found (Positive)

1. **BaseModal** - Clean, reusable modal base
2. **SentenceSynthesisItem** - Only 2 useState, well-structured
3. **Notification/NotificationContainer** - Clean separation
4. **Custom hooks in `/hooks`** - Good extraction pattern:
   - `useSynthesis.ts`
   - `useDragAndDrop.ts`
   - `useSentenceMenu.ts`
   - `useTaskHandlers.ts`
   - `useVariantsPanel.ts`

---

### Phase 3 Summary

**Component Architecture Issues:**

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| God Components | 1 | 0 | 0 | 0 |
| Inline Components | 0 | 0 | 1 | 0 |
| Inline Styles | 0 | 0 | 0 | 2 |
| **Total** | **1** | **0** | **1** | **2** |

**Primary Action:** Refactor `TaskDetailView.tsx` - this is the single largest architectural issue.

---

## Phase 4: State Management Audit

### Phase 4.1: Context Usage

**Files:** `AuthContext.tsx`, `NotificationContext.tsx`, `OnboardingContext.tsx`

#### Findings

| Context | Lines | Purpose | Quality |
|---------|-------|---------|---------|
| `AuthContext.tsx` | ~126 | Auth state, login/logout | Good |
| `NotificationContext.tsx` | 42 | Toast notifications | Excellent |
| `OnboardingContext.tsx` | N/A | Onboarding wizard state | Good |

**Positive Findings:**
1. **NotificationContext** is clean and minimal - uses ref pattern to avoid re-renders
2. **AuthContext** properly validates isikukood and persists to localStorage
3. Proper error boundaries with `throw new Error` when context is missing

**No major issues with context implementation.**

---

### Phase 4.2: Custom Hooks

**Files:** `useSynthesis.ts`, `useDragAndDrop.ts`, `useSentenceMenu.ts`, `useTaskHandlers.ts`, `useVariantsPanel.ts`

#### Findings

| Hook | Lines | Purpose | Quality |
|------|-------|---------|---------|
| `useSynthesis.ts` | 512 | Synthesis state + operations | Large but well-structured |
| `useDragAndDrop.ts` | ~50 | Drag and drop state | Good |
| `useSentenceMenu.ts` | ~40 | Menu state management | Good |
| `useTaskHandlers.ts` | ~60 | Task CRUD handlers | Good |
| `useVariantsPanel.ts` | ~80 | Variants panel state | Good |

**Positive Findings:**
1. **Good extraction pattern** - logic properly separated from components
2. **useSynthesis** encapsulates complex synthesis state (would be 500+ lines of component code)
3. **Ref pattern** used to avoid stale closures (`sentencesRef.current`)

**Issue 4.2.1: useSynthesis Could Be Split Further**

**Severity:** Low  
**Effort:** Medium (1-2 hours)

The `useSynthesis` hook (512 lines) handles:
- Sentence state management
- Audio playback (single + all)
- Tag editing
- LocalStorage persistence
- Demo data loading

Could potentially be split into:
- `useSentences` - sentence CRUD
- `useSynthesisPlayback` - audio playback
- `useSynthesisStorage` - localStorage

---

### Phase 4.3: Local State Patterns

**Components with Excessive useState (5+):**

| Component | useState Count | Status |
|-----------|----------------|--------|
| `TaskDetailView.tsx` | **23** | Critical - refactor needed |
| `PronunciationVariants.tsx` | 10 | Acceptable for complexity |
| `LoginModal.tsx` | ~6 | Acceptable |
| `TaskManager.tsx` | ~5 | Acceptable |

**Recommendation:** Only `TaskDetailView.tsx` needs state refactoring (already identified in Phase 3).

---

## Phase 5: Code Quality Audit

### Phase 5.1: God Components Identified

**Components > 200 lines:**

| File | Lines | Issues | Priority |
|------|-------|--------|----------|
| `TaskDetailView.tsx` | 781 | 23 useState, multiple responsibilities | **Critical** |
| `PronunciationVariants.tsx` | 539 | Complex but focused | Low |
| `SentenceSynthesisItem.tsx` | 334 | Well-structured | N/A |
| `TaskManager.tsx` | 266 | Inline TaskRow component | Medium |

**Cross-reference with CODE_QUALITY_ANALYSIS.md:**
- Issue #3 (God Component TasksPage) - Appears to be refactored or renamed
- Issue #1 (State Explosion) - Still present in TaskDetailView

---

### Phase 5.2: DRY Violations

**Pattern:** Date formatting is duplicated.

**Example from TaskManager.tsx (line 74):**
```typescript
new Date(task.createdAt).toLocaleDateString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric' })
```

**Same pattern appears in:**
- `TaskDetailView.tsx`
- `TaskRow` component

**Recommendation:** Extract to `utils/formatDate.ts`:
```typescript
export function formatEstonianDate(date: Date): string {
  return date.toLocaleDateString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
```

---

### Phase 5.3: Utility Functions

**Files:** `synthesize.ts`, `phoneticMarkers.ts`, `isikukood.ts`, `warmAudioWorker.ts`

| File | Purpose | Has Tests | Quality |
|------|---------|-----------|---------|
| `synthesize.ts` | Audio synthesis polling | Yes | Good |
| `phoneticMarkers.ts` | Phonetic text processing | Yes (3 test files) | Excellent |
| `isikukood.ts` | Estonian ID validation | Yes | Good |
| `warmAudioWorker.ts` | Audio worker preloading | No | Acceptable |

**Positive:** Good test coverage for utilities.

---

## Phase 6: Type Safety Audit

### Phase 6.1: Type Definitions

**Files:** `synthesis.ts`, `task.ts`, `onboarding.ts`

| File | Types Defined | Quality |
|------|---------------|---------|
| `task.ts` | Task, TaskEntry, TaskSummary, CreateTaskRequest, UpdateTaskRequest | Excellent |
| `synthesis.ts` | SentenceState, EditingTag, OpenTagMenu, + helper functions | Good |
| `onboarding.ts` | N/A | N/A |

**Positive Findings:**
1. **Clean interface definitions** with proper optionality handling
2. **Helper functions** included with types (`getVoiceModel`, `convertTextToTags`)
3. **Nullable types** properly defined (`string | null`)

**Minor Issue:** `synthesis.ts` mixes types with utility functions - consider separating.

---

### Phase 6.2: Component Props Typing

**Spot-check of 10 components:**

| Component | Props Interface | Typed | Quality |
|-----------|-----------------|-------|---------|
| BaseModal | `BaseModalProps` | Yes | Excellent |
| TaskDetailView | `TaskDetailViewProps` | Yes | Good |
| SentenceSynthesisItem | `SentenceSynthesisItemProps` | Yes | Good |
| PronunciationVariants | `PronunciationVariantsProps` | Yes | Good |
| LoginModal | Inline props | Partial | Medium |
| Notification | Multiple interfaces | Yes | Good |

**No critical typing issues found.**

---

## Phase 7: Service Layer Audit

### Phase 7.1: Data Service

**File:** `dataService.ts` (639 lines)

**Architecture:**
- Singleton pattern (`getInstance()`)
- Combines baseline tasks (JSON) with user tasks (localStorage)
- Handles task CRUD, entries, sharing

**Positive:**
- Clean separation of baseline vs user data
- Proper error handling with try/catch
- Share token generation

**Issues:**
1. **Large file** - 639 lines, could be split
2. **Mixed concerns** - handles both tasks and entries
3. **localStorage coupling** - harder to test

**Recommendation (Low Priority):**
- Split into `TaskService` and `EntryService`
- Add abstraction layer for storage (for testing)

---

### Phase 7.2: Spec Integration

**Files:** `src/services/specs/` - Generated feature files

**Purpose:** Gherkin feature specifications converted to TypeScript

**No issues - appears to be generated code for BDD testing.**

---

## Phase 8: Findings Consolidation and Recommendations

### Phase 8.1: Summary of All Findings

#### Critical Issues (Require Immediate Attention)

| # | Category | Issue | File(s) | Effort |
|---|----------|-------|---------|--------|
| 1 | SCSS | Missing token imports | `_synthesis-results.scss` | Low |
| 2 | SCSS | 100+ hardcoded values | `_synthesis-results.scss` | High |
| 3 | SCSS | Missing token imports | `_audio-player.scss`, `_playlist-audio-player.scss` | Low |
| 4 | SCSS | Missing token imports | `_notification.scss`, `_confirm-dialog.scss`, `_role-selection.scss`, `_eki-app.scss` | Low |
| 5 | SCSS | 50+ hardcoded hex colors | `_simple-layout.scss` | High |
| 6 | React | GOD component (781 lines, 23 useState) | `TaskDetailView.tsx` | High |

#### High Severity Issues

| # | Category | Issue | File(s) | Effort |
|---|----------|-------|---------|--------|
| 7 | SCSS | Extensive rem unit usage | `_audio-player.scss`, `_playlist-audio-player.scss` | High |
| 8 | SCSS | Hardcoded `white` colors | Multiple files (40 instances) | Medium |
| 9 | SCSS | Missing spacing token imports | `_textarea.scss`, `_button.scss` | Low |

#### Medium Severity Issues

| # | Category | Issue | File(s) | Effort |
|---|----------|-------|---------|--------|
| 10 | SCSS | Hardcoded RGBA shadows | 15+ files | Medium |
| 11 | SCSS | Hardcoded typography values | Multiple files | High |
| 12 | SCSS | Hardcoded breakpoints | 20+ instances | Low |
| 13 | React | Inline component definition | `TaskManager.tsx` (TaskRow) | Low |
| 14 | React | Minor inline styles | `SpecsPage.tsx`, `Dashboard.tsx` | Low |

#### Low Severity Issues

| # | Category | Issue | File(s) | Effort |
|---|----------|-------|---------|--------|
| 15 | SCSS | Hardcoded component dimensions | Various | Medium |
| 16 | SCSS | Deprecated SCSS functions | `_simple-layout.scss` (`darken()`) | Low |
| 17 | Code | DRY violation (date formatting) | Multiple components | Low |
| 18 | Hooks | useSynthesis could be split | `useSynthesis.ts` | Medium |

---

### Phase 8.2: Prioritized Action Plan

#### Tier 1: Quick Wins (Under 30 minutes each)

| Action | Files | Time | Impact |
|--------|-------|------|--------|
| Add token imports to audio components | `_audio-player.scss`, `_playlist-audio-player.scss` | 10 min | Critical |
| Add token imports to feedback/other files | 4 files | 15 min | Critical |
| Add spacing imports | `_textarea.scss`, `_button.scss` | 5 min | High |
| Replace `white` with `$color-white` | Multiple | 20 min | High |
| Replace hardcoded breakpoints | Multiple | 20 min | Medium |
| Extract `formatDate` utility | Create new file | 15 min | Low |
| Move TaskRow to separate file | `TaskManager.tsx` | 30 min | Medium |

**Total Tier 1 Effort: ~2 hours**

#### Tier 2: Medium Effort (1-2 hours each)

| Action | Files | Time | Impact |
|--------|-------|------|--------|
| Create shadow tokens | `_colors.scss` + updates | 1 hour | Medium |
| Fix `_eki-app.scss` gradients | `_eki-app.scss` | 1 hour | Medium |
| Replace typography hardcoded values | Multiple | 2 hours | Medium |
| Remove inline styles | `SpecsPage.tsx`, `Dashboard.tsx` | 30 min | Low |

**Total Tier 2 Effort: ~4.5 hours**

#### Tier 3: Major Refactoring (4+ hours each)

| Action | Files | Time | Impact |
|--------|-------|------|--------|
| Refactor `TaskDetailView.tsx` | Extract hooks, split components | 4-6 hours | Critical |
| Refactor `_synthesis-results.scss` | Token compliance | 3-4 hours | Critical |
| Evaluate `_simple-layout.scss` | Deprecate or refactor | 3-4 hours | High |
| Convert audio SCSS rem to tokens | 2 files | 2-3 hours | High |

**Total Tier 3 Effort: ~14-17 hours**

---

### Phase 8.3: Status of Previously Identified Issues

**Cross-reference with existing documentation:**

#### From ARCHITECTURAL_PROBLEMS.md

| Issue | Status | Notes |
|-------|--------|-------|
| 1. No Code Splitting Strategy | Not addressed | Still valid concern |
| 2. Component Duplication | Improved | BaseModal provides good pattern |
| 3. Hardcoded Values | Partially addressed | Task components good, others need work |
| 4. Mixed State Management | Improved | Contexts and hooks used well |
| 5. No Clear Separation of Concerns | Partially addressed | Some god components remain |
| 6. Inconsistent Error Handling | Not addressed | Still valid concern |
| 7. No API Abstraction Layer | Improved | DataService provides abstraction |
| 8. CSS Architecture Issues | Improved | Design system in place, compliance varies |
| 9. Complex Import Paths | Not verified | May still be issue |
| 10. Inconsistent Loading States | Partially addressed | Still some variation |
| 11. Dynamic/Static Import Conflicts | Not verified | |
| 12. Missing Error Boundaries | Not addressed | Still valid concern |

#### From CODE_QUALITY_ANALYSIS.md

| Issue | Status | Notes |
|-------|--------|-------|
| 1. State Explosion | Still present | TaskDetailView has 23 useState |
| 2. Hardcoded Fallback User | Not verified | |
| 3. God Component | Still present | TaskDetailView (781 lines) |
| 4. Inline Component Definition | Still present | TaskRow in TaskManager |
| 5. Duplicate Form Logic | Partially addressed | |
| 6. Mixed Concerns in Modal | Improved | BaseModal is clean |
| 7. Inline Utility | Partially addressed | formatDate still inline |
| 8. Implicit Dependencies | Not verified | |
| 9. Magic Strings | Not addressed | Estonian text hardcoded |
| 10. Prop Drilling | Partially addressed | Contexts help |

---

### Final Summary

#### Overall Assessment

| Area | Grade | Notes |
|------|-------|-------|
| BEM Naming Convention | **A** | Excellent compliance |
| Token Usage (Task components) | **A** | Best-in-class |
| Token Usage (Audio components) | **D** | Critical - missing imports |
| Token Usage (Phonetic components) | **C** | Mixed - synthesis-results is worst |
| React Component Structure | **B** | Good except TaskDetailView |
| Custom Hooks | **A-** | Well-structured |
| Type Safety | **A** | Clean TypeScript |
| State Management | **B** | Good context usage, one god component |
| Overall | **B-** | Good foundation, specific areas need work |

#### Key Metrics

- **SCSS Files Audited:** 43
- **Critical Issues:** 6
- **High Issues:** 3
- **Medium Issues:** 5
- **Low Issues:** 4
- **Files Needing Immediate Attention:** 5 SCSS + 1 React
- **Estimated Total Remediation:** 20-25 hours

---

### Recommended Next Steps

1. **Immediate (This Sprint):**
   - Add missing token imports to 6 SCSS files (30 min)
   - Replace `white` with `$color-white` globally (20 min)
   - Replace hardcoded breakpoints with mixins (20 min)

2. **Short Term (Next Sprint):**
   - Refactor `TaskDetailView.tsx` - extract state to hooks (4-6 hours)
   - Begin `_synthesis-results.scss` token compliance (3-4 hours)
   - Create shadow tokens (1 hour)

3. **Long Term (Next Quarter):**
   - Evaluate deprecation of `_simple-layout.scss`
   - Complete audio component token compliance
   - Add error boundaries
   - Implement code splitting

---

**Audit Complete.**

*Generated: January 2026*

