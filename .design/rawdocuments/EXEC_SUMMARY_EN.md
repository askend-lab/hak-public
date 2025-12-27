# Project Summary - Estonian Pronunciation Learning Platform

**For:** Aleksei, Tatjana  
**Date:** October 15, 2025  
**Status:** Requirements gathered, awaiting component access

---

## 🎯 What We Understood from the Meeting

### Client: Estonian Language Institute (Eesti Keele Instituut)

**Task:** Web application for teaching correct Estonian pronunciation.

**Target audience:**
- Foreigners learning Estonian
- Estonian language teachers
- Universities and researchers

---

## 💡 Key Insight

**The project turned out to be more complex than it initially seemed.**

### We thought:
- User enters text → listens to pronunciation
- Saves exercises → shares links

### Actually:
- Interactive word exploration (click → pronunciation variants)
- Karaoke synchronization (words highlight during playback)
- Manual phonetic editing
- Creating custom variants
- Full exercise management (CRUD)
- Integration with client's design system

**Complexity increase:** ~70%

---

## 💰 Revised Estimate

|| Option | Cost | Timeline | Description |
||---------|-----------|------|----------|
|| **Initial estimate** | €20,000 | 8 weeks | Before prototype review |
|| **Full scope** | €36,000 | 13 weeks | Everything from prototype |
|| **MVP** | €24,000 | 8 weeks | Only basic features |
|| **Phased (recommend)** | €43,500 | 13 weeks | Flexibility, can stop |

### Recommended Approach

**Week 0: Feasibility prototype (€3,500)**
- Test client components
- Answer critical questions
- Give accurate estimate

**Weeks 1-8: MVP (€18,000-24,000)**
- Basic functionality
- Production-ready
- User feedback

**Weeks 9-13: Enhanced features (€10-12,000)**
- Based on feedback
- Karaoke, custom variants
- Polish

---

## 🚨 Critical Blockers

**Can't start without this:**

### 1. Pronunciation Variants
**Question:** Where do pronunciation variants for each word come from?

**Why critical:** This is a key feature. In the prototype, each word has several variants (ku'idas, kui'das, k'uidas).

**Scenarios:**
- A) Stress marker component provides them → All OK
- B) We must generate them by rules → +40-60 hours (+€3-4k)
- C) Variant database → +20 hours
- D) Only manual creation → Feature degrades

**Budget impact:** €0-4,000

### 2. Timing Data for Karaoke
**Question:** Does Merlin TTS output time for each word?

**Why critical:** For highlighting words in karaoke mode, need to know when each word is spoken.

**Scenarios:**
- A) Merlin outputs timing → Excellent
- B) Only phonemes → Can map (+16 hours)
- C) No data → Approximate algorithm (+8 hours, worse quality)
- D) Need to synthesize by words → +60 hours (+€4,200)

**Budget impact:** €0-4,200

### 3. Component Licenses
**Question:** Can we legally use stress marker and Merlin?

**Why critical:** If license is restrictive, project may fail.

**Action:** Check BEFORE signing contract.

---

## 📋 What We Need from Client URGENTLY

1. ✅ **Repository links:**
   - Stress marker component
   - Merlin TTS synthesizer

2. ✅ **Design system access:**
   - They have their own design system
   - Repository (need access)

3. ✅ **License verification:**
   - Can we use in open source?
   - What restrictions?

4. ⏳ **Clarification next week:**
   - Meeting with designer Helen
   - Phonetic symbol visualization
   - "Squares" not intuitive - need another solution

---

## 🎨 Design and UX

### Design System
- ✅ Client has ready-made
- Need to integrate (their colors, fonts, styles)
- Possibly CSS-based or design tokens
- **Integration estimate:** +16 hours

### Phonetic Notation
- Current prototype: "squares" (not intuitive)
- Meeting with designer Helen next week
- Will decide how to show stress marks
- **Technical solution:** Abstraction (data separate, visualization separate)

### Grammar Check
- ❌ NOT required
- Focus on pronunciation, not validation
- Users responsible for text correctness

---

## 🏗️ Technical Details

### What Client Provides
1. **Stress Marker** - places stress marks in Estonian text
2. **Merlin TTS** - synthesizes speech from text
3. **Design system** - branding and styles

### What We Develop
- Frontend (React or Vue)
- Backend API (Node.js or Python)
- Database (PostgreSQL)
- Job queue (Redis/RabbitMQ) - Merlin processes one file at a time
- Audio storage (S3/B2/R2)
- Authentication (OAuth 2.0)
- Exercise management

### Architecture
```
User browser
    ↓
Frontend (SPA)
    ↓
Backend API
    ↓
├─ Database (exercises)
├─ Queue (Redis)
└─ Storage (audio)
    ↓
Client components:
├─ Stress Marker (stress marks)
└─ Merlin TTS (speech synthesis)
```

