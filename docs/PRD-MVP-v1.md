# PRD - Product Requirements Document
## MVP v1.0 - Sistema de Autenticação e Depósitos USDC/Polygon

**Versão:** 1.0
**Data:** 20 de Outubro de 2025
**Status:** Planejamento
**Autor:** Equipe de Desenvolvimento

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Objetivos do MVP](#objetivos-do-mvp)
3. [Escopo do Produto](#escopo-do-produto)
4. [Arquitetura Técnica](#arquitetura-técnica)
5. [Funcionalidades](#funcionalidades)
6. [Fluxos de Usuário](#fluxos-de-usuário)
7. [Especificações Técnicas](#especificações-técnicas)
8. [Banco de Dados](#banco-de-dados)
9. [Segurança](#segurança)
10. [Integrações](#integrações)
11. [Métricas de Sucesso](#métricas-de-sucesso)

---

## 🎯 Visão Geral

### Descrição do Produto
Sistema de autenticação e depósitos em criptomoeda via blockchain Polygon, com custódia centralizada em modelo de conta virtual. Usuários possuem saldo na plataforma, não carteiras. Foco inicial em criar uma base sólida para futuras funcionalidades de marketing multinível (MLM).

### Problema a Resolver
- Usuários precisam de uma forma simples e segura de se autenticar
- Sistema precisa identificar qual usuário fez cada depósito
- Sistema precisa centralizar fundos para futuros saques
- Sistema precisa detectar e processar depósitos automaticamente
- Necessidade de modelo de conta com ativação mínima
- Necessidade de infraestrutura blockchain robusta

### Proposta de Valor
- Autenticação simplificada via Bether Auth (sem gerenciar senhas)
- Modelo de conta virtual (usuário não gerencia carteiras)
- Ativação de conta com depósito mínimo de 100 EUR
- Sem limite máximo de depósito
- **1 endereço FIXO Polygon por usuário** (identificação automática)
- Detecção instantânea de depósitos via Moralis
- **Transferência em lote 1x por dia** para carteira global (reduz custo de gas)
- Ciclo automático de MATIC (global distribui sob demanda e recupera)
- Usuário deposita da própria carteira externa (Metamask, Trust Wallet, etc)
- Sistema preparado para escalar com funcionalidades MLM (saques, comissões)

---

## 🎯 Objetivos do MVP

### Objetivos de Negócio
1. Validar o fluxo de autenticação e onboarding
2. Testar infraestrutura blockchain em produção
3. Coletar dados sobre padrões de depósito
4. Estabelecer base técnica para MLM futuro

### Objetivos Técnicos
1. ✅ Integração completa com Bether Auth
2. ✅ Sistema de endereço Polygon FIXO por usuário
3. ✅ Webhook Moralis detectando transações
4. ✅ Transferência em LOTE (1x/dia) para carteira global
5. ✅ Ciclo automático de MATIC (Global → Endereços → Global)

### Não Objetivos (Fora do Escopo MVP)
- ❌ Sistema de comissões MLM
- ❌ Funcionalidade de saque
- ❌ Dashboard administrativo completo
- ❌ Notificações push
- ❌ KYC/Verificação de identidade
- ❌ Suporte a múltiplas moedas

---

## 📦 Escopo do Produto

### O que ESTÁ incluído
- Cadastro/Login via Bether Auth
- Sistema de conta virtual (não carteira)
- Ativação de conta com depósito mínimo 100 EUR
- **Criação de 1 endereço Polygon FIXO por usuário**
- Geração de QR Code para depósito
- Detecção automática de depósitos (qualquer token)
- **Transferência em LOTE 1x por dia** para carteira global
- Ciclo automático de MATIC (global distribui sob demanda e recupera)
- Registro do saldo na conta do usuário
- Histórico de transações

### O que NÃO ESTÁ incluído (Fase 2+)
- Sistema de comissões e indicações
- Funcionalidade de saque
- Painel administrativo avançado
- Suporte a outras blockchains
- Sistema de notificações

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológica

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (Futuro)                          │
│           React Native (iOS/Android)                    │
└─────────────────────────────────────────────────────────┘
                        ↓ REST API
┌─────────────────────────────────────────────────────────┐
│                  BACKEND - Fastify                      │
│  ├─ API REST (Node.js + TypeScript)                    │
│  ├─ Webhook Handler (Moralis)                          │
│  └─ Blockchain Integration (Ethers.js)                 │
└─────────────────────────────────────────────────────────┘
         ↓                 ↓                 ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │ Bether Auth  │  │   Moralis    │
│  + Prisma    │  │  (OAuth 2.0) │  │  (Webhooks)  │
└──────────────┘  └──────────────┘  └──────────────┘
                         ↓
               ┌──────────────────┐
               │ Polygon Network  │
               │  USDC + MATIC    │
               └──────────────────┘
```

### Componentes Principais

1. **API Fastify** - Backend principal
2. **PostgreSQL + Prisma** - Banco de dados
3. **Bether Auth** - Autenticação OAuth
4. **Moralis** - Detecção de transações blockchain
5. **Ethers.js** - Interação com blockchain

---

## ✨ Funcionalidades

### F1: Autenticação e Criação de Conta

**Descrição:** Sistema de login/cadastro usando Bether Auth como provedor OAuth. Cria conta virtual para usuário.

**Critérios de Aceitação:**
- ✅ Usuário pode fazer login via Bether Auth
- ✅ Sistema cria conta automaticamente no primeiro login (status: INACTIVE)
- ✅ Token JWT é gerado e retornado
- ✅ Token expira após 7 dias
- ✅ Refresh token disponível
- ✅ Conta permanece INACTIVE até depósito >= 100 EUR

**Endpoints:**
```
POST /auth/callback
GET  /auth/me
POST /auth/refresh
```

**Regras de Negócio:**
- Conta inicia como INACTIVE
- Usuário pode fazer login mesmo com conta INACTIVE
- Depósito >= 100 EUR ativa a conta automaticamente
- Conta ativada recebe status ACTIVE e campo activatedAt

---

### F2: Criação de Endereço Fixo de Depósito

**Descrição:** Sistema cria **1 endereço Polygon FIXO** por usuário. **IMPORTANTE:** O usuário NÃO tem acesso à private key - é apenas um endereço de rastreamento da plataforma.

**Critérios de Aceitação:**
- ✅ Endereço é criado automaticamente no primeiro login
- ✅ Private key é criptografada e guardada apenas pela plataforma
- ✅ QR Code é gerado com o endereço para facilitar depósito
- ✅ **Endereço é PERMANENTE** (mesmo para múltiplos depósitos)
- ✅ Usuário deposita da carteira EXTERNA dele (Metamask, Trust Wallet, etc)

**Endpoints:**
```
GET  /deposit/my-address  # Retorna sempre o mesmo endereço
GET  /deposit/balance
```

**Regras de Negócio:**
- **1 endereço FIXO por usuário** (nunca expira)
- Usuário pode fazer múltiplos depósitos no mesmo endereço
- Sistema detecta depósito via Moralis
- Saldo é creditado na CONTA do usuário (não em carteira)
- **Depósito mínimo para ativar conta: 100 EUR (equivalente em USDC)**
- **Sem limite máximo de depósito**
- Transferência para global acontece em LOTE (1x/dia)

---

### F3: Detecção de Depósitos

**Descrição:** Sistema detecta automaticamente quando usuário deposita **QUALQUER tipo de token** (USDC, MATIC, USDT, DAI, etc) no endereço de rastreamento dele.

**Critérios de Aceitação:**
- ✅ Moralis webhook detecta transação em tempo real
- ✅ Sistema valida assinatura do webhook
- ✅ Detecta tanto tokens ERC-20 quanto MATIC nativo
- ✅ Transação é registrada no banco com status CONFIRMED
- ✅ Sistema identifica o tipo de token automaticamente
- ✅ Valor é convertido para formato decimal correto
- ✅ Saldo do usuário é atualizado no sistema

**Webhook:**
```
POST /webhooks/moralis
```

**Tipos de Depósito Detectados:**
- MATIC (nativo) - 18 decimais
- USDC (ERC-20) - 6 decimais
- USDT (ERC-20) - 6 decimais
- DAI (ERC-20) - 18 decimais
- Qualquer outro token ERC-20

**Regras de Negócio:**
- Detectar e registrar TODOS os tipos de tokens
- Salvar token contract address, symbol e decimals
- Verificar se endereço pertence a algum usuário cadastrado
- Transação é salva como PENDING (aguarda transferência em lote)
- Endereço permanece ativo para receber novos depósitos

---

### F4: Transferência em LOTE para Carteira Global

**Descrição:** Sistema transfere **1x por dia** (job automático) todos os tokens de TODOS os endereços com saldo para a carteira global.

**Critérios de Aceitação:**
- ✅ Job automático roda 1x por dia (ex: 00:00)
- ✅ Busca TODOS os endereços de usuários com saldo > 0
- ✅ **Primeiro:** Envia MATIC da global para endereços que precisam
- ✅ **Depois:** Transfere todos os tokens (USDC, USDT, etc) → global
- ✅ **Opcional:** Recupera MATIC que sobrou → global
- ✅ Status é atualizado para SENT_TO_GLOBAL
- ✅ Saldo da conta do usuário é atualizado

**Implementação (Job Diário):**
```typescript
async function transferAllToGlobal() {
  const addresses = await getAddressesWithBalance()

  // 1. PRIMEIRO: Distribuir MATIC
  for (const addr of addresses) {
    const matic = await getMaticBalance(addr.address)
    if (matic < 0.01) {
      await globalWallet.sendMatic(addr.address, 0.05)
    }
  }

  await sleep(30000) // Aguarda confirmações

  // 2. DEPOIS: Transferir tokens → global
  for (const addr of addresses) {
    await transferTokensToGlobal(addr)
  }

  // 3. OPCIONAL: Recuperar MATIC que sobrou
  for (const addr of addresses) {
    const maticLeft = await getMaticBalance(addr.address)
    if (maticLeft > 0.02) {
      await addr.sendMaticBack(globalWallet, maticLeft - 0.01)
    }
  }
}
```

**Regras de Negócio:**
- Job roda 1x por dia (configurável: 00:00, 12:00, etc)
- Ciclo de MATIC: Global → Endereços → Global (economiza custos)
- Verificar se há MATIC suficiente na global antes de distribuir
- Se falhar, manter status PENDING para próximo job
- Registrar hash da transação de transferência
- Deixar ~0.01 MATIC de reserva em cada endereço
- Após transferência bem-sucedida, atualizar saldo da CONTA do usuário
- **Se for primeiro depósito >= 100 EUR, ativar conta (status → ACTIVE, definir activatedAt)**

---

### F5: Gerenciamento de Conta e Saldo

**Descrição:** Sistema mantém conta virtual para cada usuário com saldo baseado nos depósitos confirmados.

**Critérios de Aceitação:**
- ✅ Conta do usuário é criada no primeiro login (status: INACTIVE)
- ✅ Conta é ativada após primeiro depósito >= 100 EUR
- ✅ Saldo é atualizado após transferência para carteira global
- ✅ Sistema calcula saldo total por token (USDC, MATIC, USDT, etc)
- ✅ Histórico de todas as transações é mantido
- ✅ Endpoint para consultar saldo e status da conta

**Endpoints:**
```
GET /user/account       # Status conta + data ativação
GET /user/balance       # Saldo por token
GET /user/transactions  # Histórico completo
GET /user/address       # Endereço fixo de depósito
```

**Regras de Negócio:**
- **Depósito mínimo para ativação: 100 EUR (equivalente em USDC)**
- **Sem limite máximo de depósito**
- Saldo é atualizado após job de transferência em lote
- Cada token tem saldo separado (USDC, MATIC, USDT, etc)
- Apenas transações com status SENT_TO_GLOBAL contam no saldo
- Conta permanece ativa após ativação inicial
- Usuário NÃO tem carteira própria - apenas saldo virtual
- Endereço de depósito é fixo e nunca muda

---

## 🔄 Fluxos de Usuário

### Fluxo 1: Cadastro e Primeiro Login

```mermaid
sequenceDiagram
    participant U as Usuário
    participant A as App
    participant B as Bether Auth
    participant API as Nossa API
    participant DB as Database

    U->>A: Abre app
    A->>B: Redireciona para login
    B->>U: Mostra tela de login
    U->>B: Faz login
    B->>A: Retorna code
    A->>API: POST /auth/callback {code}
    API->>B: Troca code por token
    B->>API: Retorna user info
    API->>DB: Cria/busca usuário
    API->>A: Retorna JWT + user
    A->>U: Mostra tela principal
```

---

### Fluxo 2: Depósito de USDC

```mermaid
sequenceDiagram
    participant U as Usuário
    participant A as App
    participant API as Nossa API
    participant M as Moralis
    participant BC as Blockchain

    U->>A: Clica "Depositar"
    A->>API: GET /deposit/my-address
    API->>A: Retorna endereço fixo + QR
    A->>U: Mostra QR Code (sempre o mesmo)

    U->>BC: Envia tokens da wallet externa dele
    BC->>M: Evento Transfer detectado (após 12 confirmações)
    M->>API: POST /webhooks/moralis (já confirmado)
    API->>API: Valida signature
    API->>API: Registra transação (PENDING)
    API->>A: Notifica depósito detectado
    A->>U: "Depósito detectado! Será processado no próximo lote"

    Note over API: Job automático 1x/dia (00:00)
    API->>BC: Envia MATIC para endereços que precisam
    API->>BC: Transfer todos tokens → Global
    API->>API: Atualiza status (SENT_TO_GLOBAL)
    API->>API: Atualiza saldo de TODOS usuários
    API->>BC: Recupera MATIC que sobrou
    API->>A: Notifica saldo atualizado
    A->>U: Mostra novo saldo
```

---

## 🔧 Especificações Técnicas

### Tecnologias

**Backend:**
```json
{
  "runtime": "Node.js 20+",
  "framework": "Fastify 5.x",
  "language": "TypeScript 5.x",
  "orm": "Prisma 5.x",
  "blockchain": "Ethers.js 6.x",
  "validation": "Zod 3.x"
}
```

**Infraestrutura:**
```json
{
  "database": "PostgreSQL 16",
  "container": "Docker",
  "blockchain": "Polygon Mainnet"
}
```

**Integrações:**
```json
{
  "auth": "Bether Auth (OAuth 2.0)",
  "blockchain": "Moralis Webhooks",
  "network": "Polygon RPC"
}
```

---

### Variáveis de Ambiente

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/mvppir"

# Server
PORT=4000
NODE_ENV=production

# Bether Auth
BETHER_CLIENT_ID="xxx"
BETHER_CLIENT_SECRET="xxx"
BETHER_REDIRECT_URI="https://api.example.com/auth/callback"
BETHER_AUTH_URL="https://auth.bether.io"

# Polygon
POLYGON_RPC_URL="https://polygon-rpc.com"

# Carteira Global (centraliza fundos + distribui MATIC)
GLOBAL_WALLET_ADDRESS="0x..."
GLOBAL_WALLET_PRIVATE_KEY="encrypted_key"

# Configuração MATIC
MATIC_DISTRIBUTION_AMOUNT="0.05"  # MATIC enviado para cada endereço
MATIC_MIN_BALANCE="0.01"          # Mínimo para considerar envio
MATIC_RESERVE="0.01"              # Reserva deixada no endereço

# Job de Transferência
TRANSFER_JOB_CRON="0 0 * * *"     # 1x por dia às 00:00

# Moralis
MORALIS_API_KEY="xxx"
MORALIS_WEBHOOK_SECRET="xxx"

# Security
ENCRYPTION_KEY="32_character_random_key"
JWT_SECRET="random_jwt_secret"
JWT_EXPIRES_IN="7d"
```

---

## 💾 Banco de Dados

### Schema Prisma (Versão MVP)

```prisma
// Enums
enum UserStatus {
  INACTIVE  // Conta criada mas não ativada (sem depósito inicial)
  ACTIVE    // Conta ativada (depósito >= 100 EUR realizado)
  BLOCKED   // Conta bloqueada por admin
}

enum DepositAddressStatus {
  ACTIVE   // Endereço ativo e recebendo depósitos
  INACTIVE // Endereço desativado (admin)
}

enum TransactionType {
  CREDIT
  DEBIT
}

enum TransactionStatus {
  PENDING
  CONFIRMED
  SENT_TO_GLOBAL
  FAILED
}

// Tabelas
model User {
  id            String     @id @default(uuid())
  betherUserId  String     @unique
  name          String
  email         String     @unique
  status        UserStatus @default(INACTIVE)  // Inicia INATIVA até depósito de 100 EUR
  activatedAt   DateTime?  // Data de ativação da conta
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  depositAddresses   DepositAddress[]
  transactions       WalletTransaction[]
}

model DepositAddress {
  id              String               @id @default(uuid())
  userId          String               @unique  // 1 endereço por usuário
  polygonAddress  String               @unique
  privateKey      String               // Encrypted (apenas plataforma tem acesso)
  status          DepositAddressStatus @default(ACTIVE)
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt

  user         User                @relation(fields: [userId], references: [id])
  transactions WalletTransaction[]
}

model WalletTransaction {
  id               String            @id @default(uuid())
  userId           String
  depositAddressId String            @map("deposit_address_id")
  type             TransactionType
  tokenSymbol      String            @map("token_symbol") // "USDC", "MATIC", "USDT", etc
  tokenAddress     String?           @map("token_address") // Contract address (null para MATIC)
  tokenDecimals    Int               @map("token_decimals") // 6 para USDC, 18 para MATIC
  amount           Decimal           // Valor já convertido com decimais
  rawAmount        String            @map("raw_amount") // Valor raw da blockchain
  txHash           String            @unique @map("tx_hash") // Hash da transação de depósito
  transferTxHash   String?           @unique @map("transfer_tx_hash") // Hash da transferência para global
  status           TransactionStatus @default(PENDING)
  createdAt        DateTime          @default(now()) @map("created_at")

  user           User           @relation(fields: [userId], references: [id])
  depositAddress DepositAddress @relation(fields: [depositAddressId], references: [id])
}

model GlobalWallet {
  id             String   @id @default(uuid())
  polygonAddress String   @unique @map("polygon_address")
  privateKey     String   @map("private_key") // Criptografado
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")
}

```

---

## 🔒 Segurança

### Criptografia de Private Keys

```typescript
// AES-256-GCM
import crypto from 'crypto'

function encrypt(text: string): string {
  const algorithm = 'aes-256-gcm'
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, key, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}
```

### Rate Limiting

```typescript
// Fastify rate limit
app.register(rateLimit, {
  max: 100,
  timeWindow: '15 minutes'
})
```

### Validação de Webhooks

```typescript
// Moralis signature validation
function validateMoralisSignature(payload: any, signature: string): boolean {
  const hmac = crypto.createHmac('sha256', MORALIS_WEBHOOK_SECRET)
  const hash = hmac.update(JSON.stringify(payload)).digest('hex')
  return hash === signature
}
```

---

## 🔌 Integrações

### 1. Bether Auth

**Documentação:** https://docs.bether.io
**Tipo:** OAuth 2.0
**Endpoints:**
- Authorization: `https://auth.bether.io/oauth/authorize`
- Token: `https://auth.bether.io/oauth/token`
- UserInfo: `https://auth.bether.io/oauth/userinfo`

**Fluxo OAuth:**
```
1. Redirecionar para /oauth/authorize
2. Usuário faz login
3. Receber código de autorização
4. Trocar código por access_token
5. Buscar informações do usuário
```

---

### 2. Moralis

**Documentação:** https://docs.moralis.io
**Tipo:** Webhooks
**Setup:**
1. Criar Stream para Polygon Mainnet
2. **Configurar confirmações: 12 blocos** (Moralis só envia após confirmar)
3. Adicionar endereço USDC contract (ou monitorar todos os endereços criados)
4. Configurar webhook URL
5. Validar assinatura em cada request

**Importante:** Com `confirmed: true` e 12 confirmações, o webhook já chega confirmado e pode processar a transferência imediatamente inline.

**Opções de Implementação:**

**Opção 1 - Moralis com confirmações (Recomendado para MVP):**
- Configurar Stream com 12 confirmações
- Webhook só chega quando já está confirmado
- Processar transferência inline no webhook handler
- Sem necessidade de filas/workers

**Opção 2 - Job diário de transferência em lote (IMPLEMENTADO):**
- Webhook salva como PENDING
- Job automático 1x/dia (00:00) processa TODOS os endereços com saldo
- Distribui MATIC → transfere tokens → recupera MATIC
- Reduz drasticamente custo de gas

**Payload Exemplo:**
```json
{
  "confirmed": true,
  "chainId": "137",
  "txHash": "0x...",
  "to": "0x...",
  "value": "10000000",
  "tokenAddress": "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  "block": {
    "number": "12345678",
    "timestamp": "1234567890"
  }
}
```

---

### 3. Polygon Network

**RPC:** https://polygon-rpc.com
**Chain ID:** 137
**USDC Contract:** 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359
**Block Explorer:** https://polygonscan.com

---

## 📊 Métricas de Sucesso

### Métricas de Produto
- ✅ 100% dos usuários conseguem fazer login
- ✅ 95% dos depósitos são detectados em < 2 minutos
- ✅ 100% das transferências para global são bem-sucedidas
- ✅ 0 private keys expostas

### Métricas Técnicas
- ✅ API response time < 500ms (p95)
- ✅ Uptime > 99.9%
- ✅ 0 falhas na criptografia
- ✅ Webhook processing time < 5s

### Métricas de Negócio
- ✅ Processar 100 depósitos no primeiro mês
- ✅ Custo de gas < 2% do volume depositado
- ✅ 0 reclamações sobre depósitos perdidos

---

## 🚨 Riscos e Mitigações

### Risco 1: Private Keys Comprometidas
**Impacto:** Alto
**Probabilidade:** Baixa
**Mitigação:**
- Usar AES-256-GCM encryption
- Nunca logar private keys
- Rotacionar encryption key periodicamente
- Auditar acesso ao banco de dados

### Risco 2: Webhook Moralis Indisponível
**Impacto:** Alto
**Probabilidade:** Média
**Mitigação:**
- Implementar fallback polling
- Ter sistema de retry robusto
- Monitorar uptime do Moralis
- Ter alertas configurados

### Risco 3: Gas Fees Elevado
**Impacto:** Médio
**Probabilidade:** Média
**Mitigação:**
- Monitorar preço do gas em tempo real
- Pausar transferências se gas > threshold
- Manter buffer de MATIC na Faucet
- Alertar admin quando Faucet < 10 MATIC

### Risco 4: Falha na Transferência para Global
**Impacto:** Alto
**Probabilidade:** Baixa
**Mitigação:**
- Sistema de retry automático (3 tentativas)
- Logs detalhados de cada transferência
- Monitoramento de transações pendentes
- Alerta para transações stuck > 10 min

### Risco 5: Bether Auth Down
**Impacto:** Alto
**Probabilidade:** Baixa
**Mitigação:**
- Ter página de status
- Cache de tokens válidos
- Comunicação clara com usuários
- SLA com Bether Auth

---

## 📝 Glossário

- **USDC:** USD Coin, stablecoin atrelado ao dólar
- **Polygon:** Blockchain layer 2 do Ethereum
- **MATIC:** Token nativo da rede Polygon, usado para gas fees
- **Gas Fee:** Taxa paga para processar transações na blockchain
- **Webhook:** Callback HTTP para notificações em tempo real
- **OAuth:** Protocolo de autenticação/autorização
- **JWT:** JSON Web Token, usado para autenticação stateless
- **Faucet:** Sistema que distribui pequenas quantidades de crypto
- **Hot Wallet:** Carteira conectada à internet
- **Cold Wallet:** Carteira offline para segurança máxima

---

## 📚 Referências

- [Fastify Documentation](https://fastify.dev)
- [Prisma Documentation](https://prisma.io/docs)
- [Ethers.js Documentation](https://docs.ethers.org)
- [Moralis Documentation](https://docs.moralis.io)
- [Polygon Documentation](https://docs.polygon.technology)
- [Bether Auth Documentation](https://docs.bether.io)
- [Zod Documentation](https://zod.dev)

---


---

**Última atualização:** 20/10/2025
**Próxima revisão:** Após conclusão do MVP
