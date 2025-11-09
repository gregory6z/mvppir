# Railway Dockerfile for monorepo
# Build context: root of monorepo
# This file copies from apps/server/
# Updated: 2025-01-09 - Force rebuild without cache

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files from apps/server (MONOREPO)
COPY apps/server/package.json apps/server/pnpm-lock.yaml* ./
COPY apps/server/prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code from apps/server
COPY apps/server/ ./

# Generate Prisma Client
RUN pnpm prisma generate

# Build application
RUN pnpm run build

# Production stage
FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY apps/server/package.json apps/server/pnpm-lock.yaml* ./
COPY apps/server/prisma ./prisma/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Generate Prisma Client
RUN pnpm prisma generate

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Railway sets PORT env var automatically, but we expose both common ports
EXPOSE 3333 4000

# Run migrations before starting the server (matches package.json "start" script)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
