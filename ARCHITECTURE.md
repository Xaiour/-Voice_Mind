# VoiceMind — Production Architecture

> AI-powered healthcare voice analysis platform.
> Monorepo · Next.js · Express · Python · MongoDB · Redis · OpenAI

---

## Table of Contents

1. [Full Folder Structure](#1-full-folder-structure)
2. [Backend Architecture](#2-backend-architecture)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Reusable Component Structure](#4-reusable-component-structure)
5. [API Flow](#5-api-flow)
6. [Database Schema Architecture](#6-database-schema-architecture)
7. [AI Pipeline Architecture](#7-ai-pipeline-architecture)
8. [Deployment Architecture](#8-deployment-architecture)

---

## 1. Full Folder Structure

```
voicemind/
├── apps/
│   ├── web/                          # Next.js 14 App Router (Frontend)
│   │   ├── app/
│   │   │   ├── (auth)/               # Auth route group
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── register/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── (dashboard)/          # Protected dashboard group
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── sessions/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/page.tsx
│   │   │   │   │   └── new/page.tsx
│   │   │   │   ├── analysis/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── patients/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── settings/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── api/                   # Next.js API routes (BFF)
│   │   │   │   └── health/route.ts
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx               # Landing page
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/                    # ShadCN components
│   │   │   ├── shared/                # App-wide shared components
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   └── features/             # Feature-specific components
│   │   │       ├── voice/
│   │   │       │   ├── VoiceRecorder.tsx
│   │   │       │   ├── WaveformVisualizer.tsx
│   │   │       │   ├── UploadDropzone.tsx
│   │   │       │   └── RecordingControls.tsx
│   │   │       ├── analysis/
│   │   │       │   ├── AnalysisCard.tsx
│   │   │       │   ├── SentimentChart.tsx
│   │   │       │   ├── EmotionRadar.tsx
│   │   │       │   └── InsightPanel.tsx
│   │   │       ├── dashboard/
│   │   │       │   ├── StatsGrid.tsx
│   │   │       │   ├── RecentSessions.tsx
│   │   │       │   └── ActivityChart.tsx
│   │   │       └── patients/
│   │   │           ├── PatientCard.tsx
│   │   │           ├── PatientList.tsx
│   │   │           └── PatientTimeline.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useVoiceRecorder.ts
│   │   │   ├── useAnalysis.ts
│   │   │   ├── usePatients.ts
│   │   │   └── useDebounce.ts
│   │   ├── lib/
│   │   │   ├── api-client.ts          # Centralized Axios instance
│   │   │   ├── auth.ts                # Auth utilities
│   │   │   ├── utils.ts               # CN helper + utilities
│   │   │   └── validators.ts          # Zod schemas
│   │   ├── providers/
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── QueryProvider.tsx
│   │   │   └── ThemeProvider.tsx
│   │   ├── stores/                    # Zustand stores
│   │   │   ├── auth-store.ts
│   │   │   └── ui-store.ts
│   │   ├── styles/
│   │   │   └── animations.ts          # Framer Motion variants
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── components.json            # ShadCN config
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                           # Express.js Backend
│       ├── src/
│       │   ├── config/
│       │   │   ├── database.ts        # MongoDB connection
│       │   │   ├── redis.ts           # Upstash Redis client
│       │   │   ├── openai.ts          # OpenAI client
│       │   │   ├── multer.ts          # File upload config
│       │   │   └── env.ts             # Env validation (Zod)
│       │   ├── middleware/
│       │   │   ├── auth.ts            # JWT verification
│       │   │   ├── rateLimiter.ts     # Redis rate limiting
│       │   │   ├── upload.ts          # Multer middleware
│       │   │   ├── validate.ts        # Request validation
│       │   │   ├── errorHandler.ts    # Global error handler
│       │   │   └── cors.ts            # CORS config
│       │   ├── models/
│       │   │   ├── User.ts
│       │   │   ├── Patient.ts
│       │   │   ├── Session.ts
│       │   │   ├── Analysis.ts
│       │   │   └── AuditLog.ts
│       │   ├── routes/
│       │   │   ├── index.ts           # Route aggregator
│       │   │   ├── auth.routes.ts
│       │   │   ├── patient.routes.ts
│       │   │   ├── session.routes.ts
│       │   │   ├── analysis.routes.ts
│       │   │   └── upload.routes.ts
│       │   ├── controllers/
│       │   │   ├── auth.controller.ts
│       │   │   ├── patient.controller.ts
│       │   │   ├── session.controller.ts
│       │   │   ├── analysis.controller.ts
│       │   │   └── upload.controller.ts
│       │   ├── services/
│       │   │   ├── auth.service.ts
│       │   │   ├── patient.service.ts
│       │   │   ├── session.service.ts
│       │   │   ├── analysis.service.ts
│       │   │   ├── ai-orchestrator.ts  # AI pipeline coordinator
│       │   │   ├── voice.service.ts    # Python service client
│       │   │   ├── openai.service.ts   # OpenAI wrapper
│       │   │   ├── redis.service.ts    # Cache/session service
│       │   │   └── upload.service.ts   # File handling
│       │   ├── jobs/
│       │   │   ├── queue.ts            # Bull queue setup
│       │   │   └── analysis.job.ts     # Async analysis processing
│       │   ├── utils/
│       │   │   ├── ApiError.ts
│       │   │   ├── asyncHandler.ts
│       │   │   ├── logger.ts
│       │   │   └── helpers.ts
│       │   └── server.ts              # Express app entry
│       ├── uploads/
│       │   └── .gitkeep
│       ├── tsconfig.json
│       ├── Dockerfile
│       └── package.json
│
├── services/
│   └── voice-analysis/                # Python Microservice
│       ├── main.py                    # FastAPI entry point
│       ├── routers/
│       │   ├── analyze.py
│       │   └── health.py
│       ├── services/
│       │   ├── audio_processor.py
│       │   ├── feature_extractor.py
│       │   ├── emotion_detector.py
│       │   └── speech_to_text.py
│       ├── models/
│       │   ├── schemas.py             # Pydantic models
│       │   └── .gitkeep               # ML model storage
│       ├── utils/
│       │   ├── audio_utils.py
│       │   └── logger.py
│       ├── requirements.txt
│       ├── Dockerfile
│       └── pytest.ini
│
├── packages/
│   ├── types/                         # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── user.ts
│   │   │   ├── patient.ts
│   │   │   ├── session.ts
│   │   │   ├── analysis.ts
│   │   │   └── api.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── utils/                         # Shared utilities
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── date.ts
│   │   │   ├── format.ts
│   │   │   └── validators.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── config/                        # Shared config
│       ├── src/
│       │   ├── index.ts
│       │   └── constants.ts
│       ├── tsconfig.json
│       └── package.json
│
├── docker-compose.yml
├── turbo.json
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── ARCHITECTURE.md
└── README.md
```



---

## 2. Backend Architecture

### Design Principles
- **Layered architecture**: Routes → Controllers → Services → Models
- **Dependency injection** via service classes
- **Centralized error handling** with custom ApiError class
- **Redis-first session strategy** — JWT tokens cached in Upstash Redis
- **Rate limiting** per-user via Redis sliding window

### Request Lifecycle

```
Client Request
    │
    ▼
┌─────────────┐
│   CORS MW   │ ← Whitelist origins
└──────┬──────┘
       │
┌──────▼──────┐
│ Rate Limiter│ ← Redis sliding window (100 req/15min)
└──────┬──────┘
       │
┌──────▼──────┐
│  Auth MW    │ ← JWT verify + Redis session check
└──────┬──────┘
       │
┌──────▼──────┐
│  Validate   │ ← Zod schema validation
└──────┬──────┘
       │
┌──────▼──────┐
│ Controller  │ ← Thin layer, delegates to service
└──────┬──────┘
       │
┌──────▼──────┐
│  Service    │ ← Business logic + DB operations
└──────┬──────┘
       │
┌──────▼──────┐
│   Model     │ ← Mongoose schema + methods
└─────────────┘
```

### Redis Session Strategy

```typescript
// On login:
// 1. Generate JWT (short-lived: 15min access, 7d refresh)
// 2. Store session in Redis: `session:{userId}:{tokenId}`
// 3. Set TTL = token expiry

// On request:
// 1. Extract JWT from Authorization header
// 2. Verify signature
// 3. Check Redis key exists (not revoked)
// 4. Attach user to request

// On logout:
// 1. Delete Redis key → instant revocation
// 2. Add token to blacklist (optional)
```

### File Upload Pipeline

```
Client (multipart/form-data)
    │
    ▼
┌──────────────┐
│ Multer MW    │ ← File type validation, size limits (50MB)
│              │   Storage: disk (dev) / S3 (prod)
└──────┬───────┘
       │
┌──────▼───────┐
│ Upload Ctrl  │ ← Generate unique filename, metadata
└──────┬───────┘
       │
┌──────▼───────┐
│ Upload Svc   │ ← Move to permanent storage
│              │   Create DB record with file metadata
└──────┬───────┘
       │
┌──────▼───────┐
│ Queue Job    │ ← Dispatch async analysis job
└──────────────┘
```

---

## 3. Frontend Architecture

### Next.js App Router Strategy

| Route Group    | Purpose              | Auth   |
|---------------|----------------------|--------|
| `(auth)`      | Login, Register      | Public |
| `(dashboard)` | All protected views  | Protected |
| `(marketing)` | Landing, Pricing     | Public |

### State Management

| Layer          | Tool               | Purpose                    |
|---------------|--------------------|-----------------------------|
| Server state  | TanStack Query     | API data fetching/caching   |
| Client state  | Zustand            | UI state (sidebar, modals)  |
| Form state    | React Hook Form    | Form validation             |
| URL state     | Next.js searchParams | Filters, pagination       |

### Protected Route Pattern

```typescript
// app/(dashboard)/layout.tsx
// Wraps all dashboard routes with:
// 1. AuthProvider check
// 2. Redirect to /login if no session
// 3. Sidebar + Navbar layout
// 4. Session refresh on mount
```

### Centralized API Client

```typescript
// lib/api-client.ts
// - Axios instance with baseURL, timeout
// - Request interceptor: attach JWT from cookie/store
// - Response interceptor: handle 401 → refresh token
// - Response interceptor: handle 403, 500 → toast
// - Type-safe methods: get<T>, post<T>, put<T>, delete<T>
```

---

## 4. Reusable Component Structure

### Component Hierarchy

```
components/
├── ui/               # Atomic (ShadCN) — Button, Input, Card, Badge
├── shared/           # Molecular — Navbar, Sidebar, Loading, Error
└── features/         # Organisms — domain-specific composites
    ├── voice/        # VoiceRecorder, WaveformVisualizer
    ├── analysis/     # AnalysisCard, SentimentChart
    ├── dashboard/    # StatsGrid, RecentSessions
    └── patients/     # PatientCard, PatientList
```

### Design System Tokens

- **Colors**: HSL-based via Tailwind CSS variables (dark mode ready)
- **Typography**: Inter (headings), Geist Mono (data)
- **Spacing**: 4px grid system
- **Motion**: Framer Motion shared variants (fadeIn, slideUp, scaleIn)
- **Shadows**: Layered elevation system (sm, md, lg, xl)

### Component Pattern

```typescript
// Every feature component follows:
interface Props {
  // Required props
  // Optional overrides
  className?: string;
}

export function ComponentName({ className, ...props }: Props) {
  // 1. Hooks (state, queries)
  // 2. Derived state
  // 3. Handlers
  // 4. Render with cn() for class merging
}
```

---

## 5. API Flow

### Authentication Flow

```
┌────────┐         ┌────────┐         ┌────────┐         ┌────────┐
│ Client │         │  API   │         │ Redis  │         │MongoDB │
└───┬────┘         └───┬────┘         └───┬────┘         └───┬────┘
    │  POST /auth/login │                  │                  │
    │──────────────────►│                  │                  │
    │                   │  Find user       │                  │
    │                   │─────────────────────────────────────►
    │                   │  Verify password  │                  │
    │                   │◄─────────────────────────────────────
    │                   │  Store session    │                  │
    │                   │─────────────────►│                  │
    │                   │                  │                  │
    │  { accessToken,   │                  │                  │
    │    refreshToken } │                  │                  │
    │◄──────────────────│                  │                  │
```

### Voice Analysis Flow

```
┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
│ Client │    │  API   │    │ Queue  │    │ Python │    │ OpenAI │
└───┬────┘    └───┬────┘    └───┬────┘    └───┬────┘    └───┬────┘
    │ Upload     │              │              │              │
    │ audio file │              │              │              │
    │───────────►│              │              │              │
    │            │ Store file   │              │              │
    │            │ Create job   │              │              │
    │            │─────────────►│              │              │
    │ 202        │              │              │              │
    │ { jobId }  │              │              │              │
    │◄───────────│              │              │              │
    │            │              │ Process      │              │
    │            │              │─────────────►│              │
    │            │              │              │ Extract      │
    │            │              │              │ features     │
    │            │              │  Results     │              │
    │            │              │◄─────────────│              │
    │            │              │              │              │
    │            │              │ AI Insights  │              │
    │            │              │─────────────────────────────►
    │            │              │              │              │
    │            │              │◄─────────────────────────────
    │            │  Save to DB  │              │              │
    │            │◄─────────────│              │              │
    │            │              │              │              │
    │ GET /analysis/:id         │              │              │
    │───────────►│              │              │              │
    │ Full results              │              │              │
    │◄───────────│              │              │              │
```

### API Endpoints

| Method | Endpoint                   | Description              | Auth |
|--------|---------------------------|--------------------------|------|
| POST   | /api/v1/auth/register     | Create account           | No   |
| POST   | /api/v1/auth/login        | Login                    | No   |
| POST   | /api/v1/auth/refresh      | Refresh tokens           | No   |
| POST   | /api/v1/auth/logout       | Invalidate session       | Yes  |
| GET    | /api/v1/patients          | List patients            | Yes  |
| POST   | /api/v1/patients          | Create patient           | Yes  |
| GET    | /api/v1/patients/:id      | Get patient detail       | Yes  |
| PUT    | /api/v1/patients/:id      | Update patient           | Yes  |
| GET    | /api/v1/sessions          | List voice sessions      | Yes  |
| POST   | /api/v1/sessions          | Create session           | Yes  |
| GET    | /api/v1/sessions/:id      | Get session detail       | Yes  |
| POST   | /api/v1/upload/audio      | Upload audio file        | Yes  |
| GET    | /api/v1/analysis          | List analyses            | Yes  |
| GET    | /api/v1/analysis/:id      | Get analysis result      | Yes  |
| POST   | /api/v1/analysis/trigger  | Trigger re-analysis      | Yes  |
| GET    | /api/v1/dashboard/stats   | Dashboard metrics        | Yes  |

---

## 6. Database Schema Architecture

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    User      │       │     Patient      │       │    Session       │
├──────────────┤       ├──────────────────┤       ├──────────────────┤
│ _id          │       │ _id              │       │ _id              │
│ email        │◄──────│ therapistId (FK) │       │ patientId (FK)   │
│ password     │       │ firstName        │       │ therapistId (FK) │
│ firstName    │       │ lastName         │       │ audioFileUrl     │
│ lastName     │       │ dateOfBirth      │       │ duration         │
│ role         │       │ diagnosis        │       │ status           │
│ avatar       │       │ notes            │       │ metadata         │
│ createdAt    │       │ status           │       │ createdAt        │
│ updatedAt    │       │ createdAt        │       │ updatedAt        │
└──────────────┘       └──────────────────┘       └────────┬─────────┘
                                                           │
                                                           │ 1:1
                                                           ▼
                       ┌──────────────────┐       ┌──────────────────┐
                       │   AuditLog       │       │    Analysis      │
                       ├──────────────────┤       ├──────────────────┤
                       │ _id              │       │ _id              │
                       │ userId           │       │ sessionId (FK)   │
                       │ action           │       │ sentiment        │
                       │ resource         │       │ emotions         │
                       │ resourceId       │       │ voiceMetrics     │
                       │ metadata         │       │ transcript       │
                       │ ip               │       │ aiInsights       │
                       │ createdAt        │       │ riskScore        │
                       └──────────────────┘       │ status           │
                                                  │ processingTime   │
                                                  │ createdAt        │
                                                  └──────────────────┘
```

### Index Strategy

```
User:     { email: 1 } unique
Patient:  { therapistId: 1, lastName: 1 }
Session:  { therapistId: 1, createdAt: -1 }
          { patientId: 1, createdAt: -1 }
Analysis: { sessionId: 1 } unique
          { status: 1, createdAt: -1 }
AuditLog: { userId: 1, createdAt: -1 }
          { createdAt: 1 } TTL: 90 days
```

---

## 7. AI Pipeline Architecture

### Orchestration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI ORCHESTRATOR SERVICE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │ STAGE 1     │    │ STAGE 2     │    │ STAGE 3             │  │
│  │ Voice       │───►│ Feature     │───►│ AI Insight          │  │
│  │ Processing  │    │ Extraction  │    │ Generation          │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
│                                                                   │
│  Python Service            Python Service         OpenAI API     │
│  ─────────────            ──────────────         ──────────      │
│  • Audio normalization    • MFCC features        • GPT-4o        │
│  • Noise reduction        • Pitch analysis       • Clinical      │
│  • VAD (voice activity)   • Energy/tempo           summary       │
│  • Segmentation           • Emotion detection    • Risk scoring  │
│  • Speech-to-text         • Prosody analysis     • Suggestions   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Pipeline Stages Detail

**Stage 1 — Voice Processing (Python)**
- Input: Raw audio file (WAV/MP3/OGG)
- Operations: Resample to 16kHz, normalize amplitude, remove silence
- Output: Clean audio buffer + speech-to-text transcript

**Stage 2 — Feature Extraction (Python)**
- Input: Processed audio buffer
- Operations: Extract MFCCs, pitch contour, energy, speaking rate
- ML Model: Pre-trained emotion classifier (CNN on spectrograms)
- Output: Feature vector + emotion probabilities + voice metrics

**Stage 3 — AI Insight Generation (OpenAI)**
- Input: Transcript + voice metrics + emotion data
- Prompt Engineering: Clinical psychology framework
- Output: Structured JSON with sentiment, risk score, clinical notes
- Caching: Redis cache for similar analysis patterns (cost optimization)

### OpenAI Prompt Strategy

```
System: You are a clinical voice analysis assistant...
User: Given the following voice session data:
  - Transcript: {transcript}
  - Emotion Distribution: {emotions}
  - Voice Metrics: {metrics}
  - Patient History: {context}

Provide:
  1. Overall sentiment assessment (scale 1-10)
  2. Emotional state analysis
  3. Risk indicators (if any)
  4. Clinical observations
  5. Recommended follow-up actions
```

---

## 8. Deployment Architecture

### Infrastructure Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                          VERCEL                                    │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │                Next.js Frontend (Edge)                      │   │
│  │  • Static pages → CDN                                      │   │
│  │  • Server components → Edge Runtime                        │   │
│  │  • API routes → Serverless Functions                       │   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      RAILWAY / RENDER                              │
│  ┌─────────────────────┐       ┌─────────────────────────────┐  │
│  │  Express.js API     │       │  Python Voice Service        │  │
│  │  (Node.js 20)       │       │  (FastAPI + Uvicorn)         │  │
│  │                     │       │                               │  │
│  │  • Auto-scaling     │       │  • GPU instances (optional)  │  │
│  │  • Health checks    │       │  • Model caching             │  │
│  │  • Zero-downtime    │       │  • Async processing          │  │
│  └─────────────────────┘       └─────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
          ┌───────────┐ ┌─────────┐ ┌──────────┐
          │ MongoDB   │ │  Redis  │ │ S3/R2    │
          │ Atlas     │ │ Upstash │ │ Storage  │
          │           │ │         │ │          │
          │ • M10+    │ │ • Global│ │ • Audio  │
          │ • Auto    │ │ • Cache │ │   files  │
          │   backup  │ │ • Queue │ │ • Static │
          │ • Indexes │ │ • Rate  │ │   assets │
          └───────────┘ └─────────┘ └──────────┘
```

### CI/CD Pipeline

```
Push to main
    │
    ▼
GitHub Actions
    ├── Lint + Type Check
    ├── Unit Tests
    ├── Integration Tests
    │
    ├── Build Frontend → Deploy to Vercel
    ├── Build API → Deploy to Railway
    └── Build Voice → Deploy to Railway
```

### Environment Strategy

| Environment | Frontend      | API           | Database       |
|------------|---------------|---------------|----------------|
| Local      | localhost:3000| localhost:8000| Local MongoDB  |
| Staging    | staging.vm.io | api-stg.vm.io| Atlas (staging)|
| Production | voicemind.io  | api.vm.io    | Atlas (prod)   |

### Scaling Strategy

- **Frontend**: Vercel Edge (auto-scales, global CDN)
- **API**: Horizontal scaling on Railway (2-10 instances)
- **Voice Service**: Vertical scaling (CPU/GPU optimized)
- **MongoDB**: Atlas auto-scaling with read replicas
- **Redis**: Upstash serverless (auto-scales per request)

---

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url> && cd voicemind
npm install

# 2. Set up environment
cp .env.example .env
# Fill in your MongoDB, Redis, OpenAI keys

# 3. Run all services
npm run dev

# 4. Or use Docker
docker-compose up -d

# 5. Access
# Frontend: http://localhost:3000
# API:      http://localhost:8000
# Voice:    http://localhost:8001
# Docs:     http://localhost:8001/docs (FastAPI auto-docs)
```
