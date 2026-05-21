FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY turbo.json tsconfig.json ./

# Copy packages (shared types/utils)
COPY packages/ ./packages/

# Copy web app
COPY apps/web/ ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Build the web app
RUN pnpm --filter @voicemind/web build

EXPOSE 3000

CMD ["pnpm", "--filter", "@voicemind/web", "start"]
