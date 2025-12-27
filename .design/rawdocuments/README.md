# Estonian Language Institute - Pronunciation Learning Platform

Web application for learning proper Estonian pronunciation for non-native speakers.

## 📁 Project Documentation

### 🚀 Start Here
| Document | Description |
|----------|-------------|
| **[INDEX.md](INDEX.md)** | 🆕 **📚 ПОЛНЫЙ ИНДЕКС** - Все 19 документов с навигацией |
| **[EXEC_SUMMARY_RU.md](EXEC_SUMMARY_RU.md)** | 🇷🇺 **СТАРТ ЗДЕСЬ** - Полное резюме на русском |
| **[NEXT_STEPS_ALEKSEI.md](NEXT_STEPS_ALEKSEI.md)** | 👨‍💻 **ДЛЯ АЛЕКСЕЯ** - Что делать прямо сейчас |
| **[WORKFLOW.md](WORKFLOW.md)** | ⚙️ **ПРОЦЕСС** - Git, Cursor, инструменты |
| [QUICK_START.md](QUICK_START.md) | 🇬🇧 5-minute overview (English) |
| [CLIENT_SUMMARY.md](CLIENT_SUMMARY.md) | For client review |
| [MEETING_SUMMARY.md](MEETING_SUMMARY.md) | Meeting outcomes (Oct 15) |

### Core Documents
| Document | Description |
|----------|-------------|
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | High-level project summary, goals, and requirements |
| [UX_SPECIFICATION.md](UX_SPECIFICATION.md) | 🆕 Detailed UX/UI requirements from prototype |
| [TECHNICAL_SPEC_DRAFT.md](TECHNICAL_SPEC_DRAFT.md) | Detailed technical specification and architecture |
| [ARCHITECTURE_DIAGRAM.txt](ARCHITECTURE_DIAGRAM.txt) | ASCII architecture diagrams |
| [DEVELOPMENT_APPROACH.md](DEVELOPMENT_APPROACH.md) | 🆕 Open source quality standards, AI-assisted development |

### Estimates & Planning
| Document | Description |
|----------|-------------|
| [ESTIMATE.md](ESTIMATE.md) | ⚠️ Original estimate (outdated) |
| [REVISED_ESTIMATE.md](REVISED_ESTIMATE.md) | 🆕 Updated estimate after prototype review |
| [RISKS.md](RISKS.md) | Risk assessment and mitigation strategies |
| [TODO.md](TODO.md) | Project tasks and action items |

### Client Communication
| Document | Description |
|----------|-------------|
| [CLIENT_SUMMARY.md](CLIENT_SUMMARY.md) | 🆕 Executive summary for client review |
| [QUESTIONS_FOR_CLIENT.md](QUESTIONS_FOR_CLIENT.md) | Open questions for client |
| [CRITICAL_QUESTIONS.md](CRITICAL_QUESTIONS.md) | 🚨 Must-answer questions (blockers) |

### Meeting Notes
| Document | Description |
|----------|-------------|
| [meeting2025.10.15.txt](meeting2025.10.15.txt) | Meeting transcript (initial discussion + prototype review) |
| [MEETING_SUMMARY.md](MEETING_SUMMARY.md) | 🆕 Structured summary of meeting outcomes |

## 🎯 Quick Summary

**What:** Platform where users input Estonian text and hear proper pronunciation

**Key Features:**
- Text to speech with proper stress marking
- Exercise builder for teachers
- Shareable lessons
- Works with or without login

**Tech Stack:** TBD (React/Vue + Node.js/Python + PostgreSQL)

**Status:** 📋 Requirements gathering (prototype reviewed, awaiting component access)

## 🚀 Project Phases

### ⚠️ UPDATED AFTER PROTOTYPE REVIEW

**Original Estimate:** 7-8 weeks, €20,000  
**Revised Estimate:** 12-13 weeks, €36,000  
**Reason:** Significantly more complex functionality revealed

### Recommended Approach: Phased with Feasibility First

**Week 0: Feasibility Prototype** (€3,500)
- Test provided components
- Answer critical technical questions
- Validate approach
- Refine final estimate

**Weeks 1-8: MVP Delivery** (€24,000)
- Core synthesis functionality
- Word-by-word display
- Basic variant exploration
- Exercise management
- Production-ready

**Weeks 9-13: Enhanced Features** (€10-12,000)
- Karaoke synchronization
- Advanced phonetic editing
- Custom variants
- Polish and optimization

**Total:** ~€37,500-40,000 (flexible, can stop after any phase)

## 🔑 Critical Dependencies

⚠️ **BLOCKERS (Cannot start without):**
- ❌ Access to stress marking component repository
- ❌ Access to Merlin TTS repository
- ❌ License verification
- ❌ **CRITICAL:** How are pronunciation variants generated? (see CRITICAL_QUESTIONS.md)
- ❌ **CRITICAL:** Does Merlin output timing data for karaoke sync?

⚠️ **Important (Need during development):**
- ⏳ Client decisions (auth provider, hosting)
- ⏳ Phonetic notation system clarification
- ⏳ UX priorities (full scope vs MVP)

## 💰 Estimated Costs

**Development (Revised):**
- Feasibility prototype: €3,500 (1 week)
- MVP (core features): €24,000 (8 weeks)
- Enhanced features: €10-12,000 (4-5 weeks)
- **Total range:** €27,500-40,000

**Hosting (Monthly):**
- Minimal: €0-5 (free tiers)
- Recommended: €10-15 (VPS)
- At scale (1000+ users/day): €20-30

## 📞 Team

- **Architect/Developer:** Aleksei
- **PM:** Tatjana
- **Client:** Estonian Language Institute

## 🔗 Links

- Component repositories: *TBD*
- Prototype: *TBD*
- Architecture diagram: *TBD*

---

## 🔥 Key Insights from Prototype Review

The application is **much more sophisticated** than initial description:

1. **Interactive word exploration:** Users can click any word and see/hear multiple pronunciation variants
2. **Karaoke-style playback:** Words highlight in sync with audio
3. **Manual phonetic editing:** Users can edit stress marks and regenerate audio
4. **Custom variants:** Users can create their own pronunciations
5. **Temporary playlists:** Session-based collections (localStorage)
6. **Complex UX:** Multiple views, toggles, and interaction modes

**Impact:** 
- Complexity increased ~70%
- Estimate revised from €20k to €36k
- Timeline extended from 8 to 13 weeks

**Next Steps:**
1. 🚨 Answer critical technical questions (see CRITICAL_QUESTIONS.md)
2. Get component access and test capabilities
3. Run 1-week feasibility prototype
4. Client decides: Full scope, MVP, or phased approach

---

**Last Updated:** October 15, 2025 (updated after prototype review)  
**Next Action:** Get component access, start feasibility testing

