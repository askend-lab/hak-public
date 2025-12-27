# MVP Architecture - Estonian Pronunciation Learning Platform

**Version:** 1.0  
**Date:** October 16, 2025  
**Status:** Initial Architecture

---

## 🎯 Overview

Minimal viable product for rapid development and deployment:
- **Goal:** Text → Pronunciation with stress marks → Audio synthesis → Browser playback
- **Timeline:** 5-7 days to working prototype
- **Approach:** Maximum speed, minimum DevOps, simple architecture

---

## 🏗️ System Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────┐
│           AWS Amplify Hosting                   │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │         Next.js Application               │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │  Frontend (React)                   │ │ │
│  │  │  - Text input                       │ │ │
│  │  │  - Audio player                     │ │ │
│  │  │  - Stressed text display            │ │ │
│  │  └─────────────────────────────────────┘ │ │
│  │                                           │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │  API Routes (Auto Lambda)           │ │ │
│  │  │  - /api/synthesize                  │ │ │
│  │  │  - /api/variants (future)           │ │ │
│  │  └─────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────┘
                   │ HTTP/Lambda Invocation
        ┌──────────┴──────────┐
        ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│  Lambda         │   │  Lambda         │
│  Vabamorf       │   │  Merlin TTS     │
│  (Container)    │   │  (Container)    │
│                 │   │                 │
│  Input: Text    │   │  Input: Text    │
│  Output: Marks  │   │  Output: Audio  │
└─────────────────┘   └─────────────────┘
```

---

## 💻 Local Development Setup

### Architecture for Development

**Three components running:**

1. **Next.js App** (runs natively)
   - `npm run dev`
   - Hot reload enabled
   - Runs on `localhost:3000`
   - Fast iteration for UI/UX

2. **Vabamorf Container** (Docker)
   - HTTP service on `localhost:8001`
   - EstNLTK + Vabamorf libraries
   - No need to install Python locally

3. **Merlin TTS Container** (Docker)
   - HTTP service on `localhost:8002`
   - Pre-loaded neural network models
   - No need to download models locally

### Local Development Flow

```
Developer's Laptop
├── Terminal 1: docker-compose up vabamorf merlin
│   └─ Starts ML services in background
│
├── Terminal 2: npm run dev
│   └─ Starts Next.js with hot reload
│
└── Browser: http://localhost:3000
    └─ Full application working locally
```

### File Structure

```
eki-pronunciation/
├── pages/
│   ├── index.tsx              # Main UI
│   └── api/
│       └── synthesize.ts      # API endpoint
│
├── lambda/
│   ├── vabamorf/
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── handler.py
│   │
│   └── merlin/
│       ├── Dockerfile
│       ├── requirements.txt
│       └── handler.py
│
├── docker-compose.yml         # Local development services
├── .env.local                 # Local config
├── .env.production            # Production config (Amplify)
└── package.json
```

### Environment Variables

**Local Development (.env.local):**
```bash
VABAMORF_URL=http://localhost:8001
MERLIN_URL=http://localhost:8002
NODE_ENV=development
```

**Production (AWS Amplify):**
```bash
VABAMORF_LAMBDA=arn:aws:lambda:eu-north-1:xxx:function:vabamorf
MERLIN_LAMBDA=arn:aws:lambda:eu-north-1:xxx:function:merlin
NODE_ENV=production
AWS_REGION=eu-north-1
```

### Starting Local Development

```bash
# 1. Clone repository
git clone <repo-url>
cd eki-pronunciation

# 2. Install dependencies
npm install

# 3. Start Docker services (one-time per day)
docker-compose up -d vabamorf merlin

# 4. Start Next.js development server
npm run dev

