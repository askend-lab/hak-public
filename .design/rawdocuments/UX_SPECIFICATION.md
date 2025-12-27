# UX Specification - Detailed Functionality

**Based on:** Prototype review meeting (Oct 15, 2025)

---

## 🎯 Core User Flow

```
1. User enters text → 
2. System processes → 
3. Shows sentence broken into words → 
4. Plays audio with synchronized highlighting → 
5. User can modify/explore variations → 
6. Save to temporary playlist → 
7. (Optional) Save as exercise
```

---

## 📱 Main Interface Components

### 1. Text Input Area
```
┌─────────────────────────────────────────────────────┐
│  Enter Estonian text:                               │
│  ┌───────────────────────────────────────────────┐  │
│  │ Tere, kuidas läheb?                           │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  [Listen] [Clear]                                   │
└─────────────────────────────────────────────────────┘
```

**Behavior:**
- User types or pastes text
- Click "Listen" → immediate synthesis + playback
- Result appears below

---

### 2. Word-by-Word Display (Karaoke Mode)

```
┌─────────────────────────────────────────────────────┐
│  Original Sentence:                                 │
│  ┌───────────────────────────────────────────────┐  │
│  │ [Tere,] [kuidas] [läheb?]                     │  │
│  │   ↑ Currently playing (highlighted)            │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  🔊 ═══════════════════╸─────── 0:03 / 0:05        │
│      [⏸ Pause] [↻ Replay]                          │
└─────────────────────────────────────────────────────┘
```

**Key Features:**
1. **Sentence broken into individual words**
   - Each word is clickable
   - Words are separated visually

2. **Synchronized highlighting**
   - Current word highlights as audio plays
   - Visual feedback matches audio timing
   - "Karaoke-style" experience

3. **Audio controls**
   - Play/Pause
   - Replay
   - Progress bar

---

### 3. Word-Level Interaction

**When user clicks on a word:**

```
┌─────────────────────────────────────────────────────┐
│  Selected Word: "kuidas"                            │
│                                                     │
│  Pronunciation Variants:                            │
│  ┌───────────────────────────────────────────────┐  │
│  │ ○ ku'idas  [🔊] [Use in sentence]             │  │
│  │ ○ kui'das  [🔊] [Use in sentence]             │  │
│  │ ○ k'uidas  [🔊] [Use in sentence]             │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  [+ Create custom variant]                          │
└─────────────────────────────────────────────────────┘
```

**Functionality:**

1. **Show pronunciation variants**
   - Different stress positions
   - Different phonetic forms
   - Context-dependent variations

2. **Listen to each variant**
   - Click 🔊 to hear just that word
   - Quick comparison of options

3. **Use variant in sentence**
   - Replace word in original sentence
   - Re-synthesize entire sentence with new pronunciation
   - Hear how it sounds in context

**Important:** Even if variant doesn't fit context, still allow it
- User can experiment
- Educational value in hearing "wrong" versions

---

### 4. Phonetic Transcription View

```
┌─────────────────────────────────────────────────────┐
│  [Words View] [Phonetic View]  ← Toggle             │
│                                                     │
│  Full Sentence with Phonetic Marks:                 │
│  ┌───────────────────────────────────────────────┐  │
│  │ Te're, ku'idas lä'heb?                        │  │
│  │  ↑ ↑     ↑  ↑    ↑ ↑   ← All marks visible   │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  [Edit manually] [Revert to original]               │
└─────────────────────────────────────────────────────┘
```

**Functionality:**

1. **Full phonetic display**
   - All stress marks visible
   - All special characters
   - Complete transcription

2. **Manual editing**
   - User can modify any mark
   - Syntax is provided (we give rules)
   - Custom transcription possible

3. **Re-synthesize**
   - After editing, synthesize with new marks
   - Hear the result
   - Iterate until satisfied

---

### 5. Custom Variant Creator

```
┌─────────────────────────────────────────────────────┐
│  Create Custom Pronunciation                        │
│                                                     │
│  Word: kuidas                                       │
│                                                     │
│  Phonetic notation:                                 │
│  ┌───────────────────────────────────────────────┐  │
│  │ ku''idas                                      │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Syntax help: [?]                                   │
│  ' = primary stress                                 │
│  '' = secondary stress                              │
│  ... (other rules)                                  │
│                                                     │
│  [Test] [Add to variants]                           │
└─────────────────────────────────────────────────────┘
```

