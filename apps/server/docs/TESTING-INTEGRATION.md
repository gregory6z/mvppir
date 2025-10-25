# Testes de Integração

Testes dos fluxos completos: **MVP v1.0 + MVP v2.0 Core**

## O que é testado

### MVP v1.0 - Depósito + Webhook

O teste cobre o fluxo completo de depósito:

1. **Criar conta** - Signup via Better Auth
2. **Login** - Autenticação e obtenção de cookie
3. **Obter endereço de depósito** - GET /deposit/my-address
4. **Simular webhook Moralis** - POST /webhooks/moralis com assinatura válida
5. **Verificar transação criada** - Confirma que a transação foi salva no banco

### MVP v2.0 Core - Batch Transfer + Withdrawals + Retry

#### Batch Transfer (F1)
1. **Criar admin** - Signup e promover para role admin
2. **Criar Global Wallet** - Wallet para consolidar fundos
3. **Criar usuário com saldo** - Simular depósito confirmado
4. **Executar batch transfer** - POST /admin/transfers/batch-collect
5. **Verificar proteção admin** - Usuário comum recebe 403

#### Withdrawal Flow (F2)
1. **Fluxo completo**: Request → Approve → Process
   - Usuário solicita saque (POST /user/withdrawals/request)
   - Admin lista saques pendentes (GET /admin/withdrawals/pending)
   - Admin aprova saque (POST /admin/withdrawals/:id/approve)
   - Sistema processa (automático após aprovação)
2. **Validação de saldo**: Rejeita saques acima do saldo disponível
3. **Rejeição de saque**: Admin rejeita e saldo é devolvido

#### Withdrawal Retry
1. **Proteção admin**: Endpoint de retry acessível apenas por admin
2. **Verificação de acesso**: Usuário comum recebe 403

## Pré-requisitos

### 1. Banco de dados de teste

Crie um banco separado para testes:

```bash
# PostgreSQL
createdb mvppir_test

# Ou via SQL
psql -U postgres -c "CREATE DATABASE mvppir_test;"
```

### 2. Configure variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.test.example .env.test
```

Edite `.env.test` e configure pelo menos:

- `DATABASE_URL` - Banco de teste (NÃO use o banco de produção!)
- `MORALIS_STREAM_SECRET` - Qualquer string para validar assinaturas
- `AUTH_SECRET` - Secret para autenticação (min 32 chars)
- `ENCRYPTION_KEY` - Key hex de 64 caracteres

**IMPORTANTE:** Use um banco de dados SEPARADO para testes! Os testes limpam dados automaticamente.

### 3. Execute as migrations no banco de teste

```bash
# Com .env.test carregado
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mvppir_test?schema=public" npx prisma migrate deploy
```

Ou crie um arquivo `.env.test` e carregue-o:

```bash
# Linux/Mac
export $(cat .env.test | xargs) && npx prisma migrate deploy

# Windows (PowerShell)
Get-Content .env.test | ForEach-Object { [Environment]::SetEnvironmentVariable($_.Split('=')[0], $_.Split('=')[1]) }
npx prisma migrate deploy
```

## Rodando os testes

### Teste único

```bash
npm run test:integration
```

### Saída esperada

```
✔ Deposit + Webhook Flow > Deve processar depósito via webhook e criar transação (XXXms)
✅ Teste completo: Depósito + Webhook processado com sucesso!

ℹ tests 1
ℹ suites 1
ℹ pass 1
ℹ fail 0
```

## Como funciona

### Mock do Webhook Moralis

O teste **NÃO faz chamadas reais** para a blockchain. Ele simula o webhook do Moralis:

```typescript
// Cria payload falso
const webhookPayload = {
  txHash: "0x...",  // Hash único gerado
  to: depositAddress,  // Endereço do usuário
  value: "100000000",  // 100 USDC
  tokenAddress: "0x2791...",  // USDC address
  // ...
};

// Gera assinatura válida (Keccak256)
const signature = keccak256(JSON.stringify(payload) + SECRET);

// Envia webhook
POST /webhooks/moralis
Headers: { "x-signature": signature }
Body: webhookPayload
```

### Validações realizadas

O teste verifica:

1. ✅ Conta criada com sucesso
2. ✅ Login retorna cookie de autenticação
3. ✅ Endereço de depósito é gerado e está ACTIVE
4. ✅ Webhook aceita a assinatura válida
5. ✅ Transação é criada no banco com:
   - Status: `PENDING`
   - Type: `CREDIT`
   - Token: `USDC`
   - Amount: `100`
   - TxHash correto

## Importante

- **SEM dados reais**: Tudo é simulado localmente
- **SEM blockchain**: Não faz transações reais
- **SEM dinheiro**: Apenas testa a lógica da aplicação
- **Cleanup automático**: Os dados de teste são deletados após cada teste

## Troubleshooting

### Erro: "Invalid environment variables"

Verifique se o `.env.test` está configurado corretamente. Execute:

```bash
NODE_ENV=test node -e "require('./src/config/env')"
```

### Erro: "Database connection failed"

Verifique se:
1. PostgreSQL está rodando
2. Banco `mvppir_test` existe
3. `DATABASE_URL` em `.env.test` está correto

### Erro: "Signup deve retornar 200"

Verifique se as migrations foram aplicadas no banco de teste:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mvppir_test?schema=public" npx prisma migrate deploy
```

## Próximos passos

Este é o teste **mínimo** do fluxo principal. Futuramente podemos adicionar:

- Teste de webhook com token inválido/desconhecido
- Teste de webhook duplicado (idempotência)
- Teste de ativação de conta (depósito >= $100 USD)
- Teste de balance e histórico de transações

Mas por enquanto, este teste garante que o **core do sistema funciona**: depósito → webhook → transação salva.
