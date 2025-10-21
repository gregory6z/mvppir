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

## 🚧 MVP v2.0 - EM PLANEJAMENTO

### Objetivo
Completar o ciclo financeiro com transferências, saques e administração.

### Funcionalidades Planejadas

#### F1: Transferência em Lote
- [ ] Rota administrativa protegida
- [ ] Batch transfer: todos endereços → Global Wallet
- [ ] Distribuição automática de MATIC
- [ ] Recuperação de MATIC não usado
- [ ] Relatório detalhado de operação
- [ ] Retry automático em falhas

**Benefícios:**
- Redução de 80% no custo de gas
- Centralização de fundos
- Controle administrativo

#### F2: Sistema de Saques
- [ ] Usuário solicita saque
- [ ] Validações (saldo, endereço, valor mínimo)
- [ ] Aprovação administrativa
- [ ] Processamento automático
- [ ] Atualização de saldo
- [ ] Histórico de saques

**Regras:**
- Saque mínimo: $10 USD
- Taxa de saque: configurável
- 1 saque pendente por vez
- Aprovação obrigatória

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

### Novos Models

```prisma
Withdrawal (saques)
AdminLog (auditoria)
UserRole (USER/ADMIN)
```

### Cronograma

**Sprint 1 (1 semana):** Models + Auth Admin + Endpoints básicos
**Sprint 2 (1 semana):** Batch Transfer
**Sprint 3 (1 semana):** Sistema de Saques
**Sprint 4 (1 semana):** Dashboard Admin

**Total:** 4 semanas

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
| Batch Transfers | ❌ | ✅ | ✅ |
| Saques | ❌ | ✅ | ✅ |
| Dashboard Admin | ❌ | ✅ | ✅ |
| Rate Limiting | ❌ | ✅ | ✅ |
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

**Última atualização:** 21/10/2025
