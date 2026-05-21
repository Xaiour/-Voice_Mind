FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/
RUN npm install --workspace=@voicemind/api

# Build
FROM base AS builder
COPY apps/api/ ./apps/api/
COPY packages/ ./packages/
RUN npm run build --workspace=@voicemind/api

# Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules

RUN mkdir -p uploads

EXPOSE 8000
CMD ["node", "dist/server.js"]
