# Estonian Language Institute Project - Summary for Client

**Date:** October 15, 2025  
**Prepared by:** Askend (Aleksei & Tatjana)

---

## 🎯 What We Understood

You need a web application where:
1. Users input Estonian text
2. System adds proper stress marks (using your component)
3. System synthesizes speech (using Merlin TTS)
4. Users listen to correct pronunciation

**Target users:** Non-native Estonian speakers learning pronunciation

---

## ✅ What We Can Deliver

### MVP (Minimum Viable Product)
- ✅ Clean, modern web interface
- ✅ Anonymous usage (type & listen)
- ✅ User accounts (via Google login initially)
- ✅ Exercise builder (create sets of sentences)
- ✅ Shareable lessons (via unique links)
- ✅ Integration with your stress marker component
- ✅ Integration with Merlin TTS
- ✅ Audio file caching (for performance)
- ✅ Mobile-friendly design

### Infrastructure
- ✅ Production-ready deployment
- ✅ Scalable architecture
- ✅ Open source codebase
- ✅ Documentation for future maintainers

---

## ⏱️ Timeline

**Total: 7-8 weeks**

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Phase 1: POC** | 1.5 weeks | Working prototype with components |
| **Phase 2: Features** | 2.5 weeks | Full functionality (beta) |
| **Phase 3: Polish** | 2.5 weeks | Production-ready |
| **Buffer** | 1 week | Adjustments, testing |

---

## 💰 Investment

### Development
**€20,000** (fixed price, phased payments)
- Phase 1: €4,000 (after POC delivery)
- Phase 2: €7,000 (after feature completion)
- Phase 3: €7,000 (after production deployment)
- Management: €2,000 (final payment)

**Includes:**
- Full application development
- Component integration
- Testing and documentation
- Deployment setup
- 4 weeks post-launch support

### Hosting (Your responsibility)
- **Option 1:** €0-5/month (free tiers) - suitable for launch
- **Option 2:** €10-13/month (VPS) - recommended for production
- **At scale (1000+ users/day):** €20-30/month

**We help you set up, you maintain.**

---

## ❓ We Need From You

### Critical (before we start)
1. ✅ Access to component repositories (stress marker, Merlin)
2. ✅ License verification (can we use them?)
3. ✅ Architecture diagram (you mentioned it)
4. ✅ Prototype review (you have one built)

### Important (during development)
5. ✅ Authentication provider choice (Google? Estonian ID?)
6. ✅ Hosting preference (we can suggest)
7. ✅ Brand assets (logo, colors) if any
8. ✅ Feedback on design/UX

### Nice to have
9. Usage expectations (how many users?)
10. Priority for future features
11. Timeline constraints

---

## 🎨 Design Approach

**Since no designer is involved:**
- We'll use clean, modern UI libraries
- Simple, intuitive interface
- Focus on usability over fancy design
- Mobile-first approach
- We can show mockups for approval before coding

**Examples we like:**
- Clean input forms like Google Translate
- Simple audio players like Duolingo
- Card-based layouts like Trello

---

## 🔧 Technical Approach

### Architecture
```
User Browser
    ↓
Web App (React/Vue)
    ↓
API Server (Node.js/Python)
    ↓
┌─────────────┬──────────────┬─────────────┐
│  Database   │  Job Queue   │  Storage    │
└─────────────┴──────────────┴─────────────┘
    ↓               ↓               ↓
Your Components:  Merlin TTS   Audio Files
Stress Marker
```

### Key Decisions
1. **Modularity:** Components can be swapped (as you requested)
2. **Queue system:** Handle Merlin's one-at-a-time limitation
3. **Caching:** Reuse audio for identical texts (saves time & storage)
4. **Open source:** Clean code, well documented

---

## ✅ Your Goals Addressed

| Your Goal | Our Solution |
|-----------|--------------|
| Universities can swap components | Modular architecture, clear interfaces |
| Researchers can use their models | Documented component structure |
| Integration into LMS systems | API-first design, embeddable |
| Public website deployment | Scalable, production-ready |
| Open source code | Public repo, MIT/Apache license |
| Low hosting costs | Optimized for efficiency |

---

## ⚠️ Honest Risks

| Risk | Why | Mitigation |
|------|-----|------------|
| Component integration | We haven't seen the code yet | POC first (Phase 1) |
| Performance bottleneck | Merlin processes one at a time | Queue + caching |
| License issues | Need to verify | Check immediately |
| Scope changes | Requirements still clarifying | Clear spec + change control |

**We'll flag issues early, not at the end.**

---

## 🚀 Next Steps

### This Week
1. **Meeting:** Review your prototype together
2. **Access:** Get component repositories
3. **Clarify:** Answer open questions (see QUESTIONS_FOR_CLIENT.md)

### Next Week
4. **Approval:** You review this plan, we adjust if needed
5. **Contract:** Sign agreement
6. **Start:** Kick off Phase 1 (POC)

### Week 3-4
7. **POC Demo:** You see it working end-to-end
8. **Feedback:** Adjust based on your input
9. **Continue:** Proceed to Phase 2

---

## 📞 Questions?

**Contact:**
- Aleksei (Technical): [email/phone]
- Tatjana (Project): [email/phone]

**Availability:**
- Regular check-ins: Weekly
- Ad-hoc questions: Email/Slack anytime
- Demos: After each phase

---

## 📄 Attached Documents

For more details, see:
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Full requirements
- [TECHNICAL_SPEC_DRAFT.md](TECHNICAL_SPEC_DRAFT.md) - Technical details
- [ESTIMATE.md](ESTIMATE.md) - Detailed cost breakdown
- [QUESTIONS_FOR_CLIENT.md](QUESTIONS_FOR_CLIENT.md) - Open questions
- [RISKS.md](RISKS.md) - Risk assessment

---

## 🤝 Our Commitment

✅ **Transparent:** We'll tell you if something is too hard/expensive  
✅ **Honest timelines:** No overpromising  
✅ **Your success:** This needs to work for your users  
✅ **Quality code:** Others will read/maintain it  
✅ **Budget-conscious:** We optimize for your constraints  

**We build it right, not just fast.**

---

## 📝 Approval

Please review this summary and let us know:
- ✅ Yes, this matches our expectations → Let's proceed
- ⚠️ We need to adjust X, Y, Z → Let's discuss
- ❌ This doesn't match our vision → Let's realign

**Looking forward to building this with you!**

---

*Askend - AI-First Software Development*



