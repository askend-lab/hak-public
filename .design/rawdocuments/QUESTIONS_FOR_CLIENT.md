# Questions for Estonian Language Institute Client

## 🔴 Critical (Need answers before starting development)

### Component Access
1. **Can you provide GitHub/GitLab links to:**
   - Stress marking component repository?
   - Merlin TTS synthesizer repository?

2. **What are the licenses for these components?**
   - Are they compatible with open source/commercial use?
   - Any restrictions we should know about?

3. **Technical documentation:**
   - API documentation for components?
   - Setup/installation guides?
   - Known limitations or issues?

### Authentication
4. **Which authentication provider do you prefer?**
   - Google OAuth?
   - Estonian ID-card?
   - Other?
   - Timeline for decision?

5. **Do we need to support multiple auth providers from day 1?**
   - Or can we start with one and add others later?

### Hosting & Infrastructure
6. **Do you have preferred hosting provider?**
   - Are you open to suggestions?
   - Any restrictions (must be EU-based, etc.)?

7. **What's the budget for hosting/infrastructure?**
   - Monthly budget range?
   - One-time setup budget?

8. **Who will manage hosting and maintenance?**
   - Your team?
   - Us (ongoing contract)?
   - Shared responsibility?

---

## 🟡 Important (Need answers during development)

### Requirements
9. **What is the maximum text length for input?**
   - Per sentence?
   - Per exercise?

10. **How many concurrent users do you expect?**
    - Launch day?
    - Steady state?
    - Peak times?

11. **Are there any text content restrictions?**
    - Profanity filtering?
    - Length limits?
    - Character restrictions?

### User Experience
12. **How long is acceptable wait time for audio synthesis?**
    - 5 seconds?
    - 30 seconds?
    - 1 minute?

13. **Should we show progress/queue position to users?**
    - Or just "processing" spinner?

14. **What should happen if synthesis fails?**
    - Retry automatically?
    - Show error to user?

### Data & Privacy
15. **Data retention policy:**
    - How long to keep exercises?
    - Auto-delete inactive accounts?
    - Audio file cleanup after X days?

16. **GDPR compliance:**
    - What user data do we collect?
    - Data export functionality needed?
    - Right to be forgotten implementation?

17. **Analytics and monitoring:**
    - Do you want usage analytics?
    - Error tracking?
    - Performance monitoring?

---

## 🟢 Nice to Know (Can figure out later)

### Timeline
18. **What is your desired launch date?**
    - Hard deadline?
    - Or flexible?

19. **Are there intermediate milestones/demos?**
    - When would you like to see progress?

### Design
20. **✅ CONFIRMED: You have a design system**
    - Need: Repository access
    - Need: Integration documentation
    - Need: Design token specifications

21. **Phonetic notation display:**
    - ⏳ Meeting with Helen (designer) next week
    - Will decide on visual representation
    - Current "squares" not intuitive

22. **Do you have brand assets?**
    - Logo files?
    - Brand guidelines document?
    - Accessibility requirements (WCAG level)?

23. **Mobile support priority:**
    - Desktop-first?
    - Mobile-first?
    - Equal priority?

### Features
23. **For MVP, which is more important:**
    - Speed/simplicity?
    - Feature richness?
    - Scalability?

24. **Exercise sharing:**
    - Should shared exercises be indexed by search engines?
    - Or unlisted (only via link)?

25. **User limits:**
    - Max exercises per user?
    - Max sentences per exercise?
    - Rate limiting for anonymous users?

### Future
26. **Priority for future enhancements:**
    - Ranking from your perspective?
    - Any must-haves for Phase 2?

27. **Commercial use:**
    - Will this be used commercially by anyone?
    - Or purely educational/research?

---

## 📄 Documents We Need

- [ ] Architecture diagram (mentioned in meeting)
- [x] Existing prototype (reviewed in meeting)
- [ ] Component documentation (stress marker, Merlin)
- [ ] Component repositories (GitHub/GitLab links)
- [ ] **Design system repository** (confirmed exists)
- [ ] Brand assets (logo, colors, fonts)
- [ ] Legal/compliance requirements
- [ ] Contract/statement of work
- [ ] Contact form integration details (existing system)

---

## 📞 Suggested Next Steps

1. **Demo Call:**
   - Review existing prototype together
   - Walk through component repositories
   - Clarify any misunderstandings from meeting

2. **Technical Deep Dive:**
   - Test component integration locally
   - Verify technical feasibility
   - Identify potential blockers

3. **Proposal:**
   - Present technical spec for approval
   - Timeline and cost estimate
   - Phased delivery plan

---

**Prepared by:** Aleksei (Architect)
**Date:** October 15, 2025
**Status:** Awaiting responses

