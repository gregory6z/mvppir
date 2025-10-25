# CLAUDE.md - MVPPIR Monorepo

Global instructions for working with the MVPPIR monorepo.

## 🏗️ Monorepo Structure

```
mvppir/
├── apps/
│   ├── server/          # API Backend (Fastify + Prisma) - Port 3333
│   └── web/             # Landing Page + Admin (Next.js) - Port 3000
├── packages/
│   ├── typescript-config/  # Shared TypeScript configurations
│   └── shared-types/       # Shared types between apps
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## 📚 App-Specific Documentation

**For detailed instructions on each app, see:**
- **Server (API)**: `apps/server/CLAUDE.md` - Architecture, MLM, Blockchain, Workers
- **Web (Next.js)**: `apps/web/CLAUDE.md` - Components, UI, routes (create when needed)

## 🚀 Monorepo Commands

### Development
```bash
pnpm dev          # Run ALL apps simultaneously
pnpm dev:server   # Server only (port 3333)
pnpm dev:web      # Next.js only (port 3000)
```

### Build & Deploy
```bash
pnpm build        # Build ALL apps
pnpm test         # Test ALL apps
pnpm lint         # Lint ALL apps
pnpm type-check   # Type check all apps
pnpm clean        # Clean cache and node_modules
```

### App-Specific Commands
```bash
# Run command in specific app
pnpm --filter @mvppir/server <command>
pnpm --filter @mvppir/web <command>

# Examples:
pnpm --filter @mvppir/server test
pnpm --filter @mvppir/web build
```

## 🌿 Git Workflow in Monorepo

### Single Commits for Multiple Apps
```bash
# Commit affecting multiple apps
git add apps/server/ apps/web/ packages/shared-types/
git commit -m "feat: add OAuth support across all apps"
git push origin main
```

### Commit Convention
```
feat(server): add withdrawal system
fix(web): correct dashboard layout
feat: add shared auth types
docs: update monorepo README
```

### Filter History by App
```bash
# View commits that affected server only
git log -- apps/server/

# View commits that affected web only
git log -- apps/web/
```

## 🚢 Deploy Strategy

### Vercel (Web - Next.js)
- **Repository**: GitHub monorepo
- **Root Directory**: `apps/web`
- **Framework**: Next.js (auto-detected)
- **Deploy**: Automatic when changes detected in `apps/web/`

### Railway/Render (Server - API)
- **Repository**: GitHub monorepo
- **Root Directory**: `apps/server`
- **Build Command**: `pnpm install && pnpm --filter @mvppir/server build`
- **Start Command**: `pnpm --filter @mvppir/server start`
- **Deploy**: Automatic when changes detected in `apps/server/`

### Smart Deploy Behavior
```
Commit #1: Only apps/server/
├── ✅ Railway DEPLOYS
└── ❌ Vercel DOES NOT deploy

Commit #2: Only apps/web/
├── ❌ Railway DOES NOT deploy
└── ✅ Vercel DEPLOYS

Commit #3: apps/server/ + apps/web/
├── ✅ Railway DEPLOYS
└── ✅ Vercel DEPLOYS
```

## 📦 Shared Packages

### shared-types (`packages/shared-types/`)
TypeScript types shared between server and web.

**Import in any app:**
```typescript
import { User, UserRole } from "@mvppir/shared-types";
```

### typescript-config (`packages/typescript-config/`)
Reusable TypeScript configurations.

**Use in tsconfig.json:**
```json
{
  "extends": "@mvppir/typescript-config/base.json"
}
```

## 🔧 Turborepo Cache

Turborepo caches builds and tests to speed up development.

```bash
# Clear cache
pnpm clean

# Run without cache
turbo run build --force

# View cache
ls -la .turbo/cache/
```

## 🛠 Adding New Package/App

### New App
```bash
mkdir -p apps/mobile
cd apps/mobile
pnpm init
# Add "name": "@mvppir/mobile" to package.json
```

### New Shared Package
```bash
mkdir -p packages/ui-components
cd packages/ui-components
pnpm init
# Add "name": "@mvppir/ui-components" to package.json
```

Turborepo automatically detects new workspaces via `pnpm-workspace.yaml`.

## 🐛 Troubleshooting

### "Module not found" after adding package
```bash
# Reinstall dependencies
pnpm install

# Rebuild everything
pnpm build
```

### Prisma Client outdated
```bash
cd apps/server
pnpm prisma:generate
```

### Turbo cache causing issues
```bash
pnpm clean
pnpm install
pnpm build
```

## 📝 Best Practices

1. **Always use pnpm** (not npm/yarn) - workspaces configured for pnpm
2. **Run tests before committing** - `pnpm test`
3. **Type check** - `pnpm type-check`
4. **Use shared packages** - Avoid code duplication
5. **Atomic commits** - One feature = one commit (even if affects multiple apps)
6. **Keep CLAUDEs updated** - Document architectural changes

## 🔑 Important Notes

- **One Git repository** for all code
- **Independent deploys** per app (Vercel watches `apps/web/`, Railway watches `apps/server/`)
- **Shared dependencies** via `packages/` - changes here trigger rebuilds in all apps
- **Turborepo optimization** - Parallel execution and intelligent caching

---

**For app-specific details, see:**
- Server API: `apps/server/CLAUDE.md`
- Web App: `apps/web/CLAUDE.md` (create when developing frontend)
