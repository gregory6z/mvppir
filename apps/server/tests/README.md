# Guia de Testes - MVP PIR

Este diretório contém diferentes tipos de testes para validar o fluxo completo do sistema.

## 📋 Pré-requisitos

1. **Servidor rodando**
   ```bash
   npm run dev
   ```

2. **Banco de dados configurado**
   ```bash
   npx prisma migrate dev
   ```

3. **Variáveis de ambiente configuradas** (`.env`)
   - `MORALIS_STREAM_SECRET`
   - `DATABASE_URL`
   - `AUTH_SECRET`

4. **Para testar webhooks reais com Moralis:**
   - Configure túnel (ngrok, cloudflare, etc)
   - Configure Stream no Moralis Dashboard
   - **📖 Veja guia completo:** [WEBHOOK-SETUP.md](./WEBHOOK-SETUP.md)

---

## 🧪 Tipos de Testes

### 1. Teste do Fluxo Completo (Recomendado)

**Arquivo:** `full-flow-test.ts`

**O que testa:**
- ✅ Criação de conta
- ✅ Login/Autenticação
- ✅ Geração de endereço de depósito
- ✅ Adição ao Moralis Stream
- ✅ Webhook de depósitos (USDC, SHIB, MATIC)
- ✅ Listagem de transações
- ✅ Consulta de saldo

**Como executar:**
```bash
npx tsx tests/full-flow-test.ts
```

**Saída esperada:**
```
🚀 Iniciando teste do fluxo completo
============================================================
📝 Criando conta de teste...
✅ Conta criada: test-1234567890@example.com

🔐 Fazendo login...
✅ Login realizado com sucesso

💳 Obtendo endereço de depósito...
✅ Endereço de depósito: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

💰 Simulando depósito de USDC...
✅ Depósito de USDC processado

💰 Simulando depósito de SHIB...
✅ Depósito de SHIB processado

💰 Simulando depósito de MATIC...
✅ Depósito de MATIC processado

📋 Obtendo transações...
✅ Total de transações: 3

💰 Obtendo saldo...
✅ Saldos por token: { USDC: "5.000000", SHIB: "1.000000", MATIC: "2.000000" }

============================================================
✅ Teste do fluxo completo concluído com sucesso!
============================================================
```

---

### 2. Teste Focado no Webhook

**Arquivo:** `webhook-test.ts`

**O que testa:**
- ✅ Webhook Moralis com USDC (token conhecido)
- ✅ Webhook Moralis com SHIB (token desconhecido)
- ✅ Webhook Moralis com MATIC (nativo)
- ✅ Validação de assinatura Keccak256

**Como executar:**

1. **Primeiro, crie um endereço de depósito manualmente:**
   ```bash
   # Crie uma conta e obtenha o endereço
   npx tsx tests/full-flow-test.ts
   # Copie o endereço gerado
   ```

2. **Edite `webhook-test.ts` e substitua o campo `to`:**
   ```typescript
   to: "0xSEU_ENDERECO_AQUI"
   ```

3. **Execute o teste:**
   ```bash
   npx tsx tests/webhook-test.ts
   ```

**Saída esperada:**
```
🚀 Iniciando testes do webhook Moralis

🧪 Teste: Depósito de USDC (Token Conhecido)
🔐 Signature: 0xabc123...
📊 Status: 200
✅ Response: {
  "message": "Transaction registered successfully",
  "transactionId": "uuid",
  "amount": "1.000000",
  "tokenSymbol": "USDC"
}
```

---

### 3. Testes Manuais via cURL

**Arquivo:** `manual-curl-tests.sh`

**O que testa:**
- ✅ Todos os endpoints via linha de comando
- ✅ Gestão de cookies/sessão
- ✅ Fácil debug de requisições HTTP

**Como executar:**

```bash
# Opção 1: Executar script completo
bash tests/manual-curl-tests.sh

# Opção 2: Executar comandos individuais
# (copie e cole do arquivo)
```

**Comandos disponíveis:**

```bash
# 1. Criar conta
curl -X POST "http://localhost:3333/api/auth/sign-up" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456!","name":"Test User"}'

# 2. Login
curl -X POST "http://localhost:3333/api/auth/sign-in" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"Test123456!"}'

# 3. Obter endereço de depósito
curl -X GET "http://localhost:3333/deposit/address" \
  -b cookies.txt

# 4. Obter transações
curl -X GET "http://localhost:3333/user/transactions" \
  -b cookies.txt

# 5. Obter saldo
curl -X GET "http://localhost:3333/user/balance" \
  -b cookies.txt
```

