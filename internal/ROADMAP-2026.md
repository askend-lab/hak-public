# HAK Development Roadmap

**Date:** 2026-02-26
**Prepared by:** Askend Lab
**For:** EKI (Eesti Keele Instituut)

---

## What HAK Is Today

HAK (Hääldusabiline) is an Estonian pronunciation learning platform with a unique capability: **Vabamorf-powered phonetic variant selection** — something no competitor offers. Users enter Estonian text, hear it spoken, and explore pronunciation variants for each word.

The platform runs on AWS serverless infrastructure, has 3100+ automated tests, and serves three user roles: learner, teacher, and researcher.

---

## Phase 1: Next-Generation Speech Synthesis (Months 1–3)

*The single biggest leap in user experience and platform capability.*

### Next-Generation Neural TTS

| Aspect | Today (Merlin) | After Upgrade |
|--------|---------------|---------------|
| **Technology** | Statistical parametric (Theano, 2016) | Neural (model TBD — depends on EKI/TartuNLP partnership) |
| **Voice quality** | Functional, with artifacts | Depends on chosen model |
| **Synthesis speed** | ~4 sec per word (CPU) | Depends on chosen model and infrastructure |
| **User-perceived latency** | 5–7 sec (queue + synthesis + poll) | Reduced by streaming architecture (exact gain depends on model) |
| **Voice options** | 2 models | Depends on chosen model |
| **Infrastructure** | CPU-only (ECS Fargate) — note: Theano already supports GPU | GPU infrastructure (Inferentia / g5.xlarge / SageMaker) |

**Important context:** The current Merlin model (Theano) already supports GPU — the limitation is infrastructure (Fargate has no GPU), not the model. Moving to GPU is an infrastructure change, not a model change. A new model is a separate decision that depends on EKI partnership.

**Migration path:**
1. Explore partnership with TartuNLP / EKI for next-generation Estonian TTS model (we build the platform, not the model)
2. Deploy GPU-capable inference infrastructure (AWS Inferentia for cost, or g5.xlarge for flexibility)
3. Replace queue-poll architecture with real-time WebSocket streaming
4. Keep current Merlin as fallback during transition

### Real-Time Streaming Architecture

```
Today:    Browser → API → SQS → CPU Worker → S3 → poll → download WAV
After:    Browser → WebSocket → GPU → stream audio chunks → instant playback
```

- **Latency**: Streaming eliminates ~1–2 sec of queue/poll overhead; total latency improvement depends on chosen model
- **Cost efficiency**: Depends on model, GPU type, and traffic volume — requires benchmarking
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

### Minimal Pairs Trainer

| Feature | Description |
|---------|-------------|
| **Curated minimal pair sets** | "kool" vs "kuul", "saal" vs "seal" — the most common pronunciation mistakes |
| **Listen & choose** | Hear a word, pick which one was spoken — trains phonemic awareness |
| **Difficulty progression** | Start with obvious pairs, advance to subtle distinctions |
| **Native-language specific sets** | Different pairs for Russian, Ukrainian, English speakers — each language has different blind spots |

Minimal pair training is the gold standard in phonetics education. No Estonian language app offers this.

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

### Exam Preparation Mode

| Feature | Description |
|---------|-------------|
| **B1/B2 vocabulary lists** | Words and phrases from official Estonian language exam programs |
| **Situational dialogues** | "At the store", "At the doctor", "Job interview" — real-life conversation practice |
| **Timed practice sessions** | Simulate exam conditions with time pressure |
| **Readiness assessment** | Track which exam topics are mastered vs need more practice |

Estonia requires Estonian language proficiency for citizenship and many jobs. HAK becomes the national exam preparation tool.

Schools are the primary adoption channel for a government language institute. Teacher workflows drive student engagement.

---

## Phase 3: HAK Everywhere (Months 4–8)

*Put Estonian pronunciation help wherever people need it — not just on hak.askend-lab.com.*

### Telegram / WhatsApp Bot

Send any Estonian text → get audio back instantly. No website, no registration, no app download.

- Estonian immigrants live in messaging apps. Meet them where they are.
- Share pronunciation in group chats — social learning.
- Implementation: AWS Lambda + Telegram Bot API + existing synthesis pipeline.

### Chrome Extension

Highlight any Estonian text on any website → hear it pronounced. Right-click context menu: "Pronounce with HAK".

- Reading Estonian news, blogs, government websites — pronunciation help is one click away.
- Viral growth: every user becomes a distribution channel.
- Builds on existing Public API infrastructure.

### Embeddable Widget

