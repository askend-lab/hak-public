# Quick Start Guide - Estonian Pronunciation Platform Project

**For:** New team members, stakeholders, or anyone needing quick context

---

## ⚡ 60-Second Overview

**What:** Web app for learning Estonian pronunciation  
**For:** Non-native Estonian speakers, teachers, students  
**Status:** Pre-development (requirements complete, awaiting component access)  
**Budget:** €27,500-40,000  
**Timeline:** 10-13 weeks

---

## 🎯 What We're Building

```
User types text → System adds stress marks → Synthesizes speech → User hears pronunciation

Plus:
- Click any word → see/hear pronunciation variants
- Edit phonetics manually
- Save exercises, share with students
- Works with or without login
```

---

## 📚 Essential Reading (in order)

1. **Start here:** [CLIENT_SUMMARY.md](CLIENT_SUMMARY.md) - What we're proposing to client
2. **Then read:** [UX_SPECIFICATION.md](UX_SPECIFICATION.md) - What users will see/do
3. **Technical:** [TECHNICAL_SPEC_DRAFT.md](TECHNICAL_SPEC_DRAFT.md) - How we'll build it
4. **Costs:** [REVISED_ESTIMATE.md](REVISED_ESTIMATE.md) - Time and money
5. **Risks:** [CRITICAL_QUESTIONS.md](CRITICAL_QUESTIONS.md) - What we MUST answer first

**Total reading time:** ~45 minutes

---

## 🚨 Critical Blockers (As of Oct 15, 2025)

Before we can start development, we **MUST** have:

1. ❌ Access to client's component repositories (stress marker, Merlin TTS)
2. ❌ License verification (can we legally use them?)
3. ❌ Answer: How are pronunciation variants generated?
4. ❌ Answer: Does Merlin output timing data for karaoke sync?
5. ❌ Access to client's design system repository

**Without these, we cannot give accurate estimate or start work.**

---

## 💰 Budget Options

| Option | Cost | Timeline | Description |
|--------|------|----------|-------------|
| **Feasibility First** | €3,500 | 1 week | Test components, answer questions |
| **MVP** | €24,000 | 8 weeks | Core features only |
| **Full Scope** | €36,000 | 13 weeks | Everything in prototype |
| **Phased** | €43,500 | 13 weeks | Feasibility + MVP + Enhancements (flexible) |

**Recommendation:** Feasibility first (€3.5k), then decide.

---

## 🏗️ What Makes This Complex

### Not Just Text-to-Speech

**Initially understood:**
- User types → hears pronunciation
- Save exercises
- Share links

**Actually requires:**
- Word-by-word interactive exploration
- Multiple pronunciation variants per word
- Karaoke-style synchronized playback
- Manual phonetic editing
- Custom variant creation
- Rich exercise management CRUD
- Design system integration

**Complexity increase:** ~70% more work than first impression

---

## 🔑 Key Technologies

### Provided by Client
- **Stress Marker:** Estonian language stress marking component
- **Merlin TTS:** Text-to-speech synthesis engine
- **Design System:** EKI branding and styles

### We Build
- **Frontend:** React or Vue (TBD)
- **Backend:** Node.js or Python (TBD)
- **Database:** PostgreSQL
- **Queue:** Redis/RabbitMQ (for synthesis jobs)
- **Storage:** S3/B2/R2 (for audio files)
- **Auth:** OAuth 2.0 (Google, etc.)

---

## 👥 Roles & Responsibilities

### User Roles (in app)
- **Anonymous:** Can use, but data not saved
- **Logged-in:** Can create and save exercises
- **No distinction between teacher/student** (both just "users")

### Team Roles
- **Aleksei:** Architect, Lead Developer
- **Tatjana:** Project Manager
- **Helen:** Designer (client-side)
- **EKI:** Client, provides components

---

## 📅 Timeline

```
Now          : Requirements complete, awaiting access
Week 0       : Feasibility prototype (if approved)
Weeks 1-8    : MVP development
Weeks 9-13   : Enhanced features
Week 14      : Launch
```

**Flexible:** Can stop after any phase.

---

## 🎨 Design Notes

- Must use client's design system (repository access needed)
- Current phonetic display ("squares") not intuitive
- Meeting with designer Helen next week to decide visual approach
- No grammar/spell checking required (out of scope)

---

## ⚠️ Known Risks

| Risk | Impact | Status |
|------|--------|--------|
| Variant generation mechanism unclear | High | Unresolved |
| Timing data for karaoke unavailable | Medium | Unresolved |
| Component licenses restrictive | Critical | Unverified |
| Design system integration complex | Medium | Access pending |
| Merlin performance bottleneck | Medium | Mitigated by design |

---

## 📞 Who to Contact

### Questions About...
- **Technical approach:** Aleksei
- **Project status/timeline:** Tatjana
- **Requirements/features:** Tatjana
- **Client relationship:** Tatjana
- **Budget/contract:** Tatjana

### Client Contacts
- **Primary:** [TBD]
- **Designer:** Helen
- **Technical:** [TBD]

---

## 🚀 Next Steps

### This Week
1. Get component repository links from client
2. Get design system repository link
3. Verify licenses
4. Schedule feasibility prototype

### Next Week
5. Meet with designer (Helen)
6. Test components
7. Answer critical technical questions
8. Finalize accurate estimate

### Then
9. Client decides: Go/no-go, which budget option
10. Sign contract
11. Start development

---

## 📂 Project Structure

```
eestikeeleinstituut/
├── README.md                      ← Start here
├── QUICK_START.md                 ← You are here
├── CLIENT_SUMMARY.md              ← For client review
├── MEETING_SUMMARY.md             ← Meeting outcomes
├── PROJECT_OVERVIEW.md            ← High-level description
├── UX_SPECIFICATION.md            ← Detailed UX/UI
├── TECHNICAL_SPEC_DRAFT.md        ← Architecture
├── ARCHITECTURE_DIAGRAM.txt       ← Visual diagrams
├── ESTIMATE.md                    ← Original estimate (outdated)
├── REVISED_ESTIMATE.md            ← Current estimate
├── RISKS.md                       ← Risk assessment
├── CRITICAL_QUESTIONS.md          ← Must-answer questions
├── QUESTIONS_FOR_CLIENT.md        ← All questions
├── TODO.md                        ← Task list
└── meeting2025.10.15.txt          ← Raw transcript
```

---

## 🔗 Quick Links

- **Full docs:** [README.md](README.md)
- **For client:** [CLIENT_SUMMARY.md](CLIENT_SUMMARY.md)
- **UX details:** [UX_SPECIFICATION.md](UX_SPECIFICATION.md)
- **Tech details:** [TECHNICAL_SPEC_DRAFT.md](TECHNICAL_SPEC_DRAFT.md)
- **Budget:** [REVISED_ESTIMATE.md](REVISED_ESTIMATE.md)
- **Blockers:** [CRITICAL_QUESTIONS.md](CRITICAL_QUESTIONS.md)

---

## ✅ Quick Checklist: Am I Ready to Start?

- [ ] Read CLIENT_SUMMARY.md
- [ ] Read UX_SPECIFICATION.md
- [ ] Understand the critical blockers
- [ ] Know which budget option we're pursuing
- [ ] Have access to component repositories
- [ ] Verified licenses
- [ ] Answered critical technical questions
- [ ] Reviewed design system

**If all checked:** Ready to code! 🚀  
**If not:** Focus on unchecked items first.

---

**Document Type:** Quick reference  
**Audience:** Team members, stakeholders  
**Last Updated:** October 15, 2025  
**Next Update:** After feasibility phase



