# 🚀 Quick Start - Testnet Real (Polygon Amoy)

Guia rápido para testar o sistema completo com blockchain de teste REAL em 15 minutos.

## 🎯 O que vamos fazer:

1. ✅ Criar Global Wallet
2. ✅ Conseguir MATIC testnet gratuito
3. ✅ Configurar .env para Amoy
4. ✅ Testar fluxo completo (deposit → webhook → withdrawal)

---

## 📦 Passo 1: Configure o Ambiente

### 1.1. Atualize o `.env`

```bash
# Copie seu .env atual
cp .env .env.backup

# Edite .env e atualize estas linhas:
POLYGON_RPC_URL="https://rpc-amoy.polygon.technology"
POLYGON_CHAIN_ID="80002"
SKIP_BLOCKCHAIN_PROCESSING=false

# Moralis precisa estar configurado para Amoy (veja passo 4)
```

---

## 🔐 Passo 2: Crie a Global Wallet

```bash
# Script automatizado que:
# - Cria carteira aleatória
# - Criptografa private key
# - Salva no banco
# - Mostra endereço para você adicionar fundos

npx tsx scripts/create-global-wallet.ts
```

**Output esperado:**
```
✅ Carteira gerada:
   Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbB
   Private Key: 0x...

✅ Global Wallet salva no banco

🎯 PRÓXIMOS PASSOS:
1. Consiga MATIC testnet em https://faucet.polygon.technology/
```

**Copie o Address** que apareceu! Você vai precisar dele no próximo passo.

---

## 💰 Passo 3: Consiga MATIC Testnet (Gratuito!)

### 3.1. Acesse o Faucet

👉 https://faucet.polygon.technology/

### 3.2. Configure o Faucet

1. **Network:** Selecione "Polygon Amoy"
2. **Wallet Address:** Cole o endereço da sua Global Wallet
3. **Token:** MATIC
4. Clique em "Submit"

### 3.3. Aguarde confirmação

- ⏱️ Leva ~30 segundos
- 💰 Você receberá **0.5 MATIC** (suficiente para ~100 transações)

### 3.4. Verifique o saldo

**Opção A: Via script**
```bash
npx tsx scripts/check-global-wallet-balance.ts
```

**Opção B: Via explorer**
```bash
# Abra no navegador (substitua pelo seu endereço):
https://amoy.polygonscan.com/address/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbB
```

**Output esperado:**
```
💰 Verificando saldo MATIC...
   MATIC: 0.5 MATIC
   ✅ Saldo suficiente para testes!
```

---

## 🌊 Passo 4: Configure Moralis Stream para Amoy

### 4.1. Acesse Moralis Admin

👉 https://admin.moralis.io/streams

### 4.2. Crie ou Edite Stream

Se já tem stream configurado para Mumbai/Polygon, **edite** e adicione Amoy:

1. Clique no stream existente
2. **Networks:** Adicione "Polygon Amoy (80002)"
3. **Webhook URL:** Mantenha a mesma (`http://...` ou use ngrok se local)
4. **Save**

Se NÃO tem stream ainda:

1. **Create New Stream**
2. **Webhook URL:** `http://SEU_IP:3333/webhooks/moralis` (ou use ngrok)
3. **Description:** MVP PIR - Amoy Testnet
4. **Network:** Polygon Amoy (80002)
5. **Topic:** Transfer event
6. **ABI:**
```json
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
```
7. **Include Native Txs:** ✅ (para receber MATIC nativo)
8. **Create**

### 4.3. Copie o Stream Secret

Adicione ao `.env`:
```bash
MORALIS_STREAM_SECRET="seu-stream-secret-aqui"
```

---

## 🚀 Passo 5: Inicie o Servidor

```bash
# Aplica migrations (se necessário)
npm run prisma:migrate

# Inicia servidor
npm run dev
```

**Logs esperados:**
```
🚀 Server listening on http://localhost:3333
✅ Global Wallet loaded
```

---

## 🧪 Passo 6: Teste o Fluxo Completo

### 6.1. Crie um usuário

```bash
curl -X POST http://localhost:3333/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "Senha123!",
    "name": "Usuario Teste"
  }'
```

### 6.2. Faça login

```bash
curl -X POST http://localhost:3333/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "Senha123!"
  }' \
  -c cookies.txt
```

### 6.3. Obtenha endereço de depósito

```bash
curl -X GET http://localhost:3333/user/deposit/address \
  -b cookies.txt
```

**Output:**
```json
{
  "id": "...",
  "address": "0xABC...",
  "network": "POLYGON"
}
```

**Copie o `address`!** Este é o endereço de depósito do usuário.

### 6.4. Envie MATIC testnet para o usuário

