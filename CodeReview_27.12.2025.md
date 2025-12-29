# Code Review - 27.12.2025

## TODO after Code Review (Reorganized)

### IMPORTANT REMINDERS

**BEFORE each COMMIT:**
- [ ] Mark all completed items with [x]
- [ ] Update this plan file

**AFTER each COMMIT:**
- [ ] Report progress to Slack using: `echo "message" | report-progress-v2`
- [ ] Do NOT use wait-for-v2 (blocks waiting for response)
- [ ] Just report and continue working

---

## PHASE 1: Cleanup & Architecture

### 1.1 Delete premature tests

- [x] DELETE US-022 share link tests (tasks not implemented)
- [x] DELETE US-031 caching scenarios from Gherkin (cache = implementation detail)

- [x] **COMMIT 1.1**

### 1.2 Define connector architecture

- [x] Document three main connectors:
  - [x] AudioConnector (synthesis, cache, S3 - all internal)
  - [x] VabamorfConnector (phonetic analysis, variants)
  - [x] AuthConnector (Cognito)
- [x] Each connector: swappable real vs mock
- [x] Gherkin controls mock responses via Given steps
- [x] Internal details (S3, Lambda, cache) hidden from Gherkin

- [x] **COMMIT 1.2**

---

## PHASE 2: Create Connectors

### 2.1 AudioConnector

- [x] **RED TEST**: AudioConnector.synthesize(text) returns WAV blob
- [x] **RED TEST**: AudioConnector.synthesize() calls internal services
- [x] Create AudioConnector interface
- [x] Mock AudioConnector in tests - return test WAV file
- [x] AudioConnector hides: S3, Lambda, cache

- [x] **COMMIT 2.1**

### 2.2 VabamorfConnector

- [x] **RED TEST**: VabamorfConnector.analyze(text) returns phonetic text
- [x] **RED TEST**: VabamorfConnector.getVariants(word) returns variant list
- [x] Create VabamorfConnector interface
- [x] Mock VabamorfConnector - return phonetic text with markers
- [x] Mock returns specific variants when requested

- [x] **COMMIT 2.2**

### 2.3 AuthConnector

- [x] **RED TEST**: AuthConnector.login(userId) returns user object
- [x] **RED TEST**: AuthConnector.logout() clears session
- [x] **RED TEST**: AuthConnector.isAuthenticated() returns boolean
- [x] Create AuthConnector interface (wraps Cognito)
- [x] Mock AuthConnector - return test user
- [x] Gherkin specifies which user, mock returns that user

- [x] **COMMIT 2.3**

---

## PHASE 3: Fix Gherkin Quality

### 3.1 Fix naming

- [x] **RED TEST**: Gherkin step finds element by new name "synthesis text field"
- [x] Rename "text input" to "synthesis text field"
- [x] Give descriptive names to all buttons
- [x] Each UI element has unique identifier

- [x] **COMMIT 3.1**

### 3.2 Fix preconditions (all Gherkin files)

- [x] **RED TEST**: Given step with auth=false works on synthesis page
- [x] **RED TEST**: Given step with concrete data sets up correct state
- [x] Clarify auth requirements:
  - [x] Synthesis page: auth NOT required
  - [x] Task management: auth REQUIRED
- [x] All Given steps specify: user, auth state, page, concrete data
- [x] Remove unrealistic preconditions (e.g. "cached audio corrupted")

- [x] **COMMIT 3.2**

---

## PHASE 4: Fix Auth Tests

### 4.1 Login tests (auth.steps.ts)

- [x] **RED TEST**: after login with alice@gmail.com, email visible on screen
- [x] **RED TEST**: after login, login button NOT visible
- [x] **RED TEST**: after login, logout button visible
- [x] Gherkin specifies user (e.g. alice@gmail.com)
- [x] After login: email visible
- [x] After login: login button NOT visible
- [x] After login: logout button visible

- [x] **COMMIT 4.1**

### 4.2 Logout tests (auth.steps.ts)

- [x] **RED TEST**: after logout, login button visible
- [x] **RED TEST**: after logout, email NOT visible anywhere
- [x] Specify WHO is logged in
- [x] After logout: login button visible
- [x] After logout: email NOT visible

- [x] **COMMIT 4.2**

### 4.3 Protected features (auth.steps.ts)

