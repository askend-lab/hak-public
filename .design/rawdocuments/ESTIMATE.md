# Project Estimate - Estonian Pronunciation Platform

## ⏱️ Time Estimate

### Phase 1: Proof of Concept
| Task | Hours | Notes |
|------|-------|-------|
| Component analysis & setup | 16 | Docker setup, API wrappers |
| Basic backend API | 16 | Synthesis endpoints |
| Basic frontend | 16 | Input form, audio player |
| Integration testing | 8 | End-to-end flow |
| **Phase 1 Total** | **56 hours** | **~1.5 weeks** |

### Phase 2: Core Features
| Task | Hours | Notes |
|------|-------|-------|
| Authentication setup | 16 | OAuth integration |
| Database design & setup | 12 | Schema, migrations |
| Exercise CRUD API | 20 | Backend endpoints |
| Exercise UI | 24 | Builder, list, view |
| Job queue setup | 16 | Redis, async processing |
| File storage | 12 | Upload, serve, cleanup |
| **Phase 2 Total** | **100 hours** | **~2.5 weeks** |

### Phase 3: Polish & Deploy
| Task | Hours | Notes |
|------|-------|-------|
| UI/UX polish | 20 | Responsive, loading states |
| Error handling | 12 | Graceful failures |
| Testing | 20 | Unit, integration, E2E |
| Documentation | 16 | API docs, setup guides |
| Deployment setup | 16 | CI/CD, production env |
| Bug fixes & adjustments | 16 | Post-testing cleanup |
| **Phase 3 Total** | **100 hours** | **~2.5 weeks** |

### Contingency & Project Management
| Task | Hours | Notes |
|------|-------|-------|
| Requirements clarification | 8 | Meetings, questions |
| Component integration issues | 16 | Buffer for unknowns |
| Scope adjustments | 12 | Changes during dev |
| Code reviews | 12 | Quality assurance |
| **Management Total** | **48 hours** | **~1 week** |

---

## 📊 Total Estimate

| Category | Hours | Weeks | Percentage |
|----------|-------|-------|------------|
| Phase 1 (POC) | 56 | 1.5 | 18% |
| Phase 2 (Features) | 100 | 2.5 | 33% |
| Phase 3 (Polish) | 100 | 2.5 | 33% |
| Management | 48 | 1.0 | 16% |
| **TOTAL** | **304 hours** | **~7.5 weeks** | **100%** |

### Assumptions
- 40 hours per week
- Single developer (Aleksei)
- No major component integration issues
- Clear requirements after initial clarification
- Client responsive for decisions

---

## 💰 Cost Estimate

### Development Costs

**Rate Options:**
- Junior: €40-60/hour
- Mid-level: €60-80/hour
- Senior: €80-120/hour

**Total Cost Range:**
- Low: €12,160 (304h × €40/h)
- Mid: €21,280 (304h × €70/h)
- High: €36,480 (304h × €120/h)

**Recommended for this project:** €18,000 - €22,000
*(Senior expertise for architecture, mid-level rates for implementation)*

### Infrastructure Costs

#### Option 1: Minimal (Free Tiers)
| Service | Provider | Cost |
|---------|----------|------|
| Frontend hosting | Vercel/Netlify | €0 |
| Backend | Railway free tier | €0 |
| Database | Supabase free | €0 |
| Redis | Upstash free | €0 |
| Storage | Cloudflare R2 | €0 (10GB) |
| **Monthly Total** | | **€0** |

**Limitations:**
- Usage limits may be hit
- Not guaranteed for production
- May need upgrade

#### Option 2: Production Ready
| Service | Provider | Cost |
|---------|----------|------|
| VPS (4 vCPU, 8GB RAM) | Hetzner CPX31 | €10.90 |
| Storage | Backblaze B2 | €0.50-2 |
| Domain & SSL | Let's Encrypt | €0 |
| Monitoring | Sentry free tier | €0 |
| **Monthly Total** | | **€11-13** |

**Benefits:**
- Predictable costs
- Full control
- Scalable

#### Option 3: Cloud (Scalable)
| Service | Provider | Cost |
|---------|----------|------|
| Frontend | Vercel Pro | €20 |
| Backend | Railway | €10-20 |
| Database | Railway/Supabase | €10 |
| Redis | Upstash | €10 |
| Storage | Cloudflare R2 | €1-5 |
| **Monthly Total** | | **€51-75** |