**Functionality:**
- User enters phonetic notation manually
- "Test" → synthesize just that word
- "Add" → adds to variant list for that word
- Can use in sentences

---

### 6. Temporary Playlist (Session Storage)

```
┌─────────────────────────────────────────────────────┐
│  My Sentences (This Session)                        │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ 1. Tere, kuidas läheb?         [🔊] [✖] [✎]  │  │
│  │ 2. Täna on ilus ilm.           [🔊] [✖] [✎]  │  │
│  │ 3. Ma õpin eesti keelt.        [🔊] [✖] [✎]  │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  [▶ Play All] [Clear All]                           │
│                                                     │
│  ⚠ These will be lost when you close the page      │
│  💡 Log in to save permanently                      │
└─────────────────────────────────────────────────────┘
```

**Functionality:**

1. **Add to playlist**
   - "Save" button on each synthesized sentence
   - Adds to list below
   - Order preserved

2. **Manage items**
   - 🔊 Play individual sentence
   - ✖ Remove from list
   - ✎ Edit (goes back to editor)

3. **Play all**
   - Sequential playback of all sentences
   - Pause between sentences
   - Shows progress

4. **Session-only**
   - Stored in browser localStorage
   - Lost on page close
   - No server storage for anonymous users

---

### 7. Save as Exercise (Logged-in Users Only)

```
┌─────────────────────────────────────────────────────┐
│  Save as Exercise                                   │
│                                                     │
│  Title:                                             │
│  ┌───────────────────────────────────────────────┐  │
│  │ Different pronunciations of "kuidas"          │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Description (optional):                            │
│  ┌───────────────────────────────────────────────┐  │
│  │ Practice listening to context-dependent       │  │
│  │ variations of this common word                │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Sentences to include:                              │
│  ☑ Tere, kuidas läheb?                              │
│  ☑ Täna on ilus ilm.                                │
│  ☐ Ma õpin eesti keelt.                             │
│                                                     │
│  [Save] [Cancel]                                    │
└─────────────────────────────────────────────────────┘
```

**After saving:**
```
┌─────────────────────────────────────────────────────┐
│  ✅ Exercise Saved!                                  │
│                                                     │
│  Share link:                                        │
│  ┌───────────────────────────────────────────────┐  │
│  │ https://app.com/share/abc123def456           │  │
│  │                              [📋 Copy]        │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Anyone with this link can view and practice        │
│  this exercise (read-only).                         │
└─────────────────────────────────────────────────────┘
```

---

### 8. Exercise Management (My Exercises)

**Access:** Top menu → "My Exercises" (logged-in users only)