---

## 🐛 Debugging

### Verificar logs do servidor

Os logs aparecem no terminal onde você executou `npm run dev`:

```
✅ Endereço 0x... adicionado ao Moralis Stream
ℹ️  Token não-padrão detectado: { symbol: 'SHIB', ... }
✅ Transação registrada com sucesso: { transactionId: '...', ... }
```

### Verificar banco de dados

```bash
# Abrir Prisma Studio
npx prisma studio

# Ou consultar diretamente
psql $DATABASE_URL -c "SELECT * FROM wallet_transactions ORDER BY created_at DESC LIMIT 5;"
```

### Verificar se endereço foi adicionado ao Stream

Execute o script:
```typescript
import { listStreamAddresses } from './src/modules/deposit/services/moralis-stream.service';

async function check() {
  const addresses = await listStreamAddresses();
  console.log('Endereços no Stream:', addresses);
}

check();
```

---

## 🔍 Casos de Teste Específicos

### Testar Token Desconhecido

```typescript
// No webhook-test.ts ou full-flow-test.ts
const customTokenPayload = {
  confirmed: true,
  chainId: "0x89",
  txHash: "0x...",
  to: "SEU_ENDERECO",
  from: "0x...",
  value: "1000000",
  tokenAddress: "0xENDERECO_TOKEN_CUSTOMIZADO",
  tokenName: "My Custom Token",
  tokenSymbol: "MCT",
  tokenDecimals: "8",
  block: { number: "123", timestamp: "1234567890" }
};
```

### Testar Valor Muito Pequeno

```typescript
const microPayload = {
  // ... outros campos
  value: "1", // Valor minúsculo
};
```

### Testar Transação Duplicada

```typescript
// Envie o mesmo payload duas vezes
await sendWebhookRequest(payload, "Teste 1");
await sendWebhookRequest(payload, "Teste 2 - Duplicado");
// Deve retornar: "Transaction already processed"
```

### Testar Endereço Inativo

```sql
-- No banco de dados
UPDATE deposit_addresses
SET status = 'INACTIVE'
WHERE polygon_address = '0x...';
```

---

## 📊 Estrutura de Resposta

### Sucesso

```json
{
  "message": "Transaction registered successfully",
  "transactionId": "uuid",
  "amount": "5.000000",
  "tokenSymbol": "USDC"
}
```

### Erro de Validação

```json
{
  "error": "INVALID_PAYLOAD: txHash missing"
}
```

### Token Desconhecido (Aceito)

```json
{
  "message": "Transaction registered successfully",
  "transactionId": "uuid",
  "amount": "1.000000",
  "tokenSymbol": "SHIB"
}
```

---

## ✅ Checklist de Validação

Após executar os testes, verifique:

- [ ] Conta criada com sucesso
- [ ] Login retorna session token
- [ ] Endereço de depósito gerado (formato 0x...)
- [ ] Endereço adicionado ao Moralis Stream (check logs)
- [ ] Webhook USDC processado e salvo no banco
- [ ] Webhook SHIB (desconhecido) processado e salvo
- [ ] Webhook MATIC (nativo) processado e salvo
- [ ] Transações aparecem em `/user/transactions`
- [ ] Saldos corretos em `/user/balance`
- [ ] Transação duplicada é rejeitada
- [ ] Micro-transação é ignorada

---

## 🚨 Problemas Comuns

### Erro: "MORALIS_STREAM_SECRET not configured"

**Solução:**
```bash
# Adicione ao .env
MORALIS_STREAM_SECRET="seu-secret-aqui"
```

### Erro: "Deposit address not found"

**Causa:** O endereço no webhook não existe no banco.

**Solução:** Use o endereço retornado por `/deposit/address`

### Erro: "Invalid signature"

**Causa:** Assinatura Keccak256 incorreta.

**Solução:** Verifique se está usando o mesmo `MORALIS_STREAM_SECRET`

### Erro: "Session token not found"

**Causa:** Cookies não foram salvos/enviados.

**Solução:** Use `-c cookies.txt` e `-b cookies.txt` no cURL

---

## 📝 Próximos Passos

Após validar localmente:

1. **Configurar Moralis Stream no Dashboard**
   - URL: `https://seu-dominio.com/webhooks/moralis`
   - Chain: Polygon (0x89)
   - Adicionar endereços de teste

2. **Testar com transação real**
   - Envie USDC de testnet para o endereço
   - Verifique webhook recebido

3. **Monitorar logs em produção**
   - Implementar logging estruturado
   - Configurar alertas para erros
