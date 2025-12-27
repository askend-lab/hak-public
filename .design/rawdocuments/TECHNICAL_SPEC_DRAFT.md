# Technical Specification - Estonian Pronunciation Platform

## 1. System Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Web Browser                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React/Vue Frontend (SPA)                     │  │
│  │  - Input form  - Audio player  - Exercise builder        │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS/REST API
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend API Server                          │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │   Auth       │  │  Exercise    │  │   Synthesis        │   │
│  │   Service    │  │  Service     │  │   Orchestrator     │   │
│  └──────────────┘  └──────────────┘  └────────────────────┘   │
└───────┬──────────────────┬────────────────────┬─────────────────┘
        │                  │                    │
        ▼                  ▼                    ▼
   ┌─────────┐      ┌──────────┐      ┌────────────────────┐
   │  Auth   │      │ Database │      │  Service Queue     │
   │Provider │      │(Postgres)│      │  (Redis/RabbitMQ)  │
   └─────────┘      └──────────┘      └─────────┬──────────┘
                                                 │
        ┌────────────────────────────────────────┤
        ▼                                        ▼
┌──────────────────────┐              ┌────────────────────┐
│ Stress Marker        │              │  Merlin TTS        │
│ (Docker Container)   │              │  (Docker Container)│
│ - Input: text        │              │  - Input: text     │
│ - Output: stressed   │              │  - Output: audio   │
└──────────────────────┘              └────────────────────┘
```

---

## 2. Technology Stack (Proposed)

### 2.1 Frontend
**Option 1: React + TypeScript**
- React 18+
- TypeScript
- Vite (build tool)
- TanStack Query (data fetching)
- Zustand/Context API (state management)
- Tailwind CSS (styling)

**Option 2: Vue 3 + TypeScript**
- Vue 3 Composition API
- TypeScript
- Vite
- Pinia (state management)
- Tailwind CSS

**Rationale:** Modern, maintainable, good ecosystem

### 2.2 Backend
**Option 1: Node.js + Express/Fastify**
- Node.js 20 LTS
- Express or Fastify
- TypeScript
- Prisma ORM
- Bull/BullMQ (job queue)

**Option 2: Python + FastAPI**
- Python 3.11+
- FastAPI
- SQLAlchemy ORM
- Celery + Redis (job queue)

**Rationale for Python:** 
- Provided components likely Python-based
- Easier integration
- Good for ML/NLP workloads

### 2.3 Database
- PostgreSQL 15+ (exercises, users, metadata)
- Redis (caching, job queue, session storage)

### 2.4 Authentication
- OAuth 2.0 / OpenID Connect
- Libraries: 
  - Node: Passport.js, NextAuth
  - Python: Authlib, python-social-auth

### 2.5 Infrastructure
- Docker + Docker Compose (development)
- Kubernetes (optional, if scaling needed)
- Cloud: AWS Free Tier / DigitalOcean / Hetzner

---

## 3. Core Services

### 3.1 Stress Marking Service

**Wrapper Interface:**
```typescript
interface StressMarkerService {
  markStress(text: string): Promise<StressedText>;
}

type StressedText = {
  original: string;
  marked: string;
  segments: Array<{
    word: string;
    stressed: string;
    position: number;
  }>;
}
```

**Integration:**
- Docker container with provided component
- REST API wrapper or direct library import
- Input: plain Estonian text
- Output: text with stress marks

### 3.2 Speech Synthesis Service

**Wrapper Interface:**
```typescript
interface TTSService {
  synthesize(stressedText: string): Promise<AudioResult>;
  getStatus(jobId: string): Promise<JobStatus>;
}

type AudioResult = {
  jobId: string;
  audioUrl: string;
  format: 'wav' | 'mp3';
  duration: number;
}