Agora vamos simular um depósito real! Você tem duas opções:

**Opção A: Via MetaMask (mais fácil)**

1. Abra MetaMask
2. Conecte na Polygon Amoy Testnet
3. Envie 0.1 MATIC para o endereço de depósito do usuário
4. Confirme a transação

**Opção B: Via script (programático)**

```bash
# Você precisa de uma wallet com MATIC para enviar
# Use sua Global Wallet ou consiga outra do faucet

# Crie um script simples:
npx tsx -e "
import {Wallet, JsonRpcProvider, parseEther} from 'ethers';

const provider = new JsonRpcProvider('https://rpc-amoy.polygon.technology');
const wallet = new Wallet('0xSUA_PRIVATE_KEY', provider);
const userDepositAddress = '0xENDERECO_DO_USUARIO';

async function send() {
  const tx = await wallet.sendTransaction({
    to: userDepositAddress,
    value: parseEther('0.1')
  });

  console.log('TX Hash:', tx.hash);
  console.log('Aguardando confirmação...');

  await tx.wait();
  console.log('✅ Confirmado!');
  console.log('Ver em: https://amoy.polygonscan.com/tx/' + tx.hash);
}

send();
"
```

### 6.5. Aguarde o webhook

⏱️ Aguarde ~30-60 segundos. O Moralis detectará a transação e enviará webhook.

**Logs esperados no servidor:**
```
🔔 Webhook Moralis recebido
✅ Transação confirmada pela blockchain: {...}
✅ Balance atualizado: +0.1 MATIC
✅ Ativando conta [...] - Depósito mínimo atingido! (se >= $100)
```

### 6.6. Verifique o saldo do usuário

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

### 6.7. Teste Withdrawal (Saque Real!)

**Request withdrawal:**
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

**Promova usuário para admin (no banco):**
```bash
psql $DATABASE_URL -c "UPDATE users SET role = 'admin' WHERE email = 'teste@example.com';"
```

**Liste pending withdrawals:**
```bash
curl -X GET "http://localhost:3333/admin/withdrawals?status=PENDING_APPROVAL" \
  -b cookies.txt
```

**Approve withdrawal (copie o ID do withdrawal):**
```bash
curl -X POST http://localhost:3333/admin/withdrawals/WITHDRAWAL_ID/approve \
  -b cookies.txt
```

**Aguarde processamento (~30s) e veja no explorer:**
```bash
# Acesse:
https://amoy.polygonscan.com/address/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbB

# Você verá a transação de withdrawal real na blockchain! 🎉
```

---

## ✅ Checklist de Testes

- [ ] Global Wallet criada e com MATIC
- [ ] Servidor rodando com Amoy configurado
- [ ] Moralis Stream configurado para Amoy
- [ ] Usuário criado e login funcionando
- [ ] Deposit address gerado
- [ ] MATIC enviado para deposit address
- [ ] Webhook recebido e processado
- [ ] Saldo atualizado corretamente
- [ ] Conta ativada (se >= $100 USD)
- [ ] Withdrawal request criado
- [ ] Admin aprovou withdrawal
- [ ] Transação blockchain enviada e confirmada
- [ ] Transação visível no Amoy explorer

---

## 🔍 Troubleshooting

### Webhook não chega

**Problema:** Servidor local não é acessível publicamente

**Solução:** Use ngrok
```bash
# Instale ngrok: https://ngrok.com/
ngrok http 3333

# Use a URL gerada no Moralis Stream
# Ex: https://abc123.ngrok.io/webhooks/moralis
```

### Transaction failed: insufficient funds

**Problema:** Global Wallet sem MATIC para gas

**Solução:**
```bash
# Consiga mais MATIC no faucet
# https://faucet.polygon.technology/

# Ou verifique saldo:
npx tsx scripts/check-global-wallet-balance.ts
```

### RPC connection timeout

**Problema:** RPC público pode estar lento/offline

**Solução:** Use RPC alternativo
```bash
# No .env, teste outros RPCs:
POLYGON_RPC_URL="https://polygon-amoy.blockpi.network/v1/rpc/public"
# ou
POLYGON_RPC_URL="https://rpc.ankr.com/polygon_amoy"
```

---

## 🎉 Pronto!

Agora você tem um ambiente completo de testes com blockchain REAL!

**Próximos passos:**
- Deploy de token USDC de teste (veja `docs/TESTNET-SETUP.md`)
- Teste batch transfer com múltiplos usuários
- Simule falhas e teste retry system

**Custos:** 🆓 **ZERO!** Tudo é testnet gratuito.

---

**Dúvidas?** Veja documentação completa em `docs/TESTNET-SETUP.md`
