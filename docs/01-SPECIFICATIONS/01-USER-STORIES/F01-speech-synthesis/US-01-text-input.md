# US-01: Enter Text with Tag-Based Input

**Feature:** F01 Speech Synthesis  
**Priority:** Critical

## User Story

As a **language learner**  
I want to **enter Estonian text using a tag-based input system**  
So that **I can see my text organized as clickable words for easy manipulation**

## Acceptance Criteria

- [ ] **AC-1:** Text input field is visible on the main synthesis page
- [ ] **AC-2:** Typing text and pressing Space creates a word tag (chip) from the current input
- [ ] **AC-3:** Multiple words can be added as tags sequentially
- [ ] **AC-4:** Pressing Backspace on empty input moves the last tag back into the input field for editing
- [ ] **AC-5:** Pasting multi-word text creates multiple tags at once
- [ ] **AC-6:** Word tags are displayed as clickable chips that can be selected
- [ ] **AC-7:** Each tag shows the original word text (not phonetic form)
- [ ] **AC-8:** Clicking a tag opens a menu with options: Uuri variandid, Muuda, Kustuta
- [ ] **AC-9:** Selecting "Muuda" allows inline editing of the tag with Enter to confirm

## UI Behavior

### Initial State
- Empty input field with placeholder text
- No tags displayed

### Tag Creation
- User types a word (e.g., "Tere")
- User presses Space
- Word becomes a tag/chip displayed before the input field
- Input field clears for next word

### Tag Editing (via Backspace)
- With empty input, user presses Backspace
- Last tag content moves back to input field
- Tag is removed from tag list
- User can edit and re-add the word

### Tag Menu Actions
- Click on any word tag to open a dropdown menu with options:
  - **Uuri variandid** - Opens pronunciation variants panel (see F02)
  - **Muuda** - Enters inline edit mode for the tag
  - **Kustuta** - Removes the tag from the sentence

### Inline Tag Editing (via Menu)
- User clicks on a tag and selects "Muuda"
- Tag transforms into an editable input field
- User edits the word text
- Press Enter to confirm edit and synthesize audio
- Press Space to confirm edit without synthesis
- Press Escape to cancel and restore original value

### Multi-Word Paste
- User pastes "Tere päevast kuidas läheb"
- All words become separate tags
- Input field clears

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Create tag from current input (when tags exist) |
| Enter | Create tag + synthesize audio |
| Backspace | Edit last tag (when input empty) |

## Related Test Cases

- [TC-01: Basic Synthesis Flow](../../02-TEST-CASES/F01-speech-synthesis/TC-01-basic-synthesis.md)
- [TC-02: Input Behaviors](../../02-TEST-CASES/F01-speech-synthesis/TC-02-input-behaviors.md)

## Notes

- Space key only creates tags when at least one tag already exists (first input is plain text)
- Tags can be clicked to open a menu with pronunciation variants, edit, and delete options
- Audio cache is invalidated when text changes
- Inline tag editing allows modifying individual words without deleting the entire sentence