# Revised Project Estimate - After Prototype Review

**Date:** October 15, 2025  
**Reason:** Prototype reveals significantly more complex functionality

---

## 🔄 What Changed

### Initial Understanding
- User enters text → listen to pronunciation
- Create exercises (lists of sentences)
- Share via links

### Actual Requirements (from prototype)
- ✅ All of the above PLUS:
- Word-by-word breakdown with interaction
- **Karaoke-style synchronized highlighting**
- **Pronunciation variants per word** (multiple options)
- **Variant exploration** (listen to each, use in sentence)
- **Manual phonetic editing** (full transcription view)
- **Custom variant creation** (user-defined pronunciations)
- Temporary playlist with Play All
- Context switching between views

**Complexity increase: ~60-80%**

---

## ⏱️ Revised Time Estimate

### Phase 1: Enhanced POC (3 weeks instead of 1.5)
| Task | Hours | Notes |
|------|-------|-------|
| Component analysis & integration | 20 | Test variant capabilities |
| Word-level synthesis architecture | 16 | Individual words + full sentences |
| Basic backend API | 20 | More endpoints for variants |
| Basic frontend (input + simple play) | 20 | Foundation |
| **Phase 1 Total** | **76 hours** | **~2 weeks** |

### Phase 2: Core Features (4 weeks instead of 2.5)
| Task | Hours | Notes |
|------|-------|-------|
| Authentication | 16 | OAuth |
| Database | 12 | Schema |
| Exercise CRUD | 20 | Backend |
| Job queue | 20 | More complex with variants |
| File storage | 16 | More files (variants) |
| Word-by-word display UI | 24 | Interactive word list |
| **Variant exploration UI** | 32 | Select, listen, use in sentence |
| **Phonetic editor UI** | 24 | Manual editing interface |
| Temporary playlist UI | 20 | Session storage, play all |
| **Phase 2 Total** | **184 hours** | **~4.5 weeks** |

### Phase 3: Advanced Features (3 weeks)
| Task | Hours | Notes |
|------|-------|-------|
| **Karaoke synchronization** | 32 | Word highlighting during playback |
| Audio caching & optimization | 16 | Performance critical |
| Exercise builder UI | 24 | Save, share |
| Responsive design | 24 | Mobile optimization |
| Error handling | 16 | Graceful failures |
| Testing | 24 | Unit, integration, E2E |
| Documentation | 16 | API, setup |
| Deployment | 16 | CI/CD |
| **Phase 3 Total** | **168 hours** | **~4 weeks** |

### Project Management & Buffer
| Task | Hours | Notes |
|------|-------|-------|
| Requirements clarification | 12 | More questions now |
| Component integration issues | 24 | Variants add complexity |
| Variant mechanism research | 16 | How do we get variants? |
| UX iterations | 20 | Complex UI needs refinement |
| Code reviews | 16 | Quality |
| **Management Total** | **88 hours** | **~2 weeks** |

---

## 📊 Revised Total Estimate

| Category | Hours | Weeks (40h) | Change |
|----------|-------|-------------|--------|
| Phase 1 (POC) | 76 | 2 | +20h |
| Phase 2 (Features) | 184 | 4.5 | +84h |
| Phase 3 (Polish) | 168 | 4 | +68h |
| Management | 88 | 2 | +40h |
| **TOTAL** | **516 hours** | **~13 weeks** | **+212h (+70%)** |

### Timeline
- **Original estimate:** 7-8 weeks
- **Revised estimate:** 12-13 weeks
- **Calendar time:** ~3.5 months (with testing, feedback cycles)

---

## 💰 Revised Cost Estimate

### Development Costs

**At different rates:**
- Low (€50/h): €25,800
- Mid (€70/h): €36,120
- High (€100/h): €51,600

**Recommended for this project:** €30,000 - €36,000

