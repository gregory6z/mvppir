# MVPPIR Monorepo

> Cryptocurrency deposit/withdrawal platform with MLM system

## 📦 Estrutura do Monorepo

```
mvppir/
├── apps/
│   ├── server/          # API Backend (Fastify + Prisma + PostgreSQL)
│   └── web/             # Landing Page + Admin Dashboard (Next.js)
├── packages/
│   ├── typescript-config/  # Configurações TypeScript compartilhadas
│   └── shared-types/       # Tipos compartilhados entre apps
├── pnpm-workspace.yaml  # Configuração do workspace
├── turbo.json           # Configuração do Turborepo
└── package.json         # Scripts globais
```

## 🚀 Início Rápido

```bash
# Instalar dependências de todos os apps
pnpm install

# Desenvolvimento (todos os apps)
pnpm dev

# Desenvolvimento (um app específico)
pnpm dev:server  # API na porta 3333
pnpm dev:web     # Next.js na porta 3000

# Build de produção
pnpm build

# Testes
pnpm test
```

## 📱 Apps

### Server (`apps/server`)
- **Tech Stack**: Fastify, Prisma, PostgreSQL, Better Auth
- **Porta**: 3333
- **Features**:
  - Deposits & Withdrawals (Polygon blockchain)
  - MLM System com comissões automáticas
  - Better Auth (email/password)
  - Moralis webhooks
  - BullMQ workers para jobs assíncronos

### Web (`apps/web`)
- **Tech Stack**: Next.js 15, React 19, Tailwind CSS
- **Porta**: 3000
- **Features**:
  - Landing page pública
  - Admin dashboard
  - Gerenciamento de usuários
  - Aprovação de saques
  - Visualização de rede MLM

## 🔧 Comandos Úteis

```bash
# Limpar cache e node_modules
pnpm clean

# Verificar tipos TypeScript
pnpm type-check

# Lint
pnpm lint

# Prisma (database)
cd apps/server
pnpm prisma:migrate  # Rodar migrations
pnpm prisma:studio   # Abrir Prisma Studio
```

## 🌿 Git Workflow

### Branch Strategy
- `main` - Produção
- `develop` - Desenvolvimento
- `feature/*` - Features
- `fix/*` - Bug fixes

### Commit Convention
```
feat(server): add withdrawal approval system
fix(web): correct dashboard layout
docs: update README with new commands
```

### Verificando mudanças por app
```bash
# Ver mudanças apenas no server
git log -- apps/server/

# Ver mudanças apenas no web
git log -- apps/web/
```

## 🚢 Deploy

### Vercel (Web - Next.js)
1. Conecte o repositório no Vercel
2. Configure o **Root Directory**: `apps/web`
3. Vercel detecta Next.js automaticamente
4. Deploy automático no push para `main`

### Railway/Render (Server - API)
1. Conecte o repositório
2. Configure **Root Directory**: `apps/server`
3. Build Command: `pnpm build`
4. Start Command: `pnpm start`
5. Adicione variáveis de ambiente

## 🔐 Variáveis de Ambiente

### Server (`apps/server/.env`)
```env
DATABASE_URL=
AUTH_SECRET=
ENCRYPTION_KEY=
MORALIS_API_KEY=
MORALIS_STREAM_SECRET=
REDIS_URL=
```

### Web (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

## 📚 Documentação

- [Server Documentation](./apps/server/CLAUDE.md)
- [PRD MVP v2.0](./apps/server/docs/PRD-MVP-v2.md)
- [Testing Guide](./apps/server/docs/TESTING-INTEGRATION.md)

## 🛠 Tech Stack

- **Package Manager**: pnpm
- **Build System**: Turborepo
- **Backend**: Fastify + Prisma + PostgreSQL
- **Frontend**: Next.js 15 + React 19 + Tailwind CSS
- **Auth**: Better Auth
- **Blockchain**: Ethers.js + Moralis
- **Jobs**: BullMQ + Redis
- **Testing**: Node.js native test runner

## 📝 License

ISC