type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';
```

**Implementation:**
- Async job queue (Merlin processes one file at a time)
- File system management (temp storage for I/O)
- Audio file serving (static files or object storage)
- Status polling endpoint

**Flow:**
```
Request → Queue Job → Merlin Processing → Store Audio → Return URL
```

### 3.3 Exercise Management Service

**Data Model:**
```typescript
interface Exercise {
  id: string;
  userId: string;
  title: string;
  description?: string;
  sentences: Sentence[];
  shareLink: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Sentence {
  id: string;
  exerciseId: string;
  text: string;
  stressedText?: string;
  audioUrl?: string;
  order: number;
  notes?: string;
}
```

**Endpoints:**
```
POST   /api/exercises              - Create exercise
GET    /api/exercises              - List user's exercises
GET    /api/exercises/:id          - Get exercise details
PUT    /api/exercises/:id          - Update exercise
DELETE /api/exercises/:id          - Delete exercise
GET    /api/exercises/share/:token - Get shared exercise (public)

POST   /api/exercises/:id/sentences     - Add sentence
PUT    /api/exercises/:id/sentences/:sid - Update sentence
DELETE /api/exercises/:id/sentences/:sid - Delete sentence
```

---

## 4. Database Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_id VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Exercises
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  share_token VARCHAR(100) UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sentences
CREATE TABLE sentences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  stressed_text TEXT,
  audio_url VARCHAR(1000),
  "order" INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Synthesis Jobs (for tracking)
CREATE TABLE synthesis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sentence_id UUID REFERENCES sentences(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL, -- pending, processing, completed, failed
  error_message TEXT,
  audio_path VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_exercises_user_id ON exercises(user_id);
CREATE INDEX idx_exercises_share_token ON exercises(share_token);
CREATE INDEX idx_sentences_exercise_id ON sentences(exercise_id);
CREATE INDEX idx_synthesis_jobs_status ON synthesis_jobs(status);
```

---

## 5. API Endpoints

### 5.1 Authentication
```
GET  /api/auth/login/:provider    - Initiate OAuth flow
GET  /api/auth/callback/:provider - OAuth callback
POST /api/auth/logout             - Logout
GET  /api/auth/me                 - Get current user
```

### 5.2 Synthesis (Anonymous + Authenticated)
```
POST /api/synthesize
  Body: { text: string }
  Response: { 
    stressedText: string,
    audioUrl: string,
    jobId: string 
  }

GET /api/synthesize/:jobId/status
  Response: { 
    status: 'pending' | 'processing' | 'completed' | 'failed',
    audioUrl?: string 
  }
```

### 5.3 Exercises (Authenticated Only)
See section 3.3

---

## 6. File Storage Strategy

### Option 1: Local File System
- **Pros:** Free, simple
- **Cons:** Not scalable, backup complexity
- **Use case:** Development, small deployments

### Option 2: Object Storage (S3, Minio, B2)
- **Pros:** Scalable, reliable, CDN-ready
- **Cons:** Cost (minimal but not free)
- **Use case:** Production

### Recommendation:
- Development: Local FS
- Production: Backblaze B2 (cheapest) or Cloudflare R2 (free egress)

---

## 7. Deployment Architecture

### Development
```yaml
# docker-compose.yml
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
  
  backend:
    build: ./backend
    ports: ["8000:8000"]
    depends_on: [db, redis, stress-marker, merlin]
  
  db:
    image: postgres:15
    volumes: ["./data/postgres:/var/lib/postgresql/data"]
  
  redis:
    image: redis:7
  
  stress-marker:
    build: ./services/stress-marker
    ports: ["5001:5001"]
  
  merlin:
    build: ./services/merlin
    volumes: ["./data/audio:/audio"]
    ports: ["5002:5002"]
```

### Production (Option 1: VPS)
- Single VPS (Hetzner CPX31: ~10 EUR/month)
- Docker Compose
- Nginx reverse proxy
- Let's Encrypt SSL
- Automated backups

### Production (Option 2: Cloud)
- Frontend: Vercel/Netlify (free tier)
- Backend: Railway/Render (free tier)
- Database: Supabase (free tier)
- Queue: Upstash Redis (free tier)
- Components: Fly.io/Railway (minimal cost)

---

## 8. Performance Considerations

### 8.1 Merlin TTS Bottleneck
**Problem:** Sequential processing, one file at a time

**Solutions:**
1. **Job Queue with Status Polling**
   - User gets immediate response with jobId
   - Frontend polls status endpoint
   - UX: Show "Processing..." with spinner

2. **Caching**
   - Cache synthesized audio for identical texts
   - Key: hash(stressed_text)
   - Dramatically reduces repeated synthesis

3. **Multiple Merlin Instances** (if needed)
   - Scale horizontally with load balancer
   - Increases cost but improves throughput

### 8.2 Stress Marking
- Likely fast enough for real-time
- Can also cache if needed

---

## 9. Security Considerations

1. **Authentication:**
   - Secure cookie sessions or JWT
   - HTTPS only
   - CSRF protection

2. **Rate Limiting:**
   - Prevent abuse of synthesis API
   - Per-IP and per-user limits

3. **Input Validation:**
   - Sanitize user inputs
   - Limit text length
   - Prevent injection attacks

4. **File Access:**
   - Signed URLs for audio files
   - No directory traversal
   - Auto-cleanup of old files

---

## 10. Open Questions / TBD

- [ ] What format does stress marker expect? (Plain text, JSON?)
- [ ] What format does Merlin output? (WAV, MP3, sample rate?)
- [ ] What are the licenses of provided components?
- [ ] Repository links for stress marker and Merlin
- [ ] Maximum text length limits?
- [ ] Expected load/concurrent users?
- [ ] Client's preferred hosting provider?
- [ ] Timeline and deadlines?
- [ ] Design/UI assets provided or we create?

---

## 11. Development Phases

### Phase 1: Proof of Concept (2 weeks)
- [ ] Set up basic frontend (input + audio player)
- [ ] Set up basic backend API
- [ ] Wrap provided components in Docker
- [ ] Test end-to-end synthesis flow
- [ ] No auth, no exercises - just synthesis

### Phase 2: Core Features (3 weeks)
- [ ] Implement authentication
- [ ] Exercise CRUD functionality
- [ ] Share links
- [ ] Database setup
- [ ] Job queue for Merlin

### Phase 3: Polish & Deploy (2 weeks)
- [ ] UI/UX improvements
- [ ] Error handling
- [ ] Documentation
- [ ] Deployment setup
- [ ] Testing

**Total Estimate:** 7-8 weeks for MVP

---

## 12. Cost Estimate

### Minimal Setup (Free Tier Abuse)
- Frontend: Vercel (free)
- Backend: Railway (free, $5/month after)
- Database: Supabase (free)
- Redis: Upstash (free)
- Components: Fly.io (free tier)
- Storage: Cloudflare R2 (10GB free)

**Total: $0-5/month**

### Production Setup (Recommended)
- VPS: Hetzner CPX31 (~10 EUR)
- Storage: Backblaze B2 (~$0.005/GB)
- Domains/SSL: Free (Let's Encrypt)

**Total: ~10-15 EUR/month**

---

**Document Status:** Draft
**Next Steps:** Review with client, validate assumptions, access components



