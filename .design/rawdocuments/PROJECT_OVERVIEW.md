# Estonian Language Institute - Pronunciation Learning Platform

## 📋 Project Summary

Web application for learning proper Estonian pronunciation for non-native speakers.

**Budget:** Small
**Timeline:** TBD
**Hosting:** Client-side (Estonian Language Institute)
**License:** Open Source

---

## 🎯 Core Functionality

```
User Input (Estonian sentence) 
    ↓
Stress Marking Component (provided)
    ↓
Speech Synthesis - Merlin TTS (provided)
    ↓
Audio Output (pronunciation)
```

### User Flow

1. **Anonymous User:**
   - Enter sentence → Listen to pronunciation
   - Save to browser local storage
   - Data lost on logout

2. **Authenticated User:**
   - All anonymous features +
   - Create exercises/lessons (sets of sentences)
   - Generate shareable links
   - Others can access via link (read-only)

---

## 🏗️ Technical Architecture

### Components to Develop

- [ ] Frontend UI
- [ ] Backend API
- [ ] Database (user exercises storage)
- [ ] Authentication integration
- [ ] Service wrappers for provided components

### Components Provided (Ready)

- ✅ **Stress Marking Component**
  - Source code available
  - Docker deployable
  - Uses Estonian language dictionaries
  
- ✅ **Merlin TTS Synthesizer**
  - Source code available
  - File system based (text file → audio file)
  - **Limitation:** One file generation at a time
  - Needs service wrapper

---

## 🔑 Key Requirements

### 1. Modularity
- Easy component replacement
- Universities can plug in their own models
- Integration-ready for LMS systems (Moodle, etc.)

### 2. Cost-Efficiency
- Minimal hosting costs (ideally free/near-zero)
- Scalable (will go to public site)

### 3. Authentication
- Multiple providers support (future)
- Google OAuth (suggested)
- Government auth system (under consideration)
- International users (not only Estonian residents)

### 4. Open Source
- Public code repository
- Forkable by institutions
- Adaptable for research purposes

---

## ⚠️ Constraints & Risks

1. **Budget:** Small project, limited resources
2. **Integration Risk:** Main complexity in wrapping provided components
3. **Performance:** Merlin TTS sequential processing limitation
4. **Licensing:** Need to verify licenses of provided components
5. **Scope:** "UI over existing tech" - client aware of limitations

---

## 🚀 Future Roadmap

### Phase 2+
- Switchable language models
- LMS integration modules
- University SSO systems
- Multiple phonetic notation support
- Research API for model testing

### Target Users
1. **Educational Institutions** - integrate into their systems
2. **Researchers** - test their own models
3. **Teachers** - create exercises
4. **Students** - practice pronunciation

---

## 📦 Deliverables

1. Working web application
2. Deployment-ready code
3. Documentation for:
   - Setup/installation
   - Component replacement guide
   - Integration examples
4. Open source repository

---

## 🔍 Next Steps

- [ ] Obtain links to documentation
- [ ] Get access to component repositories
- [ ] Review licenses
- [ ] Examine prototype
- [ ] Technical integration analysis
- [ ] Choose tech stack
- [ ] Design system architecture
- [ ] Estimate effort and timeline

---

## 📞 Stakeholders

**Client:** Estonian Language Institute
**Development:** Aleksei (Architecture/Development), Tatjana (PM)

---

## 📄 Related Documents

- Architecture diagram (from client)
- Prototype (AI-generated, functional demo)
- Requirements analysis (recently completed)
- Component documentation (TBD)



