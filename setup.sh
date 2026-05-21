#!/bin/bash
# VoiceMind Quick Setup Script
# Run this once after cloning the repo

echo "🧠 Setting up VoiceMind..."

# Create .env from example if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env (edit with your MongoDB/Redis/OpenAI keys)"
fi

# Create frontend .env.local
if [ ! -f apps/web/.env.local ]; then
  cp apps/web/.env.local.example apps/web/.env.local
  echo "✅ Created apps/web/.env.local"
fi

# Create uploads directory
mkdir -p apps/api/uploads

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🎉 Setup complete! Run these in separate terminals:"
echo ""
echo "  Terminal 1: pnpm dev:api    (Backend at http://localhost:8000)"
echo "  Terminal 2: pnpm dev:web    (Frontend at http://localhost:3000)"
echo ""
