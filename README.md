# VoiceMind

**AI-powered mental health voice analysis platform** — Analyze voice patterns to detect emotional states, track wellness trends, and get personalized AI guidance.

![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-purple?logo=openai)

---

## What is VoiceMind?

VoiceMind is a full-stack mental wellness app that uses **voice biomarker analysis** to detect emotions, track mood/stress trends, and provide AI-powered wellness guidance. Users record short voice check-ins, and the platform analyzes vocal patterns (pitch, energy, speaking rate) to identify emotional states.

### Key Features

- **Voice Check-In** — 30-second recordings analyzed for emotional patterns via ML (librosa)
- **AI Wellness Chat** — GPT-4o powered companion with mental health guardrails
- **Emotional Dashboard** — Real-time charts: mood trends, stress levels, emotion hexagon radar, voice biomarkers
- **Dark Neon UI** — Antigravity glass-morphism theme with Three.js orb, particle effects, and smooth animations
- **Voice History** — Browse past analyses with detailed breakdowns

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS v3, Framer Motion, Recharts, @react-three/fiber, Zustand |
| **Backend API** | Node.js 20, Express.js, MongoDB, Mongoose, Redis |
| **Voice Analysis** | Python 3.11, Flask, librosa, NumPy, SciPy |
| **AI** | OpenAI GPT-4o (chat + analysis insights) |
| **Infrastructure** | Docker Compose, pnpm workspaces (monorepo) |
| **Auth** | Dummy mode (x-user-id header) — no JWT required for dev |

---

## Project Structure

```
voicemind/
├── apps/
│   ├── web/                    → Next.js 14 frontend
│   │   ├── app/                  → App Router pages
│   │   │   ├── (auth)/           → Login & Register pages
│   │   │   └── (dashboard)/      → Dashboard, Chat, Voice, Settings
│   │   ├── components/           → Reusable UI components
│   │   │   ├── dashboard/        → Stats cards, charts, graphs
│   │   │   ├── three-d/          → Three.js orb, particles
│   │   │   └── voice/            → Waveform, recording UI
│   │   └── lib/                  → API client, utilities
│   │
│   └── api/                    → Express.js backend
│       └── src/
│           ├── config/           → DB, Redis, OpenAI, env config
│           ├── controllers/      → Route handlers
│           ├── middleware/       → Auth, CORS, rate limiting
│           ├── models/           → MongoDB schemas (User, VoiceAnalysis, AiChat)
│           ├── routes/           → API route definitions
│           ├── services/         → Business logic (OpenAI, voice, auth)
│           └── utils/            → Helpers, logger, error classes
│
├── services/
│   └── voice-analysis/         → Python Flask ML service
│       ├── app.py                → Flask routes
│       ├── analyzer.py           → librosa voice analysis
│       ├── models/               → Emotion detection models
│       └── Dockerfile
│
├── packages/
│   ├── types/                  → Shared TypeScript interfaces
│   └── utils/                  → Shared helper functions
│
├── docker-compose.yml          → Full stack (mongo, redis, api, voice, web)
├── docker-compose.dev.yml      → Dev only (mongo + redis)
├── .env.example                → Environment template
├── pnpm-workspace.yaml         → Monorepo config
└── turbo.json                  → Turborepo pipeline
```

---

## Getting Started

### Prerequisites

- **Docker Desktop** (Windows/Mac) or Docker Engine (Linux)
- **Node.js 20+** and **pnpm** (for local dev without Docker)
- **OpenAI API Key** with billing enabled (for GPT-4o)

### 1. Clone the Repository

```bash
git clone https://github.com/Skyisbling/test.git
cd test
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
# Required for AI features
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_MODEL=gpt-4o

# MongoDB (Docker handles this, no change needed for local)
MONGODB_URI=mongodb://mongo:27017/voicemind
```

> **Free OpenAI key?** Use `OPENAI_MODEL=gpt-3.5-turbo` instead.

### 3. Run with Docker (Recommended)

```bash
docker compose up -d --build
```

This starts all 5 services:
| Service | URL | Description |
|---------|-----|-------------|
| **Web** | http://localhost:3000 | Next.js frontend |
| **API** | http://localhost:8000 | Express backend |
| **Voice** | http://localhost:8001 | Python ML service |
| **MongoDB** | localhost:27017 | Database |
| **Redis** | localhost:6379 | Caching/rate limits |

### 4. Open the App