```html
<script src="https://hak.askend-lab.com/widget.js"></script>
```

Any Estonian website adds pronunciation to their content. Newspapers, educational portals, government sites, blogs — HAK becomes the pronunciation layer of the Estonian internet.

### Public API

**Already implemented:**
| Feature | Status |
|---------|--------|
| **OpenAPI specification** | ✅ Done — `merlin-api.openapi.yaml`, `vabamorf-api.openapi.yaml`, generated from Zod schemas |
| **TypeScript client** | ✅ Done — `packages/api-client` with auto-generated types from OpenAPI |
| **Rate limiting (WAF)** | ✅ Done — per-IP and per-path rate limiting in `infra/waf.tf` |

**New work needed:**
| Feature | Description |
|---------|-------------|
| **API key management** | Self-service keys via developer dashboard (currently: Cognito JWT or anonymous) |
| **Per-key quotas & usage tiers** | Usage analytics, tiered access beyond current WAF rate limits |
| **Python SDK** | Client library for Python (TypeScript already exists) |

Opening the API to third parties creates an ecosystem: other language apps, speech therapy software, educational publishers, research institutions — all building on HAK's unique Estonian TTS + phonetic analysis.

### LTI Integration (Education)

| Feature | Description |
|---------|-------------|
| **LTI 1.3 provider** | Integrate with Moodle, Canvas, Google Classroom |
| **Grade passback** | Send pronunciation scores back to LMS gradebook |
| **Deep linking** | Teacher embeds specific pronunciation tasks directly in course materials |

Estonian schools use Moodle extensively. LTI integration means students access HAK directly from their learning environment — zero friction, no separate accounts.

### Multilingual UI

The target audience — people learning Estonian — by definition doesn't fully understand Estonian. A UI in their native language removes the single biggest adoption barrier for immigrants.

Priority languages determined by immigration statistics and EKI input. Framework (react-i18next) supports unlimited languages — community can contribute translations via standard JSON files.

---

## Phase 4: National Language Lab (Months 6–12)

*Position HAK as Estonia's national pronunciation infrastructure — a platform that only EKI can build.*

### Regional Dialect Explorer

Estonia has distinct dialect regions (Saare, Võru, Mulgi, Seto) with unique pronunciation patterns. HAK can become the living archive:

| Feature | Description |
|---------|-------------|
| **Dialect map** | Interactive map of Estonia — click a region, hear how they say it |
| **Standard vs regional** | Side-by-side comparison of standard and regional pronunciation |
| **Historical pronunciation** | How Estonian sounded 50, 100 years ago (from EKI archives) |

This positions HAK as a cultural heritage tool, not just a learning tool. Unique to EKI — no commercial provider has access to this data.

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

### Research Portal

Anonymized, aggregated data from HAK usage — a goldmine for linguistics research:

| Insight | Value |
|---------|-------|
| **Which words are hardest?** | Ranked by synthesis frequency + recording retry count |
| **Error patterns by native language** | Russian speakers struggle with X, Ukrainian with Y |
| **Regional learning patterns** | Tallinn vs Tartu vs Narva — different needs |
| **Pronunciation improvement over time** | Longitudinal data on learning effectiveness |

No other platform can provide this data. EKI becomes the authority on how people learn Estonian pronunciation.

---

## Non-Functional Evolution

### Performance

| Metric | Today | Target |
|--------|-------|--------|
| Synthesis latency | 5–7 sec (queue + synthesis + poll) | Reduced via streaming (exact target depends on model) |
| Audio file size | WAV (~100 KB/sentence) | Opus (~10 KB/sentence) |
| Mobile app experience | Web only | PWA ("Add to Home Screen", offline cached audio) |
| Cold start | ~3 sec | <1 sec (provisioned concurrency) |

### Infrastructure

**Already implemented:**
| Feature | Status |
|---------|--------|
| **Auto-scaling workers** | ✅ Done — SQS-driven 0→N scaling with `appautoscaling` target tracking in `infra/merlin/main.tf` |
| **Scale-to-zero** | ✅ Done — `desired_count = 0`, auto-scaling manages worker count based on queue depth |

**New work needed:**
| Improvement | Description |
|-------------|-------------|
| **GPU-capable infrastructure** | Inferentia or EC2 GPU instances for neural TTS (requires ECS on EC2, not Fargate) |
| **CDN for audio** | CloudFront caching for synthesized audio — lower latency, reduced S3 egress cost |
| **Private networking** | Move compute to private subnets (no public IPs) |
| **Staging environment** | Dev → Staging → Production pipeline |

### Cost Profile

