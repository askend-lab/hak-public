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

## UI Behavior

### Initial State
- Empty input field with placeholder text
- No tags displayed

### Tag Creation
- User types a word (e.g., "Tere")
- User presses Space
- Word becomes a tag/chip displayed before the input field
- Input field clears for next word

### Tag Editing
- With empty input, user presses Backspace
- Last tag content moves back to input field
- Tag is removed from tag list
- User can edit and re-add the word

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
- Tags can be clicked to open pronunciation variants panel
- Audio cache is invalidated when text changes
