# VoiceMind

AI-powered voice analysis platform for mental health professionals.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Framer Motion, ShadCN UI
- **Backend**: Node.js, Express.js, MongoDB Atlas, Mongoose, JWT Auth, Redis (Upstash)
- **AI Service**: Python, Flask, librosa, OpenAI GPT-4o
- **Infrastructure**: Docker, Turborepo, Vercel, Railway

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run all services
npm run dev

# Or with Docker
docker-compose up -d
```

## Project Structure

```
voicemind/
├── apps/web/          → Next.js frontend
├── apps/api/          → Express.js backend
├── services/voice-analysis/ → Python voice service
├── packages/types/    → Shared TypeScript types
├── packages/utils/    → Shared utilities
└── packages/config/   → Shared constants
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/users/profile | Get profile |
| PUT | /api/users/profile | Update profile |
| POST | /api/voice/upload | Upload audio |
| POST | /api/voice/analyze | Trigger analysis |
| GET | /api/voice/history | Analysis history |
| POST | /api/ai/chat | AI chat |

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full documentation.
