# 🌐 Testes Completos com ngrok + Moralis + Amoy Testnet

Este guia mostra como testar o **fluxo completo end-to-end** usando blockchain real (Amoy) + Moralis real + webhooks reais.

## 🎯 O que vamos testar:

1. ✅ Criar usuário
2. ✅ Gerar deposit address
3. ✅ Enviar MATIC testnet (transação real na blockchain!)
4. ✅ Moralis detecta automaticamente
5. ✅ Webhook chega no nosso servidor
6. ✅ Balance atualiza
7. ✅ Conta ativa (se >= $100)
8. ✅ Withdrawal com transação blockchain real
9. ✅ Ver tudo no Amoy explorer

---

## 📦 Passo 1: Instale ngrok

### macOS
```bash
brew install ngrok
```

### Linux
```bash
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
  sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
  echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
  sudo tee /etc/apt/sources.list.d/ngrok.list && \
  sudo apt update && sudo apt install ngrok
```

### Windows
```powershell
choco install ngrok
```

### Ou baixe manualmente
👉 https://ngrok.com/download

### Configure autenticação (opcional, mas recomendado)
```bash
# Crie conta grátis em https://dashboard.ngrok.com/signup
# Copie seu authtoken

ngrok config add-authtoken SEU_AUTHTOKEN
```

---

## 🔐 Passo 2: Configure o `.env.test`

Edite `.env.test`:

```bash
# Database de teste
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mvppir_test?schema=public"
PORT=3333
NODE_ENV=test

# Authentication
AUTH_SECRET="test-secret-key-at-least-32-chars-long-for-testing-purposes-only"
API_BASE_URL="http://localhost:3333"
FRONTEND_URL="http://localhost:3000"

# 🔥 Moralis REAL (você vai configurar no Passo 4)
MORALIS_API_KEY="SUA_CHAVE_MORALIS_AQUI"
MORALIS_STREAM_SECRET="SEU_STREAM_SECRET_AQUI"

# Encryption (já está OK)
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# 🌐 Polygon Amoy Testnet
POLYGON_RPC_URL="https://rpc-amoy.polygon.technology"
POLYGON_CHAIN_ID="80002"

# Global Wallet (será criada no Passo 3)
GLOBAL_WALLET_ADDRESS="0x0000000000000000000000000000000000000000"
GLOBAL_WALLET_PRIVATE_KEY="test-key-here"

# 🚀 Blockchain real!
SKIP_BLOCKCHAIN_PROCESSING=false
```

---

## 🔑 Passo 3: Crie Global Wallet e Adicione MATIC

### 3.1. Crie Global Wallet no banco de teste

```bash
NODE_ENV=test npx tsx scripts/create-global-wallet.ts
```

**Output esperado:**
```
✅ Carteira gerada:
   Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbB
   Private Key: 0x...

✅ Global Wallet salva no banco
```

**COPIE O ADDRESS!** Você vai precisar dele.

### 3.2. Consiga MATIC testnet gratuito

1. Acesse: 👉 https://faucet.polygon.technology/
2. Selecione **"Polygon Amoy"**
3. Cole o **endereço da Global Wallet**
4. Receba **0.5 MATIC** gratuito (aguarde ~30s)

### 3.3. Verifique o saldo

```bash
NODE_ENV=test npx tsx scripts/check-global-wallet-balance.ts
```

**Output esperado:**
```
💰 Verificando saldo MATIC...
   MATIC: 0.5 MATIC
   ✅ Saldo suficiente para testes!
```

---

## 🌐 Passo 4: Exponha localhost com ngrok

### 4.1. Inicie o servidor em modo teste

```bash
NODE_ENV=test npm run dev
```

**Em outro terminal:**

### 4.2. Exponha com ngrok

```bash
ngrok http 3333
```

**Output:**
```
Session Status                online
Account                       seuemail@example.com (Plan: Free)
Forwarding                    https://abc123def456.ngrok.io -> http://localhost:3333
```

**COPIE A URL:** `https://abc123def456.ngrok.io` ⬅️ **Muito importante!**

⚠️ **ATENÇÃO:** Deixe esse terminal aberto! O ngrok precisa ficar rodando.

---

## 🌊 Passo 5: Configure Moralis Stream

### 5.1. Acesse Moralis Admin

👉 https://admin.moralis.io/streams

### 5.2. Crie novo Stream

1. **Create New Stream**
2. Preencha:

