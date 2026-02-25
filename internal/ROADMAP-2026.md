# HAK Development Roadmap

**Date:** 2026-02-25
**Prepared by:** Askend Lab
**For:** EKI (Eesti Keele Instituut)

---

## What HAK Is Today

HAK (Hääldusabiline) is an Estonian pronunciation learning platform with a unique capability: **Vabamorf-powered phonetic variant selection** — something no competitor offers. Users enter Estonian text, hear it spoken, and explore pronunciation variants for each word.

The platform runs on AWS serverless infrastructure, has 3100+ automated tests, and serves three user roles: learner, teacher, and researcher.

---

## Phase 1: Next-Generation Speech Synthesis (Months 1–3)

*The single biggest leap in user experience and platform capability.*

### GPU-Accelerated Neural TTS

| Aspect | Today (Merlin) | After Upgrade |
|--------|---------------|---------------|
| **Technology** | Statistical parametric (2016) | Neural (VITS / Tacotron 2 + HiFi-GAN) |
| **Voice quality** | Functional, with artifacts | Near-human naturalness |
| **Synthesis speed** | ~4 sec per word | <1 sec per sentence |
| **User-perceived latency** | 3–6 sec (queue → process → poll) | <1 sec (real-time streaming) |
| **Voice options** | 2 models | Multiple voices, tones, emotions |
| **Infrastructure** | CPU (ECS Fargate) | GPU (Inferentia / g5.xlarge / SageMaker) |

**Migration path:**
1. Evaluate available Estonian neural TTS models (TartuNLP, EKI research, open-source VITS)
2. Deploy GPU inference infrastructure (AWS Inferentia for cost, or g5.xlarge for flexibility)
3. Replace queue-poll architecture with real-time WebSocket streaming
4. Keep current Merlin as fallback during transition

### Real-Time Streaming Architecture

```
Today:    Browser → API → SQS → CPU Worker → S3 → poll → download WAV
After:    Browser → WebSocket → GPU → stream audio chunks → instant playback
```

- **Latency**: 3–6 sec → under 1 sec
- **Cost efficiency**: GPU instances handle 10–50× more requests per dollar than CPU
- **User experience**: hear audio as it's generated, not after full synthesis

### Compressed Audio Formats

Replace WAV (large, uncompressed) with Opus or MP3 — **5–10× smaller files**, faster downloads, less storage cost. Especially impactful for mobile users on slow connections.

---

## Phase 2: Active Learning (Months 2–4)

*Transform HAK from a passive listening tool into an interactive pronunciation trainer.*

### Voice Recording & Comparison

| Feature | Description |
|---------|-------------|
| **Record your pronunciation** | Microphone button next to every sentence — record, listen back |
| **Side-by-side playback** | Hear TTS reference, then your own recording — spot differences |
| **Visual waveform comparison** | See the sound waves overlaid — visual feedback on timing and rhythm |
| **Pronunciation scoring** (future) | Automatic similarity metric (DTW/MCD) — quantify improvement |

This is the most-requested feature across all user personas (learner, teacher, speech therapist, parent). It turns HAK into a practice tool, not just a reference tool.

### Student Progress Tracking

| Feature | Description |
|---------|-------------|
| **Practice history** | Words and sentences practiced, time spent, frequency |
| **Improvement trends** | Visualize progress over days/weeks |
| **Daily goals** | Optional streak counter and practice targets |
| **Per-student view for teachers** | Which students practiced, how much, which words |

Without progress tracking, learners have no way to measure improvement — the #1 factor in sustained motivation.

### Teacher Dashboard

Expand the current task-sharing into a full pedagogical workflow:

| Feature | Description |
|---------|-------------|
| **Class management** | Create classes, add students, assign tasks to groups |
| **Assignment status** | See which students completed tasks, who's struggling |
| **Feedback mechanism** | Rate student pronunciation, add comments |
| **Completion confirmation** | Student marks "Done" → teacher sees status in real-time |

Schools are the primary adoption channel for a government language institute. Teacher workflows drive student engagement.

---

## Phase 3: Platform & Ecosystem (Months 4–8)

*Transform HAK from a tool into a platform that others build upon.*

### Public API

| Feature | Description |
|---------|-------------|
| **API key management** | Self-service keys via developer dashboard |
| **OpenAPI specification** | Machine-readable docs, Swagger UI, code generation |
| **Per-key rate limiting** | Quotas, usage tiers, monitoring |
| **TypeScript & Python SDKs** | Client libraries for easy integration |

The strategic arc for API access:

```
Now:     Endpoints locked behind WAF — security-first
Phase 1: GPU synthesis → fast, cost-effective at scale
Phase 3: Re-open as authenticated Public API → per-key limits, usage analytics
```

Once synthesis is fast and cheap (GPU), opening the API to third parties creates an ecosystem: other language apps, speech therapy software, educational publishers, research institutions — all building on HAK's unique Estonian TTS + phonetic analysis.

### LTI Integration (Education)

| Feature | Description |
|---------|-------------|
| **LTI 1.3 provider** | Integrate with Moodle, Canvas, Google Classroom |
| **Grade passback** | Send pronunciation scores back to LMS gradebook |
| **Deep linking** | Teacher embeds specific pronunciation tasks directly in course materials |

Estonian schools use Moodle extensively. LTI integration means students access HAK directly from their learning environment — zero friction, no separate accounts.

### Multi-Language UI

| Language | Purpose |
|----------|---------|
| **Russian** | Primary immigrant language in Estonia |
| **English** | International researchers, tourists, EU partners |
| **Ukrainian** | Growing immigrant population |

