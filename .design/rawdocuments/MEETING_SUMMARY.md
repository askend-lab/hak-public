# Meeting Summary - October 15, 2025

## 📅 Meeting Details

**Date:** October 15, 2025  
**Participants:** Aleksei, Tatjana, Client (EKI)  
**Purpose:** Project discussion + prototype review  
**Duration:** ~2 hours

---

## 🎯 Key Outcomes

### 1. Project Scope is Larger Than Initially Understood

**Initial understanding:**
- Simple text-to-speech tool
- Save exercises, share links

**Actual scope (from prototype):**
- Interactive word exploration
- Multiple pronunciation variants per word
- Karaoke-style synchronized playback
- Manual phonetic editing
- Custom variant creation
- Rich exercise management

**Impact:**
- Estimate revised from €20k → €36k
- Timeline extended from 8 weeks → 13 weeks

---

### 2. Core Functionality Confirmed

#### Anonymous Users
- Enter text → synthesize → listen
- Word-by-word breakdown
- Explore pronunciation variants
- Temporary playlist (localStorage)
- All data lost on page close

#### Logged-in Users
- All anonymous features +
- Create and save exercises
- Manage exercise library (CRUD)
- Generate shareable links
- Persistent storage

#### Shared Exercises
- Public access via unique link
- Read-only view
- No login required
- Encourages sign-up

---

### 3. Technical Components

#### Provided by Client
1. **Stress Marking Component**
   - Adds stress marks to Estonian text
   - ⚠️ Need: Repository access
   - ⚠️ Need: Documentation
   - ❓ Unknown: Does it provide pronunciation variants?

2. **Merlin TTS Synthesizer**
   - Text-to-speech synthesis
   - File-based I/O
   - Limitation: One file at a time
   - ⚠️ Need: Repository access
   - ❓ Unknown: Does it output timing data?

#### To Be Developed
- Frontend application
- Backend API
- Database
- Job queue (for Merlin)
- Audio file storage
- Authentication integration
- Exercise management

---

### 4. Design Requirements

#### Design System
- ✅ Client has existing design system
- Need: Repository access
- Must use: Their colors, typography, styles
- Likely: Framework-agnostic (CSS-based)

#### Phonetic Notation Display
- Current: "Square boxes" (not intuitive)
- Meeting: With designer Helen next week
- Will decide: Visual representation approach
- Technical: Abstraction layer needed

#### Grammar/Spell Checking
- ❌ NOT required
- Focus on pronunciation only
- Users responsible for correct input

---

### 5. Additional Features Discussed

#### Contact Form
- ✅ Client has existing email system
- Can reuse their implementation
- Low priority (Phase 2)
- Need: Integration details

#### Future Enhancements
- Component swapping (different models)
- LMS integration (Moodle, etc.)
- University SSO
- Research API

---

## 🚨 Critical Blockers Identified

### Must Answer Before Starting

1. **How are pronunciation variants generated?**
   - By stress marker component?
   - Linguistic rules we implement?
   - Pre-built database?
   - Manual only?
   - **Impact:** €0-4,000 cost variance

2. **Does Merlin output word timing data?**
   - For karaoke synchronization
   - Word-level? Phoneme-level? None?
   - **Impact:** €0-4,200 cost variance

3. **What is the phonetic notation system?**
   - Simple stress marks?
   - Full IPA?
   - Custom Estonian notation?
   - **Impact:** €0-1,120 cost variance

---

## 📋 Action Items

### Immediate (This Week)
- [ ] Client provides component repository links
- [ ] Client provides design system repository link
- [ ] Verify component licenses
- [ ] Schedule prototype walkthrough with Aleksei

### Next Week
- [ ] Meeting with designer (Helen) - phonetic display
- [ ] Test stress marker component
- [ ] Test Merlin TTS component
- [ ] Answer critical technical questions

### Before Contract
- [ ] Run 1-week feasibility prototype (€3,500)
- [ ] Finalize accurate estimate
- [ ] Client decides: Full scope vs MVP vs Phased

---

## 💰 Revised Budget Options

### Option A: Full Scope
- **Cost:** €36,000
- **Timeline:** 13 weeks
- **Includes:** Everything in prototype

### Option B: MVP First
- **Cost:** €24,000
- **Timeline:** 8 weeks
- **Includes:** Core features only
- **Deferred:** Karaoke sync, custom variants, advanced editing

### Option C: Phased (Recommended)
- **Phase 1 (Feasibility):** €3,500 (1 week)
- **Phase 2 (MVP):** €18,000 (6 weeks)
- **Phase 3 (Enhanced):** €12,000 (4 weeks)
- **Phase 4 (Advanced):** €10,000 (3 weeks)
- **Total:** €43,500
- **Benefit:** Can stop after any phase

---

## 🎯 Next Meeting Agenda

### Topics to Cover
1. Component repository access
2. Design system integration approach
3. Phonetic display decisions (with Helen)
4. Budget approval and scope selection
5. Contract terms and timeline

### Questions to Ask
1. Expected user load (concurrent users)?
2. Timeline constraints (hard deadlines)?
3. Hosting preference and budget?
4. Auth provider decision?

---

## 📊 Risk Assessment Update

| Risk | Level | Impact | Mitigation |
|------|-------|--------|------------|
| Variant generation unclear | 🔴 High | +€4k | Test components ASAP |
| Timing data unavailable | 🟡 Medium | +€4k | Test Merlin ASAP |
| Design system complex | 🟡 Medium | +€2k | Get access, evaluate |
| Component licenses restrictive | 🔴 High | Blocker | Verify immediately |
| Scope creep | 🟡 Medium | +€5-10k | Clear spec, change control |

---

## 📝 Key Decisions Made

| Decision | Details | Status |
|----------|---------|--------|
| Roles | No real roles, just logged-in vs anonymous | ✅ Confirmed |
| Grammar check | Not needed | ✅ Confirmed |
| Design system | Must use client's | ✅ Confirmed |
| Contact form | Reuse existing system | ✅ Confirmed |
| Hosting | Client will host | ✅ Confirmed |
| Open source | Code will be public | ✅ Confirmed |

---

## 📖 References

- **Full transcript:** [meeting2025.10.15.txt](meeting2025.10.15.txt)
- **UX specification:** [UX_SPECIFICATION.md](UX_SPECIFICATION.md)
- **Revised estimate:** [REVISED_ESTIMATE.md](REVISED_ESTIMATE.md)
- **Critical questions:** [CRITICAL_QUESTIONS.md](CRITICAL_QUESTIONS.md)
- **Client summary:** [CLIENT_SUMMARY.md](CLIENT_SUMMARY.md)

---

## 🎤 Notable Quotes

> "Нужен девелопмент. Да, тебе нужен девелопмент — эффективный, быстрый, и чтобы мы еще и заработали."

> "Это кассовая лидерность - то есть UI поверх готовых компонентов."

> "Квадратики не совсем интуитивно... не так, как принято в мире обозначать."

> "Самое важное - как тут вводить тексты, какие фонетические знаки."

---

**Document Type:** Meeting summary  
**Status:** Final  
**Distribution:** Internal team + client  
**Next Update:** After component testing and designer meeting