```yaml
Webhook URL: https://abc123def456.ngrok.io/webhooks/moralis
Description: MVP PIR - Amoy Testnet (ngrok)
Network: Polygon Amoy (80002)
Tag: deposit_monitor_test

ABI:
[{
  "anonymous": false,
  "inputs": [
    {"indexed": true, "name": "from", "type": "address"},
    {"indexed": true, "name": "to", "type": "address"},
    {"indexed": false, "name": "value", "type": "uint256"}
  ],
  "name": "Transfer",
  "type": "event"
}]

Options:
✅ Include Native Txs (para receber MATIC nativo)
✅ Include Contract Logs (para receber ERC20 transfers)
```

3. **Teste o webhook:**

Moralis tem um botão "Test Webhook". Clique para verificar que o ngrok está funcionando.

**Você deve ver no terminal do servidor:**
```
🔔 Webhook Moralis recebido (test)
```

4. **Salve e copie o Stream Secret**

⚠️ **IMPORTANTE:** Copie o **Stream Secret** que aparece após salvar.

### 5.3. Atualize `.env.test`

Adicione as chaves reais:

```bash
MORALIS_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
MORALIS_STREAM_SECRET="abc123..."
```

### 5.4. Reinicie o servidor

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
NODE_ENV=test npm run dev
```

---

## 🧪 Passo 6: Teste o Fluxo Completo!

### 6.1. Crie usuário

```bash
curl -X POST http://localhost:3333/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste-ngrok@example.com",
    "password": "Senha123!",
    "name": "Usuario Teste ngrok"
  }'
```

### 6.2. Login

```bash
curl -X POST http://localhost:3333/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste-ngrok@example.com",
    "password": "Senha123!"
  }' \
  -c cookies.txt
```

### 6.3. Obtenha deposit address

```bash
curl -X GET http://localhost:3333/user/deposit/address \
  -b cookies.txt
```

**Output:**
```json
{
  "id": "...",
  "address": "0xABC123...",
  "network": "POLYGON"
}
```

**COPIE O ADDRESS!** Este é o endereço de depósito do usuário.

### 6.4. Moralis adiciona endereço automaticamente

Você vai ver no terminal do servidor:
```
✅ Endereço 0xABC123... adicionado ao Moralis Stream
```

### 6.5. Envie MATIC testnet para o usuário

Você tem 3 opções:

#### Opção A: Via Faucet (mais fácil)

1. Acesse: https://faucet.polygon.technology/
2. Selecione "Polygon Amoy"
3. Cole o **deposit address do usuário** (`0xABC123...`)
4. Receba 0.5 MATIC

#### Opção B: Via MetaMask

1. Adicione Amoy Testnet no MetaMask
2. Importe uma wallet com MATIC testnet
3. Envie 0.1 MATIC para o deposit address do usuário

#### Opção C: Via Script (Global Wallet)

```bash
npx tsx -e "
import {Wallet, JsonRpcProvider, parseEther} from 'ethers';
import {decryptPrivateKey} from './src/lib/encryption.js';
import {prisma} from './src/lib/prisma.js';

async function send() {
  const gw = await prisma.globalWallet.findFirst();
  const pk = decryptPrivateKey(gw.privateKey);

  const provider = new JsonRpcProvider('https://rpc-amoy.polygon.technology');
  const wallet = new Wallet(pk, provider);

  const tx = await wallet.sendTransaction({
    to: '0xDEPOSIT_ADDRESS_DO_USUARIO',
    value: parseEther('0.1')
  });

  console.log('TX:', tx.hash);
  await tx.wait();
  console.log('✅ Confirmado!');
}

send();
"
```

### 6.6. Aguarde o webhook (MÁGICA ACONTECE AQUI! ✨)

⏱️ Aguarde **30-90 segundos**. Você vai ver no terminal:

```
🔔 Webhook Moralis recebido
📦 Chain: Polygon Amoy (80002)
🔄 Processing transaction...
✅ Transação confirmada pela blockchain: {
  txHash: '0x...',
  from: '0x...',
  to: '0xABC123...',
  value: '100000000000000000'
}
💰 Balance atualizado: +0.1 MATIC
✅ Ativando conta [...] - Depósito mínimo atingido! (se >= $100)
```

### 6.7. Verifique o saldo

```bash
curl -X GET http://localhost:3333/user/balance \
  -b cookies.txt
```

**Output esperado:**
```json
{
  "balances": [
    {
      "tokenSymbol": "MATIC",
      "availableBalance": "0.1",
      "lockedBalance": "0"
    }
  ],
  "totalUsd": "..."
}
```

### 6.8. Veja no blockchain explorer! 🔗

```bash
# Abra no navegador:
https://amoy.polygonscan.com/address/0xDEPOSIT_ADDRESS_DO_USUARIO

