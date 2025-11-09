# 🏗️ MVPPIR Infrastructure

Infraestrutura como código (IaC) para deployment do backend MVPPIR em múltiplos ambientes.

## 📁 Estrutura

```
infra/
├── pulumi/           # Pulumi IaC (Railway + Njalla VPS)
│   ├── index.ts      # Configuração principal
│   ├── Pulumi.yaml   # Projeto Pulumi
│   ├── Pulumi.railway.yaml  # Stack Railway (dev/staging)
│   └── Pulumi.prod.yaml     # Stack Njalla VPS (production)
├── docker/           # Docker Compose para VPS
│   ├── docker-compose.yml
│   ├── .env.example
│   └── nginx/
│       └── nginx.conf
└── scripts/          # Scripts de deployment
    ├── setup.sh      # Setup inicial
    └── deploy.sh     # Deploy automático
```

## 🎯 Ambientes

### Railway (Desenvolvimento/Staging)
- **Plataforma**: Railway (managed services)
- **Banco de dados**: PostgreSQL 16 + Redis 7 (managed)
- **Deploy**: Automático via GitHub ou Railway CLI
- **Região**: us-west1

### Njalla VPS (Produção)
- **Plataforma**: VPS (self-hosted)
- **Banco de dados**: PostgreSQL 16 + Redis 7 (Docker)
- **Deploy**: Docker Compose
- **Proxy**: Nginx com SSL/TLS (opcional)

## 🚀 Quick Start

### 1. Instalar Dependências

```bash
cd infra/pulumi
pnpm install
```

### 2. Setup Railway

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Configurar projeto
cd infra/scripts
./setup.sh railway
```

**Passos manuais no Railway UI:**
1. Criar projeto
2. Adicionar PostgreSQL: **+ New → Database → Add PostgreSQL**
3. Adicionar Redis: **+ New → Database → Add Redis**
4. Conectar variáveis ao serviço `mvpserver`:
   - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}`
   - `REDIS_URL`: `${{Redis.REDIS_URL}}`
5. Adicionar variáveis de ambiente (ver seção abaixo)
6. Deploy via Railway CLI ou GitHub integration

### 3. Setup Njalla VPS

```bash
cd infra/scripts
./setup.sh prod

# Editar .env com seus secrets
nano ../docker/.env

# Deploy
./deploy.sh prod
```

## 🔐 Variáveis de Ambiente

### Railway

Configure no Railway UI (Settings → Variables):

```bash
# Node
NODE_ENV=production
PORT=4000

# Database (usar magic variables do Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# Auth & Security
AUTH_SECRET=<min-32-chars>
ENCRYPTION_KEY=<64-hex-chars>

# Moralis Blockchain
MORALIS_API_KEY=<your-key>
MORALIS_STREAM_SECRET=<your-secret>

# Polygon
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_CHAIN_ID=137

# Global Wallet
GLOBAL_WALLET_ADDRESS=0x...
GLOBAL_WALLET_PRIVATE_KEY=<encrypted-or-plain>

# Frontend
FRONTEND_URL=https://mvppir.vercel.app
```

### Njalla VPS

Edite `infra/docker/.env`:

```bash
cp infra/docker/.env.example infra/docker/.env
nano infra/docker/.env
```

Preencha todos os valores obrigatórios marcados com `your-*-here`.

## 📦 Pulumi Secrets Management

Pulumi oferece gerenciamento seguro de secrets:

```bash
cd infra/pulumi

# Selecionar stack
pulumi stack select railway  # ou prod

# Configurar secrets (criptografados automaticamente)
pulumi config set --secret authSecret "your-auth-secret-min-32-chars"
pulumi config set --secret encryptionKey "your-64-char-hex-key"
pulumi config set --secret moralisApiKey "your-moralis-key"
pulumi config set --secret moralisStreamSecret "your-stream-secret"
pulumi config set --secret polygonRpcUrl "https://polygon-rpc.com"
pulumi config set --secret globalWalletPrivateKey "your-wallet-key"

# Para produção (Njalla)
pulumi stack select prod
pulumi config set --secret databaseUrl "postgresql://..."
pulumi config set --secret redisUrl "redis://..."

# Ver configurações (secrets aparecem como [secret])
pulumi config
```

## 🛠️ Comandos Úteis

### Railway

