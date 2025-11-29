# Dockerfile para build do PWA (Vite)
# Gera arquivos estáticos em /app/dist

FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy monorepo workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy pwa package files
COPY apps/pwa/package.json ./apps/pwa/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @mvppir/pwa

# Copy pwa source code
COPY apps/pwa ./apps/pwa

# Build
WORKDIR /app/apps/pwa
RUN pnpm build

# Production stage - Nginx para servir arquivos estáticos
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/apps/pwa/dist /usr/share/nginx/html

# Copy nginx config
COPY apps/pwa/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
