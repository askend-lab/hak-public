# Estonian Language Institute Project - TODO

## 🔴 Immediate Actions

- [ ] **Get documentation from client**
  - Architecture diagrams (mentioned in meeting)
  - Component documentation (stress marker, Merlin)
  - Functional specification
  - Any existing prototypes

- [ ] **Get repository access**
  - [ ] Stress marking component repository
  - [ ] Merlin TTS synthesizer repository
  - [ ] Check licenses (very important!)

- [ ] **Review prototype**
  - [ ] Schedule demo with Tatjana
  - [ ] Document current implementation
  - [ ] Note what works/doesn't work

- [ ] **Clarify requirements**
  - [ ] Authentication provider decision (Google? Estonian ID?)
  - [ ] Maximum text length limits
  - [ ] Expected concurrent users
  - [ ] Preferred hosting provider
  - [ ] Timeline and deadlines

## 📋 Project Setup

- [ ] **Repository structure**
  - [ ] Create Git repository
  - [ ] Set up monorepo or separate repos?
  - [ ] Choose branching strategy
  - [ ] Set up CI/CD pipelines

- [ ] **Development environment**
  - [ ] Docker Compose configuration
  - [ ] Local development setup guide
  - [ ] Environment variables documentation

- [ ] **Tech stack finalization**
  - [ ] Frontend framework decision (React vs Vue)
  - [ ] Backend framework decision (Node vs Python)
  - [ ] Database choice confirmation
  - [ ] Message queue selection

## 🎨 Design & UX

- [ ] **UI/UX Design**
  - [ ] Wireframes for main pages
  - [ ] User flow diagrams
  - [ ] Mobile responsiveness strategy
  - [ ] Accessibility considerations (WCAG)

- [ ] **Design system**
  - [ ] Color scheme
  - [ ] Typography
  - [ ] Component library
  - [ ] Icons and assets

## 💻 Development - Phase 1 (POC)

### Backend
- [ ] Set up project structure
- [ ] Configure Docker containers for provided components
- [ ] Create wrapper API for stress marker
- [ ] Create wrapper API for Merlin TTS
- [ ] Test end-to-end synthesis flow
- [ ] Basic error handling

### Frontend
- [ ] Set up project structure
- [ ] Create text input component
- [ ] Create audio player component
- [ ] Connect to backend API
- [ ] Loading states and error handling

### Integration
- [ ] Test stress marker integration
- [ ] Test Merlin TTS integration
- [ ] Verify audio file formats
- [ ] Test with various Estonian texts

## 💻 Development - Phase 2 (Core Features)

### Authentication
- [ ] Choose and integrate OAuth provider
- [ ] Implement login/logout flow
- [ ] Session management
- [ ] User profile page

### Database
- [ ] Design schema (users, exercises, sentences)
- [ ] Set up migrations
- [ ] Seed data for testing
- [ ] Backup strategy

### Exercise Management
- [ ] Exercise CRUD API endpoints
- [ ] Sentence CRUD operations
- [ ] Exercise listing UI
- [ ] Exercise builder UI
- [ ] Share link generation
- [ ] Public/private exercise view

### Synthesis Queue
- [ ] Implement job queue (Redis + Bull/Celery)
- [ ] Status polling endpoint
- [ ] Retry logic for failed jobs
- [ ] Job cleanup (old jobs)

### File Storage
- [ ] Set up audio file storage
- [ ] Audio file serving
- [ ] Caching strategy
- [ ] Cleanup of old files

## 💻 Development - Phase 3 (Polish)

### Features
- [ ] Audio caching (identical texts)
- [ ] Rate limiting
- [ ] Input validation and sanitization
- [ ] Error pages (404, 500, etc.)
- [ ] Loading skeletons
- [ ] Toast notifications

### Testing
- [ ] Unit tests (backend)
- [ ] Integration tests
- [ ] E2E tests (frontend)
- [ ] Load testing (Merlin bottleneck)

### Documentation
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Setup/installation guide
- [ ] User guide
- [ ] Component replacement guide
- [ ] Architecture documentation
- [ ] Contributing guidelines

### Security
- [ ] Security audit
- [ ] HTTPS enforcement
- [ ] CSRF protection
- [ ] Rate limiting implementation
- [ ] Input sanitization
- [ ] Secure file access

## 🚀 Deployment

### Infrastructure
- [ ] Choose hosting solution
- [ ] Set up production environment
- [ ] Configure domain and SSL
- [ ] Set up monitoring (uptime, errors)
- [ ] Set up logging (centralized)
- [ ] Backup automation

### CI/CD
- [ ] Automated testing pipeline
- [ ] Deployment automation
- [ ] Staging environment
- [ ] Production deployment

### Performance
- [ ] Frontend optimization (code splitting, lazy loading)
- [ ] Backend optimization (query optimization, caching)
- [ ] CDN setup for static assets
- [ ] Audio file CDN

## 📝 Project Management

- [ ] **Timeline**
  - [ ] Break down into sprints
  - [ ] Set milestones
  - [ ] Regular check-ins with client

- [ ] **Communication**
  - [ ] Set up project communication channel
  - [ ] Weekly status updates
  - [ ] Demo schedule

- [ ] **Risks**
  - [ ] Identify risks (see RISKS.md)
  - [ ] Mitigation strategies
  - [ ] Contingency plans

## 🔮 Future Enhancements (Post-MVP)

- [ ] Multiple language model support
- [ ] LMS integration modules (Moodle plugin)
- [ ] Advanced analytics for teachers
- [ ] Pronunciation comparison (user voice vs synthesized)
- [ ] Multiple phonetic notation systems
- [ ] Mobile apps (iOS/Android)
- [ ] Offline mode
- [ ] Export exercises (PDF, audio files)

---

## 📊 Current Status

**Project Phase:** Pre-development / Requirements gathering
**Last Updated:** October 15, 2025
**Next Meeting:** TBD

## 🎯 Critical Path Items

1. ⚠️ Get component repository access (BLOCKER)
2. ⚠️ Verify component licenses (BLOCKER)
3. ⚠️ Review prototype with Tatjana
4. Choose tech stack
5. Start Phase 1 POC

---

**Notes:**
- This is a living document, update as project progresses
- Mark items with ✅ when completed
- Add new items as they come up