```bash
# Status do deployment
railway status

# Logs em tempo real
railway logs

# Deploy manual
cd apps/server
railway up

# Abrir no browser
railway open
```

### Njalla VPS (Docker Compose)

```bash
cd infra/docker

# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Parar tudo
docker-compose down

# Rebuild e restart
docker-compose up -d --build

# Acessar shell do backend
docker-compose exec backend sh

# Executar migrations
docker-compose exec backend sh -c "cd /app && npx prisma migrate deploy"

# Ver status
docker-compose ps
```

### Pulumi

```bash
cd infra/pulumi

# Preview changes
pulumi preview

# Apply changes
pulumi up

# Ver outputs
pulumi stack output

# Destroy infrastructure
pulumi destroy
```

## 🐳 Docker Compose - Detalhes

### Serviços

1. **postgres** - PostgreSQL 16
   - Porta: 5432
   - Volume: `postgres_data`
   - Health check: `pg_isready`

2. **redis** - Redis 7
   - Porta: 6379
   - Volume: `redis_data`
   - Health check: `redis-cli ping`

3. **backend** - API Node.js
   - Porta: 4000
   - Build: `apps/server/Dockerfile`
   - Depends: postgres + redis
   - Health check: `/health` endpoint

4. **nginx** - Reverse Proxy (opcional)
   - Portas: 80, 443
   - Profile: `production` (não inicia por padrão)
   - SSL: Configure certificados em `infra/docker/nginx/ssl/`

### Iniciar com Nginx (produção com SSL)

```bash
# Primeiro, adicione certificados SSL
mkdir -p infra/docker/nginx/ssl
# Copie fullchain.pem e privkey.pem para essa pasta

# Inicie com profile production
docker-compose --profile production up -d
```

## 📊 Monitoramento

### Health Checks

```bash
# Railway
curl https://your-app.railway.app/health

# Njalla VPS
curl http://localhost:4000/health
```

### Logs

```bash
# Railway
railway logs --tail 100

# Docker Compose
docker-compose logs -f --tail=100 backend
```

## 🔧 Troubleshooting

### Railway: Healthcheck Failure

```bash
# Verificar logs
railway logs

# Problemas comuns:
# 1. DATABASE_URL não configurada
# 2. Variáveis de ambiente faltando
# 3. Migrations não executadas

# Solução: Verificar todas as variáveis obrigatórias
railway variables
```

### Njalla VPS: Container não inicia

```bash
# Ver logs detalhados
docker-compose logs backend

# Problemas comuns:
# 1. .env com valores faltando
# 2. PostgreSQL não está healthy
# 3. Porta 4000 já em uso

# Verificar health dos serviços
docker-compose ps
```

### Migrations não aplicadas

```bash
# Railway
railway run npx prisma migrate deploy

# Docker Compose
docker-compose exec backend sh -c "cd /app && npx prisma migrate deploy"
```

## 🔒 Segurança

### Checklist de Produção

- [ ] `AUTH_SECRET` com min 32 caracteres aleatórios
- [ ] `ENCRYPTION_KEY` com 64 caracteres hex (32 bytes)
- [ ] `GLOBAL_WALLET_PRIVATE_KEY` criptografada
- [ ] PostgreSQL com senha forte
- [ ] Redis com senha (adicione `REDIS_PASSWORD` se necessário)
- [ ] Nginx com SSL/TLS configurado
- [ ] Firewall configurado (somente portas 80, 443 abertas)
- [ ] Rate limiting habilitado (Nginx config)
- [ ] CORS configurado corretamente (apenas frontend permitido)

### Geração de Secrets

```bash
# AUTH_SECRET (32+ chars)
openssl rand -base64 32

# ENCRYPTION_KEY (64 hex chars = 32 bytes)
openssl rand -hex 32

# PostgreSQL password
openssl rand -base64 24
```

## 📚 Referências

- [Railway Docs](https://docs.railway.app/)
- [Pulumi TypeScript](https://www.pulumi.com/docs/languages-sdks/javascript/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Nginx Reverse Proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)

## 🆘 Suporte

Em caso de problemas:
1. Verifique os logs (Railway ou Docker Compose)
2. Confirme que todas as variáveis obrigatórias estão configuradas
3. Teste o health check: `curl http://localhost:4000/health`
4. Revise `apps/server/CLAUDE.md` para detalhes do backend

---

**Última atualização**: 2025-01-09