The target audience — people learning Estonian — by definition doesn't fully understand Estonian. A UI in their native language removes the single biggest adoption barrier for immigrants.

---

## Phase 4: Advanced Linguistics (Months 6–12)

*Leverage HAK's unique Vabamorf integration for features no competitor can match.*

### Morphological Analysis UI

Vabamorf already provides morphological analysis on the backend. Expose it to users:
- **Word class** (noun, verb, adjective)
- **Declension forms** (all 14 Estonian cases)
- **Lemma** (base form)
- **Compound word structure** (how Estonian compound words break down)

This serves researchers, translators, and advanced learners — audiences that currently use separate tools.

### Intelligent Pronunciation Guidance

| Feature | Description |
|---------|-------------|
| **"Normative pronunciation" label** | Mark the EKI-recommended variant clearly |
| **Homonym disambiguation** | Context-aware pronunciation selection (e.g., "linn" = city vs genitive of "lina") |
| **Foreign word handling** | Graceful fallback for loan words, names, abbreviations |
| **IPA output** | International Phonetic Alphabet alongside Estonian notation — for academics |

### Spell-Check & Suggestions

Vabamorf-powered "Did you mean?" for typos — especially valuable for learners who make systematic spelling errors. The morphological engine already knows valid Estonian word forms; suggesting corrections is a natural extension.

---

## Non-Functional Evolution

### Performance

| Metric | Today | Target |
|--------|-------|--------|
| Synthesis latency | 3–6 sec | <1 sec (streaming) |
| Audio file size | WAV (~100 KB/sentence) | Opus (~10 KB/sentence) |
| Mobile app experience | Web only | PWA ("Add to Home Screen", offline cached audio) |
| Cold start | ~3 sec | <1 sec (provisioned concurrency) |

### Infrastructure

| Improvement | Description |
|-------------|-------------|
| **GPU inference** | Inferentia or SageMaker for cost-optimized neural TTS |
| **Auto-scaling workers** | SQS-driven 0→N scaling (pay only for active synthesis) |
| **CDN for audio** | CloudFront caching — lower latency, reduced S3 egress cost |
| **Private networking** | Move compute to private subnets (no public IPs) |
| **Staging environment** | Dev → Staging → Production pipeline |

### Cost Profile

| Component | Today | After GPU Migration |
|-----------|-------|---------------------|
| Synthesis cost | ~$0.04/hour per CPU worker | ~$0.50/hour per GPU, but 50× throughput |
| Effective cost per synthesis | ~$0.001 | ~$0.0002 (5× cheaper) |
| Idle cost | Fixed Fargate tasks | Scale-to-zero (GPU spins down when idle) |
| Storage | WAV files, no lifecycle | Compressed + lifecycle policy |

---

## Investment Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| **1: Neural TTS** | Months 1–3 | GPU synthesis, real-time streaming, compressed audio |
| **2: Active Learning** | Months 2–4 | Voice recording, progress tracking, teacher dashboard |
| **3: Platform** | Months 4–8 | Public API, LTI integration, multi-language UI |
| **4: Linguistics** | Months 6–12 | Morphology UI, spell-check, IPA, homonym disambiguation |

Phases overlap — work on Phase 2 frontend features begins while Phase 1 GPU infrastructure is being deployed.

---

## Competitive Position After Roadmap

| Capability | HAK | Google TTS | Amazon Polly | Competitor Apps |
|------------|-----|-----------|--------------|-----------------|
| Estonian phonetic variant selection | ✅ Unique | ❌ | ❌ | ❌ |
| Morphological analysis (Vabamorf) | ✅ Unique | ❌ | ❌ | ❌ |
| Neural TTS quality | ✅ (after Phase 1) | ✅ | ✅ | Varies |
| Voice recording & comparison | ✅ (after Phase 2) | ❌ | ❌ | Some |
| Teacher–Student workflow | ✅ (after Phase 2) | ❌ | ❌ | ❌ |
| LTI / Moodle integration | ✅ (after Phase 3) | ❌ | ❌ | ❌ |
| Public API for Estonian TTS | ✅ (after Phase 3) | ✅ (limited Estonian) | ✅ (limited Estonian) | ❌ |
| Open source (MIT) | ✅ | ❌ | ❌ | ❌ |
| TARA eID authentication | ✅ | ❌ | ❌ | ❌ |
| Zero-barrier entry (no registration) | ✅ | ❌ | ❌ | ❌ |

**HAK's unique moat:** The combination of Vabamorf phonetic analysis + EKI linguistic authority + open source + Estonian eID authentication creates a position that no commercial TTS provider can replicate.

---

## Decisions Needed from EKI

| # | Decision | Impact |
|---|----------|--------|
| 1 | **Which neural TTS model to adopt?** TartuNLP, EKI research, or train new? | Phase 1 timeline |
| 2 | **Public API scope** — free for research? Paid tiers for commercial? | Phase 3 business model |
| 3 | **Content moderation policy** — needed for school context vs speech therapy ("perse" is a valid Estonian word) | User trust |
| 4 | **Authentication for synthesis** — keep anonymous access? Require login after N uses? | Abuse prevention vs adoption |
| 5 | **i18n priority** — Russian first? English first? Both simultaneously? | Phase 3 ordering |

---

*This roadmap is informed by 51 comprehensive audits covering 25 user personas (from beginner learner to EU procurement specialist) and 25 technical checklists, yielding 773 observations consolidated into 99 unique development opportunities.*
