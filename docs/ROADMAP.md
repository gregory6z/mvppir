# 🗺️ Roadmap - MVP PIR

## ✅ MVP v1.0 - CONCLUÍDO (21/10/2025)

### Funcionalidades Entregues

#### Autenticação & Contas
- ✅ Login/Cadastro via Better Auth (email/password)
- ✅ Sistema de conta virtual (INACTIVE → ACTIVE)
- ✅ Ativação automática com depósito >= $100 USD
- ✅ Session management com cookies
- ✅ Middleware de autenticação

#### Sistema de Depósitos
- ✅ 1 endereço Polygon FIXO por usuário
- ✅ Private keys criptografadas (AES-256-GCM)
- ✅ QR Code para facilitar depósitos
- ✅ Adição automática ao Moralis Stream

#### Blockchain & Detecção
- ✅ Webhook Moralis integrado
- ✅ Detecção de QUALQUER token ERC20
- ✅ Detecção de MATIC nativo
- ✅ Validação de assinatura (Keccak256)
- ✅ Registro completo de transações

#### Conversão & Pricing
- ✅ Integração com CoinGecko API
- ✅ Conversão automática tokens → USD
- ✅ Cache de 5 minutos
- ✅ Stablecoins hardcoded em $1.00

#### Gestão de Saldo
- ✅ Saldo por token (multi-token)
- ✅ Histórico completo de transações
- ✅ Cálculo de valor total em USD
- ✅ Endpoints: /user/account, /balance, /transactions, /activation

#### Banco de Dados
- ✅ User (com status e activatedAt)
- ✅ DepositAddress (1:1 com User)
- ✅ WalletTransaction (histórico completo)
- ✅ GlobalWallet (preparado para v2.0)

#### Testes & Documentação
- ✅ Suite completa de testes (4 tipos)
- ✅ Documentação de testes
- ✅ Guia de setup de webhooks
- ✅ Exemplos de uso (cURL)

### Estatísticas v1.0
- **Arquivos criados:** 32
- **Linhas de código:** +4,342
- **Endpoints:** 9
- **Models Prisma:** 6
- **Commits:** 2

---

## ✅ MVP v2.0 Core - COMPLETO (22/10/2025)

### Objetivo
Completar o ciclo financeiro com transferências, saques e administração.

**Status:** Core features (F0, F1, F2) implementadas e prontas para testes. Dashboard Admin (F3) e Otimizações (F4) adiadas para futuras iterações.

### Funcionalidades Implementadas

#### ✅ F0: Sistema de Administração (CONCLUÍDO - 22/10/2025)
- ✅ Role-based access control (user/admin)
- ✅ Middleware `requireAdmin` para proteção de rotas
- ✅ Extensão de Better Auth com roles
- ✅ Criação manual de admins via banco de dados
- ✅ Type definitions para FastifyRequest
- ✅ AdminLog para auditoria de ações

**Arquitetura:**
- Middleware admin.middleware.ts (verificação de role)
- Integração com Better Auth session
- Suporte a usuários admin bloqueados
- Rastreabilidade completa de ações administrativas

**Commits:** Implementado ao longo do desenvolvimento v2.0

#### ✅ F1: Transferência em Lote (CONCLUÍDO - 22/10/2025)
- ✅ Rota administrativa protegida
- ✅ Batch transfer: todos endereços → Global Wallet
- ✅ Distribuição automática de MATIC (apenas para endereços com tokens ERC20)
- ✅ Recuperação de MATIC não usado
- ✅ Relatório detalhado de operação
- ✅ Tratamento robusto de erros (continua se falhar)
- ✅ Logging completo em AdminLog

**Otimizações Implementadas (Economia de ~70% MATIC):**
- Verifica MATIC existente antes de enviar
- Pula endereços com apenas MATIC nativo
- Transfere ERC20 primeiro, MATIC depois
- Constantes: 0.01 MATIC/ERC20, 0.001 reserva

**Arquivos:** batch-collect-to-global.ts (452 linhas), batch-collect-controller.ts, routes.ts

**Commits:** 5576dbd, 80897ec

#### ✅ F2: Sistema de Saques (CONCLUÍDO - 22/10/2025)
- ✅ Usuário solicita saque
- ✅ Validações (saldo, endereço, valor mínimo)
- ✅ Aprovação/Rejeição administrativa
- ✅ Processamento automático após aprovação
- ✅ Sistema de retry para falhas recuperáveis
- ✅ Atualização de saldo (available/locked)
- ✅ Histórico de saques
- ✅ Notificações de status

**Sistema de Retry:**
- Erros RECUPERÁVEIS (sem gas, sem saldo): saldo fica locked, admin pode retry
- Erros PERMANENTES (endereço inválido): saldo devolvido automaticamente

**Regras:**
- Saque mínimo: $500 USD
- Taxa de saque: configurável
- 1 saque pendente por vez
- Aprovação obrigatória
- Apenas FAILED podem ser retried

**Arquivos:** 5 controllers, 6 use cases, routes.ts

**Commits:** 27bda3b, 30c00d4, a859497, a1ee16c

### Funcionalidades Pendentes