# 5. Open browser
# http://localhost:3000
```

**Result:** Full application running locally without AWS, without internet.

---

## ☁️ Production Deployment (AWS Amplify)

### Components on AWS

1. **AWS Amplify Hosting**
   - Hosts Next.js application
   - Automatic builds from Git
   - CDN (CloudFront) globally
   - SSL certificate automatic
   - Custom domain support

2. **Lambda Function: Vabamorf**
   - Container-based Lambda
   - Deployed from Docker image
   - Stores in ECR (Elastic Container Registry)
   - Invoked by Next.js API routes

3. **Lambda Function: Merlin TTS**
   - Container-based Lambda
   - Deployed from Docker image
   - Stores in ECR
   - Invoked by Next.js API routes

### Deployment Flow

```
Developer
   │
   ├─ git push origin main
   │     ↓
   │  ┌─────────────────────┐
   │  │   GitHub Repo       │
   │  └──────────┬──────────┘
   │             │ webhook
   │             ▼
   │  ┌─────────────────────┐
   │  │   AWS Amplify       │
   │  │   - Pull code       │
   │  │   - npm build       │
   │  │   - Deploy to CDN   │
   │  └─────────────────────┘
   │             ↓
   │  https://main.d1a2b3c4.amplifyapp.com
   │
   └─ docker build + push (Lambda functions)
         ↓
      ┌─────────────────────┐
      │   AWS ECR           │
      │   - vabamorf:latest │
      │   - merlin:latest   │
      └──────────┬──────────┘
                 ↓
      ┌─────────────────────┐
      │   AWS Lambda        │
      │   - Auto-update     │
      │   - Scale on demand │
      └─────────────────────┘
```

### Deployment Steps

**Initial Setup (One-time):**

1. **Create Lambda Functions:**
   ```bash
   # Build and push Docker images
   cd lambda/vabamorf
   docker build -t vabamorf .
   docker tag vabamorf:latest <account>.dkr.ecr.eu-north-1.amazonaws.com/vabamorf:latest
   docker push <account>.dkr.ecr.eu-north-1.amazonaws.com/vabamorf:latest
   
   # Create Lambda function
   aws lambda create-function \
     --function-name vabamorf \
     --package-type Image \
     --code ImageUri=<account>.dkr.ecr.eu-north-1.amazonaws.com/vabamorf:latest \
     --role <lambda-execution-role-arn>
   
   # Repeat for Merlin
   ```

2. **Connect Amplify to Git:**
   - Go to AWS Amplify Console
   - "New App" → "Host web app"
   - Connect to GitHub repository
   - Select branch (main)
   - Configure build settings (auto-detected for Next.js)
   - Add environment variables
   - Deploy

**Continuous Deployment:**

```bash
# Frontend changes
git add .
git commit -m "Update UI"
git push
# → Amplify auto-deploys in 2-3 minutes

# Lambda changes
cd lambda/vabamorf
docker build -t vabamorf .
docker push <ecr-url>
aws lambda update-function-code \
  --function-name vabamorf \
  --image-uri <ecr-url>:latest
# → Lambda updates in 30 seconds
```

---

## 🔄 Data Flow

### User Request Flow

```
1. User enters text: "Tere, kuidas läheb?"
   ↓
2. Frontend (React)
   - POST /api/synthesize
   - Body: { text: "Tere, kuidas läheb?" }
   ↓
3. Next.js API Route (/api/synthesize.ts)
   - Receives request
   ↓
4. Lambda: Vabamorf
   - Analyzes text
   - Returns: { stressedText: "Te're, ku'idas lä'heb?" }
   ↓
5. Next.js API Route
   - Receives stressed text
   ↓
6. Lambda: Merlin TTS
   - Synthesizes audio from stressed text
   - Returns: { audio: <base64-encoded-wav> }
   ↓
7. Next.js API Route
   - Receives audio
   - Returns to frontend
   ↓
8. Frontend (React)
   - Converts base64 to Blob
   - Creates object URL
   - Plays audio in <audio> element
   ↓