```
┌─────────────────────────────────────────────────────┐
│  My Exercises                          [+ New]      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ 📚 Different pronunciations of "kuidas"       │  │
│  │    5 sentences  •  Created: Oct 10, 2025      │  │
│  │    [Open] [Share] [Delete]                    │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ 📚 Long vowel practice                        │  │
│  │    8 sentences  •  Created: Oct 8, 2025       │  │
│  │    [Open] [Share] [Delete]                    │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ 📚 Common greetings                           │  │
│  │    3 sentences  •  Created: Oct 5, 2025       │  │
│  │    [Open] [Share] [Delete]                    │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Functionality:**

1. **List all user's exercises**
   - Title, sentence count, creation date
   - Sorted by most recent first

2. **Open exercise**
   - View/edit mode
   - See all sentences in exercise
   - Add new sentences
   - Remove sentences
   - Re-synthesize if needed

3. **Share exercise**
   - Generate shareable link
   - Copy to clipboard
   - Link is permanent (until exercise deleted)

4. **Delete exercise**
   - Confirmation dialog
   - Permanently removes exercise

5. **Create new exercise**
   - Two ways:
     - From temporary playlist (save current session)
     - From scratch (empty exercise, add sentences)

---

### 9. Exercise Edit View

**When opening an existing exercise:**

```
┌─────────────────────────────────────────────────────┐
│  ← Back to My Exercises                             │
├─────────────────────────────────────────────────────┤
│  Exercise: Different pronunciations of "kuidas"     │
│                                         [✎ Edit]    │
│                                                     │
│  Description: Practice listening to context-        │
│  dependent variations of this common word           │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ Sentences (5)                    [+ Add New]  │  │
│  ├───────────────────────────────────────────────┤  │
│  │ 1. Tere, kuidas läheb?    [🔊] [✖] [↓] [↑]  │  │
│  │ 2. Kuidas sul läheb?      [🔊] [✖] [↓] [↑]  │  │
│  │ 3. Täna on ilus ilm.      [🔊] [✖] [↓] [↑]  │  │
│  │ 4. Ma õpin eesti keelt.   [🔊] [✖] [↓] [↑]  │  │
│  │ 5. Aitäh, väga hästi!     [🔊] [✖] [↓] [↑]  │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  [▶ Play All] [📤 Share] [🗑 Delete Exercise]       │
└─────────────────────────────────────────────────────┘
```

**Functionality:**

1. **View metadata**
   - Title, description
   - Edit metadata (✎ button)

2. **Manage sentences**
   - 🔊 Play individual sentence
   - ✖ Remove from exercise
   - ↓↑ Reorder sentences

3. **Add new sentences**
   - Opens synthesis interface
   - After synthesis, add to exercise

4. **Re-synthesize**
   - If component updated
   - If pronunciation rules changed
   - "Refresh all audio" option

---

### 10. Shared Exercise View (Public Access)

**URL:** `/share/:token`  
**Access:** Anyone with link (no login required)

```
┌─────────────────────────────────────────────────────┐
│  🔗 Shared Exercise                                  │
├─────────────────────────────────────────────────────┤
│  Different pronunciations of "kuidas"               │
│                                                     │
│  Practice listening to context-dependent            │
│  variations of this common word                     │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ Sentences (5)                                 │  │
│  ├───────────────────────────────────────────────┤  │
│  │ 1. Tere, kuidas läheb?              [🔊]     │  │
│  │ 2. Kuidas sul läheb?                [🔊]     │  │
│  │ 3. Täna on ilus ilm.                [🔊]     │  │
│  │ 4. Ma õpin eesti keelt.             [🔊]     │  │
│  │ 5. Aitäh, väga hästi!               [🔊]     │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  [▶ Play All]                                       │
│                                                     │
│  💡 Want to create your own exercises?              │
│     [Sign Up] or [Log In]                           │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Read-only view
- Can listen to all sentences
- Cannot edit or add
- Encourages sign-up

---

### 11. Feedback/Contact Form

**Low priority feature**

```
┌─────────────────────────────────────────────────────┐
│  Contact Us / Report Issue                          │
│                                                     │
│  Name:                                              │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Email:                                             │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Message:                                           │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  │                                               │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  [reCAPTCHA or similar]                             │
│                                                     │
│  [Send]                                             │
└─────────────────────────────────────────────────────┘
```

**Implementation:**
- Client already has email system
- Can reuse their existing form/endpoint
- Or simple POST to their email service
- Add captcha for spam prevention
- **Not critical for MVP**

---

## 🔄 Data Flow Summary

### Anonymous User Flow
```
1. Enter text
2. Synthesize → word-by-word display
3. Explore variants, edit phonetics
4. Add to temporary playlist
5. Play, experiment, learn
6. Close page → all lost
```

### Logged-in User Flow
```
1-5. Same as anonymous
6. Save playlist as named exercise
7. Get shareable link
8. Share with students
9. Students access (no login required)
10. Students see read-only version
```

---

## 🎨 UI/UX Principles

### 1. Immediate Feedback
- Click "Listen" → audio starts playing immediately
- No "processing" step visible to user
- If queued, show "Preparing audio..." briefly

### 2. Visual Synchronization
- Words highlight as they're spoken
- Clear visual connection between text and audio
- Progress indicator matches speech

### 3. Exploratory Learning
- Allow "wrong" variants (educational)
- No judgments or errors
- Encourage experimentation

### 4. Minimal Clicks
- Default action is "listen"
- Common tasks ≤ 2 clicks
- Keyboard shortcuts for power users

### 5. Progressive Complexity
- Simple: just type and listen
- Intermediate: explore variants
- Advanced: manual phonetic editing
- Expert: create custom variants

---

## 🤔 Open UX Questions

### Question 1: One-button vs Two-button
**Option A: One button "Listen"**
- Click → synthesize + play immediately
- Fast, simple
- User might not realize processing happened

**Option B: Two buttons**
- "Synthesize" → prepare audio
- "Play" → play prepared audio
- More control, clearer process
- Extra click

**Recommendation:** Start with Option A, add Option B as setting

### Question 2: Play All Behavior
**When clicking "Play All" on playlist:**
- Pause between sentences? (1 second? 2 seconds?)
- Show progress? (Sentence 2 of 5...)
- Allow skip to next?