#### F3: Dashboard Administrativo
- [ ] Autenticação de admin (role-based)
- [ ] Estatísticas gerais da plataforma
- [ ] Gestão de usuários (listar, buscar, bloquear)
- [ ] Aprovação/rejeição de saques
- [ ] Executar batch transfers
- [ ] Visualizar saldo Global Wallet
- [ ] Logs de operações

**Interface:**
- Web dashboard (React/Next.js ou SSR)
- Gráficos e métricas
- Filtros e busca

#### F4: Segurança & Otimizações
- [ ] Rate limiting (100/15min público, 1000/15min autenticado)
- [ ] Validação de endereços Polygon
- [ ] Log estruturado (Pino/Winston)
- [ ] Métricas de performance
- [ ] Health check endpoint
- [ ] Backup automático

### Novos Models Criados

```prisma
✅ Withdrawal (saques com 6 status)
✅ AdminLog (auditoria de ações)
✅ WithdrawalNotification (4 tipos)
✅ GlobalWalletBalance (saldo da global wallet)
✅ Balance (available + locked para performance)
```

### Estatísticas v2.0 Core (Completo)

**Concluído:**
- **Arquivos criados:** 13+ (controllers + middleware + types)
- **Linhas de código:** +1,800 (aproximado)
- **Endpoints:** 9 novos (admin + withdrawal)
- **Models Prisma:** 5 novos (Withdrawal, Balance, AdminLog, WithdrawalNotification, GlobalWalletBalance)
- **Commits:** 10+
- **Features Core:** 3/3 (100%) - F0, F1, F2 completos
- **Features Total:** 3/4 (75%) - F3 e F4 adiados para futuras iterações

### Cronograma

**Sprint 1:** ✅ Models + Balance Architecture
**Sprint 2:** ✅ Sistema de Saques + Retry
**Sprint 3:** ✅ Batch Transfer com otimizações + Admin System
**Sprint 4:** ⏸️ Dashboard Admin + Rate Limiting (adiados para futuras iterações)

**Progresso Core:** ✅ 100% completo (F0 + F1 + F2)
**Progresso Total:** 75% (F3 e F4 pendentes)

---

## 🔮 MVP v3.0+ - FUTURO

### Funcionalidades Potenciais

#### Sistema MLM
- [ ] Árvore genealógica (binary/unilevel)
- [ ] Sistema de comissões (diretas/indiretas)
- [ ] Plano de compensação
- [ ] Bônus de performance
- [ ] Relatórios de rede

#### Comunicação
- [ ] Notificações push (Firebase)
- [ ] Notificações por email (SendGrid)
- [ ] SMS (Twilio)
- [ ] Notificações in-app

#### KYC & Compliance
- [ ] Verificação de identidade
- [ ] Upload de documentos
- [ ] Aprovação manual
- [ ] Limites por tier

#### Expansões
- [ ] Suporte a múltiplas blockchains (Ethereum, BSC, etc)
- [ ] Exchange interno (swap de tokens)
- [ ] Staking/Rendimentos
- [ ] Cartão de débito crypto
- [ ] App mobile (React Native)

#### Melhorias Técnicas
- [ ] Multi-sig wallets
- [ ] Cold storage
- [ ] GraphQL API
- [ ] WebSocket para real-time
- [ ] Microservices architecture

---

## 📊 Comparação de Versões

| Funcionalidade | v1.0 | v2.0 | v3.0+ |
|---------------|------|------|-------|
| Autenticação | ✅ | ✅ | ✅ |
| Depósitos | ✅ | ✅ | ✅ |
| Ativação de Conta | ✅ | ✅ | ✅ |
| Saldo Multi-token | ✅ | ✅ | ✅ |
| Role-Based Admin | ❌ | ✅ | ✅ |
| Batch Transfers | ❌ | ✅ | ✅ |
| Saques | ❌ | ✅ | ✅ |
| Dashboard Admin | ❌ | 🚧 | ✅ |
| Rate Limiting | ❌ | 🚧 | ✅ |
| Sistema MLM | ❌ | ❌ | ✅ |
| Notificações | ❌ | ❌ | ✅ |
| KYC | ❌ | ❌ | ✅ |
| Multi-chain | ❌ | ❌ | ✅ |
| App Mobile | ❌ | ❌ | ✅ |

---

## 🎯 Prioridades

### Curto Prazo (v2.0)
1. 🔥 Batch Transfers (crítico)
2. 🔥 Sistema de Saques (crítico)
3. ⚡ Dashboard Admin (importante)
4. ⚡ Rate Limiting (importante)

### Médio Prazo (v3.0)
1. 🔥 Sistema MLM (core business)
2. ⚡ Notificações
3. ⚡ KYC básico

### Longo Prazo
1. Multi-blockchain
2. App Mobile
3. Features avançadas

---

## 📝 Notas

- v1.0 foca em fundação sólida e segura
- v2.0 completa o ciclo financeiro básico
- v3.0 adiciona features de negócio (MLM)
- Cada versão deve ser production-ready
- Testes completos em cada fase

**Última atualização:** 22/10/2025
