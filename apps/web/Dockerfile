# Dockerfile para build do frontend (Vite)
# Gera arquivos estáticos em /app/dist

FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy monorepo workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy web package files
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @mvppir/web

# Copy web source code
COPY apps/web ./apps/web

# Build
WORKDIR /app/apps/web
RUN pnpm build

# Production stage - Nginx para servir arquivos estáticos
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy nginx config
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