### Breakdown by Phase
| Phase | Hours | Cost @ €70/h |
|-------|-------|--------------|
| Phase 1 | 76 | €5,320 |
| Phase 2 | 184 | €12,880 |
| Phase 3 | 168 | €11,760 |
| Management | 88 | €6,160 |
| **TOTAL** | **516** | **€36,120** |

---

## 🎯 Scope Management Options

### Option A: Full Scope (as prototyped)
**Cost:** €36,000  
**Timeline:** 13 weeks  
**Includes:** Everything in prototype

### Option B: MVP Scope (reduced)
**Cost:** €24,000  
**Timeline:** 8 weeks  
**Includes:**
- ✅ Basic synthesis
- ✅ Word-by-word display (no karaoke sync)
- ✅ Variant exploration (basic)
- ✅ Temporary playlist
- ✅ Save exercises
- ❌ Karaoke highlighting → Phase 2
- ❌ Manual phonetic editor → Phase 2
- ❌ Custom variants → Phase 2
- ❌ Play all → Phase 2

### Option C: Phased Delivery
**Phase 1 (MVP):** €18,000 (6 weeks)
- Text input + synthesis
- Word display (static)
- Single variant per word
- Save exercises
- Basic functionality

**Phase 2 (Enhanced):** €12,000 (4 weeks)
- Multiple variants
- Variant exploration
- Temporary playlist
- Manual editing

**Phase 3 (Advanced):** €10,000 (3 weeks)
- Karaoke synchronization
- Custom variants
- Play all
- Polish

**Total:** €40,000 (13 weeks)  
**Benefit:** Can pause after each phase

---

## ⚠️ Critical Unknowns (Affect Estimate)

### 1. Variant Generation Mechanism
**Question:** How do we get pronunciation variants?

**Scenario A:** Stress marker provides them
- Estimate: Accurate (included above)

**Scenario B:** We must generate them
- Additional work: +40 hours
- Additional cost: +€2,800

**Scenario C:** They don't exist, we fake it
- UX impact: High
- Need alternative approach

### 2. Karaoke Synchronization Feasibility
**Question:** Can we get word-level timing from Merlin?

**Scenario A:** Merlin provides timing data
- Estimate: Accurate (32 hours included)

**Scenario B:** No timing data available
- Need approximate algorithm
- Additional complexity: +16 hours
- Quality: Lower precision

**Scenario C:** Word-by-word synthesis required
- Huge complexity increase: +60 hours
- Audio quality: May sound unnatural
- Additional cost: +€4,200

### 3. Phonetic Notation System
**Question:** What syntax? How complex?

**Scenario A:** Simple (just stress marks)
- Estimate: Accurate

**Scenario B:** Full IPA or complex system
- Additional UI work: +16 hours
- Need helper tools (character picker)
- Additional cost: +€1,120

---

## 🔍 Risk Assessment Update

| Risk | Probability | Impact | Cost Impact |
|------|-------------|--------|-------------|
| Variant mechanism unclear | **High** | High | +€0-4,000 |
| Karaoke timing unavailable | Medium | High | +€0-4,200 |
| Complex phonetic syntax | Low | Medium | +€0-1,120 |
| Performance issues (too many audio files) | Medium | Medium | +€1,400 |
| UX complexity (too many features) | Medium | Medium | +€2,100 |

**Total risk exposure:** €0-12,820  
**Recommended contingency:** 25% (€9,000)

---

## 💡 Recommendations

### Recommendation 1: Clarify Before Starting
**Before signing contract:**
1. ✅ Access component repositories
2. ✅ Test variant generation capability
3. ✅ Test Merlin timing output
4. ✅ Clarify phonetic notation system
5. ✅ Review prototype together in detail

**Benefit:** Accurate estimate, no surprises

### Recommendation 2: Start with MVP (Option B)
**Rationale:**
- Prove core value quickly
- Get user feedback
- Adjust based on real usage
- Lower initial investment
- Clear path to enhancement

