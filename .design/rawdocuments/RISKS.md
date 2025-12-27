# Risk Assessment - Estonian Language Institute Project

## 🔴 High Priority Risks

### 1. Component Integration Complexity
**Risk:** Provided components (stress marker, Merlin) may be difficult to integrate
**Impact:** High - Core functionality depends on this
**Probability:** Medium

**Mitigation:**
- Get early access to component repositories
- Test integration in Phase 1 POC (before building features)
- Allocate buffer time for integration issues
- Have fallback options ready

**Contingency:**
- If stress marker fails: Use simpler rule-based algorithm
- If Merlin fails: Use cloud TTS API (Google/AWS) temporarily

---

### 2. Licensing Issues
**Risk:** Provided components may have restrictive licenses incompatible with client's open source goals
**Impact:** High - Could derail entire project
**Probability:** Low-Medium

**Mitigation:**
- Check licenses IMMEDIATELY (before writing any code)
- Discuss with client if issues found
- Get legal advice if needed

**Contingency:**
- Negotiate with component authors for license exception
- Find alternative components
- Build components from scratch (last resort)

---

### 3. Merlin Performance Bottleneck
**Risk:** Single-threaded Merlin TTS may not handle production load
**Impact:** Medium - Poor user experience
**Probability:** High

**Mitigation:**
- Implement job queue from the start
- Aggressive caching of synthesized audio
- Clear UX for processing time
- Load testing early

**Contingency:**
- Scale horizontally (multiple Merlin instances)
- Hybrid approach (Merlin + cloud TTS for overflow)
- Set hard limits on usage

---

### 4. Unclear Requirements
**Risk:** Many details still undefined (auth provider, hosting, timeline)
**Impact:** Medium - Scope creep, rework
**Probability:** Medium

**Mitigation:**
- Document all assumptions in writing
- Get client sign-off on specs before development
- Regular check-ins to clarify requirements
- Agile approach (iterate and adjust)

**Contingency:**
- Build flexible/modular architecture
- Start with simplest implementation
- Be prepared to pivot

---

## 🟡 Medium Priority Risks

### 5. Budget Constraints
**Risk:** "Small budget" may not cover all desired features
**Impact:** Medium - Feature cuts or quality compromises
**Probability:** Medium

**Mitigation:**
- Clear MVP scope definition
- Separate "must-have" vs "nice-to-have" features
- Transparent cost estimates upfront
- Free/cheap hosting solutions

**Contingency:**
- Phased delivery (MVP first, enhancements later)
- Open source approach (community contributions)

---

### 6. Hosting Costs
**Risk:** "Free hosting" may not be realistic for production load
**Impact:** Low-Medium - Client needs to pay or scale down
**Probability:** Medium

**Mitigation:**
- Explore all free tiers aggressively
- Estimate costs for different load scenarios
- Set up cost monitoring/alerts

**Contingency:**
- Client pays for hosting (they agreed to host anyway)
- Optimize aggressively to stay in free tiers

---

### 7. File Storage Growth
**Risk:** Audio files accumulate, storage costs increase
**Impact:** Low-Medium - Ongoing costs
**Probability:** High

**Mitigation:**
- Aggressive caching strategy (reuse files)
- Auto-cleanup of old/unused files
- Cheap object storage (B2, R2)
- Compression/optimized formats

**Contingency:**
- CDN with free egress (Cloudflare R2)
- Purge policy (30-day cleanup)

---

### 8. No Designer on Team
**Risk:** Prototype has "no designer," UI may be poor
**Impact:** Medium - User adoption, client satisfaction
**Probability:** Medium

**Mitigation:**
- Use established UI component libraries
- Follow best practices from similar apps
- Keep it simple and clean
- Get user feedback early

**Contingency:**
- Budget for freelance designer
- Use AI tools for design assistance
- Open source - community can contribute designs

---

## 🟢 Low Priority Risks

### 9. Authentication Provider Uncertainty
**Risk:** Client hasn't decided on auth provider yet
**Impact:** Low - Easy to swap later
**Probability:** High

**Mitigation:**
- Abstract auth behind interface
- Use OAuth 2.0 standard (provider-agnostic)
- Start with simplest option (Google)

**Contingency:**
- Add multiple providers easily (modular design)

---

### 10. International User Base
**Risk:** Users from many countries, different auth/compliance needs
**Impact:** Low - Mostly already addressed by flexible auth
**Probability:** Low

**Mitigation:**
- Support multiple auth providers from start
- GDPR compliance (standard for EU)
- i18n ready (even if only Estonian/English for now)

**Contingency:**
- Add localization later if needed
- Regional deployments if required

---

### 11. Technology Choice Regret
**Risk:** Chosen tech stack may not be optimal
**Impact:** Low-Medium - Rework, technical debt
**Probability:** Low

**Mitigation:**
- Choose mature, stable technologies
- Stick to popular stacks (easier to find help)
- Avoid bleeding-edge tech
- Consider client's future maintenance

**Contingency:**
- Modular architecture allows partial rewrites
- Document decisions for future reference

---

### 12. Scope Creep
**Risk:** "Future enhancements" ideas bleed into MVP
**Impact:** Medium - Timeline delays, budget overruns
**Probability:** Medium

**Mitigation:**
- Clear MVP definition in writing
- Separate backlog for future features
- Regular scope reviews with client
- Say "no" or "later" firmly

**Contingency:**
- Time-box features (ship or cut)
- Phase 2 contract for enhancements

---

## 🎯 Risk Monitoring Plan

### Weekly Review
- Check status of high-priority risks
- Update mitigation progress
- Add new risks as discovered

### Triggers for Escalation
- Component integration fails after 3 days
- Licensing issues discovered
- Budget exceeded by 20%
- Timeline slips by more than 1 week

### Communication
- **Green:** All good, proceeding as planned
- **Yellow:** Issue identified, mitigation in progress
- **Red:** Blocker, need client decision/help

---

## 📋 Risk Matrix

| Risk | Impact | Probability | Priority | Status |
|------|--------|-------------|----------|--------|
| Component Integration | High | Medium | 🔴 High | ⏳ Pending access |
| Licensing Issues | High | Low | 🔴 High | ⏳ Not checked yet |
| Merlin Bottleneck | Medium | High | 🔴 High | ✅ Mitigated by design |
| Unclear Requirements | Medium | Medium | 🔴 High | ⏳ In progress |
| Budget Constraints | Medium | Medium | 🟡 Medium | 📝 Documented |
| Hosting Costs | Medium | Medium | 🟡 Medium | 📝 Estimated |
| Storage Growth | Medium | High | 🟡 Medium | ✅ Mitigated by design |
| No Designer | Medium | Medium | 🟡 Medium | 📝 Plan in place |

---

**Last Updated:** October 15, 2025
**Next Review:** TBD (after component access)