```
http://localhost:3000
```

Register an account, then explore the dashboard, voice check-in, and AI chat.

---

## Local Development (Without Docker)

If you prefer running services individually:

```bash
# Start only MongoDB + Redis via Docker
docker compose -f docker-compose.dev.yml up -d

# Install all dependencies
pnpm install

# Run API server (port 8000)
pnpm --filter api dev

# Run Next.js frontend (port 3000)
pnpm --filter web dev

# Run Python voice service (port 8001)
cd services/voice-analysis
pip install -r requirements.txt
python app.py
```

---

## API Endpoints

### Authentication (Dummy Mode)
All protected routes use the `x-user-id` header instead of JWT:
```
x-user-id: your-user-id-here
```

### Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | No | API health check |
| `GET` | `/api/ai/health` | No | OpenAI connectivity test |
| `POST` | `/api/auth/register` | No | Create account |
| `POST` | `/api/auth/login` | No | Login (returns user ID) |
| `POST` | `/api/auth/logout` | Yes | Logout |
| `GET` | `/api/users/profile` | Yes | Get user profile |
| `PUT` | `/api/users/profile` | Yes | Update profile |
| `POST` | `/api/voice/upload` | Yes | Upload audio recording |
| `POST` | `/api/voice/analyze` | Yes | Trigger voice analysis |
| `GET` | `/api/voice/history` | Yes | Get analysis history |
| `POST` | `/api/ai/chat` | Yes | Send chat message |
| `GET` | `/api/ai/conversations` | Yes | List conversations |
| `GET` | `/api/ai/conversations/:id` | Yes | Get conversation |
| `DELETE` | `/api/ai/conversations/:id` | Yes | Delete conversation |
| `GET` | `/api/wellness/insights` | Yes | Get wellness insights |
| `GET` | `/api/wellness/trends` | Yes | Get mood/stress trends |

---

## OpenAI Setup

The AI chat and voice analysis insights require an OpenAI API key:

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a key (requires billing for GPT-4o)
3. Add to `.env`:
   ```env
   OPENAI_API_KEY=sk-proj-xxxxx
   OPENAI_MODEL=gpt-4o
   ```
4. Rebuild: `docker compose up -d --build`
5. Test: Open `http://localhost:8000/api/ai/health` in browser

### Model Options

| Model | Cost | Quality | Best For |
|-------|------|---------|----------|
| `gpt-4o` | ~$2.50/1M input tokens | Highest | Production use |
| `gpt-4o-mini` | ~$0.15/1M input tokens | Great | Development (recommended) |
| `gpt-3.5-turbo` | ~$0.50/1M input tokens | Good | Free-tier keys |

---

## Troubleshooting

### "No user ID provided" on /api/ai/health
You're running old code. Pull the latest:
```bash
git pull origin fix/openai-api-integration
docker compose up -d --build
```

### Chat says "temporary issue"
Check API logs:
```bash
docker logs test-api-1
```

Look for:
- `⚠️ OPENAI_API_KEY is not set!` → `.env` file not at project root
- `OpenAI chat error [401]` → Invalid/expired key
- `OpenAI chat error [429]` → Rate limited or no billing
- `OpenAI chat error [404]` → Model not available on your plan

### Voice analysis returns similar results
The Python service works (real ML), but the frontend times out after 30s and shows mock data. This is a known polling issue, not a service failure.

### Docker build fails on Windows
Make sure Docker Desktop is running and WSL2 is enabled. Also ensure `.env` file uses LF line endings (not CRLF).

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes (for AI) | — | OpenAI API key |
| `OPENAI_MODEL` | No | `gpt-4o` | Model to use |
| `MONGODB_URI` | No | `mongodb://mongo:27017/voicemind` | MongoDB connection |
| `REDIS_URL` | No | `redis://redis:6379` | Redis connection |
| `VOICE_SERVICE_URL` | No | `http://voice:8001` | Python service URL |
| `PORT` | No | `8000` | API server port |
| `NODE_ENV` | No | `development` | Environment |
| `JWT_SECRET` | No | (dev default) | JWT signing key |
| `UPLOAD_DIR` | No | `./uploads` | Audio upload path |
| `MAX_FILE_SIZE` | No | `50mb` | Upload size limit |

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system design and data flow diagrams.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guides.

---

## Contributing

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make changes and commit
3. Push and open a PR against `feat/voicemind-architecture`

---

## License

Private project — not licensed for public use.