9. User hears pronunciation
```

**Total time:** 5-15 seconds (depending on text length and cold starts)

---

## 📦 Technology Stack

### Frontend
- **Framework:** Next.js 14+ (React 18)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (or client's design system)
- **State:** React hooks (useState, useEffect)
- **Build:** Vite / Next.js built-in

### Backend
- **API:** Next.js API Routes (serverless)
- **Runtime:** Node.js 20 LTS
- **SDK:** AWS SDK v3 (Lambda invoke)

### ML Services
- **Vabamorf:**
  - Language: Python 3.11
  - Libraries: EstNLTK, Vabamorf
  - Container: Python Lambda base image
  
- **Merlin TTS:**
  - Language: Python 3.11
  - Framework: Merlin DNN
  - Models: efm_s (words), efm_l (sentences)
  - Container: Python Lambda base image

### Infrastructure
- **Hosting:** AWS Amplify
- **Compute:** AWS Lambda (container-based)
- **Registry:** AWS ECR
- **CDN:** CloudFront (via Amplify)
- **DNS:** Route 53 (optional)

### Development Tools
- **Containers:** Docker, Docker Compose
- **Version Control:** Git + GitHub
- **Package Manager:** npm
- **CI/CD:** AWS Amplify (automatic)

---

## 💰 Cost Estimate

### Development (First 12 months with Free Tier)

**AWS Amplify:**
- Build minutes: 1000 min/month free
- Hosting: 15 GB/month free
- **Cost:** $0

**AWS Lambda:**
- Vabamorf: 60K requests × 0.5 sec × 0.5GB
- Merlin: 60K requests × 10 sec × 2GB
- Free Tier: 1M requests + 400K GB-seconds free
- **Cost:** $0-5/month

**AWS ECR:**
- Storage: 2 images × 1GB each
- **Cost:** $0.20/month

**Total Development Cost:** ~$0-5/month

### Production (After Free Tier)

**At 2,000 requests/day (60K/month):**

- Amplify: $0-5/month
- Lambda (Vabamorf): $0.25/month
- Lambda (Merlin): $20/month
- ECR: $0.20/month
- Data transfer: $1/month

**Total Production Cost:** ~$20-25/month

### Scaling

**At 10,000 requests/day (300K/month):**
- Total: ~$100-120/month

**At 50,000 requests/day (1.5M/month):**
- Total: ~$500-600/month

---

## 🚀 Deployment Timeline

### Phase 1: Initial Setup (Day 1-2)

**Day 1:**
- ✅ Create Next.js project
- ✅ Basic UI (text input + audio player)
- ✅ Docker setup for Vabamorf
- ✅ Docker setup for Merlin
- ✅ Test locally with docker-compose

**Day 2:**
- ✅ Deploy Lambda functions (with stub/mock data)
- ✅ Connect Amplify to Git
- ✅ Configure environment variables
- ✅ First deployment

**Result:** Working demo with mocks/stubs

### Phase 2: Real Integration (Day 3-5)

**Day 3-4:**
- ✅ Integrate real Vabamorf
- ✅ Integrate real Merlin TTS
- ✅ Test end-to-end flow
- ✅ Fix issues

**Day 5:**
- ✅ Polish UI
- ✅ Error handling
- ✅ Loading states
- ✅ Basic styling

**Result:** Fully working MVP

### Phase 3: Optimization (Day 6-7)

- ✅ Performance optimization
- ✅ Better UX (stress marks display)
- ✅ Testing with various texts
- ✅ Documentation

**Result:** Production-ready MVP

---

## 🔒 Security Considerations

### Local Development
- No sensitive data stored
- No authentication needed (MVP)
- Containers isolated

### Production
- Lambda functions in private VPC (optional)
- IAM roles with least privilege
- API Gateway rate limiting (future)
- HTTPS only (via Amplify/CloudFront)
- No user data stored (stateless)

---

## 📝 Future Enhancements (Post-MVP)

### Immediate Next Steps
1. Add pronunciation variants explorer
2. Add DynamoDB for saved exercises
3. Add Cognito for authentication
4. Add word-level synthesis

### Later Enhancements
1. Karaoke-style highlighting
2. Custom variant creation
3. Manual phonetic editing
4. Export functionality
5. Exercise sharing

---

## 🎯 Success Criteria

### MVP is successful if:
- ✅ User can input Estonian text
- ✅ System shows text with stress marks
- ✅ System generates audio
- ✅ Audio plays in browser
- ✅ Total time < 15 seconds
- ✅ Works on desktop and mobile
- ✅ Deployed and publicly accessible
- ✅ Costs < $25/month

---

## 📞 Team Responsibilities

### Frontend Developer
- Next.js application
- React components
- UI/UX implementation
- Integration with API routes

### Backend/ML Developer
- Lambda functions (Vabamorf, Merlin)
- Docker containers
- Integration testing
- Performance optimization

### DevOps/Infrastructure (Minimal)
- Initial AWS setup
- Amplify configuration
- Lambda deployment
- Monitoring setup

---

## 🔗 Key Links

- **Repository:** TBD
- **Amplify Console:** TBD
- **Production URL:** TBD
- **Lambda Functions:** TBD

---

## 📚 References

- Vabamorf: https://github.com/Filosoft/vabamorf
- EstNLTK: https://github.com/estnltk/estnltk
- Merlin TTS: https://github.com/keeleinstituut/mrln_et_light_efm
- Next.js Docs: https://nextjs.org/docs
- AWS Amplify: https://docs.amplify.aws/

---

**Document Status:** Initial version  
**Last Updated:** October 16, 2025  
**Next Review:** After Phase 1 completion


