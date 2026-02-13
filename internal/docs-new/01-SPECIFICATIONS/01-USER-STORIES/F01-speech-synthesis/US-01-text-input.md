# US-01: Enter Text with Tag-Based Input

**Feature:** F01 Speech Synthesis  
**Priority:** Critical

## User Story

As a **language learner**  
I want to **enter Estonian text using a tag-based input system**  
So that **I can see my text organized as clickable words for easy manipulation**

## Acceptance Criteria

- [x] **AC-1:** Text input field is visible on the main synthesis page
- [x] **AC-2:** Typing text and pressing Space creates a word tag when at least one tag already exists
- [x] **AC-3:** Multiple words can be added as tags sequentially
- [x] **AC-4:** Pressing Backspace on empty input moves the last tag back into the input field for editing
- [x] **AC-5:** Typing or pasting multi-word text and pressing Enter creates multiple tags at once
- [x] **AC-6:** Word tags are displayed as clickable chips that can be selected
- [x] **AC-7:** Each tag shows the original word text (not phonetic form)
- [x] **AC-8:** Clicking a tag opens a menu with options: Vali sõna häälduskuju, Muuda sõna kirjakuju, Kustuta sõna
- [x] **AC-9:** Selecting "Muuda sõna kirjakuju" allows inline editing of the tag
- [x] **AC-10:** Clear button (X) appears when tags or input text exist, clearing all content when clicked
- [x] **AC-11:** When input field loses focus (blur) with tags present, remaining input text is added as tags

## UI Behavior

### Initial State
- Empty input field with placeholder text: "Kirjuta sõna või lause ja vajuta Enter"
- No tags displayed
- Clear button hidden

### Tag Creation
- User types a word (e.g., "Tere")
- User presses Enter
- Word becomes a tag/chip displayed before the input field
- Input field clears for next word
- Audio synthesis is triggered

### Tag Creation via Space (When Tags Exist)
- When at least one tag already exists
- User types a word and presses Space
- Word becomes a tag/chip
- Input field clears
- No audio synthesis is triggered

### Tag Editing (via Backspace)
- With empty input, user presses Backspace
- Last tag content moves back to input field
- Tag is removed from tag list
- User can edit and re-add the word

### Tag Menu Actions
- Click on any word tag to open a dropdown menu with options:
  - **Vali sõna häälduskuju** - Opens pronunciation variants panel (see F02)
  - **Muuda sõna kirjakuju** - Enters inline edit mode for the tag
  - **Kustuta sõna** - Removes the tag from the sentence

### Inline Tag Editing (via Menu)
- User clicks on a tag and selects "Muuda sõna kirjakuju"
- Tag transforms into an editable input field
- User edits the word text
- Press Enter to confirm edit and trigger audio synthesis
- Press Space to confirm edit without synthesis
- Press Escape to cancel and restore original value
- Blur (clicking outside) confirms edit without synthesis

### Multi-Word Input
- User types or pastes "Tere päevast kuidas läheb"
- Text stays in input field until Enter is pressed
- Pressing Enter creates all words as separate tags and triggers synthesis
- If tags exist, pressing Space after each word creates tags one at a time

### Clear All
- Clear button (X) appears when tags or input text exist
- Clicking clears all tags and input text
- Resets sentence to initial state

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Create tag from current input (only when tags already exist) |
| Enter | Create tag(s) + synthesize audio |
| Backspace | Move last tag to input (when input is empty) |
| Escape | Cancel inline tag editing |

## Related Test Cases

- [TC-01: Basic Synthesis Flow](../../02-TEST-CASES/F01-speech-synthesis/TC-01-basic-synthesis.md)
- [TC-02: Input Behaviors](../../02-TEST-CASES/F01-speech-synthesis/TC-02-input-behaviors.md)

## Notes

- First word must use Enter to create a tag; Space only works when tags already exist
- Tags can be clicked to open a menu with pronunciation variants, edit, and delete options
- Audio cache is invalidated when text changes
- Inline tag editing allows modifying individual words without deleting the entire sentence
- When editing a tag, entering multiple words (separated by spaces) will split into multiple tags
- Empty tag edit (just spaces) deletes the tag