| Component | Today | After GPU Migration |
|-----------|-------|---------------------|
| Synthesis cost | ~$0.04/hour per CPU Fargate worker | GPU instance cost varies ($0.84/hr for g5.xlarge) — requires benchmarking |
| Effective cost per synthesis | Depends on traffic volume | Depends on model, batching capability, and traffic — requires benchmarking |
| Idle cost | ✅ Already scale-to-zero (auto-scaling) | Same principle applies to GPU instances |
| Storage | WAV files, no lifecycle | Compressed + lifecycle policy |

---

## Investment Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| **1: Neural TTS** | Months 1–3 | GPU infrastructure, streaming architecture, compressed audio (model depends on EKI partnership) |
| **2: Active Learning** | Months 2–4 | Voice recording, minimal pairs, progress tracking, teacher dashboard, exam prep |
| **3: HAK Everywhere** | Months 4–8 | Telegram bot, Chrome extension, embeddable widget, API keys, LTI, multilingual UI |
| **4: National Language Lab** | Months 6–12 | Regional dialects, morphology UI, spell-check, IPA, research portal |

Phases overlap — work on Phase 2 frontend features begins while Phase 1 GPU infrastructure is being deployed.

---

## Competitive Position After Roadmap

| Capability | HAK | Google TTS | Amazon Polly | Competitor Apps |
|------------|-----|-----------|--------------|------------------|
| Estonian phonetic variant selection | ✅ Unique | ❌ | ❌ | ❌ |
| Morphological analysis (Vabamorf) | ✅ Unique | ❌ | ❌ | ❌ |
| Regional dialect explorer | ✅ Unique (after Phase 4) | ❌ | ❌ | ❌ |
| Minimal pairs trainer | ✅ (after Phase 2) | ❌ | ❌ | ❌ |
| Neural TTS quality | ✅ (after Phase 1) | ✅ | ✅ | Varies |
| Voice recording & comparison | ✅ (after Phase 2) | ❌ | ❌ | Some |
| Exam preparation (B1/B2) | ✅ (after Phase 2) | ❌ | ❌ | ❌ |
| Teacher–Student workflow | ✅ (after Phase 2) | ❌ | ❌ | ❌ |
| Telegram/WhatsApp bot | ✅ (after Phase 3) | ❌ | ❌ | ❌ |
| Chrome extension | ✅ (after Phase 3) | ❌ | ❌ | ❌ |
| Embeddable widget | ✅ (after Phase 3) | ❌ | ❌ | ❌ |
| LTI / Moodle integration | ✅ (after Phase 3) | ❌ | ❌ | ❌ |
| Research portal | ✅ (after Phase 4) | ❌ | ❌ | ❌ |
| Public API for Estonian TTS | ✅ Partially (OpenAPI, TS client, WAF rate limiting done; API keys, Python SDK pending) | ✅ (limited Estonian) | ✅ (limited Estonian) | ❌ |
| Open source (MIT) | ✅ | ❌ | ❌ | ❌ |
| TARA eID authentication | ✅ | ❌ | ❌ | ❌ |
| Zero-barrier entry (no registration) | ✅ | ❌ | ❌ | ❌ |

**HAK's unique moat:** The combination of Vabamorf phonetic analysis + EKI linguistic authority + open source + Estonian eID authentication creates a position that no commercial TTS provider can replicate.

---

## Decisions Needed from EKI

| # | Decision | Impact |
|---|----------|--------|
| 1 | **Which neural TTS model to pursue?** Partnership with TartuNLP, EKI research, or commission new? (We build the platform, not the model) | Phase 1 timeline |
| 2 | **Public API scope** — free for research? Paid tiers for commercial? | Phase 3 business model |
| 3 | **Content moderation policy** — needed for school context vs speech therapy ("perse" is a valid Estonian word) | User trust |
| 4 | **Authentication for synthesis** — keep anonymous access? Require login after N uses? | Abuse prevention vs adoption |
| 5 | **i18n priority** — which languages first? Community translations? | Phase 3 ordering |
| 6 | **Dialect data access** — can EKI provide regional pronunciation recordings/data? | Phase 4 scope |
| 7 | **Research portal ethics** — anonymization standards for usage data? IRB approval needed? | Phase 4 launch |

---

*This roadmap is informed by 51 comprehensive audits covering 25 user personas (from beginner learner to EU procurement specialist) and 25 technical checklists, yielding 773 observations consolidated into 99 unique development opportunities.*

*Updated 2026-02-26: Added Telegram bot, Chrome extension, embeddable widget, minimal pairs trainer, exam preparation mode, regional dialect explorer, and research portal.*