---

## 👥 User Scenarios

### Anonymous User
1. Enters text
2. Listens to pronunciation
3. Clicks on words → sees variants
4. Listens to each variant
5. Adds to temporary playlist (localStorage)
6. Closed page → everything lost

### Logged-in User
- Same as above +
- Creates exercises
- Saves them forever
- Shares links
- Manages their library

### Shared Link User
- Sees someone else's exercise
- Read-only access
- Can listen
- Cannot edit
- Encouraged to register

---

## 📊 Risks

|| Risk | Probability | Impact | Budget |
||------|-------------|---------|--------|
|| Pronunciation variants unclear | High | High | +€0-4k |
|| No timing data | Medium | High | +€0-4k |
|| Restrictive licenses | Low | Critical | Blocker |
|| Complex design system | Medium | Medium | +€1-2k |
|| Scope creep | Medium | Medium | +€5-10k |

**Total risk:** €6-20k additional costs

**Recommendation:** 
- Feasibility prototype MANDATORY
- Answer critical questions BEFORE contract
- Phased development (flexibility)

---

## 📅 Next Steps

### This Week
1. Client provides repository links
2. Client provides design system access
3. We check licenses
4. Plan feasibility prototype

### Next Week
5. Meeting with designer Helen (phonetics)
6. Test stress marker
7. Test Merlin TTS
8. Answer critical questions

### In 2 Weeks
9. Give accurate estimate
10. Client chooses option (MVP/Full/Phased)
11. Sign contract
12. Start development

---

## 💡 Our Recommendations

### 1. Start with Feasibility (€3,500, 1 week)
**Why:**
- Test client components
- Answer critical questions
- Give accurate estimate

**Result:**
- Technical report
- Accurate estimate
- Go/no-go decision

### 2. Phased Development
**Why:**
- Flexibility (can stop after any phase)
- Estimate after each stage
- Reprioritize as we go

**Phases:**
1. Feasibility (€3.5k) → answer questions
2. MVP (€18-24k) → basic value
3. Enhanced (€12k) → extended features
4. Advanced (€10k) → polish

### 3. Clear Scope Control
**Why:**
- Project can "sprawl"
- Many "want-to-haves" in future

**How:**
- Written specification
- Change request process
- Separate backlog for "future"

---

## 📞 Contacts

### Our Team
- **Aleksei:** Architect, developer
- **Tatjana:** Project manager

### Client (EKI)
- **Main contact:** [TBD]
- **Designer:** Helen
- **Technical:** [TBD]

---

## 📚 Documentation

Full document package created in `projects/eestikeeleinstituut/`:

**For quick start:**
- [QUICK_START.md](QUICK_START.md) - 5 minutes to familiarize

**For client:**
- [CLIENT_SUMMARY.md](CLIENT_SUMMARY.md) - what we offer
- [MEETING_SUMMARY.md](MEETING_SUMMARY.md) - meeting outcomes

**Details:**
- [UX_SPECIFICATION.md](UX_SPECIFICATION.md) - what user sees
- [TECHNICAL_SPEC_DRAFT.md](TECHNICAL_SPEC_DRAFT.md) - how we build
- [REVISED_ESTIMATE.md](REVISED_ESTIMATE.md) - money and time
- [CRITICAL_QUESTIONS.md](CRITICAL_QUESTIONS.md) - what MUST be found out
- [RISKS.md](RISKS.md) - risk analysis

---

## ✅ Readiness Checklist

**Before starting development need:**

- [ ] Access to stress marker repository
- [ ] Access to Merlin TTS repository
- [ ] Access to design system
- [ ] Verified licenses (OK to use)
- [ ] Tested stress marker
- [ ] Tested Merlin TTS
- [ ] Got answer: where pronunciation variants from
- [ ] Got answer: is there timing data
- [ ] Met with designer (visualization)
- [ ] Client chose budget option
- [ ] Signed contract

**If all ✅ → can start coding!**

---

## 🎯 Main Conclusion

**Project is interesting and feasible, BUT:**

1. More complex than initially seemed (+70%)
2. There are critical unknowns (variants, timing)
3. Feasibility prototype is MANDATORY
4. Phased approach reduces risks

**Recommendation:** 
- Feasibility first (€3.5k, 1 week)
- Then MVP (€24k, 8 weeks)
- Then enhancements as desired

**Total budget:** €27.5k - 40k  
**Total timeline:** 10-13 weeks  
**Risk:** Manageable (if we answer critical questions)

---

**Document:** Executive summary  
**Status:** Final version  
**Date:** October 15, 2025  
**Next update:** After feasibility phase

