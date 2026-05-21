FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY turbo.json tsconfig.json ./

# Copy packages (shared types/utils)
COPY packages/ ./packages/

# Copy API app
COPY apps/api/ ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 8000

# Run in dev mode (ts-node / tsx) since we don't have a build step
CMD ["pnpm", "--filter", "@voicemind/api", "dev"]