# Você verá a transação real! 🎉
```

---

## 🎯 Passo 7: Teste Withdrawal com Blockchain Real

### 7.1. Request withdrawal

```bash
curl -X POST http://localhost:3333/user/withdrawals/request \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "tokenSymbol": "MATIC",
    "amount": "0.05",
    "destinationAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbB"
  }'
```

### 7.2. Promova usuário para admin

```bash
psql postgresql://postgres:postgres@localhost:5432/mvppir_test -c \
  "UPDATE users SET role = 'admin' WHERE email = 'teste-ngrok@example.com';"
```

### 7.3. Aprove o withdrawal

```bash
# Liste pending
curl -X GET "http://localhost:3333/admin/withdrawals?status=PENDING_APPROVAL" \
  -b cookies.txt

# Copie o withdrawal ID

# Approve
curl -X POST http://localhost:3333/admin/withdrawals/WITHDRAWAL_ID/approve \
  -b cookies.txt
```

**Você vai ver no terminal:**
```
🔄 Processing withdrawal...
📤 MATIC transfer sent: 0x...
✅ MATIC transfer confirmed: 0x...
✅ Withdrawal WITHDRAWAL_ID processed successfully
```

### 7.4. Veja a transação no explorer! 🎉

```bash
# Abra:
https://amoy.polygonscan.com/address/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbB

# Você verá:
# - Transação de entrada (deposit do usuário)
# - Transação de saída (withdrawal processado)
# Tudo real na blockchain! 🚀
```

---

## ✅ Checklist Completo

- [ ] ngrok instalado e rodando
- [ ] `.env.test` configurado com Amoy
- [ ] Global Wallet criada e com MATIC (faucet)
- [ ] Servidor rodando com `NODE_ENV=test`
- [ ] Moralis Stream configurado com URL do ngrok
- [ ] Stream Secret adicionado ao `.env.test`
- [ ] Usuário criado e login funcionando
- [ ] Deposit address gerado
- [ ] MATIC enviado para deposit address (faucet ou MetaMask)
- [ ] Webhook recebido automaticamente ✨
- [ ] Balance atualizado no banco
- [ ] Transação visível no Amoy explorer
- [ ] Withdrawal request criado
- [ ] Admin aprovou withdrawal
- [ ] Transação blockchain enviada e confirmada
- [ ] Withdrawal visível no explorer

---

## 🔍 Troubleshooting

### Webhook não chega

**Problema:** Moralis não consegue acessar o ngrok

**Solução:**
```bash
# 1. Verifique se ngrok está rodando
curl https://SUA_URL.ngrok.io/webhooks/moralis

# 2. Teste webhook manualmente no Moralis Admin
# 3. Verifique logs do servidor
```

### Transaction failed: insufficient funds

**Problema:** Global Wallet sem MATIC

**Solução:**
```bash
# Consiga mais MATIC no faucet
https://faucet.polygon.technology/

# Ou verifique saldo:
NODE_ENV=test npx tsx scripts/check-global-wallet-balance.ts
```

### ngrok URL mudou

**Problema:** ngrok free muda URL toda vez que reinicia

**Solução:**
```bash
# 1. Copie nova URL do ngrok
# 2. Atualize Moralis Stream com nova URL
# 3. Reinicie servidor
```

### Signature validation failed

**Problema:** Stream Secret errado no `.env.test`

**Solução:**
```bash
# 1. Copie Stream Secret correto do Moralis Admin
# 2. Atualize MORALIS_STREAM_SECRET no .env.test
# 3. Reinicie servidor
```

---

## 🎉 Pronto!

Agora você tem um ambiente de testes **COMPLETO** com:
- ✅ Blockchain real (Amoy testnet)
- ✅ Moralis real (webhooks automáticos)
- ✅ Transações reais (visíveis no explorer)
- ✅ Tudo gratuito (faucet tokens)

**Custos:** 🆓 **ZERO!** Tudo é testnet.

**Próximos passos:**
- Teste com tokens ERC20 (deploy TestUSDC)
- Teste batch transfer com múltiplos usuários
- Simule falhas e teste retry system

---

**Dúvidas?** Veja outros guias:
- `docs/TESTNET-SETUP.md` - Setup detalhado
- `docs/QUICK-START-TESTNET.md` - Quick start
