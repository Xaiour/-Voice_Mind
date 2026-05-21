# VoiceMind — Full Deployment Guide

> Step-by-step guide to deploy VoiceMind to production.
> Beginner-friendly. Copy-paste ready.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Environment Variables](#2-environment-variables)
3. [MongoDB Atlas Setup](#3-mongodb-atlas-setup)
4. [Upstash Redis Setup](#4-upstash-redis-setup)
5. [Frontend — Vercel Deployment](#5-frontend--vercel-deployment)
6. [Backend — Railway Deployment](#6-backend--railway-deployment)
7. [Python Service — Render Deployment](#7-python-service--render-deployment)
8. [CORS & Domain Setup](#8-cors--domain-setup)
9. [API Connection Setup](#9-api-connection-setup)
10. [Production Scripts](#10-production-scripts)
11. [Debugging Checklist](#11-debugging-checklist)

---

## 1. Prerequisites

Before deploying, make sure you have:

- [ ] GitHub repository with VoiceMind code pushed
- [ ] Node.js 20+ installed locally
- [ ] Python 3.11+ installed locally
- [ ] Accounts created on:
  - [Vercel](https://vercel.com) (free tier)
  - [Railway](https://railway.app) (free tier / $5 hobby)
  - [Render](https://render.com) (free tier)
  - [MongoDB Atlas](https://cloud.mongodb.com) (free M0 cluster)
  - [Upstash](https://upstash.com) (free tier — 10K commands/day)
  - [OpenAI](https://platform.openai.com) (paid — $5 minimum)

---

## 2. Environment Variables

### Full Variable Reference

```bash
# ─── App ─────────────────────────────────────────────────────
NODE_ENV=production
APP_URL=https://voicemind.vercel.app        # Your Vercel URL
API_URL=https://voicemind-api.railway.app   # Your Railway URL
VOICE_SERVICE_URL=https://voicemind-voice.onrender.com  # Render URL

# ─── MongoDB Atlas ───────────────────────────────────────────
MONGODB_URI=mongodb+srv://voicemind:<PASSWORD>@cluster0.xxxxx.mongodb.net/voicemind?retryWrites=true&w=majority

# ─── Upstash Redis ───────────────────────────────────────────
REDIS_URL=rediss://default:<PASSWORD>@<REGION>.upstash.io:6379
UPSTASH_REDIS_REST_URL=https://<REGION>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<YOUR_TOKEN>

# ─── JWT ─────────────────────────────────────────────────────
JWT_SECRET=generate-a-64-char-random-string-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=generate-another-64-char-random-string
JWT_REFRESH_EXPIRES_IN=30d

# ─── OpenAI ──────────────────────────────────────────────────
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o

# ─── File Uploads ────────────────────────────────────────────
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50mb

# ─── Rate Limiting ───────────────────────────────────────────
RATE_LIMIT_WINDOW=900
RATE_LIMIT_MAX=100
SESSION_TTL=86400
```

### Generate Secure Secrets

```bash
# Run this in terminal to generate random secrets:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 3. MongoDB Atlas Setup

### Step-by-Step

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create account
2. **Create a Cluster:**
   - Choose "Shared" (free M0 tier)
   - Region: closest to your users (e.g., US East)
   - Cluster name: `voicemind-cluster`
3. **Create Database User:**
   - Username: `voicemind`
   - Password: auto-generate (save it!)
   - Role: "Read and write to any database"
4. **Network Access:**
   - Click "Add IP Address"
   - Select **"Allow Access from Anywhere"** (`0.0.0.0/0`)
   - ⚠️ For production: restrict to Railway/Render IPs
5. **Get Connection String:**
   - Click "Connect" → "Drivers" → Copy the URI
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `voicemind`

### Your URI looks like:
```
mongodb+srv://voicemind:YOUR_PASSWORD@cluster0.abc123.mongodb.net/voicemind?retryWrites=true&w=majority
```

### Create Indexes (optional but recommended):
```javascript
// Run in MongoDB Atlas shell or Compass:
db.users.createIndex({ email: 1 }, { unique: true });
db.voice_analyses.createIndex({ userId: 1, createdAt: -1 });
db.emotional_trends.createIndex({ userId: 1, date: -1 });
db.ai_chats.createIndex({ userId: 1, updatedAt: -1 });
db.sessions.createIndex({ userId: 1, createdAt: -1 });
```

---

## 4. Upstash Redis Setup

### Step-by-Step

1. Go to [console.upstash.com](https://console.upstash.com) → Sign up
2. Click **"Create Database"**
3. Settings:
   - Name: `voicemind-redis`
   - Region: same as your backend deployment
   - Type: "Regional" (cheaper) or "Global" (faster)
   - Enable TLS: Yes
4. After creation, go to the database details page
5. Copy these values:

```bash
REDIS_URL=rediss://default:xxxxx@us1-xxxxx.upstash.io:6379
UPSTASH_REDIS_REST_URL=https://us1-xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ==
```

### Verify Connection:
```bash
# Install Upstash CLI (optional)
npx @upstash/cli redis ping
# Should return: PONG
```

---

## 5. Frontend — Vercel Deployment

### Method 1: GitHub Auto-Deploy (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://voicemind-api.up.railway.app
   NEXT_PUBLIC_APP_NAME=VoiceMind
   ```
5. Click **Deploy**

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend
cd apps/web

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: voicemind
# - Directory: ./
# - Override settings? No

# Deploy to production
vercel --prod
```

### vercel.json (create in apps/web/):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

### Custom Domain (Optional):
1. Vercel Dashboard → Project → Settings → Domains
2. Add: `voicemind.io` or `app.voicemind.io`
3. Update DNS records as instructed
4. SSL is automatic

---

## 6. Backend — Railway Deployment

### Step-by-Step

1. Go to [railway.app](https://railway.app) → Sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub Repo"**
3. Select your repository
4. Configure:
   - **Root Directory:** `apps/api`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`

### Environment Variables in Railway:
Go to your service → Variables tab → Add all:

```bash
NODE_ENV=production
PORT=8000
MONGODB_URI=mongodb+srv://...
REDIS_URL=rediss://...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o
VOICE_SERVICE_URL=https://voicemind-voice.onrender.com
APP_URL=https://voicemind.vercel.app
UPLOAD_DIR=./uploads
```

### railway.toml (create in apps/api/):
```toml
[build]
builder = "nixpacks"
buildCommand = "npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 30
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

### Generate Domain:
1. Railway Dashboard → Service → Settings → Networking
2. Click "Generate Domain"
3. You'll get: `voicemind-api-production.up.railway.app`
4. Or add custom domain: `api.voicemind.io`

### Alternative: Render Deployment

If you prefer Render over Railway:

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect GitHub repository
3. Settings:
   - **Root Directory:** `apps/api`
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or Starter $7/mo for no sleep)
4. Add environment variables (same as above)

---

## 7. Python Service — Render Deployment

### Step-by-Step

1. Go to [render.com](https://render.com) → New → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name:** `voicemind-voice`
   - **Root Directory:** `services/voice-analysis`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 main:app`
4. Environment Variables:
   ```
   PORT=8001
   PYTHONUNBUFFERED=1
   ```
5. Instance Type: Free (or Starter for no cold starts)

### render.yaml (create in services/voice-analysis/):
```yaml
services:
  - type: web
    name: voicemind-voice
    env: python
    region: oregon
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 main:app
    envVars:
      - key: PYTHONUNBUFFERED
        value: "1"
    healthCheckPath: /health
```

### Verify Deployment:
```bash
curl https://voicemind-voice.onrender.com/health
# Should return: {"status": "ok", "service": "voicemind-voice-analysis"}
```

### ⚠️ Important Notes:
- Free tier on Render sleeps after 15min of inactivity
- First request after sleep takes ~30 seconds (cold start)
- For hackathons: this is fine
- For production: upgrade to Starter ($7/mo) for always-on

---

## 8. CORS & Domain Setup

### Backend CORS Configuration

In `apps/api/src/middleware/cors.ts`, update the allowed origins:

```typescript
const allowedOrigins = [
  "https://voicemind.vercel.app",        // Vercel production
  "https://app.voicemind.io",            // Custom domain (if used)
  "http://localhost:3000",                // Local development
];
```

### Frontend API URL

In your Vercel dashboard, set:
```
NEXT_PUBLIC_API_URL=https://voicemind-api-production.up.railway.app/api
```

### DNS Records (if using custom domains)

| Type  | Name        | Value                                      |
|-------|-------------|---------------------------------------------|
| CNAME | app         | cname.vercel-dns.com                       |
| CNAME | api         | voicemind-api-production.up.railway.app    |
| A     | @           | 76.76.21.21 (Vercel)                        |

### SSL
- Vercel: automatic (Let's Encrypt)
- Railway: automatic
- Render: automatic

---

## 9. API Connection Setup

### Frontend → Backend Connection

In `apps/web/lib/api-client.ts`:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
```

### Backend → Python Service Connection

In `apps/api/src/config/env.ts`:
```typescript
VOICE_SERVICE_URL: process.env.VOICE_SERVICE_URL || "http://localhost:8001",
```

### Backend → MongoDB Connection

Already handled in `apps/api/src/config/database.ts` — just set the `MONGODB_URI` env var.

### Backend → Redis Connection

Already handled in `apps/api/src/config/redis.ts` — supports both Upstash REST and IORedis TCP.

### Connection Flow Diagram:
```
Browser (Vercel CDN)
    │
    ▼ HTTPS
Express API (Railway)
    │           │
    ▼ HTTPS     ▼ REST
Python (Render) Redis (Upstash)
                    │
                    ▼ TCP/TLS
              MongoDB Atlas
```

---

## 10. Production Scripts

### Root package.json scripts:
```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "start": "turbo run start",
    "dev:web": "turbo run dev --filter=@voicemind/web",
    "dev:api": "turbo run dev --filter=@voicemind/api",
    "dev:voice": "cd services/voice-analysis && python -m flask run --port 8001",
    "build:web": "turbo run build --filter=@voicemind/web",
    "build:api": "turbo run build --filter=@voicemind/api",
    "lint": "turbo run lint",
    "clean": "turbo run clean"
  }
}
```

### API Build & Start:
```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsup src/server.ts --format cjs --dts",
    "start": "node dist/server.js",
    "lint": "eslint src/"
  }
}
```

### Frontend Build & Start:
```json
{
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Python Service:
```bash
# Development
python main.py

# Production (Gunicorn)
gunicorn --bind 0.0.0.0:8001 --workers 2 --timeout 120 main:app
```

---

## 11. Debugging Checklist

### 🔴 Frontend won't connect to backend?

- [ ] Check `NEXT_PUBLIC_API_URL` is set in Vercel env vars
- [ ] Verify the URL includes `/api` at the end
- [ ] Check CORS origins include your Vercel domain
- [ ] Open browser DevTools → Network tab → look for CORS errors
- [ ] Try: `curl https://your-api-url.railway.app/api/health`

### 🔴 Backend can't connect to MongoDB?

- [ ] Check `MONGODB_URI` in Railway env vars
- [ ] Verify IP whitelist in Atlas (use `0.0.0.0/0` for testing)
- [ ] Make sure password doesn't contain special characters (URL-encode them)
- [ ] Test: try connecting with MongoDB Compass using the same URI

### 🔴 Redis connection failing?

- [ ] Check `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- [ ] Verify you're using `rediss://` (with double s) for TLS
- [ ] Check Upstash dashboard for connection count and errors
- [ ] Test: `curl -H "Authorization: Bearer TOKEN" https://URL/ping`

### 🔴 Python service not responding?

- [ ] Check Render logs (Dashboard → Service → Logs)
- [ ] Verify health endpoint: `curl https://your-render-url/health`
- [ ] Cold start on free tier: wait 30 seconds after first request
- [ ] Check if `librosa` and `libsndfile` are installed (Docker)

### 🔴 Voice upload failing?

- [ ] Check file size limit (50MB max)
- [ ] Verify `UPLOAD_DIR` exists and is writable
- [ ] Check `Content-Type: multipart/form-data` in request
- [ ] Verify multer middleware is correctly configured
- [ ] Check backend logs for specific error messages

### 🔴 OpenAI API errors?

- [ ] Verify `OPENAI_API_KEY` starts with `sk-proj-`
- [ ] Check your OpenAI billing page has credits
- [ ] Verify `OPENAI_MODEL=gpt-4o` is available on your plan
- [ ] Check rate limits: [platform.openai.com/usage](https://platform.openai.com/usage)

### 🔴 JWT authentication issues?

- [ ] Verify `JWT_SECRET` is the same in all environments
- [ ] Check token expiry (15 min access, 7d refresh)
- [ ] Ensure `Authorization: Bearer <token>` header format
- [ ] Clear localStorage/cookies and re-login
- [ ] Check Redis session exists: `GET session:<userId>`

### 🔴 General debugging:

```bash
# Check Railway logs
railway logs --tail

# Check Render logs
# Dashboard → Service → Logs (web UI)

# Check Vercel logs
vercel logs your-project-url

# Test API health
curl -v https://your-api.railway.app/api/health

# Test with full auth flow
curl -X POST https://your-api.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

---

## Quick Deploy Checklist

```
□ MongoDB Atlas cluster created + URI copied
□ Upstash Redis database created + credentials copied
□ OpenAI API key generated
□ JWT secrets generated (2 random strings)
□ Frontend deployed to Vercel with NEXT_PUBLIC_API_URL
□ Backend deployed to Railway with all env vars
□ Python service deployed to Render
□ CORS origins updated with production domains
□ Health endpoints returning 200 OK on all services
□ Login/register working end-to-end
□ Voice upload working (file reaches Python service)
□ AI chat responding (OpenAI key valid)
```

---

## Cost Estimate (Hackathon/MVP)

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| Vercel | Hobby | $0 |
| Railway | Free/Hobby | $0–$5 |
| Render | Free | $0 |
| MongoDB Atlas | M0 Free | $0 |
| Upstash Redis | Free | $0 |
| OpenAI | Pay-as-you-go | ~$5–20 |
| **Total** | | **$5–25/month** |

---

*Good luck with your deployment! If you run into issues, check the debugging checklist above. For hackathons, the free tiers are more than sufficient.*
