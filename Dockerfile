# Railway Dockerfile for monorepo
# Build context: root of monorepo
# Updated: 2025-01-09 - Monorepo-aware build

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy monorepo workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy all workspace packages (needed for lockfile resolution)
COPY apps/server/package.json ./apps/server/package.json
COPY apps/server/prisma ./apps/server/prisma

# Install ALL dependencies (monorepo workspace)
RUN pnpm install --frozen-lockfile

# Copy server source code
COPY apps/server ./apps/server

# Generate Prisma Client and build
WORKDIR /app/apps/server
RUN pnpm prisma generate
RUN pnpm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy monorepo workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy server package files
COPY apps/server/package.json ./apps/server/package.json
COPY apps/server/prisma ./apps/server/prisma

# Install ALL dependencies (need prisma CLI from devDeps to generate client)
RUN pnpm install --frozen-lockfile --filter @mvppir/server

# Generate Prisma Client
WORKDIR /app/apps/server
RUN pnpm prisma generate

# Remove dev dependencies after generating Prisma client
RUN pnpm install --frozen-lockfile --prod --filter @mvppir/server

# Copy built application from builder stage
COPY --from=builder /app/apps/server/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

# Railway sets PORT env var automatically
EXPOSE 3333 4000

# Run migrations before starting (from apps/server directory)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