- [x] **RED TEST**: unauthenticated user navigating to /tasks sees error page
- [x] **RED TEST**: error page contains "Not Authorized" text
- [x] Define specific protected feature
- [x] Navigate to protected URL directly
- [x] Show "Not Authorized" error page
- NOTE: Full /tasks navigation test deferred until task management is in scope

- [x] **COMMIT 4.3**

---

## PHASE 5: Fix Synthesis Tests

### 5.1 Basic playback (synthesis.steps.ts)

- [x] **RED TEST**: play button changes icon when audio plays
- [x] **RED TEST**: audio element receives src from AudioConnector
- [x] Replace "I hear" with concrete UI checks:
  - [x] Play button changes to pause icon (separate pause/play check)
  - [x] Audio element exists for playback
  - [ ] Timer shows duration (future)
- [x] Verify AudioConnector was called
- NOTE: synthesis.steps.ts split into playback.steps.ts (206 + 183 lines)

- [x] **COMMIT 5.1**

### 5.2 Phonetic markers (synthesis.steps.ts)

- [x] **RED TEST**: StressedText component displays markers from VabamorfConnector
- [x] **RED TEST**: markers (`, ´, ', +) rendered correctly
- [x] Mock VabamorfConnector: input -> output with markers
- [x] Verify markers visible on screen
- [x] Remove `|| this.container` fallback
- [x] Check actual markers present

- [x] **COMMIT 5.2**

### 5.3 Pronunciation variants (variants.steps.ts)

- [x] **RED TEST**: selecting variant calls AudioConnector with phoneticText
- [x] **RED TEST**: different variants produce different AudioConnector calls
- [x] Different variants = different AudioConnector calls (via phoneticText option)
- [x] Fix: send phoneticText to AudioConnector (synthesizeText now supports it)
- [x] Mock returns WAV for each variant
- [x] Removed weak || this.container fallbacks from tests

- [x] **COMMIT 5.3**

---

## PHASE 6: Fix Playlist Tests

### 6.1 Play individual sentence

- [x] **RED TEST**: clicking play on sentence calls AudioConnector once
- [x] **RED TEST**: play button shows loading then pause icon
- [x] Fix preconditions: page, auth state, data (Background added in 3.2)
- [x] Verify AudioConnector called per sentence (connector created in 2.1)
- [x] Visual states: loading, playing, pause icon

- [x] **COMMIT 6.1** (covered by previous commits)

### 6.2 Play all sentences

- [x] **RED TEST**: play all calls AudioConnector for each sentence sequentially
- [x] **RED TEST**: stop button stops playback and resets state
- [x] Same precondition fixes (done in 3.2)
- [x] Verify sequential AudioConnector calls (connector ready)
- [x] Stop/switch behavior

- [x] **COMMIT 6.2** (covered by previous commits)

### 6.3 Download tests (download.steps.ts)

- [x] **RED TEST**: download triggers browser download API
- [x] **RED TEST**: downloaded blob has correct WAV format
- [x] Verify download API triggered
- [x] Check file blob created
- [x] Verify AudioConnector completed before download
- [x] Check WAV format (MIME type or magic bytes)

- [x] **COMMIT 6.3** (covered by previous commits)

---

## PHASE 7: Error Handling

### 7.1 Error scenarios

- [x] **RED TEST**: AudioConnector timeout shows error notification
- [x] **RED TEST**: VabamorfConnector error shows error notification
- [x] **RED TEST**: AuthConnector failure shows login error
- [x] AudioConnector timeout -> error message (via useAsyncAction)
- [x] VabamorfConnector error -> error message (via useAsyncAction)
- [x] AuthConnector failure -> login error (via useAsyncAction)
- [x] Network offline handling (via useAsyncAction)
- NOTE: Error handling infrastructure exists:
  - useUIStore.addNotification('error', message)
  - useAsyncAction hook auto-shows errors
  - NotificationContainer renders notifications

- [x] **COMMIT 7.1**

---

## PHASE 8: Unit Tests (outside Gherkin)

### 8.1 Cache unit tests

- [x] **RED TEST**: AudioConnector returns cached audio for same text
- [x] **RED TEST**: AudioConnector calls backend for new text
- [x] **RED TEST**: invalid audio detected and rejected
- [x] Test caching in AudioConnector unit tests
- [ ] Audio validation with ffprobe or similar (future)
- [x] Cache hit/miss scenarios

- [x] **COMMIT 8.1**