**Benefits:**
- Auto-scaling
- Global CDN
- Managed services

### Recommendation
**Start with Option 1 (free), plan to move to Option 2 (€10-13/month) for production.**

---

## 📈 Scaling Costs

### Traffic Estimates
| Users/day | Avg sentences/user | Syntheses/day | Storage/month |
|-----------|-------------------|---------------|---------------|
| 100 | 5 | 500 | ~5 GB |
| 1,000 | 5 | 5,000 | ~50 GB |
| 10,000 | 5 | 50,000 | ~500 GB |

### Cost at Scale (Option 2 - VPS)
| Traffic | VPS | Storage | Total/month |
|---------|-----|---------|-------------|
| 100 users/day | €11 | €0.50 | €11.50 |
| 1,000 users/day | €18 (CPX41) | €2.50 | €20.50 |
| 10,000 users/day | €40 (CCX33) | €25 | €65 |

**Note:** Aggressive caching can reduce storage needs by 50-70%

---

## 🎯 Optimization Opportunities

### Cost Savings
1. **Audio caching:** Reuse identical synthesis results
   - **Potential saving:** 50-70% of synthesis requests
   
2. **CDN with free egress:** Cloudflare R2
   - **Saving:** Bandwidth costs essentially €0
   
3. **Compression:** Convert to MP3 instead of WAV
   - **Saving:** ~80% storage reduction
   
4. **Auto-cleanup:** Delete audio files older than 30 days
   - **Saving:** Continuous storage optimization

### Time Savings
1. **Use existing UI component library:** -20 hours
2. **Skip custom design, use templates:** -16 hours
3. **Reduce test coverage:** -10 hours (not recommended)
4. **Skip documentation:** -16 hours (not recommended)

**Potential fast-track:** ~220 hours (~5.5 weeks)
**Cost reduction:** ~€6,000

---

## 📋 Payment Structure Options

### Option A: Fixed Price
- **Total:** €20,000
- **Payment:** 30% start, 40% midpoint, 30% completion
- **Risk:** Client (fixed scope)

### Option B: Time & Materials
- **Rate:** €70/hour
- **Estimate:** 300 hours ≈ €21,000
- **Payment:** Weekly/biweekly invoicing
- **Risk:** Shared (actual hours)

### Option C: Phased
- **Phase 1 (POC):** €4,000 fixed
- **Phase 2 (Features):** €7,000 fixed
- **Phase 3 (Polish):** €7,000 fixed
- **Management:** €2,000 fixed
- **Total:** €20,000
- **Risk:** Balanced (exit points)

### Recommendation
**Option C (Phased)** - Provides flexibility and clear milestones

---

## ⚠️ Risks to Estimate

| Risk | Impact on Time | Impact on Cost | Mitigation |
|------|----------------|----------------|------------|
| Component integration issues | +20-40 hours | +€1,400-2,800 | Early POC |
| Unclear requirements | +16-32 hours | +€1,120-2,240 | Detailed spec |
| Scope creep | +20-60 hours | +€1,400-4,200 | Change control |
| Third-party dependencies | +8-24 hours | +€560-1,680 | Buffer time |
| Performance issues | +12-24 hours | +€840-1,680 | Load testing |

**Total Risk Buffer:** 76-180 hours (€5,320-12,600)

**Recommended contingency:** 20% (€4,000)

---

## 🎯 Final Recommendation

### Development
- **Estimate:** 300 hours
- **Timeline:** 7-8 weeks
- **Cost:** €20,000 (fixed, phased)
- **Contingency:** €4,000 (20%)
- **Total:** €24,000

### Infrastructure (Annual)
- **Year 1:** €150 (€0 months 1-6, €13/month months 7-12)
- **Year 2+:** €150/year

### Grand Total (Year 1)
**€24,150** (development + infrastructure)

---

## 🗓️ Timeline

| Week | Phase | Deliverable |
|------|-------|-------------|
| 1-2 | Phase 1 | Working POC |
| 3-5 | Phase 2 | Full features (beta) |
| 6-7 | Phase 3 | Production ready |
| 8 | Launch | Go live |

**Start date:** TBD (after client approval)
**Launch date:** TBD + 8 weeks

---

**Document Status:** Draft estimate
**Valid until:** 30 days from Oct 15, 2025
**Contact:** Aleksei (Askend)