**Needs clarification from client**

### Question 3: Variant Source
**Where do pronunciation variants come from?**
- Pre-generated by stress marker? (all possible variations)
- Linguistic rules? (stress can be here, here, or here)
- Database of common variations?
- Generated on-demand?

**Critical for architecture - need to clarify**

### Question 4: Phonetic Syntax
**What notation system?**
- IPA (International Phonetic Alphabet)?
- Custom Estonian notation?
- Simplified marks (' for stress)?

**Client provides this (they mentioned "syntax is known")**

### Question 5: Word Boundaries
**How to split sentence into words?**
- Simple space splitting?
- Punctuation handling?
- Compound words?
- Client's stress marker already does this?

**Need to test with their component**

---

## 📊 Feature Complexity Matrix

| Feature | Complexity | Priority | MVP? |
|---------|-----------|----------|------|
| Basic synthesis | Low | High | ✅ Yes |
| Word-by-word display | Medium | High | ✅ Yes |
| Karaoke highlighting | Medium | Medium | ⚠️ Maybe |
| Variant exploration | High | High | ✅ Yes |
| Manual phonetic edit | Medium | Medium | ✅ Yes |
| Custom variants | Medium | Low | ❌ Phase 2 |
| Temporary playlist | Low | Medium | ✅ Yes |
| Play all | Medium | Low | ⚠️ Maybe |
| Save exercises | Low | High | ✅ Yes |

**MVP Scope:**
- Basic synthesis ✅
- Word display ✅
- Variants ✅
- Manual edit ✅
- Playlist ✅
- Save exercises ✅

**Phase 2:**
- Karaoke sync
- Custom variants
- Play all
- Advanced features

---

## 🛠️ Technical Implications

### Word-level Audio
**Challenge:** How to play individual words?

**Option 1: Pre-generate all**
- Synthesize full sentence
- Also synthesize each word individually
- Store all audio files
- Pros: Fast playback
- Cons: More synthesis calls, more storage

**Option 2: On-demand**
- Only synthesize full sentences
- When user clicks word, synthesize on the fly
- Pros: Less initial load
- Cons: Delay when clicking words

**Recommendation:** Hybrid
- Full sentence always
- Words on-demand (cached after first request)

### Pronunciation Variants
**Challenge:** Generate/store variants

**Architecture:**
```
1. User enters sentence
2. Stress marker returns:
   - Default stressed text
   - Variant list per word (?)
   
OR

3. We query: "Give me variants for word X"
4. Stress marker returns list
5. We cache variants
```

**Need to clarify with client's component**

### Karaoke Synchronization
**Challenge:** Time-align words with audio

**Option 1: Word-level synthesis**
- Synthesize each word separately
- Know exact duration of each
- Concatenate visually
- Pros: Perfect sync
- Cons: Unnatural speech (no coarticulation)

**Option 2: Phoneme-level timing**
- Merlin outputs timing data?
- Map phonemes → words
- Pros: Natural speech
- Cons: Complex, need timing data

**Option 3: Approximate**
- Calculate average word duration
- Equal spacing
- Pros: Simple
- Cons: Imprecise

**Need to check:** Does Merlin output timing data?

---

## 📐 Wireframe Annotations

### Desktop Layout
```
┌────────────────────────────────────────────────────────────┐
│  [Logo] Estonian Pronunciation Tool      [Login] [Lang]    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Input Area (full width)                              │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Word-by-Word Display + Audio Player                  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌────────────────────────────┬─────────────────────────┐ │
│  │ Variant Explorer           │  Temporary Playlist     │ │
│  │ (when word selected)       │  (always visible)       │ │
│  │                            │                         │ │
│  └────────────────────────────┴─────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Mobile Layout
```
┌──────────────────────┐
│ ☰ [Logo]    [Login]  │
├──────────────────────┤
│                      │
│ ┌──────────────────┐ │
│ │ Input            │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ Words + Audio    │ │
│ └──────────────────┘ │
│                      │
│ [Variants ▼]         │  ← Expandable
│                      │
│ [My List (3) ▼]      │  ← Expandable
│                      │
└──────────────────────┘
```

---

---

## 🎨 Design System & Visual Requirements

### Client's Design System

**Key Information:**
- Client (EKI - Estonian Language Institute) has existing design system
- Repository available (need access)
- Must use their branding:
  - Colors
  - Typography
  - Frame/border styles
  - Component styles

**Technical Approach:**
- Design system may be framework-agnostic
- Likely CSS-based or design tokens
- Need to integrate into our chosen framework
- Can potentially import as CSS or convert to component library

### Phonetic Notation Display

**Current Issue:**
- Prototype uses "square boxes" (квадратики) for stress marks
- **Not intuitive** for users
- Not standard international notation

**To Be Decided:**
- Meeting with designer (Helen) next week
- Will determine:
  - How to visually represent stress marks
  - Alternative notation display
  - More standard/intuitive approach

**Technical Consideration:**
- Whatever component outputs → we map to visual components
- Abstraction layer between data and presentation
- Easy to swap visualization without changing data layer

**Examples of alternatives:**
```
Current (squares):    Te□re, kui□das lä□heb?
Standard IPA-style:   ˈtere, ˈkuidas ˈlæheb
Simple marks:         Te're, kui'das lä'heb
Bold stress:          **Te**re, **kui**das **lä**heb
Underline:            Tere, kuidas läheb
                      ‾
```

### Grammar/Spell Checking

**Question raised:** Should we validate text input?

**Current Answer:** 
- **NOT required** for MVP
- No grammar checking requested
- No spell checking needed
- User responsible for correct input
- Focus on pronunciation, not validation

**Rationale:**
- This is a pronunciation tool, not a language learning platform
- Users (teachers) are expected to provide correct text
- Adding validation significantly increases scope

---

## 📋 Updated Priority Matrix

| Feature | Complexity | Priority | MVP? | Notes |
|---------|-----------|----------|------|-------|
| Basic synthesis | Low | High | ✅ Yes | Core feature |
| Word-by-word display | Medium | High | ✅ Yes | Core feature |
| Karaoke highlighting | Medium | Medium | ⚠️ Maybe | Nice-to-have |
| Variant exploration | High | High | ✅ Yes | Core feature |
| Manual phonetic edit | Medium | Medium | ✅ Yes | Important |
| Custom variants | Medium | Low | ❌ Phase 2 | Can defer |
| Temporary playlist | Low | Medium | ✅ Yes | Easy win |
| Play all | Medium | Low | ⚠️ Maybe | If time permits |
| Save exercises | Low | High | ✅ Yes | Core for teachers |
| **Exercise management** | Low | High | ✅ Yes | CRUD operations |
| **Exercise sharing** | Low | High | ✅ Yes | Core for teachers |
| **Design system integration** | Medium | High | ✅ Yes | Brand compliance |
| Contact form | Low | Low | ❌ Phase 2 | Use existing system |
| Grammar checking | High | N/A | ❌ Not needed | Out of scope |

---

## 🔧 Technical Requirements Update

### Design System Integration

**Tasks:**
1. Get access to design system repository
2. Evaluate integration approach:
   - Direct CSS import?
   - Convert to component library?
   - Use design tokens?
3. Set up theming in our framework
4. Document customization approach

**Estimated effort:** +16 hours (if straightforward)

### Phonetic Display Abstraction

**Architecture:**
```typescript
interface PhoneticRenderer {
  render(stressedText: string, format: 'squares' | 'ipa' | 'simple'): JSX.Element;
}

// Component outputs: "Te're, kui'das"
// Renderer decides: how to display visually
```

**Benefit:** 
- Easy to change display format
- No impact on backend/data
- Designer can iterate freely

**Estimated effort:** +8 hours (abstraction layer)

---

## 📅 Upcoming Meetings

### Week of Oct 21, 2025

**Meeting with Designer (Helen):**
- Discuss phonetic notation display
- Review design system integration
- Finalize visual approach for stress marks
- Get design assets/specifications

**Action items before meeting:**
- Access design system repo
- Prepare examples of notation options
- Show prototype to designer
- List questions about visual requirements

---

## 🚀 Next Steps

1. ✅ Review with Tatjana/client
2. ✅ Get design system repository access
3. ✅ Meeting with designer (Helen) - next week
4. ⏳ Prioritize features for MVP
5. ⏳ Clarify variant generation mechanism
6. ⏳ Test client components for capabilities
7. ⏳ Update technical spec with UX requirements

---

**Document Status:** Draft based on prototype demo + additional details
**Last Updated:** October 15, 2025 (updated with design system info)
**Next Update:** After designer meeting (week of Oct 21)