**Cost:** €24,000 (8 weeks)  
**Risk:** Lower

### Recommendation 3: Phased Approach (Option C)
**Rationale:**
- Client can evaluate after each phase
- Can stop if budget runs out
- Can reprioritize features between phases
- Spreads payment over time

**Cost:** €40,000 total (€18k + €12k + €10k)  
**Flexibility:** Highest

### Recommendation 4: Prototype First (NEW)
**Mini-engagement before full project:**

**Goal:** Answer critical unknowns  
**Duration:** 1 week  
**Cost:** €3,500  
**Deliverables:**
- Test variant generation
- Test Merlin capabilities
- Test karaoke feasibility
- Technical feasibility report
- Accurate estimate for full project

**Then decide:** Go/No-go, MVP vs Full

---

## 📋 Revised Payment Structure

### For Option A (Full Scope - €36,000)
- **Contract signing:** €7,200 (20%)
- **Phase 1 complete (POC):** €7,200 (20%)
- **Phase 2 complete (Features):** €12,960 (36%)
- **Phase 3 complete (Polish):** €8,640 (24%)

### For Option B (MVP - €24,000)
- **Contract signing:** €6,000 (25%)
- **Midpoint (4 weeks):** €9,000 (37.5%)
- **Completion (8 weeks):** €9,000 (37.5%)

### For Option C (Phased - €40,000)
- **Phase 1 start:** €4,500 (25% of P1)
- **Phase 1 delivery:** €13,500 (75% of P1)
- **Phase 2 start:** €3,000 (25% of P2)
- **Phase 2 delivery:** €9,000 (75% of P2)
- **Phase 3 start:** €2,500 (25% of P3)
- **Phase 3 delivery:** €7,500 (75% of P3)

### For Prototype First (€3,500)
- **Start:** €1,750 (50%)
- **Delivery (1 week):** €1,750 (50%)
- *Then separate contract for main project*

---

## 🎯 What We Need to Decide

### Client Decisions Required:
1. **Budget:** What's realistic? €24k, €36k, €40k?
2. **Scope:** Full prototype or MVP first?
3. **Timeline:** Hard deadline or flexible?
4. **Risk:** Prototype first or dive in?

### Technical Clarifications Required:
1. Component capabilities (variants, timing)
2. Phonetic notation system
3. Expected load (affects architecture)
4. Hosting budget

---

## 📊 Comparison Table

| Approach | Cost | Timeline | Scope | Risk | Flexibility |
|----------|------|----------|-------|------|-------------|
| **Prototype First** | €3.5k + TBD | 1w + TBD | Research | Low | High |
| **MVP (Option B)** | €24k | 8 weeks | Core only | Medium | Medium |
| **Full (Option A)** | €36k | 13 weeks | Everything | High | Low |
| **Phased (Option C)** | €40k | 13 weeks | Everything | Medium | High |

---

## 🚦 Our Recommendation

**Best approach:**

1. **Week 0:** Prototype/feasibility study (€3,500)
   - Answer technical unknowns
   - Validate approach
   - Refine estimate

2. **Weeks 1-8:** MVP delivery (€24,000)
   - Prove core value
   - Get user feedback
   - Production-ready

3. **Weeks 9-13:** Enhancement (€10-12k)
   - Based on feedback
   - Prioritize most valuable features
   - Can skip if budget tight

**Total:** €37,500-39,500 (with prototype)  
**Risk:** Minimal (can stop after any phase)  
**Benefit:** Informed decisions at each step

---

## 📞 Next Steps

1. **This week:** Review this estimate
2. **Client decides:** Scope and budget
3. **We deliver:** Prototype/feasibility (1 week)
4. **Client approves:** Final estimate and contract
5. **We start:** Development

---

**Document Status:** Revised after prototype review  
**Confidence:** Medium (need to answer technical questions)  
**Valid until:** 30 days



